import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import apiRouter from './routes/api';
import { startHindsightServer } from './hindsight-server/server';

const app = express();

app.use(cors());
app.use(express.json());

// Handle malformed JSON body
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }
  next(err);
});

// API Routes
app.use('/api', apiRouter);

// Handle unknown API routes (404 Not Found)
app.use('/api', (req: express.Request, res: express.Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global unhandled error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({ error: 'Internal server error', details: err.message || 'An unexpected error occurred' });
});


// Root Welcome & Documentation
app.get('/', (req, res) => {
  res.json({
    name: 'SmaranSaathi API',
    description: 'AI Customer Support Agent with Persistent Memory powered by Hindsight and Groq',
    endpoints: {
      customers: 'GET /api/customers',
      customerDetails: 'GET /api/customers/:customerId',
      customerTickets: 'GET /api/customers/:customerId/tickets',
      ticketDetails: 'GET /api/tickets/:ticketId',
      chat: 'POST /api/chat',
      customerMemories: 'GET /api/customers/:customerId/memories',
      retainMemory: 'POST /api/customers/:customerId/memories/retain',
      systemStatus: 'GET /api/status',
      resetData: 'POST /api/reset',
    },
    hindsightUrl: config.hindsight.baseUrl,
    configuredLLM: config.groq.model,
  });
});

// Auto-start Hindsight server if HINDSIGHT_BASE_URL points to localhost:8888
if (config.hindsight.baseUrl.includes('localhost:8888') || config.hindsight.baseUrl.includes('127.0.0.1:8888')) {
  try {
    startHindsightServer(8888);
  } catch (err: any) {
    console.log(`[Hindsight Server] Notice: Port 8888 already in use (Docker or external process running): ${err.message}`);
  }
}

app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 SmaranSaathi Backend running on http://localhost:${config.port}`);
  console.log(`🧠 Hindsight Base URL: ${config.hindsight.baseUrl}`);
  console.log(`⚡ Groq Model: ${config.groq.model} (Configured: ${Boolean(config.groq.apiKey)})`);
  console.log(`====================================================`);
});
