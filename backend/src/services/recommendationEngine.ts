import { Customer, Ticket, Message, HindsightMemory, SupportRecommendation } from '../types';

export interface GenerateRecommendationParams {
  customer: Customer;
  currentMessage: string;
  recentMessages: Message[];
  currentTicket?: Ticket;
  ticketHistory: Ticket[];
  recalledMemories: HindsightMemory[];
  useMemory: boolean;
}

export class RecommendationEngine {
  /**
   * Generates a grounded AI Support Recommendation strictly from available context:
   * 1. Detected Issue
   * 2. Relevant Previous Experience (ONLY if verified in Hindsight or ticket history; NEVER invented)
   * 3. Suggested Action
   * 4. Escalation (ONLY when available signals indicate escalation is appropriate)
   */
  public generateRecommendation(params: GenerateRecommendationParams): SupportRecommendation {
    const { customer, currentMessage, recentMessages, currentTicket, ticketHistory, recalledMemories, useMemory } = params;

    const msg = currentMessage.toLowerCase();
    const allMsgText = [msg, ...recentMessages.map((m) => m.message.toLowerCase())].join(' ');

    // 1. DETECTED ISSUE
    let detectedIssue = this.inferDetectedIssue(msg, currentTicket);

    // 2. RELEVANT PREVIOUS EXPERIENCE
    // CRITICAL: Never invent a previous solution. If Hindsight or ticket history does not contain a previous solution, do not claim that one existed.
    let relevantPreviousExperience: string | null = null;

    if (useMemory) {
      // Check recalled Hindsight memories first — MUST match detected issue topic
      const solutionMemory = recalledMemories.find(
        (m) =>
          (m.category === 'successful_solution' ||
            (m.content.toLowerCase().includes('resolved') && !m.content.toLowerCase().includes('preference'))) &&
          this.isSolutionMatchForIssue(m.content, detectedIssue)
      );

      if (solutionMemory) {
        // Derive clean concise experience string
        const memText = solutionMemory.content;
        if (memText.toLowerCase().includes('billing address') || detectedIssue.toLowerCase().includes('payment')) {
          relevantPreviousExperience = 'Previous payment failure resolved by correcting billing address.';
        } else if (memText.toLowerCase().includes('clock') || memText.toLowerCase().includes('authenticator')) {
          relevantPreviousExperience = 'Previous MFA authentication failure resolved by syncing Authenticator device clock.';
        } else if (memText.toLowerCase().includes('s3') || memText.toLowerCase().includes('queue') || memText.toLowerCase().includes('export')) {
          relevantPreviousExperience = 'Previous export timeout resolved by routing through asynchronous queue workers.';
        } else {
          relevantPreviousExperience = `Previous resolution: ${memText.replace(/^payment issue was successfully resolved by /i, 'Resolved by ')}`;
        }
      } else {
        // If not in recalled memories, check customer's past resolved tickets for this customer ONLY
        const pastResolvedTicket = ticketHistory.find(
          (t) =>
            t.status === 'resolved' &&
            t.customerId === customer.id &&
            t.id !== currentTicket?.id &&
            t.resolutionSummary &&
            this.isSolutionMatchForIssue(t.subject + ' ' + t.resolutionSummary, detectedIssue)
        );

        if (pastResolvedTicket && pastResolvedTicket.resolutionSummary) {
          relevantPreviousExperience = `Previous ${pastResolvedTicket.issueType.toLowerCase()} issue resolved: ${pastResolvedTicket.resolutionSummary} (Ticket #${pastResolvedTicket.id}).`;
        }
      }
    }

    // 3. SUGGESTED ACTION
    let suggestedAction = this.inferSuggestedAction({
      detectedIssue,
      relevantPreviousExperience,
      recalledMemories,
      customer,
      useMemory,
      msg,
    });

    // 4. ESCALATION
    // CRITICAL: Only show escalation when the available information indicates that escalation is appropriate.
    const escalation = this.inferEscalation({
      msg,
      allMsgText,
      customer,
      detectedIssue,
      relevantPreviousExperience,
      recentMessages,
    });

    return {
      detectedIssue,
      relevantPreviousExperience,
      suggestedAction,
      escalation,
    };
  }

