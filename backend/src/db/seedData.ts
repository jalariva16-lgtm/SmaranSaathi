import { Customer, Ticket, Message, HindsightMemory } from '../types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@apexfintech.io',
    company: 'Apex FinTech',
    accountTier: 'Enterprise',
    environment: {
      os: 'macOS Sonoma 14.4',
      browser: 'Chrome 122.0',
      authMethod: 'SSO',
      paymentMethod: 'Corporate Visa ending in 4092',
    },
    createdAt: '2025-11-12T10:00:00Z',
  },
  {
    id: 'cust_2',
    name: 'Priya Mehta',
    email: 'priya.mehta@cloudscale.net',
    company: 'CloudScale Dynamics',
    accountTier: 'Pro',
    environment: {
      os: 'Windows 11 Pro',
      browser: 'Edge 121.0',
      authMethod: 'Password',
      paymentMethod: 'Mastercard ending in 8812',
    },
    createdAt: '2025-12-01T14:30:00Z',
  },
  {
    id: 'cust_3',
    name: 'Arjun Rao',
    email: 'arjun.rao@hyperwave.ai',
    company: 'HyperWave AI',
    accountTier: 'Enterprise',
    environment: {
      os: 'Ubuntu 24.04 LTS',
      browser: 'Firefox 124.0',
      authMethod: 'Google OAuth',
      paymentMethod: 'Amex Business ending in 1004',
    },
    createdAt: '2025-10-18T09:15:00Z',
  },
  {
    id: 'cust_4',
    name: 'Ananya Patel',
    email: 'ananya.p@zenithmedia.com',
    company: 'Zenith Media Labs',
    accountTier: 'Pro',
    environment: {
      os: 'macOS Ventura 13.6',
      browser: 'Safari 17.2',
      authMethod: 'SSO',
      paymentMethod: 'Visa ending in 3319',
    },
    createdAt: '2026-01-05T11:45:00Z',
  },
  {
    id: 'cust_5',
    name: 'Vikram Singh',
    email: 'vikram.singh@solarislogistics.in',
    company: 'Solaris Global Logistics',
    accountTier: 'Starter',
    environment: {
      os: 'Windows 10 Enterprise',
      browser: 'Chrome 120.0',
      authMethod: 'Password',
      paymentMethod: 'Corporate Mastercard ending in 7701',
    },
    createdAt: '2026-02-14T16:20:00Z',
  },
  {
    id: 'cust_6',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@biocorehealth.com',
    company: 'BioCore Health Systems',
    accountTier: 'Enterprise',
    environment: {
      os: 'macOS Sonoma 14.2',
      browser: 'Chrome 123.0',
      authMethod: 'SSO',
      paymentMethod: 'Corporate Visa ending in 9123',
    },
    createdAt: '2025-09-10T08:00:00Z',
  },
  {
    id: 'cust_7',
    name: 'Rohan Gupta',
    email: 'rohan@quantumecom.org',
    company: 'Quantum eCommerce',
    accountTier: 'Pro',
    environment: {
      os: 'Windows 11 Home',
      browser: 'Chrome 122.0',
      authMethod: 'Google OAuth',
      paymentMethod: 'Visa ending in 4421',
    },
    createdAt: '2025-11-28T13:10:00Z',
  },
  {
    id: 'cust_8',
    name: 'Kavita Nair',
    email: 'kavita.nair@veritaslegal.in',
    company: 'Veritas Legal Partners',
    accountTier: 'Enterprise',
    environment: {
      os: 'Windows 11 Pro',
      browser: 'Edge 122.0',
      authMethod: 'SSO',
      paymentMethod: 'Amex ending in 6654',
    },
    createdAt: '2025-10-04T15:40:00Z',
  },
  {
    id: 'cust_9',
    name: 'Siddharth Verma',
    email: 'sid.verma@novapulse.io',
    company: 'NovaPulse Software',
    accountTier: 'Pro',
    environment: {
      os: 'Fedora 39',
      browser: 'Firefox 123.0',
      authMethod: 'Password',
      paymentMethod: 'Mastercard ending in 2190',
    },
    createdAt: '2026-01-20T10:05:00Z',
  },
  {
    id: 'cust_10',
    name: 'Meera Joshi',
    email: 'meera.joshi@crestviewedtech.com',
    company: 'Crestview EdTech',
    accountTier: 'Starter',
    environment: {
      os: 'macOS Sonoma 14.3',
      browser: 'Safari 17.3',
      authMethod: 'Google OAuth',
      paymentMethod: 'Visa ending in 8802',
    },
    createdAt: '2026-02-02T12:00:00Z',
  },
  {
    id: 'cust_11',
    name: 'Amit Shah',
    email: 'amit.shah@stratusinfra.com',
    company: 'Stratus Cloud Infra',
    accountTier: 'Enterprise',
    environment: {
      os: 'Ubuntu 22.04 LTS',
      browser: 'Chrome 121.0',
      authMethod: 'SSO',
      paymentMethod: 'Corporate Visa ending in 5543',
    },
    createdAt: '2025-08-19T09:30:00Z',
  },
  {
    id: 'cust_12',
    name: 'Ritu Desai',
    email: 'ritu.desai@luminaanalytics.co',
    company: 'Lumina Analytics',
    accountTier: 'Pro',
    environment: {
      os: 'macOS Sequoia 15.0',
      browser: 'Chrome 124.0',
      authMethod: 'SSO',
      paymentMethod: 'Mastercard ending in 3311',
    },
    createdAt: '2025-12-15T11:25:00Z',
  },
  {
    id: 'cust_13',
    name: 'Dev Mukherjee',
    email: 'dev.m@synthetixgames.com',
    company: 'Synthetix Game Studios',
    accountTier: 'Pro',
    environment: {
      os: 'Windows 11 Pro',
      browser: 'Brave 1.63',
      authMethod: 'Password',
      paymentMethod: 'Visa ending in 9076',
    },
    createdAt: '2026-01-11T14:50:00Z',
  },
  {
    id: 'cust_14',
    name: 'Pooja Iyer',
    email: 'pooja.iyer@orbitpay.in',
    company: 'OrbitPay Solutions',
    accountTier: 'Enterprise',
    environment: {
      os: 'macOS Ventura 13.5',
      browser: 'Safari 17.0',
      authMethod: 'SSO',
      paymentMethod: 'Amex ending in 4108',
    },
    createdAt: '2025-11-05T17:15:00Z',
  },
  {
    id: 'cust_15',
    name: 'Aditya Kulkarni',
    email: 'aditya.k@metrisecurity.io',
    company: 'MetriSecurity Labs',
    accountTier: 'Enterprise',
    environment: {
      os: 'Arch Linux',
      browser: 'Firefox 125.0',
      authMethod: 'SSO',
      paymentMethod: 'Corporate Visa ending in 7112',
    },
    createdAt: '2025-09-30T13:45:00Z',
  },
  {
    id: 'cust_16',
    name: 'Divya Malhotra',
    email: 'divya@aegisinsights.com',
    company: 'Aegis Market Insights',
    accountTier: 'Pro',
    environment: {
      os: 'Windows 11 Pro',
      browser: 'Edge 123.0',
      authMethod: 'Password',
      paymentMethod: 'Mastercard ending in 6609',
    },
    createdAt: '2026-02-18T10:10:00Z',
  },
  {
    id: 'cust_17',
    name: 'Harsh Choudhury',
    email: 'harsh.c@vectorfleet.co',
    company: 'VectorFleet Telematics',
    accountTier: 'Starter',
    environment: {
      os: 'macOS Monterey 12.7',
      browser: 'Chrome 120.0',
      authMethod: 'Password',
      paymentMethod: 'Visa ending in 1993',
    },
    createdAt: '2026-03-01T15:00:00Z',
  },
  {
    id: 'cust_18',
    name: 'Neha Bhat',
    email: 'neha.bhat@prismadesign.studio',
    company: 'Prisma Design Studio',
    accountTier: 'Pro',
    environment: {
      os: 'macOS Sonoma 14.1',
      browser: 'Chrome 122.0',
      authMethod: 'Google OAuth',
      paymentMethod: 'Amex ending in 3820',
    },
    createdAt: '2025-12-22T09:00:00Z',
  },
  {
    id: 'cust_19',
    name: 'Gaurav Agarwal',
    email: 'gaurav@nexushub.cloud',
    company: 'NexusHub Cloud Services',
    accountTier: 'Enterprise',
    environment: {
      os: 'Windows 11 Enterprise',
      browser: 'Chrome 123.0',
      authMethod: 'SSO',
      paymentMethod: 'Corporate Visa ending in 8440',
    },
    createdAt: '2025-10-12T16:35:00Z',
  },
  {
    id: 'cust_20',
    name: 'Shreya Sen',
    email: 'shreya.sen@omnicare.org',
    company: 'OmniCare Telehealth',
    accountTier: 'Enterprise',
    environment: {
      os: 'macOS Sonoma 14.4',
      browser: 'Safari 17.4',
      authMethod: 'SSO',
      paymentMethod: 'Corporate Mastercard ending in 5122',
    },
    createdAt: '2025-11-19T11:20:00Z',
  },
];

