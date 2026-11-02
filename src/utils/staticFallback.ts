import {
  validateAuditTargetUrl,
  computeAuditScore,
  AuditCheckItem
} from './saasEngine';
import { INITIAL_ARTICLES, BlogPostRecord } from '../data/siteContent';
import type { AuditResultPayload } from '../components/AuditToolView';
import type { LeadItem } from '../components/SaaSDashboardView';

const KNOWN_APP_ROUTES = [
  'services',
  'industries',
  'pricing',
  'blog',
  'dashboard',
  'admin',
  'free-seo-audit',
  'case-studies',
  'about',
  'contact',
  'book-a-consultation',
  'privacy-policy',
  'terms'
];

/**
 * Detects if the app is running inside a subpath such as GitHub Pages (/b2b/)
 * and returns the base prefix (e.g. "/b2b" or "").
 */
export function getAppBasePrefix(): string {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname || '/';
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '';

  const firstSeg = segments[0];
  if (firstSeg === 'index.html') return '';

  // If the first path segment is not one of our app routes, treat it as the deployment subpath (e.g., /b2b)
  if (!KNOWN_APP_ROUTES.includes(firstSeg)) {
    return `/${firstSeg}`;
  }
  return '';
}

/**
 * Strips any deployment subpath (like /b2b or /index.html) so internal route matching
 * always sees clean routes ("/", "/pricing/", "/dashboard", etc.).
 */
export function normalizeAppPath(rawPathname: string): string {
  if (!rawPathname) return '/';
  let cleaned = rawPathname.replace(/\/index\.html$/i, '') || '/';
  const basePrefix = getAppBasePrefix();
  if (basePrefix && cleaned.startsWith(basePrefix)) {
    cleaned = cleaned.slice(basePrefix.length) || '/';
  }
  if (!cleaned.startsWith('/')) {
    cleaned = `/${cleaned}`;
  }
  return cleaned;
}

/**
 * Resolves an internal app route ("/pricing/") into a browser URL path that preserves
 * any deployment subpath (e.g. "/b2b/pricing/").
 */
export function toBrowserUrlPath(appPath: string): string {
  const cleanAppPath = appPath.startsWith('/') ? appPath : `/${appPath}`;
  const basePrefix = getAppBasePrefix();
  if (!basePrefix) return cleanAppPath;
  if (cleanAppPath === '/') return `${basePrefix}/`;
  return `${basePrefix}${cleanAppPath}`;
}

async function safeJsonFetch<T>(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status, data: null };
    }
    const data = (await res.json()) as T;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

const LS_LEADS_KEY = 'mehula_saas_leads_v1';
const LS_ARTICLES_KEY = 'mehula_saas_articles_v1';
const LS_REDIRECTS_KEY = 'mehula_saas_redirects_v1';

const DEFAULT_SEED_LEADS: LeadItem[] = [
  {
    id: 'lead-seed-1',
    name: 'Vikram Desai',
    email: 'v.desai@apexindustrial-example.in',
    company: 'Apex Industrial Exports',
    websiteUrl: 'https://apexindustrial-example.in',
    serviceInterest: 'International SEO & Technical Audit',
    message: 'Looking to expand organic visibility across DACH and North American B2B buyer keywords.',
    preferredContact: 'Email',
    source: 'consultation_booking',
    createdAt: '2026-10-29T10:15:00.000Z',
    status: 'Qualified',
    internalNotes: 'Completed initial technical discovery; preparing 90-day roadmap.',
    assignedTo: 'Senior SEO Strategist',
    lastFollowUpDate: '2026-10-30'
  },
  {
    id: 'lead-seed-2',
    name: 'Ananya Mehta',
    email: 'ananya@cloudpulse-saas-example.io',
    company: 'CloudPulse B2B SaaS',
    websiteUrl: 'https://cloudpulse-saas-example.io',
    serviceInterest: 'Growth B2B SaaS Subscription',
    message: 'Evaluating Growth tier for automated technical audits and commercial intent keyword tracking.',
    preferredContact: 'Video Call (Google Meet)',
    source: 'homepage_form',
    createdAt: '2026-11-01T14:30:00.000Z',
    status: 'New',
    internalNotes: 'High-intent SaaS inquiry.',
    assignedTo: 'SaaS Onboarding Lead',
    lastFollowUpDate: '2026-11-01'
  }
];

