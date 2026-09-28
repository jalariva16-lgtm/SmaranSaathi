async function testFlows() {
  console.log('Testing SmaranSaathi AI Demo API Flows...\n');

  // Reset to initial clean state
  const resetRes = await fetch('http://localhost:3001/api/reset', { method: 'POST' });
  console.log('System Reset:', resetRes.ok ? 'SUCCESS' : 'FAILED');

  // 1. Memory OFF Test
  const res1 = await (await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      message: 'My payment is failing again.',
      useMemory: false,
    }),
  })).json();
  console.log('\n====================================');
  console.log('1. MEMORY OFF (COLD-START BASELINE)');
  console.log('====================================');
  console.log('AI Message:\n', res1.message);
  console.log('Recalled Memories:', res1.recalledMemories.length);
  console.log('Memory Status:', res1.memoryStatus);

  // 2. Memory ON Test
  const res2 = await (await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      message: 'My payment is failing again.',
      useMemory: true,
    }),
  })).json();
  console.log('\n====================================');
  console.log('2. MEMORY ON (HINDSIGHT MEMORY-GUIDED)');
  console.log('====================================');
  console.log('AI Message:\n', res2.message);
  console.log('Recalled Memories Count:', res2.recalledMemories.length);
  console.log('Memory Status:', res2.memoryStatus);
  console.log('Suggested Action:', res2.suggestedAction);

  // 3. Irrelevant Memory Safety Test
  const res3 = await (await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      message: "I'm having trouble logging in.",
      useMemory: true,
    }),
  })).json();
  console.log('\n====================================');
  console.log('3. IRRELEVANT MEMORY SAFETY TEST');
  console.log('====================================');
  console.log('AI Message:\n', res3.message);
  console.log('Suggested Action:', res3.suggestedAction);

  // 4. Retain New Outcome
  const res4 = await (await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      message: 'I updated the billing address and it went through!',
      useMemory: true,
    }),
  })).json();
  console.log('\n====================================');
  console.log('4. NEW OUTCOME RETENTION');
  console.log('====================================');
  console.log('Newly Retained Count:', res4.newlyRetainedMemories.length);
  if (res4.newlyRetainedMemories.length > 0) {
    console.log('Retained Memory:', res4.newlyRetainedMemories[0].content);
  }
}

testFlows().catch(console.error);
