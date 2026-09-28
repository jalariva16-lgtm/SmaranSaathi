// verify_recommendations.ts
import http from 'http';

async function postJson(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(resData));
          } catch (e) {
            resolve(resData);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING AI SUPPORT RECOMMENDATION TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Issue with known previous solution
  console.log('--- TEST 1: Issue with known previous solution (Rahul Sharma - Payment Failure) ---');
  const t1 = await postJson('http://localhost:3001/api/chat', {
    customerId: 'cust_1',
    message: 'My payment is failing again at checkout.',
    useMemory: true,
  });
  console.log('Detected Issue:', t1.recommendation?.detectedIssue);
  console.log('Relevant Previous Experience:', t1.recommendation?.relevantPreviousExperience);
  console.log('Suggested Action:', t1.recommendation?.suggestedAction);
  console.log('Escalation:', t1.recommendation?.escalation);
  const pass1 =
    t1.recommendation?.detectedIssue === 'Payment failure' &&
    t1.recommendation?.relevantPreviousExperience?.toLowerCase().includes('billing address') &&
    t1.recommendation?.suggestedAction?.toLowerCase().includes('billing address') &&
    t1.recommendation?.escalation === null;
  console.log(`Result: ${pass1 ? '✅ PASS' : '❌ FAIL'}\n`);

  // Test 2: New issue with no previous solution
  console.log('--- TEST 2: New issue with no previous solution (Rahul Sharma - Analytics Freeze) ---');
  const t2 = await postJson('http://localhost:3001/api/chat', {
    customerId: 'cust_1',
    message: 'Why is the real-time analytics graph freezing on my dashboard?',
    useMemory: true,
  });
  console.log('Detected Issue:', t2.recommendation?.detectedIssue);
  console.log('Relevant Previous Experience:', t2.recommendation?.relevantPreviousExperience);
  console.log('Suggested Action:', t2.recommendation?.suggestedAction);
  console.log('Escalation:', t2.recommendation?.escalation);
  const pass2 =
    t2.recommendation?.detectedIssue.includes('analytics') &&
    t2.recommendation?.relevantPreviousExperience === null &&
    t2.recommendation?.escalation === null;
  console.log(`Result: ${pass2 ? '✅ PASS (Did NOT invent previous solution)' : '❌ FAIL'}\n`);

  // Test 3: Unrelated issue
  console.log('--- TEST 3: Unrelated issue (Rahul Sharma - Upgrade Plan) ---');
  const t3 = await postJson('http://localhost:3001/api/chat', {
    customerId: 'cust_1',
    message: 'How do I upgrade my plan to the Pro tier?',
    useMemory: true,
  });
  console.log('Detected Issue:', t3.recommendation?.detectedIssue);
  console.log('Relevant Previous Experience:', t3.recommendation?.relevantPreviousExperience);
  console.log('Suggested Action:', t3.recommendation?.suggestedAction);
  console.log('Escalation:', t3.recommendation?.escalation);
  const pass3 =
    t3.recommendation?.detectedIssue.includes('upgrade') &&
    t3.recommendation?.relevantPreviousExperience === null &&
    t3.recommendation?.escalation === null;
  console.log(`Result: ${pass3 ? '✅ PASS (No solution claimed for unrelated inquiry)' : '❌ FAIL'}\n`);

  // Test 4: Customer with no history
  console.log('--- TEST 4: Customer with no history (Vikram Singh - Logistics Roles) ---');
  const t4 = await postJson('http://localhost:3001/api/chat', {
    customerId: 'cust_5',
    message: 'Hello, how do I configure user roles for our logistics team?',
    useMemory: true,
  });
  console.log('Detected Issue:', t4.recommendation?.detectedIssue);
  console.log('Relevant Previous Experience:', t4.recommendation?.relevantPreviousExperience);
  console.log('Suggested Action:', t4.recommendation?.suggestedAction);
  console.log('Escalation:', t4.recommendation?.escalation);
  const pass4 =
    t4.recommendation?.detectedIssue.includes('role') &&
    t4.recommendation?.relevantPreviousExperience === null &&
    t4.recommendation?.escalation === null;
  console.log(`Result: ${pass4 ? '✅ PASS (Zero history customer handled cleanly)' : '❌ FAIL'}\n`);

  // Test 5: Customer Isolation check
  console.log('--- TEST 5: Customer Isolation (Priya Mehta - MFA code drift) ---');
  const t5 = await postJson('http://localhost:3001/api/chat', {
    customerId: 'cust_2',
    message: 'Our Authenticator app 6-digit codes are failing with time drift.',
    useMemory: true,
  });
  console.log('Detected Issue:', t5.recommendation?.detectedIssue);
  console.log('Relevant Previous Experience:', t5.recommendation?.relevantPreviousExperience);
  console.log('Suggested Action:', t5.recommendation?.suggestedAction);
  const pass5 =
    t5.recommendation?.detectedIssue.includes('MFA') &&
    t5.recommendation?.relevantPreviousExperience?.toLowerCase().includes('authenticator') &&
    !t5.recommendation?.relevantPreviousExperience?.toLowerCase().includes('billing');
  console.log(`Result: ${pass5 ? '✅ PASS (Strict customer isolation preserved)' : '❌ FAIL'}\n`);

  // Test 6: Escalation Trigger (repeated failure after trying standard fix)
  console.log('--- TEST 6: Escalation Trigger (Payment still failing after updating billing address) ---');
  const t6 = await postJson('http://localhost:3001/api/chat', {
    customerId: 'cust_1',
    message: 'The payment is still failing after updating billing address! Urgent renewal blocked!',
    useMemory: true,
  });
  console.log('Detected Issue:', t6.recommendation?.detectedIssue);
  console.log('Relevant Previous Experience:', t6.recommendation?.relevantPreviousExperience);
  console.log('Suggested Action:', t6.recommendation?.suggestedAction);
  console.log('Escalation:', JSON.stringify(t6.recommendation?.escalation));
  const pass6 =
    t6.recommendation?.escalation?.recommended === true &&
    t6.recommendation?.escalation?.targetTeam === 'Billing & Finance' &&
    t6.recommendation?.escalation?.urgency === 'high';
  console.log(`Result: ${pass6 ? '✅ PASS (Escalation triggered appropriately)' : '❌ FAIL'}\n`);

  console.log('====================================================');
  if (pass1 && pass2 && pass3 && pass4 && pass5 && pass6) {
    console.log('🎉 ALL 6 TEST SUITE REQUIREMENTS PASSED PERFECTLY!');
  } else {
    console.log('❌ SOME TESTS FAILED');
  }
  console.log('====================================================');
}

runTests().catch(console.error);
