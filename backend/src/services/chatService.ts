import { db } from '../db/database';
import { hindsight } from './hindsightClient';
import { groq } from './groqClient';
import { memoryExtractor } from './memoryExtractor';
import { recommendationEngine } from './recommendationEngine';
import { ChatRequest, ChatResponse, HindsightMemory, Ticket } from '../types';

export class ChatService {
  public async handleChatMessage(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    const { customerId, ticketId: requestedTicketId, message: userMessage, useMemory = true } = request;

    // STEP 1 — Identify Customer
    const customer = db.getCustomerById(customerId);
    if (!customer) {
      throw new Error(`Customer with ID "${customerId}" not found.`);
    }

    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error('Message cannot be empty.');
    }

    // STEP 2 — Load Conversation & Ticket
    let currentTicket: Ticket | undefined;
    if (requestedTicketId) {
      const candidateTicket = db.getTicketById(requestedTicketId);
      // Strict security & isolation check: ticket MUST belong to the requested customer
      if (candidateTicket && candidateTicket.customerId === customerId) {
        currentTicket = candidateTicket;
      } else if (candidateTicket) {
        console.warn(`[ChatService] Ticket ${requestedTicketId} belongs to ${candidateTicket.customerId}, NOT ${customerId}. Ignoring stale ticket.`);
      }
    }

    if (!currentTicket) {
      // Find open or in_progress ticket for customer, or create a new active ticket
      const customerTickets = db.getTicketsByCustomer(customerId);
      currentTicket = customerTickets.find((t) => t.status === 'open' || t.status === 'in_progress');

      if (!currentTicket) {
        currentTicket = db.createTicket({
          customerId,
          issueType: this.inferIssueType(userMessage),
          subject: userMessage.slice(0, 60),
          status: 'in_progress',
        });
      }
    }

    const recentMessages = db.getMessagesByTicket(currentTicket.id);
    const ticketHistory = db.getTicketsByCustomer(customerId);

    // STEP 3 — Recall Hindsight
    let recalledMemories: HindsightMemory[] = [];
    let memoryStatus: 'active' | 'empty' | 'unavailable' | 'bypassed_without_memory' = 'bypassed_without_memory';
    let hindsightError: string | undefined;

    if (useMemory) {
      console.log(`[ChatService] Querying Hindsight for customer ${customer.name} (bank: ${hindsight.getBankIdForCustomer(customerId)})...`);
      const recallResult = await hindsight.recall(customerId, userMessage, 5);

      if (recallResult.available) {
        recalledMemories = [...recallResult.memories];
        // Always include retained customer preferences so communication style remains personalized
        const allMemories = await hindsight.listMemories(customerId);
        const preferences = allMemories.filter((m) => m.category === 'preference');
        for (const pref of preferences) {
          if (!recalledMemories.some((rm) => rm.id === pref.id)) {
            recalledMemories.push({
              ...pref,
              relevanceScore: 0.92,
              relevanceReason: 'Active customer communication preference',
            });
          }
        }
        memoryStatus = recalledMemories.length > 0 ? 'active' : 'empty';
      } else {
        memoryStatus = 'unavailable';
        hindsightError = recallResult.error;
        console.warn(`[ChatService] Hindsight memory recall was unavailable: ${recallResult.error}`);
      }
    } else {
      memoryStatus = 'bypassed_without_memory';
      console.log(`[ChatService] Memory recall bypassed for demonstration (WITHOUT MEMORY mode)`);
    }

    // STEP 4 — Build AI Context
    const promptParams = {
      customer,
      currentTicket,
      recentMessages,
      ticketHistory,
      recalledMemories,
      useMemory,
      userMessage,
    };
    const { systemPrompt, userPrompt } = groq.buildSystemPrompt(promptParams);

    // STEP 5 — Generate Response
    const llmResult = await groq.generateResponse(promptParams);

    // STEP 6 — Save Conversation
    // Save customer message
    db.addMessage({
      ticketId: currentTicket.id,
      customerId,
      sender: 'customer',
      message: userMessage,
    });

    // Save AI response
    db.addMessage({
      ticketId: currentTicket.id,
      customerId,
      sender: 'ai',
      message: llmResult.content,
      recalledMemoriesUsed: useMemory ? recalledMemories : [],
      memoryOperationStatus:
        memoryStatus === 'active'
          ? 'recalled'
          : memoryStatus === 'unavailable'
          ? 'unavailable'
          : memoryStatus === 'empty'
          ? 'no_memory'
          : 'bypassed',
    });

    // STEP 7 — Retain Important Information in Hindsight
    const newlyRetainedMemories: HindsightMemory[] = [];
    let retentionDecision = 'No meaningful long-term facts found in this turn.';

    if (useMemory) {
      const candidates = memoryExtractor.extractMeaningfulMemories(
        customer,
        userMessage,
        llmResult.content,
        recentMessages
      );

      if (candidates.length > 0) {
        retentionDecision = `Identified ${candidates.length} meaningful long-term memory candidate(s). Retaining in Hindsight bank...`;
        for (const candidate of candidates) {
          const retainResult = await hindsight.retain(
            customerId,
            candidate.content,
            {
              category: candidate.category,
              ticketId: currentTicket.id,
              reason: candidate.reason,
            },
            candidate.type
          );

          if (retainResult.success && retainResult.memory) {
            newlyRetainedMemories.push(retainResult.memory);
          }
        }
      }
    } else {
      retentionDecision = 'Retention skipped (WITHOUT MEMORY mode active).';
    }

    const recommendation = recommendationEngine.generateRecommendation({
      customer,
      currentMessage: userMessage,
      recentMessages,
      currentTicket,
      ticketHistory,
      recalledMemories,
      useMemory,
    });

    const executionTimeMs = Date.now() - startTime;

    return {
      message: llmResult.content,
      ticketId: currentTicket.id,
      customerId,
      recalledMemories,
      newlyRetainedMemories,
      suggestedAction: recommendation.suggestedAction,
      recommendation,
      memoryStatus,
      llmModel: llmResult.model,
      executionTimeMs,
      observability: {
        promptContext: `--- SYSTEM PROMPT ---\n${systemPrompt}\n\n--- USER CONTEXT ---\n${userPrompt}`,
        hindsightBankId: hindsight.getBankIdForCustomer(customerId),
        memoryRecallQuery: userMessage,
        retentionDecision,
        errorDetails: hindsightError,
      },
    };
  }

  private inferIssueType(msg: string): 'Payment' | 'Login/MFA' | 'Dashboard' | 'SSO' | 'Account Config' {
    const lower = msg.toLowerCase();
    if (lower.includes('pay') || lower.includes('bill') || lower.includes('card') || lower.includes('invoice') || lower.includes('charge')) {
      return 'Payment';
    }
    if (lower.includes('mfa') || lower.includes('login') || lower.includes('password') || lower.includes('auth') || lower.includes('totp')) {
      return 'Login/MFA';
    }
    if (lower.includes('sso') || lower.includes('okta') || lower.includes('saml') || lower.includes('azure')) {
      return 'SSO';
    }
    if (lower.includes('dashboard') || lower.includes('graph') || lower.includes('freeze') || lower.includes('slow') || lower.includes('metric')) {
      return 'Dashboard';
    }
    return 'Account Config';
  }
}

export const chatService = new ChatService();
