// test_harden_backend.ts
import http from 'http';

async function rawRequest(
  options: http.RequestOptions,
  body?: string
): Promise<{ status: number; headers: http.IncomingHttpHeaders; data: any; raw: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        let data: any = raw;
        try {
          data = JSON.parse(raw);
        } catch {}
        resolve({ status: res.statusCode || 0, headers: res.headers, data, raw });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function postJson(path: string, payload: any) {
  const body = JSON.stringify(payload);
  return rawRequest(
    {
      hostname: 'localhost',
      port: 3001,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    body
  );
}

async function getJson(path: string) {
  return rawRequest({
    hostname: 'localhost',
    port: 3001,
    path,
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
}

async function runHardeningTests() {
  console.log('====================================================');
  console.log('🛡️  BACKEND HARDENING & ERROR HANDLING TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(title: string, condition: boolean, details?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${title}`);
      if (details) console.log(`   └─ ${details}`);
    } else {
      console.error(`❌ [FAIL] ${title}`);
      if (details) console.error(`   └─ ${details}`);
    }
  }

  // -----------------------------------------------------------
  // 1. REQUIRED CHAT PIPELINE VERIFICATION
  // -----------------------------------------------------------
  console.log('--- 1. Testing Required Chat Pipeline ---');
  const chatRes = await postJson('/api/chat', {
    customerId: 'cust_1',
    message: 'My payment is failing again at checkout.',
    useMemory: true,
  });

  assert(
    'Chat endpoint returns HTTP 200 with complete response object',
    chatRes.status === 200 && typeof chatRes.data === 'object'
  );

  const pipeline = chatRes.data;
  assert(
    'Pipeline Step 1 & 2: Identifies customer and conversation ticket',
    pipeline.customerId === 'cust_1' && Boolean(pipeline.ticketId)
  );

  assert(
    'Pipeline Step 3: Recalls relevant Hindsight memory',
    Array.isArray(pipeline.recalledMemories) && pipeline.recalledMemories.length > 0,
    `Recalled ${pipeline.recalledMemories?.length || 0} memories`
  );

  assert(
    'Pipeline Step 4 & 5: Builds LLM context & generates grounded response',
    typeof pipeline.message === 'string' && pipeline.message.length > 20
  );

  assert(
    'Pipeline Step 6 & 7: Returns memory status and retains meaningful candidate',
    pipeline.memoryStatus === 'active' && Boolean(pipeline.observability?.retentionDecision)
  );

  // -----------------------------------------------------------
  // 2. CUSTOMER ISOLATION & TICKET SECURITY
  // -----------------------------------------------------------
  console.log('\n--- 2. Testing Customer Isolation & Security ---');

  // Customer A vs Customer B
  const priyaChat = await postJson('/api/chat', {
    customerId: 'cust_2',
    message: 'Our Authenticator app 6-digit codes are failing with time drift.',
    useMemory: true,
  });

  const priyaMessage = priyaChat.data.message || '';
  const priyaMemories = JSON.stringify(priyaChat.data.recalledMemories || []);
  const noRahulLeak =
    !priyaMessage.toLowerCase().includes('rahul') &&
    !priyaMessage.toLowerCase().includes('apex fintech') &&
    !priyaMemories.toLowerCase().includes('rahul') &&
    !priyaMemories.toLowerCase().includes('apex fintech');

  assert(
    'Memories & customer context are strictly isolated per customer',
    noRahulLeak,
    'Zero data leakage between customer banks'
  );

  // Ticket ownership cross-customer injection attempt
  // Try to use Rahul's ticket PAY-104 while chatting as Priya (cust_2)
  const crossTicketChat = await postJson('/api/chat', {
    customerId: 'cust_2',
    ticketId: 'PAY-104', // Belongs to cust_1!
    message: 'Checking ticket status.',
    useMemory: true,
  });

  assert(
    'Cross-customer ticket injection is rejected/ignored safely',
    crossTicketChat.data.ticketId !== 'PAY-104' && crossTicketChat.data.customerId === 'cust_2',
    `Prevented hijacking ticket PAY-104; assigned customer's own ticket #${crossTicketChat.data.ticketId}`
  );

  // -----------------------------------------------------------
  // 3. SECURITY & CREDENTIAL PRIVACY
  // -----------------------------------------------------------
  console.log('\n--- 3. Testing Security & Credential Privacy ---');
  const statusRes = await getJson('/api/status');
  const statusData = statusRes.data;

  assert(
    'Status endpoint does NOT leak API keys or secrets',
    statusData &&
      !('apiKey' in (statusData.llm || {})) &&
      !('apiKey' in (statusData.hindsight || {})),
    'Sensitive credentials omitted from public status endpoint'
  );

  assert(
    'Reports truth in external services (Configured: false when no key)',
    statusData.llm?.configured === false && statusData.llm?.provider === 'Fallback',
    `Provider is "${statusData.llm?.provider}", Configured: ${statusData.llm?.configured}`
  );

  // -----------------------------------------------------------
  // 4. ERROR HANDLING & RESILIENCE
  // -----------------------------------------------------------
  console.log('\n--- 4. Testing Error Handling & Graceful Failures ---');

  // Test: Missing Customer
  const missingCustRes = await postJson('/api/chat', {
    customerId: 'cust_99999_non_existent',
    message: 'Hello, need help.',
  });
  assert(
    'Missing customer returns HTTP 404 with error message',
    missingCustRes.status === 404 && missingCustRes.data.error.includes('not found'),
    `HTTP ${missingCustRes.status}: "${missingCustRes.data.error}"`
  );

  // Test: Missing customerId in payload
  const noCustRes = await postJson('/api/chat', {
    message: 'Hello, need help.',
  });
  assert(
    'Missing customerId payload returns HTTP 400 Bad Request',
    noCustRes.status === 400 && noCustRes.data.error.includes('Missing customerId'),
    `HTTP ${noCustRes.status}: "${noCustRes.data.error}"`
  );

  // Test: Empty Message
  const emptyMsgRes = await postJson('/api/chat', {
    customerId: 'cust_1',
    message: '   ',
  });
  assert(
    'Empty/whitespace message returns HTTP 400 Bad Request',
    emptyMsgRes.status === 400 && emptyMsgRes.data.error.includes('Message cannot be empty'),
    `HTTP ${emptyMsgRes.status}: "${emptyMsgRes.data.error}"`
  );

  // Test: Malformed JSON payload
  const malformedRes = await rawRequest(
    {
      hostname: 'localhost',
      port: 3001,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    '{"customerId": "cust_1", "message": INVALID_JSON_SYNTAX'
  );
  assert(
    'Malformed JSON payload returns HTTP 400 instead of crashing server',
    malformedRes.status === 400 && malformedRes.data.error.includes('Malformed JSON'),
    `HTTP ${malformedRes.status}: "${malformedRes.data.error}"`
  );

  // Test: Unknown API route (404)
  const unknownRouteRes = await getJson('/api/non_existent_service_route_404');
  assert(
    'Unknown API route returns HTTP 404 with clean JSON error',
    unknownRouteRes.status === 404 && unknownRouteRes.data.error.includes('API route not found'),
    `HTTP ${unknownRouteRes.status}: "${unknownRouteRes.data.error}"`
  );

  // Test: Unconfigured / Failed Groq fallback resilience
  assert(
    'LLM Integration gracefully handles unconfigured / failed LLM without crashing',
    typeof pipeline.message === 'string' &&
      (pipeline.llmModel?.includes('Fallback') ||
        pipeline.llmModel?.includes('openai') ||
        pipeline.llmModel?.includes('Guided')),
    `Generated high-fidelity memory-guided response safely: "${pipeline.message.slice(0, 60)}..."`
  );

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL BACKEND HARDENING & RELIABILITY CHECKS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME CHECKS FAILED');
  }
  console.log('====================================================');
}

runHardeningTests().catch(console.error);
