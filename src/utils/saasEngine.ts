export type PlanId = 'free' | 'starter' | 'growth' | 'agency';
export type BillingCycle = 'monthly' | 'annual';

export interface SaaSPlan {
  id: PlanId;
  name: string;
  audience: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number; // billed annually (monthly equivalent * 12 with 20% discount)
  annualMonthlyEquivalentUsd: number;
  auditLimit: number;
  keywordLimit: number;
  cmsAccessLevel: 'Read-Only' | 'Author (Drafts)' | 'Editor & Redirects' | 'Full Admin & Multi-Site';
  supportSla: string;
  features: string[];
}

export const SAAS_PLANS: Record<PlanId, SaaSPlan> = {
  free: {
    id: 'free',
    name: 'Audit Sandbox',
    audience: 'For initial site evaluation',
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    annualMonthlyEquivalentUsd: 0,
    auditLimit: 3,
    keywordLimit: 5,
    cmsAccessLevel: 'Read-Only',
    supportSla: 'Community & Documentation',
    features: [
      '3 Automated On-Page Technical Audits / mo',
      '5 Tracked Search Keywords',
      'SSRF-Protected HTTP & Metadata Diagnostics',
      'Printable Executive Audit Summary'
    ]
  },
  starter: {
    id: 'starter',
    name: 'Local & Emerging',
    audience: 'For early-stage & local businesses',
    monthlyPriceUsd: 149,
    annualPriceUsd: 1428,
    annualMonthlyEquivalentUsd: 119,
    auditLimit: 25,
    keywordLimit: 50,
    cmsAccessLevel: 'Author (Drafts)',
    supportSla: '48-Hour Specialist Response',
    features: [
      '25 Automated Technical Audits / mo',
      '50 Tracked Search Keywords',
      'Local SEO Citation & Schema Checklist',
      'CMS Draft Creation & Metadata Preview',
      'Automated Monthly Billing & PDF Invoices'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Growth B2B Suite',
    audience: 'For scaling B2B & e-commerce operations',
    monthlyPriceUsd: 399,
    annualPriceUsd: 3828,
    annualMonthlyEquivalentUsd: 319,
    auditLimit: 100,
    keywordLimit: 250,
    cmsAccessLevel: 'Editor & Redirects',
    supportSla: '24-Hour Priority Engineering Support',
    features: [
      '100 Automated Technical Audits / mo',
      '250 Tracked Search Keywords with Intent Mapping',
      'Full CMS Publishing & 301 Slug Redirect Engine',
      'CRM Lead Pipeline & Webhook Export',
      'Dedicated Quarterly Technical Review'
    ]
  },
  agency: {
    id: 'agency',
    name: 'Enterprise & Retainer',
    audience: 'For multi-market brands & enterprise teams',
    monthlyPriceUsd: 999,
    annualPriceUsd: 9588,
    annualMonthlyEquivalentUsd: 799,
    auditLimit: 500,
    keywordLimit: 1500,
    cmsAccessLevel: 'Full Admin & Multi-Site',
    supportSla: '4-Hour Dedicated SEO Architect SLA',
    features: [
      '500 Automated Technical Audits / mo',
      '1,500 Tracked Keywords Across Regions',
      'Full RBAC Admin Console & Custom Schema JSON-LD',
      'Custom Crawl Budget & Log File Consultation',
      'Bespoke Engineering Support by XENO Webworks'
    ]
  }
};

export interface AuditCheckItem {
  id: string;
  checkName: string;
  category: 'Indexability' | 'On-Page Content' | 'Technical Foundation' | 'Structured Data & Links';
  status: 'pass' | 'warn' | 'fail';
  observedValue: string;
  explanation: string;
  recommendation: string;
  weight: number;
}

export function calculateSubscriptionAmount(planId: PlanId, cycle: BillingCycle): number {
  const plan = SAAS_PLANS[planId];
  if (!plan) return 0;
  return cycle === 'annual' ? plan.annualPriceUsd : plan.monthlyPriceUsd;
}

export function calculateProratedUpgrade(
  currentPlanId: PlanId,
  newPlanId: PlanId,
  cycle: BillingCycle,
  daysRemainingInCycle: number = 15
): { immediateChargeUsd: number; newRecurringAmountUsd: number; auditLimit: number; keywordLimit: number } {
  const currentAmount = calculateSubscriptionAmount(currentPlanId, cycle);
  const newAmount = calculateSubscriptionAmount(newPlanId, cycle);
  const totalDays = cycle === 'annual' ? 365 : 30;
  const clampedDays = Math.max(0, Math.min(totalDays, daysRemainingInCycle));
  const diff = Math.max(0, newAmount - currentAmount);
  const immediateChargeUsd = Number(((diff * clampedDays) / totalDays).toFixed(2));
  const targetPlan = SAAS_PLANS[newPlanId];
  return {
    immediateChargeUsd,
    newRecurringAmountUsd: newAmount,
    auditLimit: targetPlan.auditLimit,
    keywordLimit: targetPlan.keywordLimit
  };
}

export function generateInvoiceNumber(timestampMs: number, uidSuffix: string): string {
  const datePart = new Date(timestampMs).toISOString().slice(0, 10).replace(/-/g, '');
  const cleanSuffix = uidSuffix.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'USER';
  return `INV-${datePart}-${cleanSuffix}`;
}

export function calculateNextBillingDate(fromMs: number, cycle: BillingCycle): string {
  const d = new Date(fromMs);
  if (cycle === 'annual') {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString().slice(0, 10);
}

/**
 * Pure SSRF & URL Validator for the Automated SEO Audit Tool
 * Blocks non-HTTP(S), localhost, loopback, link-local, cloud metadata, and private IPv4/IPv6 ranges.
 */
export function validateAuditTargetUrl(rawInput: string): {
  valid: boolean;
  normalizedUrl?: string;
  hostname?: string;
  error?: string;
} {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter a website URL to analyze.' };
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return { valid: false, error: 'Invalid URL format. Example: https://example.com' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are permitted.' };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || !hostname.includes('.')) {
    return { valid: false, error: 'Please provide a public domain name with a valid TLD.' };
  }

  const blockedHostnames = new Set([
    'localhost',
    'localhost.localdomain',
    '0.0.0.0',
    '127.0.0.1',
    '::1',
    '[::1]',
    'metadata.google.internal',
    'metadata',
    '169.254.169.254'
  ]);

  if (blockedHostnames.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return {
      valid: false,
      error: 'SSRF Protection: Loopback, internal, and cloud metadata hostnames are blocked.'
    };
  }

  if (isPrivateOrReservedIp(hostname)) {
    return {
      valid: false,
      error: 'SSRF Protection: Private network and reserved IP addresses cannot be audited.'
    };
  }

  parsed.hash = '';
  return {
    valid: true,
    normalizedUrl: parsed.toString(),
    hostname
  };
}

export function isPrivateOrReservedIp(ipOrHost: string): boolean {
  const clean = ipOrHost.replace(/^\[|\]$/g, '').toLowerCase();

  // Check IPv6 loopback / link-local / unique-local
  if (clean === '::1' || clean === '::' || clean.startsWith('fe80:') || clean.startsWith('fc00:') || clean.startsWith('fd00:')) {
    return true;
  }

  // Check IPv4 format
  const ipv4Match = clean.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4Match) return false;

  const octets = [
    Number(ipv4Match[1]),
    Number(ipv4Match[2]),
    Number(ipv4Match[3]),
    Number(ipv4Match[4])
  ];

  if (octets.some((o) => isNaN(o) || o < 0 || o > 255)) return true;

  const [a, b] = octets;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // Link-local / Cloud metadata 169.254.169.254
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // Multicast & reserved

  return false;
}

/**
 * Deterministic scoring calculation for SEO audit findings.
 * Documented formula: Weighted sum of passed (100%), warning (50%), and failed (0%) checks.
 */
export function computeAuditScore(checks: AuditCheckItem[]): {
  overallScore: number;
  passedCount: number;
  warningCount: number;
  failedCount: number;
} {
  if (!checks.length) {
    return { overallScore: 0, passedCount: 0, warningCount: 0, failedCount: 0 };
  }

  let totalWeight = 0;
  let earnedWeight = 0;
  let passedCount = 0;
  let warningCount = 0;
  let failedCount = 0;

  for (const check of checks) {
    const w = Math.max(1, check.weight);
    totalWeight += w;
    if (check.status === 'pass') {
      earnedWeight += w;
      passedCount++;
    } else if (check.status === 'warn') {
      earnedWeight += w * 0.5;
      warningCount++;
    } else {
      failedCount++;
    }
  }

  const overallScore = Math.round((earnedWeight / totalWeight) * 100);
  return { overallScore, passedCount, warningCount, failedCount };
}