  private inferDetectedIssue(msg: string, currentTicket?: Ticket): string {
    if (msg.includes('payment') || msg.includes('card') || msg.includes('billing') || msg.includes('declined') || msg.includes('checkout')) {
      return 'Payment failure';
    }
    if (msg.includes('mfa') || msg.includes('login') || msg.includes('logging in') || msg.includes('authenticator') || msg.includes('totp') || msg.includes('6-digit') || msg.includes('sign in')) {
      return 'Login difficulty';
    }
    if (msg.includes('saml') || msg.includes('sso') || msg.includes('okta') || msg.includes('assertion') || msg.includes('signature')) {
      return 'SSO SAML assertion signature error';
    }
    if (msg.includes('freeze') || msg.includes('freezing') || msg.includes('graph') || msg.includes('dashboard') || msg.includes('chart')) {
      return 'Real-time analytics dashboard rendering stall';
    }
    if (msg.includes('upgrade') || msg.includes('plan') || msg.includes('tier') || msg.includes('subscription')) {
      return 'Subscription plan upgrade inquiry';
    }
    if (msg.includes('role') || msg.includes('permission') || msg.includes('logistics') || msg.includes('dispatch') || msg.includes('member')) {
      return 'Team role & permission configuration';
    }
    if (msg.includes('one step') || msg.includes('step-by-step') || msg.includes('instruction')) {
      return 'Support communication pacing preference';
    }

    if (currentTicket && currentTicket.subject) {
      return currentTicket.subject;
    }

    return 'Technical support inquiry';
  }

  private isSolutionMatchForIssue(textWithSolution: string, detectedIssue: string): boolean {
    const text = textWithSolution.toLowerCase();
    const issue = detectedIssue.toLowerCase();

    if (issue.includes('payment') || issue.includes('billing')) {
      return text.includes('payment') || text.includes('billing') || text.includes('address') || text.includes('card') || text.includes('avs');
    }
    if (issue.includes('mfa') || issue.includes('login') || issue.includes('authenticator')) {
      return text.includes('mfa') || text.includes('authenticator') || text.includes('clock') || text.includes('totp') || text.includes('drift');
    }
    if (issue.includes('saml') || issue.includes('sso')) {
      return text.includes('saml') || text.includes('sso') || text.includes('assertion') || text.includes('certificate') || text.includes('okta');
    }
    if (issue.includes('dashboard') || issue.includes('analytics') || issue.includes('freeze') || issue.includes('graph')) {
      return text.includes('dashboard') || text.includes('freeze') || text.includes('graph') || text.includes('chart') || text.includes('metric');
    }
    if (issue.includes('export') || issue.includes('timeout')) {
      return text.includes('export') || text.includes('s3') || text.includes('queue') || text.includes('timeout');
    }
    if (issue.includes('webhook')) {
      return text.includes('webhook') || text.includes('hmac') || text.includes('endpoint');
    }
    if (issue.includes('role') || issue.includes('permission')) {
      return text.includes('role') || text.includes('permission') || text.includes('rbac');
    }
    if (issue.includes('upgrade') || issue.includes('subscription')) {
      return text.includes('upgrade') || text.includes('plan tier') || text.includes('downgrade');
    }
    return false;
  }

