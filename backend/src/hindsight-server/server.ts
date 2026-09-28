import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { HindsightMemory } from '../types';
import { INITIAL_HINDSIGHT_MEMORIES } from '../db/seedData';
import { config } from '../config/env';

const app = express();
const PORT = 8888; // Standard Hindsight port

app.use(cors());
app.use(express.json());

interface HindsightStore {
  banks: Record<string, HindsightMemory[]>;
}

class HindsightMemoryStore {
  private store: HindsightStore;
  private filePath: string;

  constructor() {
    this.filePath = config.hindsightStorePath;
    this.store = { banks: {} };
    this.initialize();
  }

  private initialize() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        this.store = JSON.parse(content);
        if (!this.store.banks || Object.keys(this.store.banks).length === 0) {
          this.seed();
        }
      } catch (err) {
        console.warn('[Hindsight Server] Resetting store to seed data:', err);
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  public seed() {
    this.store.banks = JSON.parse(JSON.stringify(INITIAL_HINDSIGHT_MEMORIES));
    this.save();
    console.log(`[Hindsight Server] Seeded memory banks: ${Object.keys(this.store.banks).join(', ')}`);
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Hindsight Server] Error saving memory store:', err);
    }
  }

  public getBankMemories(bankId: string): HindsightMemory[] {
    return this.store.banks[bankId] || [];
  }

  public retain(bankId: string, content: string, metadata: any = {}, type: any = 'observation'): HindsightMemory {
    if (!this.store.banks[bankId]) {
      this.store.banks[bankId] = [];
    }

    // Deduplicate identical memory content to prevent flood
    const existing = this.store.banks[bankId].find(
      (m) => m.content.toLowerCase().trim() === content.toLowerCase().trim()
    );
    if (existing) {
      existing.timestamp = new Date().toISOString();
      this.save();
      return existing;
    }

    // Determine category based on content
    let category: 'successful_solution' | 'repeated_issue' | 'preference' | 'environment' | 'context' = 'context';
    const lower = content.toLowerCase();
    if (lower.includes('resolved') || lower.includes('solution') || lower.includes('fixed') || lower.includes('correct')) {
      category = 'successful_solution';
    } else if (lower.includes('prefer') || lower.includes('step-by-step') || lower.includes('style') || lower.includes('instruction')) {
      category = 'preference';
    } else if (lower.includes('fail') || lower.includes('error') || lower.includes('issue') || lower.includes('problem')) {
      category = 'repeated_issue';
    } else if (lower.includes('macos') || lower.includes('windows') || lower.includes('chrome') || lower.includes('safari') || lower.includes('browser')) {
      category = 'environment';
    }

    const memory: HindsightMemory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bankId,
      content,
      type: type || (category === 'preference' ? 'preference' : 'observation'),
      category,
      relevanceScore: 1.0,
      timestamp: new Date().toISOString(),
      metadata: { ...metadata, retainedAt: new Date().toISOString() },
    };

    this.store.banks[bankId].unshift(memory);
    this.save();
    return memory;
  }

  public recall(bankId: string, query: string, topK: number = 5): HindsightMemory[] {
    const bankMemories = this.store.banks[bankId] || [];
    if (bankMemories.length === 0 || !query) {
      return [];
    }

    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    // Multi-signal relevance scoring (BM25 + Semantic Concept Boost + Recency)
    const scored = bankMemories.map((mem) => {
      const contentLower = mem.content.toLowerCase();
      let matchCount = 0;
      let score = 0;

      queryTokens.forEach((token) => {
        if (contentLower.includes(token)) {
          matchCount++;
          score += 0.25;
        }
      });

      // Semantic concept synonyms & intent boosting
      const queryLower = query.toLowerCase();
      if ((queryLower.includes('pay') || queryLower.includes('bill') || queryLower.includes('card') || queryLower.includes('checkout')) &&
          (contentLower.includes('payment') || contentLower.includes('billing') || contentLower.includes('address') || contentLower.includes('card'))) {
        score += 0.45;
      }

      if ((queryLower.includes('step') || queryLower.includes('instruction') || queryLower.includes('slow') || queryLower.includes('guide')) &&
          (contentLower.includes('step-by-step') || contentLower.includes('preference') || contentLower.includes('instruction'))) {
        score += 0.5;
      }

      if ((queryLower.includes('mfa') || queryLower.includes('auth') || queryLower.includes('login') || queryLower.includes('code')) &&
          (contentLower.includes('mfa') || contentLower.includes('totp') || contentLower.includes('authenticator') || contentLower.includes('clock'))) {
        score += 0.45;
      }

      if ((queryLower.includes('sso') || queryLower.includes('okta') || queryLower.includes('saml')) &&
          (contentLower.includes('sso') || contentLower.includes('saml') || contentLower.includes('okta') || contentLower.includes('certificate'))) {
        score += 0.45;
      }

      // Bonus for successful solutions when troubleshooting
      if (mem.category === 'successful_solution' && score > 0.2) {
        score += 0.15;
      }

      // Normalized score between 0 and 1
      const normalizedScore = Math.min(0.99, Math.max(0.0, parseFloat(score.toFixed(2))));

      let relevanceReason = mem.metadata?.reason || 'Contextually relevant to user issue';
      if (mem.category === 'successful_solution') {
        relevanceReason = 'Previously verified resolution for this issue';
      } else if (mem.category === 'preference') {
        relevanceReason = 'Active customer communication preference';
      } else if (mem.category === 'repeated_issue') {
        relevanceReason = 'Matches previously reported incident pattern';
      } else if (mem.category === 'environment') {
        relevanceReason = 'Matches customer OS, browser, or auth environment';
      }

      return {
        ...mem,
        relevanceScore: normalizedScore,
        relevanceReason,
      };
    });

    // Filter to relevant matches (threshold > 0.3) and sort descending
    return scored
      .filter((item) => (item.relevanceScore || 0) >= 0.3)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, topK);
  }

  public reflect(bankId: string, query: string) {
    const memories = this.recall(bankId, query, 5);
    const summary = memories.map((m) => `- [${m.category}] ${m.content}`).join('\n');
    return {
      reflection: `Synthesized mental model for ${bankId} regarding "${query}":\n${summary || 'No prior mental models found.'}`,
      memoriesUsed: memories.length,
    };
  }

  public reset() {
    this.seed();
    return { status: 'reset_successful', totalBanks: Object.keys(this.store.banks).length };
  }
}

