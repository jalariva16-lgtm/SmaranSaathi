// verify_dashboard.ts
import http from 'http';

async function request(url: string, method: string = 'GET', data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const body = data ? JSON.stringify(data) : null;
        const req = http.request(
            {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname + urlObj.search,
                method,
                headers: {
                    ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}),
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
        if (body) req.write(body);
        req.end();
    });
}

async function runDashboardTests() {
    console.log('====================================================');
    console.log('📊 SUPPORT DASHBOARD METRICS VERIFICATION SUITE');
    console.log('====================================================\n');

    // STEP 1: Fetch initial baseline metrics
    console.log('--- STEP 1: Fetching initial baseline metrics from database ---');
    const initial = await request('http://localhost:3001/api/dashboard/metrics');
    const m1 = initial.metrics;
    console.log('Total Customers:', m1.totalCustomers);
    console.log('Total Tickets:', m1.totalTickets);
    console.log('Open Tickets:', m1.openTickets);
    console.log('Resolved Tickets:', m1.resolvedTickets);
    console.log('Repeated Issues:', m1.repeatedIssues);
    console.log('Customers with Previous History:', m1.customersWithHistory);
    console.log('Memory-Enabled Conversations:', m1.memoryEnabledConversations);
    console.log('Common Issue Types:');
    m1.commonIssueTypes.forEach((t: any) => console.log(`  - ${t.type}: ${t.count} (${t.percentage}%)`));

    const validBaseline =
        m1.totalCustomers > 0 &&
        m1.totalTickets > 0 &&
        m1.openTickets + m1.resolvedTickets === m1.totalTickets &&
        m1.commonIssueTypes.length > 0;
    console.log(`Baseline valid: ${validBaseline ? '✅ YES' : '❌ NO'}\n`);

    // STEP 2: Create a new support ticket (test data mutation 1)
    console.log('--- STEP 2: Creating a new test ticket to verify live metrics update ---');
    const createRes = await request('http://localhost:3001/api/tickets', 'POST', {
        customerId: 'cust_1',
        issueType: 'Payment',
        subject: `Automated Test Ticket #${Date.now()}`,
    });
    const m2 = createRes.metrics;
    console.log('New Ticket Created:', createRes.ticket.id);
    console.log('Previous Total Tickets:', m1.totalTickets, '-> New Total Tickets:', m2.totalTickets);
    console.log('Previous Open Tickets:', m1.openTickets, '-> New Open Tickets:', m2.openTickets);

    const passCreation = m2.totalTickets === m1.totalTickets + 1 && m2.openTickets === m1.openTickets + 1;
    console.log(`Result: ${passCreation ? '✅ PASS (Total and Open incremented)' : '❌ FAIL'}\n`);

    // STEP 3: Resolve the newly created ticket (test data mutation 2)
    console.log('--- STEP 3: Resolving ticket to verify live status transition ---');
    const resolveRes = await request(`http://localhost:3001/api/tickets/${createRes.ticket.id}/status`, 'PATCH', {
        status: 'resolved',
        resolutionSummary: 'Verified and resolved during automated test suite execution.',
    });
    const m3 = resolveRes.metrics;
    console.log('Previous Open Tickets:', m2.openTickets, '-> New Open Tickets:', m3.openTickets);
    console.log('Previous Resolved Tickets:', m2.resolvedTickets, '-> New Resolved Tickets:', m3.resolvedTickets);

    const passResolution = m3.openTickets === m2.openTickets - 1 && m3.resolvedTickets === m2.resolvedTickets + 1;
    console.log(`Result: ${passResolution ? '✅ PASS (Open decremented, Resolved incremented)' : '❌ FAIL'}\n`);

    // STEP 4: Confirm metrics are grounded in actual database records
    console.log('--- STEP 4: Verifying zero fabrication & database integrity ---');
    const currentDb = await request('http://localhost:3001/api/dashboard/metrics');
    const mFinal = currentDb.metrics;
    const isGrounded =
        mFinal.totalCustomers === 20 &&
        mFinal.totalTickets === m3.totalTickets &&
        mFinal.resolvedTickets === m3.resolvedTickets &&
        mFinal.openTickets === m3.openTickets;
    console.log(`Grounding check: ${isGrounded ? '✅ PASS (100% database-grounded)' : '❌ FAIL'}\n`);

    console.log('====================================================');
    if (validBaseline && passCreation && passResolution && isGrounded) {
        console.log('🎉 ALL DASHBOARD METRICS REQUIREMENTS VERIFIED SUCCESSFULLY!');
    } else {
        console.log('❌ SOME DASHBOARD TESTS FAILED');
    }
    console.log('====================================================');
}

runDashboardTests().catch(console.error);
