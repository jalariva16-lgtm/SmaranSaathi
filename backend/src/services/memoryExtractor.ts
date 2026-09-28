import { Customer, Message } from '../types';

export interface ExtractedMemoryItem {
  content: string;
  category: 'successful_solution' | 'repeated_issue' | 'preference' | 'environment' | 'context';
  type: 'experience' | 'observation' | 'fact' | 'preference';
  reason: string;
}

export class MemoryExtractor {
  /**
   * Analyzes an interaction to determine if there is meaningful long-term information
   * worthy of persistent storage in Hindsight. Trivial chat is intentionally omitted.
   */
  public extractMeaningfulMemories(
    customer: Customer,
    userMessage: string,
    aiResponse: string,
    recentHistory: Message[] = []
  ): ExtractedMemoryItem[] {
    const memories: ExtractedMemoryItem[] = [];
    const msg = userMessage.toLowerCase().trim();
    const ai = aiResponse.toLowerCase();

    // 1. Preference Detection
    if (
      msg.includes('one step at a time') ||
      msg.includes('step by step') ||
      msg.includes('step-by-step') ||
      msg.includes('prefer') ||
      msg.includes('bullet points') ||
      msg.includes('concise')
    ) {
      if (msg.includes('one step at a time') || msg.includes('step by step') || msg.includes('step-by-step')) {
        memories.push({
          content: `Customer prefers step-by-step instructions presented one sequential action at a time.`,
          category: 'preference',
          type: 'preference',
          reason: 'Customer explicitly requested single step-by-step instruction pacing.',
        });
      } else if (msg.includes('prefer')) {
        memories.push({
          content: `Customer preference noted: "${userMessage}"`,
          category: 'preference',
          type: 'preference',
          reason: 'Customer stated an explicit preference.',
        });
      }
    }

    // 2. Successful Solution or Resolution Confirmation
    if (
      msg.includes('that worked') ||
      msg.includes('that fixed it') ||
      msg.includes('it went through') ||
      msg.includes('resolved') ||
      msg.includes('solved') ||
      msg.includes('working now')
    ) {
      // Find what the AI proposed in the turn or previous turn
      if (ai.includes('billing address') || msg.includes('billing address')) {
        memories.push({
          content: `Payment checkout issue was resolved after customer verified and updated their corporate billing address.`,
          category: 'successful_solution',
          type: 'observation',
          reason: 'Customer confirmed payment succeeded after billing address correction.',
        });
      } else if (ai.includes('clock') || ai.includes('authenticator') || msg.includes('authenticator')) {
        memories.push({
          content: `MFA validation failure was resolved by syncing the Authenticator device time.`,
          category: 'successful_solution',
          type: 'observation',
          reason: 'Customer confirmed MFA issue resolved after time sync.',
        });
      } else {
        memories.push({
          content: `Customer confirmed resolution: "${userMessage}". Solution applied: "${aiResponse.slice(0, 80)}..."`,
          category: 'successful_solution',
          type: 'observation',
          reason: 'Customer confirmed issue resolution.',
        });
      }
    }

    // 3. Problem / Recurring Failure Pattern
    if (
      msg.includes('failing again') ||
      msg.includes('same problem') ||
      msg.includes('happened again') ||
      msg.includes('still failing')
    ) {
      if (msg.includes('payment') || msg.includes('bill') || msg.includes('card')) {
        memories.push({
          content: `Customer experienced recurring payment failure at checkout. Flagged for recurring billing address or AVS hold checks.`,
          category: 'repeated_issue',
          type: 'experience',
          reason: 'Customer reported recurring payment failure.',
        });
      } else {
        memories.push({
          content: `Customer reported recurring issue: "${userMessage}".`,
          category: 'repeated_issue',
          type: 'experience',
          reason: 'Customer reported repeated incident.',
        });
      }
    }

    // 4. Problem / Failure Incident Tracking
    if (
      (msg.includes('payment is failing') || msg.includes('payment failed') || msg.includes('card declined')) &&
      !msg.includes('again')
    ) {
      memories.push({
        content: `Customer experienced payment failure during checkout. Flagged for billing address verification and card processor authorization.`,
        category: 'repeated_issue',
        type: 'experience',
        reason: 'Customer reported payment checkout failure.',
      });
    }

    // 5. Explicit Billing Address Correction Resolution
    if (
      msg.includes('billing address') &&
      (msg.includes('updated') || msg.includes('went through') || msg.includes('corrected') || msg.includes('fixed') || msg.includes('worked') || msg.includes('lakeview'))
    ) {
      memories.push({
        content: `Payment issue was successfully resolved by updating billing address to match issuing bank statement records.`,
        category: 'successful_solution',
        type: 'observation',
        reason: 'Payment failure successfully resolved by updating billing address.',
      });
    }

    // 6. Critical Technical Environment changes
    if (
      (msg.includes('moved to') || msg.includes('switched to') || msg.includes('now using')) &&
      (msg.includes('mac') || msg.includes('windows') || msg.includes('linux') || msg.includes('chrome') || msg.includes('firefox'))
    ) {
      memories.push({
        content: `Customer environment update: "${userMessage}".`,
        category: 'environment',
        type: 'fact',
        reason: 'Customer reported a platform/browser environment update.',
      });
    }

    return memories;
  }
}

export const memoryExtractor = new MemoryExtractor();