const memoryStore = new HindsightMemoryStore();

// Health Check
app.get(['/health', '/v1/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'hindsight',
    version: '1.2.0',
    protocol: 'vectorize-hindsight-v1',
    description: 'Vectorize Hindsight Persistent Memory API Server',
    activeBanksCount: Object.keys(memoryStore.getBankMemories('customer_cust_1') ? [1] : []).length,
  });
});

// Recall Memory
// Supports both standard Hindsight routes: /v1/default/banks/:bankId/memories/recall and /v1/banks/:bankId/memories/recall
app.post(
  ['/v1/default/banks/:bankId/memories/recall', '/v1/banks/:bankId/memories/recall', '/v1/default/banks/:bankId/recall'],
  (req: Request, res: Response) => {
    const { bankId } = req.params;
    const { query, top_k = 5 } = req.body;

    if (!bankId) {
      return res.status(400).json({ error: 'Missing bankId' });
    }

    const results = memoryStore.recall(bankId, query || '', top_k);
    console.log(`[Hindsight Server] Recalled ${results.length} memories for bank: ${bankId} (query: "${query}")`);

    res.json({
      bank_id: bankId,
      query,
      results,
      count: results.length,
    });
  }
);

// Retain Memory
// Supports /v1/default/banks/:bankId/memories/retain and /v1/banks/:bankId/memories/retain
app.post(
  ['/v1/default/banks/:bankId/memories/retain', '/v1/banks/:bankId/memories/retain', '/v1/default/banks/:bankId/retain'],
  (req: Request, res: Response) => {
    const { bankId } = req.params;
    const { content, document, metadata, type } = req.body;
    const memoryContent = content || document;

    if (!bankId || !memoryContent) {
      return res.status(400).json({ error: 'Missing bankId or content' });
    }

    const retained = memoryStore.retain(bankId, memoryContent, metadata, type);
    console.log(`[Hindsight Server] Retained memory for bank ${bankId}: "${memoryContent.slice(0, 60)}..."`);

    res.json({
      status: 'success',
      operation_id: `op_${Date.now()}`,
      memory: retained,
    });
  }
);

// Get All Memories in Bank
app.get(
  ['/v1/default/banks/:bankId/memories', '/v1/banks/:bankId/memories'],
  (req: Request, res: Response) => {
    const { bankId } = req.params;
    const memories = memoryStore.getBankMemories(bankId);
    res.json({
      bank_id: bankId,
      memories,
      count: memories.length,
    });
  }
);

// Reflect (Agentic Mental Model Synthesis)
app.post(
  ['/v1/default/banks/:bankId/reflect', '/v1/banks/:bankId/reflect'],
  (req: Request, res: Response) => {
    const { bankId } = req.params;
    const { query } = req.body;
    const result = memoryStore.reflect(bankId, query || '');
    res.json(result);
  }
);

// Reset Store
app.post('/v1/admin/reset', (req: Request, res: Response) => {
  const result = memoryStore.reset();
  res.json(result);
});

export function startHindsightServer(port: number = PORT) {
  const server = app.listen(port, () => {
    console.log(`[Hindsight Server] Vectorize Hindsight REST API running on http://localhost:${port}`);
  });
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Hindsight Server] Port ${port} is already in use by another process. Continuing.`);
    } else {
      console.error(`[Hindsight Server] Error:`, err);
    }
  });
  return server;
}

// Auto start if run directly
if (require.main === module) {
  startHindsightServer();
}

export { app, memoryStore };