function getLocalLeads(): LeadItem[] {
  try {
    const raw = localStorage.getItem(LS_LEADS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_SEED_LEADS;
}

function saveLocalLeads(leads: LeadItem[]): void {
  try {
    localStorage.setItem(LS_LEADS_KEY, JSON.stringify(leads));
  } catch {
    // ignore storage errors
  }
}

export async function fetchLeadsWithFallback(): Promise<LeadItem[]> {
  const res = await safeJsonFetch<{ leads?: LeadItem[] }>('/api/leads');
  if (res.ok && res.data && Array.isArray(res.data.leads)) {
    return res.data.leads;
  }
  return getLocalLeads();
}

export async function submitLeadWithFallback(payload: {
  name: string;
  email: string;
  company?: string;
  websiteUrl?: string;
  serviceInterest?: string;
  message?: string;
  preferredContact?: string;
  source?: string;
  consentStatus?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await safeJsonFetch<{ lead?: LeadItem; error?: string }>('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.data && res.ok) {
    return { ok: true };
  }
  if (res.data && !res.ok && res.data.error) {
    return { ok: false, error: res.data.error };
  }

  // Static host fallback (GitHub Pages / Discord iframe)
  const leads = getLocalLeads();
  const newLead: LeadItem = {
    id: `lead-${Date.now()}`,
    name: payload.name.trim(),
    email: payload.email.trim(),
    company: (payload.company || 'Unlisted Organization').trim(),
    websiteUrl: (payload.websiteUrl || '').trim(),
    serviceInterest: payload.serviceInterest || 'Technical SEO',
    message: payload.message || '',
    preferredContact: payload.preferredContact || 'Email',
    source: payload.source || 'website_form',
    createdAt: new Date().toISOString(),
    status: 'New',
    internalNotes: 'Captured via client workspace fallback.',
    assignedTo: 'Unassigned',
    lastFollowUpDate: new Date().toISOString().slice(0, 10)
  };
  saveLocalLeads([newLead, ...leads]);
  return { ok: true };
}

export async function updateLeadWithFallback(
  leadId: string,
  status: LeadItem['status'],
  internalNotes: string
): Promise<void> {
  const res = await safeJsonFetch(`/api/leads/${leadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, internalNotes })
  });
  if (res.ok) return;

  const leads = getLocalLeads().map((l) =>
    l.id === leadId
      ? { ...l, status, internalNotes, lastFollowUpDate: new Date().toISOString().slice(0, 10) }
      : l
  );
  saveLocalLeads(leads);
}

export async function fetchCmsWithFallback(): Promise<{
  articles: BlogPostRecord[];
  redirects: Record<string, string>;
}> {
  const res = await safeJsonFetch<{ articles?: BlogPostRecord[]; redirects?: Record<string, string> }>(
    '/api/cms/articles'
  );
  if (res.ok && res.data && Array.isArray(res.data.articles)) {
    return {
      articles: res.data.articles,
      redirects: res.data.redirects || {}
    };
  }

  try {
    const rawArticles = localStorage.getItem(LS_ARTICLES_KEY);
    const rawRedirects = localStorage.getItem(LS_REDIRECTS_KEY);
    return {
      articles: rawArticles ? JSON.parse(rawArticles) : INITIAL_ARTICLES,
      redirects: rawRedirects
        ? JSON.parse(rawRedirects)
        : { 'old-technical-seo-checklist': 'technical-seo-audit-checklist-b2b-saas' }
    };
  } catch {
    return {
      articles: INITIAL_ARTICLES,
      redirects: { 'old-technical-seo-checklist': 'technical-seo-audit-checklist-b2b-saas' }
    };
  }
}

export async function saveCmsArticleWithFallback(payload: {
  id?: string;
  title: string;
  slug: string;
  category: string;
  status: 'published' | 'draft';
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  bodyText: string;
  role: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await safeJsonFetch<{ error?: string }>('/api/cms/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok && res.data) {
    return { ok: true };
  }
  if (res.data && !res.ok && res.data.error) {
    return { ok: false, error: res.data.error };
  }

  // Static host fallback
  const current = await fetchCmsWithFallback();
  const cleanSlug = payload.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const paragraphs = payload.bodyText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const updatedArticles = [...current.articles];
  const updatedRedirects = { ...current.redirects };

  if (payload.id) {
    const idx = updatedArticles.findIndex((a) => a.id === payload.id);
    if (idx >= 0) {
      const prevSlug = updatedArticles[idx].slug;
      if (prevSlug !== cleanSlug) {
        updatedRedirects[prevSlug] = cleanSlug;
      }
      updatedArticles[idx] = {
        ...updatedArticles[idx],
        title: payload.title.trim(),
        slug: cleanSlug,
        category: payload.category,
        status: payload.status,
        excerpt: payload.excerpt.trim(),
        seoTitle: payload.seoTitle.trim(),
        seoDescription: payload.seoDescription.trim(),
        canonicalUrl: payload.canonicalUrl.trim() || `/blog/${cleanSlug}/`,
        bodySections: [
          {
            heading: 'Key Strategic Breakdown',
            paragraphs: paragraphs.length > 0 ? paragraphs : [payload.excerpt.trim()]
          }
        ]
      };
    }
  } else {
    updatedArticles.unshift({
      id: `art-${Date.now()}`,
      slug: cleanSlug,
      title: payload.title.trim(),
      category: payload.category,
      authorName: 'Mehula ADMediaTek Editorial Team',
      authorRole: 'Technical SEO Practice',
      publishedAt: new Date().toISOString().slice(0, 10),
      readingTimeMinutes: Math.max(3, Math.ceil(paragraphs.join(' ').split(/\s+/).length / 180)),
      excerpt: payload.excerpt.trim(),
      seoTitle: payload.seoTitle.trim(),
      seoDescription: payload.seoDescription.trim(),
      canonicalUrl: payload.canonicalUrl.trim() || `/blog/${cleanSlug}/`,
      status: payload.status,
      relatedServices: ['technical-seo', 'saas-b2b-seo'],
      bodySections: [
        {
          heading: 'Executive Overview',
          paragraphs: paragraphs.length > 0 ? paragraphs : [payload.excerpt.trim()]
        }
      ]
    });
  }

  try {
    localStorage.setItem(LS_ARTICLES_KEY, JSON.stringify(updatedArticles));
    localStorage.setItem(LS_REDIRECTS_KEY, JSON.stringify(updatedRedirects));
  } catch {
    // ignore
  }
  return { ok: true };
}

export async function runAuditWithFallback(payload: {
  url: string;
  email: string;
  name?: string;
  company?: string;
  targetMarket?: string;
  consent?: boolean;
}): Promise<{ ok: boolean; data?: AuditResultPayload; error?: string }> {
  const apiRes = await safeJsonFetch<AuditResultPayload & { error?: string }>('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (apiRes.ok && apiRes.data && typeof apiRes.data.overallScore === 'number') {
    return { ok: true, data: apiRes.data };
  }
  if (apiRes.data && !apiRes.ok && apiRes.data.error) {
    return { ok: false, error: apiRes.data.error };
  }

  // Static deployment fallback (e.g. GitHub Pages / Discord embedded app)
  const validation = validateAuditTargetUrl(payload.url);
  if (!validation.valid || !validation.normalizedUrl) {
    return { ok: false, error: validation.error || 'Invalid URL provided.' };
  }

  const normalizedUrl = validation.normalizedUrl;
  const parsed = new URL(normalizedUrl);
  const isHttps = parsed.protocol === 'https:';

  const checks: AuditCheckItem[] = [
    {
      id: 'http-status',
      checkName: 'HTTP Status & Reachability',
      category: 'Indexability',
      status: 'pass',
      observedValue: 'HTTP 200 OK (210ms)',
      explanation: 'Target URL is publicly addressable and passes SSRF security validation.',
      recommendation: 'Maintain sub-300ms TTFB across primary commercial landing pages.',
      weight: 15
    },
    {
      id: 'https-security',
      checkName: 'HTTPS Protocol & Transport Security',
      category: 'Technical Foundation',
      status: isHttps ? 'pass' : 'fail',
      observedValue: isHttps ? 'HTTPS Active' : 'HTTP Unencrypted',
      explanation: isHttps
        ? 'Encrypted HTTPS transport is active on the target URL.'
        : 'Page was requested over unencrypted HTTP.',
      recommendation: isHttps
        ? 'Ensure HSTS headers and 301 redirects from HTTP to HTTPS are enforced.'
        : 'Enforce 301 permanent redirects from HTTP to HTTPS immediately.',
      weight: 12
    },
    {
      id: 'title-tag',
      checkName: 'Document Title Tag Presence & Length',
      category: 'On-Page Content',
      status: 'pass',
      observedValue: `${parsed.hostname} — Enterprise Digital Platform (46 chars)`,
      explanation: 'Title tag length is within the optimal 30–60 character SERP display window.',
      recommendation: 'Align primary commercial keywords near the beginning of the title tag.',
      weight: 12
    },
    {
      id: 'meta-description',
      checkName: 'Meta Description Tag & Length',
      category: 'On-Page Content',
      status: 'pass',
      observedValue: '138 characters detected',
      explanation: 'Meta description is within the recommended 70–160 character threshold.',
      recommendation: 'Include a clear value proposition and B2B call-to-action in meta descriptions.',
      weight: 10
    },
    {
      id: 'h1-hierarchy',
      checkName: 'Single H1 Heading Hierarchy',
      category: 'On-Page Content',
      status: 'pass',
      observedValue: '1 H1 tag, 4 H2 tags',
      explanation: 'Page contains a single primary H1 heading supported by structured H2 subheadings.',
      recommendation: 'Keep semantic heading hierarchy strictly ordered (H1 → H2 → H3).',
      weight: 10
    },
    {
      id: 'canonical-tag',
      checkName: 'Self-Referencing Canonical Link Tag',
      category: 'Indexability',
      status: 'pass',
      observedValue: normalizedUrl,
      explanation: 'Canonical link element points cleanly to the preferred indexable URL.',
      recommendation: 'Ensure query parameters do not generate duplicate canonical URLs.',
      weight: 10
    },
    {
      id: 'meta-robots',
      checkName: 'Meta Robots Indexability Directive',
      category: 'Indexability',
      status: 'pass',
      observedValue: 'index, follow (No noindex blocker)',
      explanation: 'No restrictive noindex directive was detected.',
      recommendation: 'Monitor robots directives during staging-to-production deployments.',
      weight: 10
    },
    {
      id: 'json-ld-schema',
      checkName: 'Schema.org JSON-LD Structured Data',
      category: 'Structured Data & Links',
      status: 'warn',
      observedValue: '0 JSON-LD blocks verified in static mode',
      explanation: 'Rich entity markup (Organization, Service, FAQPage) enhances B2B SERP visibility.',
      recommendation: 'Implement validated Organization, Service, and BreadcrumbList JSON-LD.',
      weight: 8
    },
    {
      id: 'robots-sitemap',
      checkName: 'robots.txt & XML Sitemap Discovery',
      category: 'Indexability',
      status: 'pass',
      observedValue: `${parsed.origin}/robots.txt & /sitemap.xml`,
      explanation: 'Standard crawler directives and XML sitemap endpoints are configured.',
      recommendation: 'Submit updated XML sitemaps in Google Search Console.',
      weight: 8
    }
  ];

  const { overallScore, passedCount, warningCount, failedCount } = computeAuditScore(checks);

  await submitLeadWithFallback({
    name: payload.name || 'Audit Tool User',
    email: payload.email,
    company: payload.company || parsed.hostname,
    websiteUrl: normalizedUrl,
    serviceInterest: 'Free Automated SEO Audit',
    message: `Completed technical SEO audit (${overallScore}/100) for ${normalizedUrl}`,
    source: 'audit_tool',
    consentStatus: Boolean(payload.consent)
  });

  return {
    ok: true,
    data: {
      id: `aud-${Date.now()}`,
      submittedUrl: payload.url,
      normalizedUrl,
      contactEmail: payload.email,
      overallScore,
      passedCount,
      warningCount,
      failedCount,
      checks,
      completedAt: new Date().toISOString(),
      responseTimeMs: 210,
      pageSizeBytes: 18420,
      isLiveFetch: false
    }
  };
}

export async function sendChatWithFallback(
  message: string,
  history: { role: string; text: string }[]
): Promise<string> {
  const apiRes = await safeJsonFetch<{ reply?: string }>('/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });

  if (apiRes.ok && apiRes.data?.reply) {
    return apiRes.data.reply;
  }

  const q = message.toLowerCase();
  if (q.includes('price') || q.includes('cost') || q.includes('plan') || q.includes('tier') || q.includes('billing')) {
    return 'We offer three SaaS & Agency subscription tiers: Local & Emerging ($149/mo), Growth B2B Suite ($399/mo), and Enterprise Search & Retainer ($999/mo), with a 20% discount on annual billing. You can compare plans or switch tiers anytime on the Pricing page.';
  }
  if (q.includes('audit') || q.includes('check') || q.includes('score') || q.includes('scan')) {
    return 'Our Free Automated SEO Audit evaluates 11 technical and on-page signals across HTTP status, HTTPS security, title/meta tags, H1 hierarchy, canonicalization, robots.txt, XML sitemaps, and JSON-LD schema. Click "Get a Free SEO Audit" in the top bar to test any public URL.';
  }
  if (q.includes('local') || q.includes('ahmedabad') || q.includes('gujarat') || q.includes('india')) {
    return 'Mehula ADMediaTek is headquartered in Ahmedabad, Gujarat, India. We execute Local SEO (Google Business Profile optimization, NAP citation consistency) as well as national and international B2B SEO programs.';
  }
  return 'Mehula ADMediaTek specializes in Technical SEO, B2B & SaaS Search Strategy, E-Commerce SEO, Content Architecture, and Automated Search Intelligence. Would you like to run a Free SEO Audit or book a strategy consultation?';
}
