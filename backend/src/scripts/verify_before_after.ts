// Uses Node native global fetch

async function main() {
  const baseUrl = 'http://localhost:3001/api';

  console.log('=====================================================');
  console.log('HINDSIGHT BEFORE VS AFTER DEMONSTRATION VERIFICATION');
  console.log('=====================================================\n');

  // Customer: Rahul Sharma (cust_1)
  // Scenario: Customer previously had payment failure resolved by billing address correction (PAY-104)
  // Query: "My payment is failing again."

  // TEST 1: WITHOUT HINDSIGHT (Memory OFF)
  console.log('--- TEST 1: WITHOUT HINDSIGHT (useMemory: false) ---');
  const resWithout = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      message: 'My payment is failing again.',
      useMemory: false,
    }),
  });

  const dataWithout = (await resWithout.json()) as any;
  console.log('Status HTTP:', resWithout.status);
  console.log('Memory Status:', dataWithout.memoryStatus);
  console.log('Recalled Memories Count:', dataWithout.recalledMemories?.length || 0);
  console.log('Suggested Action:', dataWithout.suggestedAction);
  console.log('AI Response:\n', dataWithout.message);
  console.log('\n-----------------------------------------------------\n');

  // TEST 2: WITH HINDSIGHT (Memory ON)
  console.log('--- TEST 2: WITH HINDSIGHT (useMemory: true) ---');
  const resWith = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust_1',
      message: 'My payment is failing again.',
      useMemory: true,
    }),
  });

  const dataWith = (await resWith.json()) as any;
  console.log('Status HTTP:', resWith.status);
  console.log('Memory Status:', dataWith.memoryStatus);
  console.log('Recalled Memories Count:', dataWith.recalledMemories?.length || 0);
  console.log('Recalled Memories:');
  dataWith.recalledMemories?.forEach((m: any, i: number) => {
    console.log(` [${i + 1}] (${m.category}): ${m.content}`);
  });
  console.log('Suggested Action:', dataWith.suggestedAction);
  console.log('AI Response:\n', dataWith.message);

  // Assertions
  console.log('\n================ VERIFICATION CHECKS ================');
  const check1 = dataWithout.recalledMemories?.length === 0;
  console.log('1. Without Hindsight received 0 memories:', check1 ? 'PASS' : 'FAIL');

  const check2 = dataWithout.memoryStatus === 'bypassed_without_memory';
  console.log('2. Without Hindsight memoryStatus is bypassed_without_memory:', check2 ? 'PASS' : 'FAIL');

  const check3 =
    dataWithout.message.toLowerCase().includes('troubleshoot') ||
    dataWithout.message.toLowerCase().includes('details') ||
    dataWithout.message.toLowerCase().includes('questions') ||
    dataWithout.message.toLowerCase().includes('error message');
  console.log('3. Without Hindsight asks diagnostic questions without assuming prior knowledge:', check3 ? 'PASS' : 'FAIL');

  const check4 = (dataWith.recalledMemories?.length || 0) > 0;
  console.log('4. With Hindsight recalled genuine memories from Hindsight bank:', check4 ? 'PASS' : 'FAIL');

  const check5 = dataWith.message.toLowerCase().includes('billing address');
  console.log('5. With Hindsight actively uses recalled previous billing address resolution:', check5 ? 'PASS' : 'FAIL');

  const allPassed = check1 && check2 && check3 && check4 && check5;
  console.log('\nOVERALL RESULT:', allPassed ? 'ALL CHECKS PASSED SUCCESSFULLY' : 'SOME CHECKS FAILED');
}

main().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
