import fs from 'fs';
import path from 'path';
import { Customer, Ticket, Message, DashboardMetrics } from '../types';
import { INITIAL_CUSTOMERS, generateSeedTicketsAndMessages } from './seedData';
import { config } from '../config/env';

interface DatabaseSchema {
  customers: Customer[];
  tickets: Ticket[];
  messages: Message[];
}

class Database {
  private data: DatabaseSchema;
  private filePath: string;

  constructor() {
    this.filePath = config.dbPath;
    this.data = {
      customers: [],
      tickets: [],
      messages: [],
    };
    this.initialize();
  }

  private initialize() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure valid schema
        if (!this.data.customers || this.data.customers.length === 0) {
          this.seed();
        }
      } catch (err) {
        console.warn('[Database] Error reading existing file, resetting to seed data:', err);
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  public seed() {
    console.log('[Database] Seeding 20 customers and 100 tickets with message history...');
    const { tickets, messages } = generateSeedTicketsAndMessages();
    this.data = {
      customers: [...INITIAL_CUSTOMERS],
      tickets,
      messages,
    };
    this.save();
    console.log(`[Database] Seeded ${this.data.customers.length} customers, ${this.data.tickets.length} tickets, and ${this.data.messages.length} messages.`);
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to save database file:', err);
    }
  }

  // Customer Queries
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  // Ticket Queries
  public getTicketsByCustomer(customerId: string): Ticket[] {
    return this.data.tickets
      .filter((t) => t.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getTicketById(ticketId: string): Ticket | undefined {
    return this.data.tickets.find((t) => t.id === ticketId);
  }

  public createTicket(ticket: Omit<Ticket, 'id' | 'createdAt'>): Ticket {
    const id = `TICK-${Date.now().toString().slice(-4)}`;
    const newTicket: Ticket = {
      ...ticket,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.tickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  public updateTicketStatus(
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved',
    resolutionSummary?: string
  ): Ticket | undefined {
    const ticket = this.data.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      if (status === 'resolved') {
        ticket.resolvedAt = new Date().toISOString();
        if (resolutionSummary) {
          ticket.resolutionSummary = resolutionSummary;
        }
      }
      this.save();
    }
    return ticket;
  }

  // Message Queries
  public getMessagesByTicket(ticketId: string): Message[] {
    return this.data.messages
      .filter((m) => m.ticketId === ticketId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.messages.push(newMessage);
    this.save();
    return newMessage;
  }

  public getStats() {
    return {
      customersCount: this.data.customers.length,
      ticketsCount: this.data.tickets.length,
      messagesCount: this.data.messages.length,
    };
  }

  public getDashboardMetrics(): DashboardMetrics {
    const customers = this.data.customers || [];
    const tickets = this.data.tickets || [];
    const messages = this.data.messages || [];

    const totalCustomers = customers.length;
    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length;

    // Repeated issues: count tickets where a customer has 2+ tickets of the same issueType
    const customerIssueCounts: Record<string, Record<string, number>> = {};
    for (const ticket of tickets) {
      if (!customerIssueCounts[ticket.customerId]) {
        customerIssueCounts[ticket.customerId] = {};
      }
      customerIssueCounts[ticket.customerId][ticket.issueType] =
        (customerIssueCounts[ticket.customerId][ticket.issueType] || 0) + 1;
    }
    let repeatedIssuesCount = 0;
    for (const custId in customerIssueCounts) {
      for (const issueType in customerIssueCounts[custId]) {
        if (customerIssueCounts[custId][issueType] > 1) {
          repeatedIssuesCount += customerIssueCounts[custId][issueType] - 1;
        }
      }
    }

    // Customers with previous support history (more than 1 ticket or has resolved ticket)
    const customersWithHistory = customers.filter((c) => {
      const custTickets = tickets.filter((t) => t.customerId === c.id);
      return custTickets.length > 1 || custTickets.some((t) => t.status === 'resolved');
    }).length;

    // Memory-enabled conversations: tickets where at least one AI message used Hindsight memories
    const memoryEnabledTicketIds = new Set(
      messages
        .filter(
          (m) =>
            m.sender === 'ai' &&
            ((m.recalledMemoriesUsed && m.recalledMemoriesUsed.length > 0) ||
              m.memoryOperationStatus === 'recalled')
        )
        .map((m) => m.ticketId)
    );
    const memoryEnabledConversations = memoryEnabledTicketIds.size;

    // Common issue types
    const issueTypeCounts: Record<string, number> = {};
    for (const ticket of tickets) {
      const type = ticket.issueType || 'General';
      issueTypeCounts[type] = (issueTypeCounts[type] || 0) + 1;
    }
    const commonIssueTypes = Object.entries(issueTypeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalCustomers,
      totalTickets,
      openTickets,
      resolvedTickets,
      repeatedIssues: repeatedIssuesCount,
      customersWithHistory,
      memoryEnabledConversations,
      commonIssueTypes,
    };
  }

  public reset() {
    this.seed();
    return this.getStats();
  }
}

export const db = new Database();