// Helper to generate 100 realistic tickets across the 20 customers
export function generateSeedTicketsAndMessages(): { tickets: Ticket[]; messages: Message[] } {
  const tickets: Ticket[] = [];
  const messages: Message[] = [];

  const issueCategories: Array<'Payment' | 'Login/MFA' | 'Dashboard' | 'SSO' | 'Account Config'> = [
    'Payment',
    'Login/MFA',
    'Dashboard',
    'SSO',
    'Account Config',
  ];

  const issueTemplates: Record<
    string,
    { subjects: string[]; resolutions: string[]; sampleTurn: [string, string] }
  > = {
    Payment: {
      subjects: [
        'Payment failure during invoice settlement',
        'Credit card declined for automated monthly renewal',
        'Stripe 3D-Secure authentication failure on card ending in 4092',
        'Unable to update corporate billing credit card',
        'Payment failure: Error code ERR_BILLING_ZIP_MISMATCH',
      ],
      resolutions: [
        'Billing address ZIP code mismatch resolved after customer aligned profile address with issuing bank record.',
        'Customer bank had flagged international transaction; cleared after customer approved fraud alert.',
        'Switched payment gateway method to secondary corporate card.',
        'Customer cleared expired billing profile token and re-authorized payment method successfully.',
        'Billing address updated to headquarters address, allowing charge to complete immediately.',
      ],
      sampleTurn: [
        'My payment is failing when I try to renew our subscription.',
        'I investigated the transaction log: error code indicates a billing address verification mismatch. Updating the billing address in your billing portal will resolve this immediately.',
      ],
    },
    'Login/MFA': {
      subjects: [
        'MFA prompt loop after mobile device replacement',
        'Authenticator app time-drift causing invalid code errors',
        'Hardware security key WebAuthn timeout on Safari',
        'Unable to receive SMS verification backup code',
        'Session revoked repeatedly every 15 minutes',
      ],
      resolutions: [
        'Reset TOTP seed and generated temporary single-use backup codes for device re-enrollment.',
        'Advised customer to sync device clock in Authenticator settings, which restored code synchronization.',
        'Updated browser security token permissions in Safari settings.',
        'Reconfigured MFA fallback method to corporate email authorization.',
        'Cleared cached session cookies and updated enterprise SSO token lifespan.',
      ],
      sampleTurn: [
        'My MFA codes are showing invalid even though I just entered the current number from Google Authenticator.',
        'This typically happens due to clock drift on the mobile device. In your Authenticator app, go to Settings -> Time correction for codes -> Sync now. That will synchronize the tokens.',
      ],
    },
    Dashboard: {
      subjects: [
        'Dashboard analytics widget failing to render on Chrome',
        'Real-time metrics graph freezing after 10 minutes of activity',
        'High latency loading customer transaction overview table',
        'CSV export of monthly audit logs timing out at 50,000 rows',
        'White screen on Dashboard navigation under macOS Safari',
      ],
      resolutions: [
        'Disabled ad-blocker script filter that was intercepting internal analytics websocket endpoints.',
        'Optimized client-side date range filter to paginate records in 5,000 item chunks.',
        'Advised hardware acceleration toggle in browser settings which resolved WebGL canvas freeze.',
        'Scheduled asynchronous background export job with S3 download link sent via email.',
        'Cleared indexedDB client cache to reset corrupted local state.',
      ],
      sampleTurn: [
        'The main analytics graph on our team dashboard keeps freezing after about 10 minutes of monitoring.',
        'This issue is caused by browser memory accumulation in WebGL rendering. Toggling hardware acceleration or refreshing the websocket stream will prevent the tab freeze.',
      ],
    },
    SSO: {
      subjects: [
        'Okta SAML 2.0 assertion signature validation failure',
        'Azure AD SCIM user provisioning not deactivating departed members',
        'Google Workspace SAML redirect loop on login',
        'Entity ID mismatch on custom IdP configuration',
        'Certificate expiration warning on SAML single sign-on metadata',
      ],
      resolutions: [
        'Regenerated X.509 signing certificate in identity provider and updated ACS URL metadata.',
        'Synced Azure AD SCIM bearer token and verified group mapping schema.',
        'Adjusted RelayState parameter to direct users to default enterprise dashboard.',
        'Corrected Entity ID URI from tenant subdomain to root domain.',
        'Rotated SAML certificate before expiration, zero customer downtime.',
      ],
      sampleTurn: [
        'Our employees are getting an Okta SAML error saying invalid assertion signature.',
        'The SAML X.509 certificate on your Okta app configuration had expired. Please upload the newly generated certificate from your admin portal into the Security tab.',
      ],
    },
    'Account Config': {
      subjects: [
        'Webhook delivery endpoint failing with HTTP 410',
        'API rate limit configuration for staging environment',
        'Preference: requires step-by-step sequential guidance',
        'Custom domain CNAME DNS verification stuck on pending',
        'Role-based access control permission inheritance issue',
      ],
      resolutions: [
        'Customer re-registered webhook listener with updated HTTPS endpoint and valid HMAC secret.',
        'Temporarily boosted staging rate limit from 100 req/s to 500 req/s for performance testing.',
        'Customer noted preference for one instruction at a time without overwhelming technical jargon.',
        'Added missing CAA DNS record to allow Let’s Encrypt automated certificate issuance.',
        'Assigned custom auditor role with read-only permissions across all tenant workspaces.',
      ],
      sampleTurn: [
        'Please explain how to configure our staging webhooks, but keep it strictly step-by-step.',
        'Understood! I will give you instructions one step at a time. Step 1: Open Settings > Webhooks > Add Endpoint.',
      ],
    },
  };

  let ticketCounter = 100;
  let messageCounter = 500;

  // 1. Specific canonical tickets for Rahul Sharma (cust_1) for primary hackathon demo
  // Ticket 1: PAY-104 (Resolved payment failure resolved by billing address correction)
  const rahulTicket1: Ticket = {
    id: `PAY-104`,
    customerId: 'cust_1',
    issueType: 'Payment',
    subject: 'Payment failing repeatedly at invoice checkout',
    status: 'resolved',
    createdAt: '2026-03-10T14:20:00Z',
    resolvedAt: '2026-03-10T15:05:00Z',
    resolutionSummary:
      'Billing address needed to be corrected. The ZIP code in profile did not match the bank issuing address. Once updated, the charge processed successfully.',
  };
  tickets.push(rahulTicket1);

  messages.push(
    {
      id: `msg-${messageCounter++}`,
      ticketId: rahulTicket1.id,
      customerId: 'cust_1',
      sender: 'customer',
      message: 'My payment is failing when trying to renew our subscription.',
      timestamp: '2026-03-10T14:20:10Z',
    },
    {
      id: `msg-${messageCounter++}`,
      ticketId: rahulTicket1.id,
      customerId: 'cust_1',
      sender: 'ai',
      message:
        'I investigated your payment attempt. The card processor rejected the charge with an Address Verification System (AVS) mismatch. Could you verify if the billing address in your account matches your card statement?',
      timestamp: '2026-03-10T14:22:00Z',
    },
    {
      id: `msg-${messageCounter++}`,
      ticketId: rahulTicket1.id,
      customerId: 'cust_1',
      sender: 'customer',
      message: 'I tried re-submitting with the card number again, but it was declined again. Does the billing zip code really have to match the physical office?',
      timestamp: '2026-03-10T14:35:00Z',
    },
    {
      id: `msg-${messageCounter++}`,
      ticketId: rahulTicket1.id,
      customerId: 'cust_1',
      sender: 'ai',
      message:
        'Yes, the card issuing bank strictly enforces postal code matching. If your company recently moved or uses a headquarters address, updating it in the billing portal will clear the hold immediately.',
      timestamp: '2026-03-10T14:36:00Z',
    },
    {
      id: `msg-${messageCounter++}`,
      ticketId: rahulTicket1.id,
      customerId: 'cust_1',
      sender: 'customer',
      message: 'Ah, our corporate office recently moved! I updated the billing address to 402 Lakeview Blvd and it went through!',
      timestamp: '2026-03-10T14:45:00Z',
    },
    {
      id: `msg-${messageCounter++}`,
      ticketId: rahulTicket1.id,
      customerId: 'cust_1',
      sender: 'ai',
      message:
        'Excellent! The payment has cleared and your Enterprise plan is fully active. I have noted this resolution on your account.',
      timestamp: '2026-03-10T14:46:00Z',
    }
  );

  // Ticket 2: PREF-201 (Resolved customer communication preference)
  const rahulTicket2: Ticket = {
    id: `PREF-201`,
    customerId: 'cust_1',
    issueType: 'Account Config',
    subject: 'Customer communication preference: step-by-step instructions',
    status: 'resolved',
    createdAt: '2026-03-15T09:10:00Z',
    resolvedAt: '2026-03-15T09:30:00Z',
    resolutionSummary:
      'Customer explicitly expressed preference: "Please give me instructions one step at a time." Agent adapted responses to sequential single-action steps.',
  };
  tickets.push(rahulTicket2);

  messages.push(
    {
      id: `msg-${messageCounter++}`,
      ticketId: rahulTicket2.id,
      customerId: 'cust_1',
      sender: 'customer',
      message: 'Please give me instructions one step at a time whenever we troubleshoot.',
      timestamp: '2026-03-15T09:10:00Z',
    },
    {
      id: `msg-${messageCounter++}`,
      ticketId: rahulTicket2.id,
      customerId: 'cust_1',
      sender: 'ai',
      message:
        'Understood, Rahul! I will always provide step-by-step guidance, one single action at a time so you can proceed comfortably.',
      timestamp: '2026-03-15T09:11:00Z',
    }
  );

  // Ticket 3: PAY-105 (Active recurring payment failure for live demo)
  const rahulTicket3: Ticket = {
    id: `PAY-105`,
    customerId: 'cust_1',
    issueType: 'Payment',
    subject: 'Recurring payment failure on subscription renewal attempt',
    status: 'in_progress',
    createdAt: '2026-03-24T11:15:00Z',
  };
  tickets.push(rahulTicket3);

  messages.push(
    {
      id: `msg-${messageCounter++}`,
      ticketId: rahulTicket3.id,
      customerId: 'cust_1',
      sender: 'customer',
      message: 'Hello, our corporate card payment is failing again at renewal. Can you check what is happening?',
      timestamp: '2026-03-24T11:15:10Z',
    },
    {
      id: `msg-${messageCounter++}`,
      ticketId: rahulTicket3.id,
      customerId: 'cust_1',
      sender: 'ai',
      message:
        'Hello Rahul Sharma, I see your payment is failing again.\n\nBased on our previous conversation, this issue was resolved when we updated your billing address to match your card issuing statement.\n\nLet\'s check this step-by-step:\n**Step 1:** Please navigate to **Billing Settings > Payment Methods** and verify if the billing address matches your card statement.',
      timestamp: '2026-03-24T11:16:00Z',
      recalledMemoriesUsed: [
        INITIAL_HINDSIGHT_MEMORIES.customer_cust_1[1],
        INITIAL_HINDSIGHT_MEMORIES.customer_cust_1[2],
      ],
      memoryOperationStatus: 'recalled',
    }
  );

  // 2. Distribute remaining 97 tickets across 17 customers to reach exactly 100 tickets
  let validCustomersCount = 0;
  INITIAL_CUSTOMERS.forEach((customer) => {
    // Rahul (cust_1) has 3 canonical tickets (PAY-104, PREF-201, PAY-105)
    if (customer.id === 'cust_1') return;
    // Vikram Singh (cust_5) & Pooja Hegde (cust_14) have NO HISTORY (0 tickets)
    if (customer.id === 'cust_5' || customer.id === 'cust_14') return;

    validCustomersCount++;
    // First 12 customers get 6 tickets (12 * 6 = 72), remaining 5 get 5 tickets (5 * 5 = 25) -> 72 + 25 = 97 tickets!
    const targetCount = validCustomersCount <= 12 ? 6 : 5;

    for (let i = 0; i < targetCount; i++) {
      ticketCounter++;
      const category = issueCategories[(validCustomersCount + i) % issueCategories.length];
      const template = issueTemplates[category];
      const subject = template.subjects[i % template.subjects.length];
      const resolution = template.resolutions[i % template.resolutions.length];

      // Realistic status distribution: mostly resolved, some in_progress, some open
      const status: 'resolved' | 'open' | 'in_progress' =
        i === 0 && validCustomersCount % 3 === 0
          ? 'in_progress'
          : i === 1 && validCustomersCount % 4 === 0
          ? 'open'
          : 'resolved';

      const ticketId = `${category.slice(0, 3).toUpperCase()}-${ticketCounter}`;
      const createdDate = new Date(Date.now() - (105 - ticketCounter) * 86400000 * 0.8).toISOString();
      const resolvedDate =
        status === 'resolved'
          ? new Date(new Date(createdDate).getTime() + (20 + (ticketCounter % 40)) * 60000).toISOString()
          : undefined;

      const ticket: Ticket = {
        id: ticketId,
        customerId: customer.id,
        issueType: category,
        subject,
        status,
        createdAt: createdDate,
        resolvedAt: resolvedDate,
        resolutionSummary: status === 'resolved' ? resolution : undefined,
      };
      tickets.push(ticket);

      // Add realistic conversation turns
      if (status === 'in_progress') {
        // Multi-turn with unsuccessful initial attempt
        messages.push(
          {
            id: `msg-${messageCounter++}`,
            ticketId,
            customerId: customer.id,
            sender: 'customer',
            message: template.sampleTurn[0],
            timestamp: createdDate,
          },
          {
            id: `msg-${messageCounter++}`,
            ticketId,
            customerId: customer.id,
            sender: 'ai',
            message: template.sampleTurn[1],
            timestamp: new Date(new Date(createdDate).getTime() + 60000).toISOString(),
          },
          {
            id: `msg-${messageCounter++}`,
            ticketId,
            customerId: customer.id,
            sender: 'customer',
            message: 'I tried applying that change, but it did not resolve the problem. The error still persists.',
            timestamp: new Date(new Date(createdDate).getTime() + 180000).toISOString(),
          },
          {
            id: `msg-${messageCounter++}`,
            ticketId,
            customerId: customer.id,
            sender: 'ai',
            message: 'Thank you for testing that. Since the standard step did not work, I am reviewing our diagnostic logs and escalating the telemetry data for deeper investigation.',
            timestamp: new Date(new Date(createdDate).getTime() + 240000).toISOString(),
          }
        );
      } else if (status === 'open') {
        // Fresh open ticket awaiting response
        messages.push({
          id: `msg-${messageCounter++}`,
          ticketId,
          customerId: customer.id,
          sender: 'customer',
          message: template.sampleTurn[0],
          timestamp: createdDate,
        });
      } else {
        // Resolved ticket with successful fix
        messages.push(
          {
            id: `msg-${messageCounter++}`,
            ticketId,
            customerId: customer.id,
            sender: 'customer',
            message: template.sampleTurn[0],
            timestamp: createdDate,
          },
          {
            id: `msg-${messageCounter++}`,
            ticketId,
            customerId: customer.id,
            sender: 'ai',
            message: template.sampleTurn[1],
            timestamp: new Date(new Date(createdDate).getTime() + 60000).toISOString(),
          },
          {
            id: `msg-${messageCounter++}`,
            ticketId,
            customerId: customer.id,
            sender: 'customer',
            message: 'That fixed it! Thank you so much for the quick help.',
            timestamp: new Date(new Date(createdDate).getTime() + 180000).toISOString(),
          }
        );
      }
    }
  });

  return { tickets, messages };
}

