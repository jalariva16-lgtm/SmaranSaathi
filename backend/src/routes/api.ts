import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { hindsight } from '../services/hindsightClient';
import { groq } from '../services/groqClient';
import { chatService } from '../services/chatService';
import { recommendationEngine } from '../services/recommendationEngine';
import { SystemStatus, HindsightMemory } from '../types';

const router = Router();

// GET /customers
router.get('/customers', (req: Request, res: Response) => {
  const customers = db.getCustomers();
  res.json({ customers, count: customers.length });
});

// GET /customers/:customerId
router.get('/customers/:customerId', (req: Request, res: Response) => {
  const { customerId } = req.params;
  const customer = db.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ error: `Customer ${customerId} not found` });
  }
  res.json({ customer });
});

// GET /customers/:customerId/tickets
router.get('/customers/:customerId/tickets', (req: Request, res: Response) => {
  const { customerId } = req.params;
  const customer = db.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ error: `Customer with ID "${customerId}" not found.` });
  }
  const tickets = db.getTicketsByCustomer(customerId);
  res.json({ customerId, tickets, count: tickets.length });
});

// GET /tickets/:ticketId
router.get('/tickets/:ticketId', (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const ticket = db.getTicketById(ticketId);
  if (!ticket) {
    return res.status(404).json({ error: `Ticket ${ticketId} not found` });
  }
  const messages = db.getMessagesByTicket(ticketId);
  res.json({ ticket, messages });
});

// GET /dashboard/metrics - Useful support metrics strictly from synthetic database
router.get('/dashboard/metrics', (req: Request, res: Response) => {
  const metrics = db.getDashboardMetrics();
  res.json({ metrics });
});

// PATCH /tickets/:ticketId/status - Update ticket status (open/resolved)
router.patch('/tickets/:ticketId/status', (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const { status, resolutionSummary } = req.body;
  if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be open, in_progress, or resolved.' });
  }
  const updated = db.updateTicketStatus(ticketId, status, resolutionSummary);
  if (!updated) {
    return res.status(404).json({ error: `Ticket ${ticketId} not found` });
  }
  res.json({ ticket: updated, metrics: db.getDashboardMetrics() });
});

// POST /tickets - Create a new ticket (e.g. for testing test data changes)
router.post('/tickets', (req: Request, res: Response) => {
  const { customerId, issueType, subject } = req.body;
  if (!customerId || !subject) {
    return res.status(400).json({ error: 'Missing customerId or subject' });
  }
  const ticket = db.createTicket({
    customerId,
    issueType: issueType || 'Account Config',
    subject,
    status: 'open',
  });
  res.status(201).json({ ticket, metrics: db.getDashboardMetrics() });
});


// POST /chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { customerId, ticketId, message, useMemory = true } = req.body;
    if (!customerId || typeof customerId !== 'string' || customerId.trim().length === 0) {
      return res.status(400).json({ error: 'Missing customerId' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const customer = db.getCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ error: `Customer with ID "${customerId}" not found.` });
    }

    const result = await chatService.handleChatMessage({
      customerId,
      ticketId,
      message,
      useMemory,
    });

    res.json(result);
  } catch (err: any) {
    console.error('[API /chat error]', err);
    res.status(500).json({ error: err.message || 'Internal chat service error' });
  }
});

// GET /customers/:customerId/memories
router.get('/customers/:customerId/memories', async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const customer = db.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ error: `Customer with ID "${customerId}" not found.` });
  }
  const memories = await hindsight.listMemories(customerId);
  const bankId = hindsight.getBankIdForCustomer(customerId);
  res.json({ customerId, bankId, memories, count: memories.length });
});

// POST /customers/:customerId/memories/recall
router.post('/customers/:customerId/memories/recall', async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const customer = db.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ error: `Customer with ID "${customerId}" not found.` });
  }
  const { query = '', topK = 5 } = req.body;
  const result = await hindsight.recall(customerId, query, topK);
  res.json(result);
});

// POST /customers/:customerId/memories/retain
router.post('/customers/:customerId/memories/retain', async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const customer = db.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ error: `Customer with ID "${customerId}" not found.` });
  }
  const { content, metadata, type } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Missing memory content' });
  }

  const result = await hindsight.retain(customerId, content, metadata, type);
  res.json(result);
});

// POST /customers/:customerId/recommendation
router.post('/customers/:customerId/recommendation', async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const { ticketId, message = '', useMemory = true } = req.body;

  const customer = db.getCustomerById(customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const ticket = ticketId ? db.getTicketById(ticketId) : undefined;
  const ticketHistory = db.getTicketsByCustomer(customerId);
  const recentMessages = ticket ? db.getMessagesByTicket(ticket.id) : [];

  let recalledMemories: HindsightMemory[] = [];
  if (useMemory) {
    const query = message || ticket?.subject || '';
    const recallResult = await hindsight.recall(customerId, query, 5);
    if (recallResult.available) {
      recalledMemories = [...recallResult.memories];
      const allMemories = await hindsight.listMemories(customerId);
      const preferences = allMemories.filter((m) => m.category === 'preference');
      for (const pref of preferences) {
        if (!recalledMemories.some((rm) => rm.id === pref.id)) {
          recalledMemories.push(pref);
        }
      }
    }
  }

  const recommendation = recommendationEngine.generateRecommendation({
    customer,
    currentMessage: message || ticket?.subject || '',
    recentMessages,
    currentTicket: ticket,
    ticketHistory,
    recalledMemories,
    useMemory,
  });

  res.json({ recommendation });
});

// GET /status
router.get('/status', async (req: Request, res: Response) => {
  const hindsightHealth = await hindsight.checkHealth();
  const stats = db.getStats();

  const status: SystemStatus = {
    hindsight: {
      status: hindsightHealth.connected ? 'connected' : 'disconnected',
      baseUrl: hindsightHealth.baseUrl,
      details: hindsightHealth.details,
    },
    llm: {
      provider: groq.isConfigured() ? 'Groq' : 'Fallback',
      model: groq.getModelName(),
      configured: groq.isConfigured(),
    },
    database: stats,
  };

  res.json(status);
});

// POST /reset
router.post('/reset', async (req: Request, res: Response) => {
  db.reset();
  // Also call reset on hindsight server if local
  try {
    await fetch(`${hindsightHealthUrl()}/v1/admin/reset`, { method: 'POST' }).catch(() => {});
  } catch {}

  res.json({
    status: 'success',
    message: 'Reset database and Hindsight memory banks to initial seed state.',
    stats: db.getStats(),
  });
});

function hindsightHealthUrl(): string {
  return (process.env.HINDSIGHT_BASE_URL || 'http://localhost:8888').replace(/\/$/, '');
}

export default router;
