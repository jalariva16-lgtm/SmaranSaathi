import { config } from '../config/env';
import { HindsightMemory } from '../types';

export interface HindsightRecallResult {
  success: boolean;
  available: boolean;
  memories: HindsightMemory[];
  error?: string;
  latencyMs: number;
}

export interface HindsightRetainResult {
  success: boolean;
  available: boolean;
  memory?: HindsightMemory;
  operationId?: string;
  error?: string;
}

export interface HindsightStatusResult {
  connected: boolean;
  baseUrl: string;
  details: string;
  latencyMs: number;
}

export class HindsightClient {
  private baseUrl: string;
  private apiKey: string;
  private timeoutMs: number;

  constructor() {
    this.baseUrl = config.hindsight.baseUrl.replace(/\/$/, '');
    this.apiKey = config.hindsight.apiKey;
    this.timeoutMs = config.hindsight.timeoutMs;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  public getBankIdForCustomer(customerId: string): string {
    // Formulate strict bank ID per customer for guaranteed memory isolation
    return `customer_${customerId.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
  }

  public async checkHealth(): Promise<HindsightStatusResult> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.getHeaders(),
        signal: controller.signal,
      }).catch(async () => {
        // Try fallback health route
        return await fetch(`${this.baseUrl}/v1/health`, {
          headers: this.getHeaders(),
          signal: controller.signal,
        });
      });

      clearTimeout(timer);
      const latencyMs = Date.now() - start;

      if (response && response.ok) {
        const body = (await response.json().catch(() => ({}))) as any;
        return {
          connected: true,
          baseUrl: this.baseUrl,
          details: `Connected (${body.service || 'Hindsight'} v${body.version || '1.0'})`,
          latencyMs,
        };
      } else {
        return {
          connected: false,
          baseUrl: this.baseUrl,
          details: `HTTP ${response ? response.status : 'No response'} from ${this.baseUrl}`,
          latencyMs,
        };
      }
    } catch (err: any) {
      return {
        connected: false,
        baseUrl: this.baseUrl,
        details: `Connection refused at ${this.baseUrl}: ${err.message || 'Service unavailable'}`,
        latencyMs: Date.now() - start,
      };
    }
  }

  public async recall(customerId: string, query: string, topK: number = 5): Promise<HindsightRecallResult> {
    const bankId = this.getBankIdForCustomer(customerId);
    const start = Date.now();

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      // Call official Hindsight recall endpoint
      const response = await fetch(`${this.baseUrl}/v1/default/banks/${bankId}/memories/recall`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ query, top_k: topK }),
        signal: controller.signal,
      }).catch(async (fetchErr) => {
        // Try alternative endpoint paths supported by Hindsight versions
        return await fetch(`${this.baseUrl}/v1/banks/${bankId}/memories/recall`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ query, top_k: topK }),
          signal: controller.signal,
        });
      });

      clearTimeout(timer);
      const latencyMs = Date.now() - start;

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`[HindsightClient] Recall failed HTTP ${response.status}: ${errText}`);
        return {
          success: false,
          available: false,
          memories: [],
          error: `Hindsight HTTP ${response.status}: ${errText || response.statusText}`,
          latencyMs,
        };
      }

      const data = (await response.json()) as any;
      const rawResults = data.results || data.memories || [];

      const memories: HindsightMemory[] = rawResults.map((item: any) => ({
        id: item.id || `mem_${Date.now()}`,
        bankId,
        content: item.content || item.document || item.text || '',
        relevanceScore: item.relevanceScore ?? item.score ?? undefined,
        relevanceReason: item.relevanceReason || item.metadata?.reason,
        type: item.type || 'observation',
        category: item.category || 'context',
        timestamp: item.timestamp || new Date().toISOString(),
        metadata: item.metadata || {},
      }));

      console.log(`[HindsightClient] Recalled ${memories.length} memories for bank ${bankId} (${latencyMs}ms)`);
      return {
        success: true,
        available: true,
        memories,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      console.warn(`[HindsightClient] Recall exception connecting to ${this.baseUrl}: ${err.message}`);
      return {
        success: false,
        available: false,
        memories: [],
        error: `Hindsight service unreachable at ${this.baseUrl} (${err.message})`,
        latencyMs,
      };
    }
  }

  public async retain(
    customerId: string,
    content: string,
    metadata: Record<string, any> = {},
    type: string = 'observation'
  ): Promise<HindsightRetainResult> {
    const bankId = this.getBankIdForCustomer(customerId);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.baseUrl}/v1/default/banks/${bankId}/memories/retain`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          content,
          metadata: {
            customerId,
            ...metadata,
          },
          type,
        }),
        signal: controller.signal,
      }).catch(async () => {
        return await fetch(`${this.baseUrl}/v1/banks/${bankId}/memories/retain`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            content,
            metadata: { customerId, ...metadata },
            type,
          }),
          signal: controller.signal,
        });
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`[HindsightClient] Retain failed HTTP ${response.status}: ${errText}`);
        return {
          success: false,
          available: false,
          error: `Hindsight HTTP ${response.status}: ${errText}`,
        };
      }

      const data = (await response.json()) as any;
      console.log(`[HindsightClient] Successfully retained memory into bank ${bankId}: "${content.slice(0, 50)}..."`);

      return {
        success: true,
        available: true,
        memory: data.memory,
        operationId: data.operation_id,
      };
    } catch (err: any) {
      console.warn(`[HindsightClient] Retain failed: Hindsight unreachable at ${this.baseUrl} (${err.message})`);
      return {
        success: false,
        available: false,
        error: `Hindsight service unreachable at ${this.baseUrl} (${err.message})`,
      };
    }
  }

  public async listMemories(customerId: string): Promise<HindsightMemory[]> {
    const bankId = this.getBankIdForCustomer(customerId);
    try {
      const response = await fetch(`${this.baseUrl}/v1/default/banks/${bankId}/memories`, {
        headers: this.getHeaders(),
      }).catch(async () => {
        return await fetch(`${this.baseUrl}/v1/banks/${bankId}/memories`, {
          headers: this.getHeaders(),
        });
      });

      if (!response.ok) return [];
      const data = (await response.json()) as any;
      return data.memories || [];
    } catch {
      return [];
    }
  }
}

export const hindsight = new HindsightClient();