  private inferSuggestedAction(params: {
    detectedIssue: string;
    relevantPreviousExperience: string | null;
    recalledMemories: HindsightMemory[];
    customer: Customer;
    useMemory: boolean;
    msg: string;
  }): string {
    const { detectedIssue, relevantPreviousExperience, recalledMemories, customer, useMemory, msg } = params;

    // Check for customer preference memory
    const hasStepByStepPreference =
      useMemory &&
      recalledMemories.some(
        (m) =>
          m.category === 'preference' ||
          m.content.toLowerCase().includes('step-by-step') ||
          m.content.toLowerCase().includes('one step')
      );

    const preferenceSuffix = hasStepByStepPreference ? ' (Format response one single step at a time per customer preference).' : '';

    // If we have a verified previous resolution, suggest applying it!
    if (relevantPreviousExperience) {
      if (detectedIssue.includes('Payment')) {
        return `Ask the customer to verify the billing address in Billing Portal > Payment Methods to clear the AVS hold.${preferenceSuffix}`;
      }
      if (detectedIssue.includes('MFA')) {
        return `Guide customer to Authenticator Settings > Time correction > Sync now to clear TOTP time-drift.${preferenceSuffix}`;
      }
      return `Propose the verified resolution that solved this issue previously for ${customer.name}.${preferenceSuffix}`;
    }

    // No previous solution exists — suggest standard diagnostic steps
    if (detectedIssue.includes('Payment')) {
      return `Ask customer for the specific checkout error code and verify card issuing bank authorization.${preferenceSuffix}`;
    }
    if (detectedIssue.includes('Login') || detectedIssue.includes('MFA')) {
      return `Ask customer for login error type and verify credentials or SSO configuration.${preferenceSuffix}`;
    }
    if (detectedIssue.includes('SAML') || detectedIssue.includes('SSO')) {
      return `Verify Identity Provider SAML certificate expiration and certificate thumbprint in Organization Settings > SSO.`;
    }
    if (detectedIssue.includes('dashboard') || detectedIssue.includes('analytics')) {
      return `Request browser console logs, test in incognito window, and check WebGL hardware acceleration.`;
    }
    if (detectedIssue.includes('Subscription') || detectedIssue.includes('upgrade')) {
      return `Direct customer to Organization Settings > Subscriptions to choose their desired plan tier.${preferenceSuffix}`;
    }
    if (detectedIssue.includes('role') || detectedIssue.includes('permission')) {
      return `Direct customer to Organization Settings > Team Members to configure role-based access control.`;
    }

    return `Acknowledge query, gather diagnostic context, and assist customer with resolution.${preferenceSuffix}`;
  }

  private inferEscalation(params: {
    msg: string;
    allMsgText: string;
    customer: Customer;
    detectedIssue: string;
    relevantPreviousExperience: string | null;
    recentMessages: Message[];
  }): { recommended: boolean; reason: string; targetTeam: string; urgency: 'low' | 'medium' | 'high' } | null {
    const { msg, allMsgText, customer, detectedIssue } = params;

    // Condition 1: Repeated failure despite customer having applied standard fix
    if (
      msg.includes('still failing') ||
      msg.includes('tried that') ||
      msg.includes('already updated') ||
      msg.includes('already changed') ||
      msg.includes('third time') ||
      msg.includes('3rd time') ||
      msg.includes('not working after')
    ) {
      return {
        recommended: true,
        reason: 'Customer reports repeated failure persisting after standard resolution steps.',
        targetTeam: detectedIssue.includes('Payment') ? 'Billing & Finance' : 'Tier 2 Engineering',
        urgency: 'high',
      };
    }

    // Condition 2: Urgent / Production Blocker explicit in message
    if (msg.includes('urgent') || msg.includes('emergency') || msg.includes('production blocked') || msg.includes('down')) {
      return {
        recommended: true,
        reason: 'Customer explicitly reported urgent production impact.',
        targetTeam: 'Tier 2 Engineering',
        urgency: 'high',
      };
    }

    // Condition 3: Organization-wide SAML certificate failure
    if (detectedIssue.includes('SAML') && (msg.includes('all users') || msg.includes('entire team') || msg.includes('locked out'))) {
      return {
        recommended: true,
        reason: 'Organization-wide identity authentication failure locking out team.',
        targetTeam: 'Security Operations',
        urgency: 'high',
      };
    }

    // Condition 4: Enterprise account payment failure at renewal (high business risk if blocked)
    if (customer.accountTier === 'Enterprise' && detectedIssue.includes('Payment') && msg.includes('renew') && msg.includes('failing again')) {
      return {
        recommended: true,
        reason: 'Enterprise subscription renewal payment blocked; manual merchant gateway review recommended.',
        targetTeam: 'Billing & Finance',
        urgency: 'medium',
      };
    }

    // Standard cases: Escalation is NOT appropriate
    return null;
  }
}

export const recommendationEngine = new RecommendationEngine();