// Initial seed memories specifically populated for Hindsight memory banks
export const INITIAL_HINDSIGHT_MEMORIES: Record<string, HindsightMemory[]> = {
  customer_cust_1: [
    {
      id: 'mem_rahul_1',
      bankId: 'customer_cust_1',
      content: 'Customer previously experienced payment failure during invoice checkout due to an Address Verification System (AVS) mismatch.',
      type: 'experience',
      category: 'repeated_issue',
      relevanceScore: 0.94,
      timestamp: '2026-03-10T14:46:00Z',
      metadata: { ticketId: 'PAY-104', source: 'ticket_resolution' },
    },
    {
      id: 'mem_rahul_2',
      bankId: 'customer_cust_1',
      content: 'Payment issue was successfully resolved by updating the corporate billing address to 402 Lakeview Blvd to match the credit card issuing bank statement.',
      type: 'observation',
      category: 'successful_solution',
      relevanceScore: 0.98,
      timestamp: '2026-03-10T14:46:00Z',
      metadata: { ticketId: 'PAY-104', resolution: 'billing_address_update' },
    },
    {
      id: 'mem_rahul_3',
      bankId: 'customer_cust_1',
      content: 'Customer preference: Prefers step-by-step instructions presented one sequential action at a time without complex jargon.',
      type: 'preference',
      category: 'preference',
      relevanceScore: 0.91,
      timestamp: '2026-03-15T09:30:00Z',
      metadata: { ticketId: 'PREF-201', preferenceType: 'communication_style' },
    },
    {
      id: 'mem_rahul_4',
      bankId: 'customer_cust_1',
      content: 'Customer environment: Uses macOS Sonoma with Chrome browser and corporate Visa card ending in 4092 authenticated via Okta SSO.',
      type: 'fact',
      category: 'environment',
      relevanceScore: 0.75,
      timestamp: '2026-03-10T14:20:00Z',
      metadata: { environment: 'macOS/Chrome/SSO' },
    },
  ],
  customer_cust_2: [
    {
      id: 'mem_priya_1',
      bankId: 'customer_cust_2',
      content: 'Customer environment: Windows 11 with Edge browser. Uses password login with Azure AD identity sync.',
      type: 'fact',
      category: 'environment',
      relevanceScore: 0.85,
      timestamp: '2026-02-10T11:00:00Z',
      metadata: {},
    },
    {
      id: 'mem_priya_2',
      bankId: 'customer_cust_2',
      content: 'Customer had an MFA time-drift issue that was resolved by syncing the Authenticator app internal clock.',
      type: 'observation',
      category: 'successful_solution',
      relevanceScore: 0.92,
      timestamp: '2026-02-12T16:00:00Z',
      metadata: { ticketId: 'LOG-102' },
    },
  ],
  customer_cust_3: [
    {
      id: 'mem_arjun_1',
      bankId: 'customer_cust_3',
      content: 'Customer environment: Runs Ubuntu 24.04 and Firefox. High-frequency API user managing automated model deployments.',
      type: 'fact',
      category: 'environment',
      relevanceScore: 0.88,
      timestamp: '2026-01-20T10:00:00Z',
      metadata: {},
    },
    {
      id: 'mem_arjun_2',
      bankId: 'customer_cust_3',
      content: 'Resolved CSV export timeouts by routing exports through asynchronous S3 worker queues.',
      type: 'observation',
      category: 'successful_solution',
      relevanceScore: 0.90,
      timestamp: '2026-02-01T15:20:00Z',
      metadata: {},
    },
    {
      id: 'mem_arjun_3',
      bankId: 'customer_cust_3',
      content: 'Customer preference: Prefers concise command-line explanations and technical logs over long prose.',
      type: 'preference',
      category: 'preference',
      relevanceScore: 0.88,
      timestamp: '2026-01-25T11:00:00Z',
      metadata: { preferenceType: 'format' },
    },
  ],
  customer_cust_6: [
    {
      id: 'mem_sneha_1',
      bankId: 'customer_cust_6',
      content: 'Customer environment: macOS Sonoma 14.2 with Chrome 123.0. Enterprise SSO configured with Okta tenant.',
      type: 'fact',
      category: 'environment',
      relevanceScore: 0.82,
      timestamp: '2025-09-10T08:00:00Z',
      metadata: {},
    },
    {
      id: 'mem_sneha_2',
      bankId: 'customer_cust_6',
      content: 'Okta SAML assertion signature validation failure resolved by regenerating X.509 signing certificate in admin portal.',
      type: 'observation',
      category: 'successful_solution',
      relevanceScore: 0.95,
      timestamp: '2026-02-15T14:30:00Z',
      metadata: { ticketId: 'SSO-114' },
    },
    {
      id: 'mem_sneha_3',
      bankId: 'customer_cust_6',
      content: 'Customer preference: Requires formal security change logs and audit notes for all identity updates.',
      type: 'preference',
      category: 'preference',
      relevanceScore: 0.89,
      timestamp: '2026-02-15T15:00:00Z',
      metadata: { preferenceType: 'compliance' },
    },
  ],
};

