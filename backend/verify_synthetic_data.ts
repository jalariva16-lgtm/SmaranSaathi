// verify_synthetic_data.ts
import http from 'http';

async function getJson(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port: 3001, path }, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          resolve(raw);
        }
      });
    }).on('error', reject);
  });
}

async function runIntegrityVerification() {
  console.log('====================================================');
  console.log('🔍 REALISTIC SYNTHETIC CUSTOMER DATA INTEGRITY AUDIT');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title: string, condition: boolean, detail?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${title}`);
      if (detail) console.log(`   └─ ${detail}`);
    } else {
      console.error(`❌ [FAIL] ${title}`);
      if (detail) console.error(`   └─ ${detail}`);
    }
  }

  // 1. Customers Count & Schema
  console.log('--- 1. Customers Audit ---');
  const custRes = await getJson('/api/customers');
  const customers = custRes.customers || [];
  assert('Approximately 20 customers generated', customers.length === 20, `Generated ${customers.length} customers`);

  const validSchema = customers.every(
    (c: any) =>
      c.id &&
      c.name &&
      c.email &&
      c.company &&
      c.accountTier &&
      c.environment?.os &&
      c.environment?.browser &&
      c.environment?.authMethod &&
      c.environment?.paymentMethod
  );
  assert('Every customer has complete profile & environment configuration', validSchema);

  // 2. Tickets Count & Categories
  console.log('\n--- 2. Tickets Audit ---');
  const metricsRes = await getJson('/api/dashboard/metrics');
  const metrics = metricsRes.metrics;
  assert('Approximately 100 support tickets generated', metrics.totalTickets === 100, `Generated exactly ${metrics.totalTickets} tickets`);

  const expectedCategories = ['Payment', 'Login/MFA', 'Dashboard', 'SSO', 'Account Config'];
  const generatedCategories = metrics.commonIssueTypes.map((t: any) => t.type);
  const hasAllCategories = expectedCategories.every((cat) => generatedCategories.includes(cat));
  assert('Includes all 5 common support categories (Payment, Login/MFA, Dashboard, SSO, Account Config)', hasAllCategories, `Categories: ${generatedCategories.join(', ')}`);

  // 3. Relationships & Data Integrity
  console.log('\n--- 3. Relationships & Data Integrity Audit ---');

  // Verify Rahul Sharma (cust_1)
  const rahulTicketsRes = await getJson('/api/customers/cust_1/tickets');
  const rahulTickets = rahulTicketsRes.tickets || [];
  const pay104 = rahulTickets.find((t: any) => t.id === 'PAY-104');
  assert('Rahul Sharma has canonical ticket PAY-104', Boolean(pay104), `PAY-104 found: ${pay104?.subject}`);

  const pay104Correct =
    pay104?.issueType === 'Payment' &&
    pay104?.status === 'resolved' &&
    pay104?.resolutionSummary?.toLowerCase().includes('billing address');
  assert('PAY-104 has Payment failure issue and Billing address correction resolution', pay104Correct, `Resolution: "${pay104?.resolutionSummary}"`);

  const pref201 = rahulTickets.find((t: any) => t.id === 'PREF-201');
  assert('Rahul Sharma has preference ticket PREF-201 (step-by-step)', Boolean(pref201));

  const pay105 = rahulTickets.find((t: any) => t.id === 'PAY-105');
  assert('Rahul Sharma has active recurring payment ticket PAY-105 for live Hindsight demo', Boolean(pay105) && pay105?.status === 'in_progress');

  // Verify Customers with NO History
  const vikramTickets = await getJson('/api/customers/cust_5/tickets');
  const poojaTickets = await getJson('/api/customers/cust_14/tickets');
  assert('Vikram Singh (cust_5) is a customer with NO history (0 tickets)', (vikramTickets.tickets || []).length === 0);
  assert('Pooja Hegde (cust_14) is a customer with NO history (0 tickets)', (poojaTickets.tickets || []).length === 0);

  // Verify Customers with Several Tickets
  const priyaTickets = await getJson('/api/customers/cust_2/tickets');
  const arjunTickets = await getJson('/api/customers/cust_3/tickets');
  assert('Customers with several tickets exist (Priya: 6, Arjun: 6)', (priyaTickets.tickets || []).length >= 5 && (arjunTickets.tickets || []).length >= 5);

  // Verify Unsuccessful Attempts in Messages
  let foundUnsuccessfulAttempt = false;
  for (const c of customers.slice(0, 6)) {
    const cTickets = (await getJson(`/api/customers/${c.id}/tickets`)).tickets || [];
    for (const t of cTickets) {
      const detail = await getJson(`/api/tickets/${t.id}`);
      const msgs = detail.messages || [];
      if (
        msgs.some(
          (m: any) =>
            m.message.toLowerCase().includes('did not resolve') ||
            m.message.toLowerCase().includes('still persists') ||
            m.message.toLowerCase().includes('declined again') ||
            m.message.toLowerCase().includes('still failing')
        )
      ) {
        foundUnsuccessfulAttempt = true;
        break;
      }
    }
    if (foundUnsuccessfulAttempt) break;
  }
  assert('Unsuccessful troubleshooting attempts are represented in conversation history', foundUnsuccessfulAttempt);

  // Verify Strict Customer Isolation (customers do not share ticket history)
  let zeroLeakage = true;
  for (const c of customers) {
    const custTickets = (await getJson(`/api/customers/${c.id}/tickets`)).tickets || [];
    if (custTickets.some((t: any) => t.customerId !== c.id)) {
      zeroLeakage = false;
      break;
    }
  }
  assert('Strict customer isolation: Customers do NOT share ticket history', zeroLeakage);

  // Verify Consistent Statuses (resolved has resolvedAt & resolutionSummary; open does not)
  let statusConsistent = true;
  for (const c of customers.slice(0, 10)) {
    const custTickets = (await getJson(`/api/customers/${c.id}/tickets`)).tickets || [];
    for (const t of custTickets) {
      if (t.status === 'resolved' && (!t.resolvedAt || !t.resolutionSummary)) statusConsistent = false;
      if (t.status !== 'resolved' && (t.resolvedAt || t.resolutionSummary)) statusConsistent = false;
    }
  }
  assert('Status values are consistent (resolvedAt & resolutionSummary present only on resolved)', statusConsistent);

  console.log('\n====================================================');
  console.log(`🏁 AUDIT RESULTS: ${passed}/${total} CHECKS PASSED`);
  if (passed === total) {
    console.log('🎉 ALL SYNTHETIC DATA & INTEGRITY REQUIREMENTS VERIFIED PERFECTLY!');
  } else {
    console.error('❌ SOME CHECKS FAILED');
  }
  console.log('====================================================');
}

runIntegrityVerification().catch(console.error);
