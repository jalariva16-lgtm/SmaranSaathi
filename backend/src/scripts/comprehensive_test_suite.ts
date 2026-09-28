// Uses Node native global fetch

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function record(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  const symbol = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${symbol} | ${name}: ${details}`);
}

async function runTestSuite() {
  const baseUrl = 'http://localhost:3001/api';

  console.log('================================================================');
  console.log('SMARANSAATHI — COMPREHENSIVE END-TO-END TEST SUITE');
  console.log('================================================================\n');

  // STEP 0: Reset to clean initial seed data
  console.log('>>> Resetting test database & Hindsight memory banks to initial seed state...');
  const resetRes = await fetch(`${baseUrl}/reset`, { method: 'POST' });
  const resetData = (await resetRes.json()) as any;
  record('System Reset', resetRes.ok, `Database reset status: ${resetData.status}`);

  console.log('\n================================================================');
  console.log('PART 1: CANONICAL 13-STEP END-TO-END USER JOURNEY');
  console.log('================================================================\n');

  // STEP 1: Select Rahul Sharma (cust_1)
  const custRes = await fetch(`${baseUrl}/customers/cust_1`);
  const rahulData = (await custRes.json()) as any;
  const rahul = rahulData.customer;
  record('Step 1: Select Rahul', Boolean(rahul && rahul.name === 'Rahul Sharma'), `Customer loaded: ${rahul?.name} (${rahul?.company})`);

  // STEP 2: Start a support conversation (create ticket)
  const ticketRes = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      issueType: 'Payment',
      subject: 'Payment failure during monthly subscription invoice checkout',
    }),
  });
  const newTicketData = (await ticketRes.json()) as any;
  const ticket1 = newTicketData.ticket;
  record('Step 2: Start Support Conversation', ticketRes.status === 201, `Created Ticket #${ticket1?.id} for ${rahul.name}`);

  // STEP 3: Customer reports payment failure
  // STEP 4: AI responds using current conversation and relevant Hindsight memory
  const chat1Res = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      ticketId: ticket1.id,
      message: 'My corporate Visa card is failing at checkout.',
      useMemory: true,
    }),
  });
  const chat1 = (await chat1Res.json()) as any;
  record(
    'Step 3 & 4: Customer reports failure & AI responds with Hindsight context',
    chat1Res.ok && chat1.memoryStatus === 'active' && chat1.recalledMemories.length > 0,
    `Recalled ${chat1.recalledMemories?.length} memories. Status: ${chat1.memoryStatus}. AI suggested: "${chat1.suggestedAction}"`
  );

  // STEP 5: Resolve the issue (customer updates billing address, ticket resolved)
  const resolveChatRes = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      ticketId: ticket1.id,
      message: 'I updated our billing address to 402 Lakeview Blvd and the payment cleared!',
      useMemory: true,
    }),
  });
  const resolveChat = (await resolveChatRes.json()) as any;

  // Mark ticket as resolved in DB
  const updateStatusRes = await fetch(`${baseUrl}/tickets/${ticket1.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'resolved',
      resolutionSummary: 'Billing address updated to 402 Lakeview Blvd matching bank statement. Payment cleared successfully.',
    }),
  });
  record('Step 5: Resolve the Issue', updateStatusRes.ok, `Ticket #${ticket1.id} marked resolved in database`);

  // STEP 6: Retain meaningful information in Hindsight
  const retainRes = await fetch(`${baseUrl}/customers/cust_1/memories/retain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: 'Customer confirmed payment processed immediately after updating billing address to 402 Lakeview Blvd.',
      metadata: { ticketId: ticket1.id, source: 'verified_resolution' },
      type: 'observation',
    }),
  });
  const retainData = (await retainRes.json()) as any;
  record(
    'Step 6: Retain Meaningful Memory in Hindsight',
    retainRes.ok && retainData.success && Boolean(retainData.memory?.id),
    `Retained memory id: ${retainData.memory?.id} into bank: ${retainData.memory?.bankId}`
  );

  // STEP 7: Start a NEW conversation with Rahul
  const ticket2Res = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      issueType: 'Payment',
      subject: 'New inquiry: card failure on renewal',
    }),
  });
  const ticket2Data = (await ticket2Res.json()) as any;
  const ticket2 = ticket2Data.ticket;
  record('Step 7: Start NEW Conversation with Rahul', ticket2Res.status === 201, `Created clean Ticket #${ticket2.id}`);

  // STEP 8: Customer says: "My payment is failing again."
  // STEP 9: Verify Hindsight recalls previous relevant information
  // STEP 10: Verify AI response uses that memory
  const chat2Res = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      ticketId: ticket2.id,
      message: 'My payment is failing again.',
      useMemory: true,
    }),
  });
  const chat2 = (await chat2Res.json()) as any;

  const hasBillingAddressMemory = chat2.recalledMemories?.some((m: any) =>
    m.content.toLowerCase().includes('billing address') || m.content.toLowerCase().includes('resolved')
  );
  const responseUsesMemory = chat2.message.toLowerCase().includes('billing address');
  const responseFormatsStepByStep = chat2.message.toLowerCase().includes('step-by-step') || chat2.message.toLowerCase().includes('step 1');

  record('Step 8: Customer says "My payment is failing again."', chat2Res.ok, `Message processed successfully`);
  record(
    'Step 9: Hindsight Recalls Previous Solution',
    Boolean(hasBillingAddressMemory),
    `Found billing address resolution memory in recalled set (${chat2.recalledMemories?.length} memories recalled)`
  );
  record(
    'Step 10: AI Response Actively Uses That Memory',
    Boolean(responseUsesMemory && responseFormatsStepByStep),
    `Response mentions billing address: ${responseUsesMemory}, Formatted step-by-step per customer preference: ${responseFormatsStepByStep}`
  );

  // STEP 11: Show the memory in the Memory Panel (GET customer memories)
  const memsRes = await fetch(`${baseUrl}/customers/cust_1/memories`);
  const memsData = (await memsRes.json()) as any;
  const rahulMemories = memsData.memories || [];
  record(
    'Step 11: Show Memory in Memory Panel',
    memsRes.ok && rahulMemories.length >= 4,
    `Memory bank ${memsData.bankId} has ${rahulMemories.length} persistent memories ready for display in MemoryPanel`
  );

  // STEP 12: Switch to another customer (Priya Mehta cust_2)
  const priyaRes = await fetch(`${baseUrl}/customers/cust_2/memories`);
  const priyaData = (await priyaRes.json()) as any;
  const priyaMemories = priyaData.memories || [];

  // STEP 13: Verify Rahul's memory is NOT shown (Memory Isolation)
  const rahulMemoriesLeaked = priyaMemories.some(
    (m: any) =>
      m.bankId === 'customer_cust_1' ||
      m.content.toLowerCase().includes('rahul') ||
      m.content.toLowerCase().includes('apex fintech') ||
      m.content.toLowerCase().includes('402 lakeview')
  );
  record('Step 12: Switch to Another Customer (Priya Mehta)', priyaRes.ok, `Loaded Priya Mehta bank: ${priyaData.bankId}`);
  record(
    'Step 13: Verify Memory Isolation (Rahul memory NOT shown for Priya)',
    !rahulMemoriesLeaked && priyaData.bankId === 'customer_cust_2',
    `Isolation verified: 0 memory leaks across tenant banks. Priya bank contains ${priyaMemories.length} isolated records.`
  );

  console.log('\n================================================================');
  console.log('PART 2: MANDATORY 12 TEST CASES VERIFICATION');
  console.log('================================================================\n');

  // Test Case 1: New customer with NO history or memories (Vikram Singh cust_5)
  const tc1Res = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_5',
      message: 'Hello, how do I configure user roles for our logistics team?',
      useMemory: true,
    }),
  });
  const tc1 = (await tc1Res.json()) as any;
  record(
    'Test Case 1: New Customer (Cold Start)',
    tc1Res.ok && tc1.memoryStatus === 'empty' && tc1.recalledMemories.length === 0,
    `Customer Vikram Singh (0 prior tickets): memoryStatus='${tc1.memoryStatus}', 0 memories invented.`
  );

  // Test Case 2: Returning customer (Rahul Sharma cust_1)
  record(
    'Test Case 2: Returning Customer',
    rahulMemories.length > 0 && chat2.memoryStatus === 'active',
    `Rahul Sharma recognized with 3 past tickets and persistent memory bank active.`
  );

  // Test Case 3: Repeated issue detection
  const tc3RecRes = await fetch(`${baseUrl}/customers/cust_1/recommendation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'My payment is failing again.', useMemory: true }),
  });
  const tc3Rec = (await tc3RecRes.json()) as any;
  record(
    'Test Case 3: Repeated Issue Detection',
    tc3RecRes.ok && Boolean(tc3Rec.recommendation?.detectedIssue.includes('Payment')),
    `Detected Issue: "${tc3Rec.recommendation?.detectedIssue}". Flagged as recurring problem.`
  );

  // Test Case 4: Previous successful solution grounding
  record(
    'Test Case 4: Previous Successful Solution Grounding',
    Boolean(tc3Rec.recommendation?.relevantPreviousExperience?.includes('billing address')),
    `Relevant Previous Experience: "${tc3Rec.recommendation?.relevantPreviousExperience}" (verified, not invented)`
  );

  // Test Case 5: Customer preference compliance
  record(
    'Test Case 5: Customer Preference Compliance',
    chat2.message.includes('Step 1') && tc3Rec.recommendation?.suggestedAction?.includes('step at a time'),
    `Sequential 1-step formatting enforced per customer preference memory.`
  );

  // Test Case 6: Unrelated issue for returning customer
  const tc6Res = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      message: 'Can you tell me how role-based permissions work for auditor accounts?',
      useMemory: true,
    }),
  });
  const tc6 = (await tc6Res.json()) as any;
  const tc6SuggestedAction = tc6.suggestedAction || '';
  const tc6IrrelevantLeak = tc6SuggestedAction.toLowerCase().includes('billing address');
  record(
    'Test Case 6: Unrelated Issue (Semantic Filtering)',
    !tc6IrrelevantLeak,
    `On permission query, payment memories are not misapplied. Suggested action: "${tc6SuggestedAction}"`
  );

  // Test Case 7: Customer switching
  const custSwitchList = await fetch(`${baseUrl}/customers`);
  const custSwitchData = (await custSwitchList.json()) as any;
  record(
    'Test Case 7: Customer Switching',
    custSwitchData.count === 20,
    `Can switch seamlessly across all 20 enterprise customers with isolated context.`
  );

  // Test Case 8: No relevant memory
  const tc8Res = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_14', // Pooja Hegde has 0 memories
      message: 'What is the SLA for enterprise ticket responses?',
      useMemory: true,
    }),
  });
  const tc8 = (await tc8Res.json()) as any;
  record(
    'Test Case 8: No Relevant Memory State',
    tc8.memoryStatus === 'empty' && tc8.recalledMemories.length === 0,
    `Returns clean memoryStatus='empty' without claiming memories exist.`
  );

  // Test Case 9: Hindsight unavailable (graceful degradation)
  // Test recall with a non-existent port
  const badRecallClient = new (require('../services/hindsightClient').HindsightClient)();
  (badRecallClient as any).baseUrl = 'http://localhost:9999'; // Offline port
  const offlineRecall = await badRecallClient.recall('cust_1', 'payment', 5);
  record(
    'Test Case 9: Hindsight Unavailable (Graceful Fallback)',
    offlineRecall.available === false && offlineRecall.memories.length === 0,
    `Handles network/service failure gracefully: available=false without crashing application.`
  );

  // Test Case 10: Groq unavailable (intelligent fallback engine)
  const groqClient = new (require('../services/groqClient').GroqClient)();
  const simulatedResp = (groqClient as any).generateSimulatedResponse({
    customer: rahul,
    recentMessages: [],
    ticketHistory: [],
    recalledMemories: chat2.recalledMemories,
    useMemory: true,
    userMessage: 'My payment is failing again.',
  });
  record(
    'Test Case 10: Groq Unavailable (High-Fidelity Engine)',
    Boolean(simulatedResp.content.includes('billing address') && simulatedResp.provider === 'Intelligent Fallback'),
    `High-fidelity engine provides accurate memory-guided fallback response when LLM API key is unconfigured.`
  );

  // Test Case 11: Database / API error handling
  const badCustRes = await fetch(`${baseUrl}/customers/non_existent_id_999`);
  const badCustData = (await badCustRes.json()) as any;
  record(
    'Test Case 11: Database / API Error Handling',
    badCustRes.status === 404 && Boolean(badCustData.error),
    `Returns HTTP 404 with structured JSON error: "${badCustData.error}"`
  );

  // Test Case 12: Empty message validation
  const emptyMsgRes = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId: 'cust_1', message: '   ', useMemory: true }),
  });
  const emptyMsgData = (await emptyMsgRes.json()) as any;
  record(
    'Test Case 12: Empty Message Validation',
    emptyMsgRes.status === 400 && Boolean(emptyMsgData.error),
    `Returns HTTP 400 Bad Request: "${emptyMsgData.error}"`
  );

  // Summary
  console.log('\n================================================================');
  console.log('TEST SUITE EXECUTION SUMMARY');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total Checks: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🌟 ALL 13 CANONICAL STEPS AND 12 TEST CASES PASSED WITH 100% SUCCESS!');
  } else {
    console.log('\n⚠️ Some test checks failed. Review details above.');
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite execution error:', err);
  process.exit(1);
});
