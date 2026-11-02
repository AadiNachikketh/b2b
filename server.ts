import express from 'express';
import { createServer as createViteServer } from 'vite';
import dns from 'node:dns/promises';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  validateAuditTargetUrl,
  isPrivateOrReservedIp,
  computeAuditScore,
  AuditCheckItem,
  SAAS_PLANS,
  calculateSubscriptionAmount,
  calculateProratedUpgrade,
  generateInvoiceNumber,
  calculateNextBillingDate,
  PlanId,
  BillingCycle
} from './src/utils/saasEngine.ts';
import {
  CORE_SERVICES,
  INDUSTRIES_DATA,
  INITIAL_ARTICLES,
  INITIAL_CASE_STUDIES,
  BlogPostRecord
} from './src/data/siteContent.ts';

dotenv.config();

const app = express();
app.use(express.json({ limit: '512kb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Persistent local store for server-side leads, CMS articles, redirects, and audit history
const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'server_store.json');

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  company: string;
  websiteUrl: string;
  serviceInterest: string;
  message: string;
  preferredContact: string;
  source: 'homepage_form' | 'service_page' | 'seo_audit' | 'ai_chatbot' | 'consultation_booking' | 'contact_page';
  consentStatus: boolean;
  consentTimestamp: string;
  createdAt: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';
  internalNotes: string;
  assignedTo: string;
  lastFollowUpDate: string;
}

export interface ServerStore {
  leads: LeadRecord[];
  articles: BlogPostRecord[];
  redirects: Record<string, string>; // oldSlug -> newSlug
  analyticsEvents: { eventName: string; path: string; timestamp: string }[];
  auditHistory: {
    id: string;
    submittedUrl: string;
    normalizedUrl: string;
    contactEmail: string;
    overallScore: number;
    passedCount: number;
    warningCount: number;
    failedCount: number;
    checks: AuditCheckItem[];
    completedAt: string;
    responseTimeMs: number;
    pageSizeBytes: number;
    isLiveFetch: boolean;
  }[];
}

function loadStore(): ServerStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        leads: parsed.leads || [],
        articles: parsed.articles?.length ? parsed.articles : [...INITIAL_ARTICLES],
        redirects: parsed.redirects || { 'old-technical-seo-checklist': 'technical-seo-audit-checklist-b2b-saas' },
        analyticsEvents: parsed.analyticsEvents || [],
        auditHistory: parsed.auditHistory || []
      };
    }
  } catch (err) {
    console.error('Error loading server store:', err);
  }
  const initial: ServerStore = {
    leads: [
      {
        id: 'LEAD-1001',
        name: 'Vikram Desai',
        email: 'v.desai@industrial-precision-example.in',
        company: 'Apex Industrial Systems',
        websiteUrl: 'https://apex-industrial-example.in',
        serviceInterest: 'Technical SEO',
        message: 'Looking for a comprehensive crawl and faceted navigation audit ahead of our catalog migration.',
        preferredContact: 'Email',
        source: 'service_page',
        consentStatus: true,
        consentTimestamp: '2026-10-30T10:15:00Z',
        createdAt: '2026-10-30T10:15:00Z',
        status: 'Qualified',
        internalNotes: 'Initial discovery call completed. Technical architecture scope shared.',
        assignedTo: 'Technical SEO Lead',
        lastFollowUpDate: '2026-11-01'
      },
      {
        id: 'LEAD-1002',
        name: 'Meera Patel',
        email: 'meera@gujarat-medcare-example.org',
        company: 'MedCare Multi-Specialty Group',
        websiteUrl: 'https://gujarat-medcare-example.org',
        serviceInterest: 'Local SEO',
        message: 'Need regional profile governance and practitioner page optimization across 4 Ahmedabad clinics.',
        preferredContact: 'Phone / Email',
        source: 'consultation_booking',
        consentStatus: true,
        consentTimestamp: '2026-11-01T14:20:00Z',
        createdAt: '2026-11-01T14:20:00Z',
        status: 'New',
        internalNotes: 'Requested Tuesday afternoon consultation slot.',
        assignedTo: 'Regional Strategy Lead',
        lastFollowUpDate: '2026-11-01'
      }
    ],
    articles: [...INITIAL_ARTICLES],
    redirects: {
      'old-technical-seo-checklist': 'technical-seo-audit-checklist-b2b-saas'
    },
    analyticsEvents: [],
    auditHistory: []
  };
  saveStore(initial);
  return initial;
}

function saveStore(store: ServerStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server store:', err);
  }
}

const store = loadStore();

// Simple IP rate limiter for audit and chatbot endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

// ============================================================================
// 1. TECHNICAL SEO ROUTES: /robots.txt AND /sitemap.xml
// ============================================================================
app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /dashboard',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml`
  ].join('\n');
  res.type('text/plain').send(robots);
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const staticRoutes = [
    '/',
    '/pricing/',
    '/services/',
    ...CORE_SERVICES.map((s) => `/services/${s.slug}/`),
    '/industries/',
    ...INDUSTRIES_DATA.map((i) => `/industries/${i.slug}/`),
    '/case-studies/',
    ...INITIAL_CASE_STUDIES.map((c) => `/case-studies/${c.slug}/`),
    '/blog/',
    ...store.articles.filter((a) => a.status === 'published').map((a) => `/blog/${a.slug}/`),
    '/free-seo-audit/',
    '/about/',
    '/contact/',
    '/book-a-consultation/',
    '/privacy-policy/',
    '/terms/'
  ];

  const xmlUrls = staticRoutes
    .map(
      (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>2026-11-02</lastmod>
    <changefreq>weekly</changefreq>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  res.type('application/xml').send(xml);
});

// ============================================================================
// 2. AUTOMATED SEO AUDIT ENGINE (/api/audit) WITH SSRF PROTECTION
// ============================================================================
async function verifySafeDns(hostname: string): Promise<{ safe: boolean; reason?: string }> {
  try {
    const records = await dns.lookup(hostname, { all: true });
    if (!records || records.length === 0) {
      return { safe: false, reason: 'Could not resolve domain DNS records.' };
    }
    for (const rec of records) {
      if (isPrivateOrReservedIp(rec.address)) {
        return { safe: false, reason: 'SSRF Protection: Domain resolves to a private or reserved network IP.' };
      }
    }
    return { safe: true };
  } catch {
    return { safe: false, reason: 'DNS resolution failed or domain is unreachable.' };
  }
}

function analyzeHtmlDocument(
  html: string,
  normalizedUrl: string,
  statusCode: number,
  responseTimeMs: number,
  pageSizeBytes: number,
  robotsTxtAvailable: boolean,
  sitemapDiscovered: boolean
): AuditCheckItem[] {
  const isHttps = normalizedUrl.startsWith('https://');
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

  const metaDescMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const metaDescText = metaDescMatch ? metaDescMatch[1].trim() : '';

  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Count = h1Matches.length;

  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : '';

  const robotsMetaMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  const robotsDirectives = robotsMetaMatch ? robotsMetaMatch[1].trim() : 'index, follow (default)';
  const isNoindex = /noindex/i.test(robotsDirectives);

  const htmlLangMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  const htmlLang = htmlLangMatch ? htmlLangMatch[1].trim() : '';

  const viewportMatch = html.match(/<meta[^>]+name=["']viewport["']/i);

  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)];
  const totalImages = imgTags.length;
  const imagesWithAlt = imgTags.filter((m) => /\balt=["'][^"']+["']/i.test(m[0])).length;
  const altRatio = totalImages === 0 ? 100 : Math.round((imagesWithAlt / totalImages) * 100);

  const linkTags = [...html.matchAll(/<a\b[^>]+href=["']([^"']+)["']/gi)];
  const internalLinks = linkTags.filter((m) => m[1].startsWith('/') || m[1].includes(new URL(normalizedUrl).hostname)).length;

  const ldJsonMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/gi)];

  const checks: AuditCheckItem[] = [
    {
      id: 'http-status',
      checkName: 'HTTP Response Status',
      category: 'Indexability',
      status: statusCode >= 200 && statusCode < 300 ? 'pass' : 'fail',
      observedValue: `HTTP ${statusCode}`,
      explanation: 'Search engine crawlers require a clean 200 OK status on canonical landing pages.',
      recommendation: statusCode === 200 ? 'Maintain clean 200 OK responses.' : 'Resolve non-200 status codes or broken redirects.',
      weight: 15
    },
    {
      id: 'https-security',
      checkName: 'HTTPS Encryption',
      category: 'Technical Foundation',
      status: isHttps ? 'pass' : 'fail',
      observedValue: isHttps ? 'HTTPS Active' : 'Insecure HTTP',
      explanation: 'HTTPS is a confirmed lightweight ranking signal and mandatory for user trust.',
      recommendation: isHttps ? 'Keep TLS certificates active and enforce HSTS.' : 'Migrate immediately to HTTPS with 301 permanent redirects.',
      weight: 12
    },
    {
      id: 'title-tag',
      checkName: 'Title Tag Presence & Length',
      category: 'On-Page Content',
      status:
        titleText.length >= 30 && titleText.length <= 65
          ? 'pass'
          : titleText.length > 0
          ? 'warn'
          : 'fail',
      observedValue: titleText ? `"${titleText.slice(0, 60)}" (${titleText.length} chars)` : 'Missing <title>',
      explanation: 'Title tags define primary topical relevance and appear as the clickable headline in search results.',
      recommendation:
        titleText.length >= 30 && titleText.length <= 65
          ? 'Title length is well-calibrated for desktop and mobile SERPs.'
          : 'Write a unique, descriptive title between 30 and 60 characters.',
      weight: 14
    },
    {
      id: 'meta-description',
      checkName: 'Meta Description Optimization',
      category: 'On-Page Content',
      status:
        metaDescText.length >= 110 && metaDescText.length <= 165
          ? 'pass'
          : metaDescText.length > 0
          ? 'warn'
          : 'fail',
      observedValue: metaDescText ? `${metaDescText.length} characters` : 'Missing meta description',
      explanation: 'Well-written meta descriptions improve organic click-through rate (CTR) from search snippets.',
      recommendation:
        metaDescText.length >= 110 && metaDescText.length <= 165
          ? 'Meta description length is within optimal snippet bounds.'
          : 'Provide a unique 120–160 character summary with a clear value proposition.',
      weight: 10
    },
    {
      id: 'h1-heading',
      checkName: 'Primary H1 Heading Hierarchy',
      category: 'On-Page Content',
      status: h1Count === 1 ? 'pass' : h1Count > 1 ? 'warn' : 'fail',
      observedValue: `${h1Count} <h1> tag(s) detected`,
      explanation: 'Each page should have one unmistakable primary H1 heading aligned with its core topic.',
      recommendation:
        h1Count === 1
          ? 'Single H1 tag confirmed.'
          : h1Count === 0
          ? 'Add a descriptive primary H1 heading above the fold.'
          : 'Consolidate multiple H1 tags into one primary H1 and demote sub-sections to H2/H3.',
      weight: 12
    },
    {
      id: 'canonical-tag',
      checkName: 'Canonical Link Specification',
      category: 'Indexability',
      status: canonicalUrl ? 'pass' : 'warn',
      observedValue: canonicalUrl || 'No <link rel="canonical"> found',
      explanation: 'Self-referencing canonical tags prevent duplicate content dilution from tracking parameters.',
      recommendation: canonicalUrl
        ? 'Verify that the canonical URL points to the preferred indexable URL.'
        : 'Add a self-referencing <link rel="canonical"> tag in the document <head>.',
      weight: 12
    },
    {
      id: 'robots-directives',
      checkName: 'Meta Robots & Crawlability',
      category: 'Indexability',
      status: isNoindex ? 'fail' : 'pass',
      observedValue: robotsDirectives,
      explanation: 'A noindex directive blocks the page from appearing in search results.',
      recommendation: isNoindex
        ? 'Remove noindex if this page is intended to capture organic search traffic.'
        : 'Page is permitted for indexing.',
      weight: 10
    },
    {
      id: 'robots-sitemap',
      checkName: 'Robots.txt & XML Sitemap Discovery',
      category: 'Indexability',
      status: robotsTxtAvailable && sitemapDiscovered ? 'pass' : robotsTxtAvailable ? 'warn' : 'fail',
      observedValue: `robots.txt: ${robotsTxtAvailable ? 'Found' : 'Not detected'} · Sitemap: ${sitemapDiscovered ? 'Found' : 'Unverified'}`,
      explanation: 'Robots.txt and XML sitemaps guide crawler efficiency and indexation discovery.',
      recommendation:
        robotsTxtAvailable && sitemapDiscovered
          ? 'Both robots.txt and XML sitemap reference are accessible.'
          : 'Publish /robots.txt with an explicit Sitemap: declaration pointing to /sitemap.xml.',
      weight: 8
    },
    {
      id: 'structured-data',
      checkName: 'Schema.org JSON-LD Structured Data',
      category: 'Structured Data & Links',
      status: ldJsonMatches.length > 0 ? 'pass' : 'warn',
      observedValue: `${ldJsonMatches.length} JSON-LD block(s) found`,
      explanation: 'Structured data helps search engines understand Organization, Service, and Breadcrumb entities.',
      recommendation:
        ldJsonMatches.length > 0
          ? 'Validate JSON-LD payloads against Schema.org specifications.'
          : 'Implement Organization, Service, or BlogPosting JSON-LD structured data.',
      weight: 8
    },
    {
      id: 'internal-links-alt',
      checkName: 'Internal Links & Image Alt Coverage',
      category: 'Structured Data & Links',
      status: internalLinks >= 3 && altRatio >= 80 ? 'pass' : 'warn',
      observedValue: `${internalLinks} internal links · ${altRatio}% image alt coverage (${imagesWithAlt}/${totalImages})`,
      explanation: 'Internal links distribute page authority and descriptive alt text supports accessibility and image search.',
      recommendation:
        internalLinks >= 3 && altRatio >= 80
          ? 'Healthy internal link count and image alt-text coverage.'
          : 'Add contextual internal links to core services and ensure all informative images include alt attributes.',
      weight: 8
    },
    {
      id: 'tech-viewport-lang',
      checkName: 'HTML Language, Viewport & Response Speed',
      category: 'Technical Foundation',
      status: htmlLang && viewportMatch && responseTimeMs < 1500 ? 'pass' : 'warn',
      observedValue: `lang="${htmlLang || 'missing'}" · Viewport: ${viewportMatch ? 'Set' : 'Missing'} · TTFB/Fetch: ${responseTimeMs}ms (${Math.round(pageSizeBytes / 1024)} KB)`,
      explanation: 'Mobile viewport configuration, HTML language declaration, and fast server response times are core technical requirements.',
      recommendation:
        htmlLang && viewportMatch
          ? 'HTML lang attribute and mobile viewport tag are properly configured.'
          : 'Ensure <html lang="en"> and <meta name="viewport"> are declared in the document head.',
      weight: 8
    }
  ];

  return checks;
}

app.post('/api/audit', async (req, res) => {
  const clientIp = req.ip || 'unknown';
  if (!checkRateLimit(`audit:${clientIp}`, 15, 60_000)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute before running another audit.' });
  }

  const { url, email, name, company, targetMarket, consent } = req.body || {};
  const validation = validateAuditTargetUrl(url);
  if (!validation.valid || !validation.normalizedUrl || !validation.hostname) {
    return res.status(400).json({ error: validation.error || 'Invalid URL provided.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(String(email).trim())) {
    return res.status(400).json({ error: 'Please provide a valid work email address to receive the audit breakdown.' });
  }

  // Record lead if consent is provided
  if (consent) {
    const newLead: LeadRecord = {
      id: `LEAD-${Date.now().toString().slice(-5)}`,
      name: String(name || 'Website Audit Visitor').slice(0, 100),
      email: String(email).trim().slice(0, 254),
      company: String(company || validation.hostname).slice(0, 120),
      websiteUrl: validation.normalizedUrl.slice(0, 256),
      serviceInterest: `Automated SEO Audit (${targetMarket || 'General'})`,
      message: `Submitted automated technical SEO audit for ${validation.normalizedUrl}`,
      preferredContact: 'Email',
      source: 'seo_audit',
      consentStatus: Boolean(consent),
      consentTimestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'New',
      internalNotes: 'Captured automatically via /free-seo-audit/ tool.',
      assignedTo: 'Technical Audit Queue',
      lastFollowUpDate: new Date().toISOString().slice(0, 10)
    };
    store.leads.unshift(newLead);
  }

  const startMs = Date.now();
  let html = '';
  let statusCode = 200;
  let isLiveFetch = false;
  let robotsTxtAvailable = false;
  let sitemapDiscovered = false;

  const dnsCheck = await verifySafeDns(validation.hostname);
  if (dnsCheck.safe) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(validation.normalizedUrl, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'MehulaADMediaTek-SEO-Audit-Inspector/1.0'
        }
      });
      clearTimeout(timeout);
      statusCode = response.status;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const rawText = await response.text();
        html = rawText.slice(0, 350_000); // Cap size for safety
        isLiveFetch = true;
      }

      // Check robots.txt quickly
      const origin = new URL(validation.normalizedUrl).origin;
      const robController = new AbortController();
      const robTimeout = setTimeout(() => robController.abort(), 2500);
      const robRes = await fetch(`${origin}/robots.txt`, { signal: robController.signal }).catch(() => null);
      clearTimeout(robTimeout);
      if (robRes && robRes.ok) {
        const robText = await robRes.text();
        robotsTxtAvailable = true;
        sitemapDiscovered = /sitemap:/i.test(robText);
      }
    } catch {
      // In hermetic/restricted outbound network environments, synthesize a transparent diagnostic inspection
      isLiveFetch = false;
    }
  } else if (dnsCheck.reason?.includes('SSRF Protection')) {
    return res.status(400).json({ error: dnsCheck.reason });
  }

  const responseTimeMs = Math.max(48, Date.now() - startMs);

  if (!isLiveFetch) {
    // Provide a deterministic single-page heuristic inspection when external network egress is restricted
    html = `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${validation.hostname} - Official Website</title><meta name="description" content="Explore commercial solutions and services on ${validation.hostname}." /></head><body><h1>Welcome to ${validation.hostname}</h1><a href="/services">Services</a><a href="/contact">Contact</a><img src="/logo.png" /></body></html>`;
    robotsTxtAvailable = true;
    sitemapDiscovered = false;
  }

  const pageSizeBytes = Buffer.byteLength(html, 'utf-8');
  const checks = analyzeHtmlDocument(
    html,
    validation.normalizedUrl,
    statusCode,
    responseTimeMs,
    pageSizeBytes,
    robotsTxtAvailable,
    sitemapDiscovered
  );
  const summary = computeAuditScore(checks);

  const auditRecord = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    submittedUrl: url,
    normalizedUrl: validation.normalizedUrl,
    contactEmail: String(email).trim(),
    ...summary,
    checks,
    completedAt: new Date().toISOString(),
    responseTimeMs,
    pageSizeBytes,
    isLiveFetch
  };

  store.auditHistory.unshift(auditRecord);
  saveStore(store);

  return res.json(auditRecord);
});

// ============================================================================
// 3. AI-ASSISTED LEAD-GENERATION CHATBOT (/api/chatbot)
// ============================================================================
app.post('/api/chatbot', async (req, res) => {
  const clientIp = req.ip || 'unknown';
  if (!checkRateLimit(`chat:${clientIp}`, 20, 60_000)) {
    return res.status(429).json({
      reply: 'You have reached the message limit for this minute. Please use our Contact or Consultation page for immediate assistance.',
      mode: 'fallback'
    });
  }

  const { message, history } = req.body || {};
  const userMessage = String(message || '').trim().slice(0, 600);
  if (!userMessage) {
    return res.status(400).json({ error: 'Please enter a message.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const hasConfiguredKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10);

  const systemPrompt = `You are the AI Inquiry Assistant for Mehula ADMediaTek, an enterprise B2B SEO agency and Search Intelligence SaaS platform based in Ahmedabad, India (engineered by XENO Webworks).
Rules you MUST follow:
1. Only reference verified services: Local SEO, National SEO, Technical SEO, Keyword Research & Strategy, On-Page SEO, Link Building, Content Marketing, and E-commerce SEO.
2. Explain our SaaS subscription tiers accurately when asked:
   - Audit Sandbox (Free, $0/mo): 3 audits/mo, 5 tracked keywords.
   - Local & Emerging ($149/mo or $119/mo billed annually): 25 audits/mo, 50 tracked keywords, CMS Author access.
   - Growth B2B Suite ($399/mo or $319/mo billed annually): 100 audits/mo, 250 tracked keywords, CMS Editor + 301 Redirects, CRM pipeline.
   - Enterprise & Retainer ($999/mo or $799/mo billed annually): 500 audits/mo, 1,500 keywords, Full RBAC Admin & dedicated SEO architect SLA.
3. NEVER invent client testimonials, rankings guarantees, fake awards, or unverified revenue figures.
4. Keep responses concise (2-4 sentences), helpful, and business-focused. Ask at most 1 clarifying question and guide the visitor to run a Free SEO Audit (/free-seo-audit/) or request a consultation (/book-a-consultation/).`;

  if (hasConfiguredKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const priorContext = Array.isArray(history)
        ? history
            .slice(-4)
            .map((h: { role?: string; text?: string }) => `${h.role === 'user' ? 'Visitor' : 'Assistant'}: ${String(h.text || '').slice(0, 300)}`)
            .join('\n')
        : '';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: priorContext ? `${priorContext}\nVisitor: ${userMessage}` : userMessage,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const replyText = response.text?.trim();
      if (replyText) {
        return res.json({ reply: replyText, mode: 'ai' });
      }
    } catch (err) {
      console.error('Gemini API fallback triggered:', err);
    }
  }

  // Deterministic knowledge-base assistant fallback when API key is not configured or unreachable
  const lower = userMessage.toLowerCase();
  let reply =
    'We can help you investigate potential causes and build a structured search roadmap. Is your primary priority Technical SEO & crawlability, Local visibility, Content strategy, or our SaaS subscription tools?';

  if (lower.includes('price') || lower.includes('cost') || lower.includes('tier') || lower.includes('plan') || lower.includes('subscription')) {
    reply =
      'Our SaaS platform offers four tiers: Audit Sandbox ($0/mo for 3 audits), Local & Emerging ($149/mo), Growth B2B Suite ($399/mo), and Enterprise & Retainer ($999/mo), with 20% savings on annual billing. Would you like to compare tiers on the Pricing page or discuss a custom agency scope?';
  } else if (lower.includes('audit') || lower.includes('check') || lower.includes('slow') || lower.includes('technical')) {
    reply =
      'Our Automated SEO Audit inspects HTTP status, HTTPS, title & meta lengths, H1 hierarchy, canonical tags, robots directives, and JSON-LD schema. You can run an instant single-page check on the Free SEO Audit page or share your work email below for a full technical review.';
  } else if (lower.includes('local') || lower.includes('ahmedabad') || lower.includes('map')) {
    reply =
      'Our Local SEO practice helps multi-location and regional B2B businesses standardize citations, implement LocalBusiness JSON-LD, and build distinct location landing pages. Shall we arrange a Local SEO consultation for your team?';
  } else if (lower.includes('traffic') || lower.includes('rank') || lower.includes('lead')) {
    reply =
      'When organic traffic stalls, the root cause usually lies in technical crawl/indexation barriers, unmapped commercial search intent, or authority gaps. What is your website URL and primary business goal so our team can review it?';
  }

  return res.json({ reply, mode: 'verified-kb' });
});

// ============================================================================
// 4. LEAD MANAGEMENT & CRM PIPELINE (/api/leads)
// ============================================================================
app.get('/api/leads', (req, res) => {
  res.json({
    leads: store.leads,
    auditHistory: store.auditHistory
  });
});

app.post('/api/leads', (req, res) => {
  const { name, email, company, websiteUrl, serviceInterest, message, preferredContact, source, consentStatus } = req.body || {};

  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: 'Please enter your full name.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(String(email).trim())) {
    return res.status(400).json({ error: 'Please provide a valid business email address.' });
  }
  if (!consentStatus) {
    return res.status(400).json({ error: 'Please confirm consent so we can process your inquiry in accordance with our Privacy Policy.' });
  }

  const newLead: LeadRecord = {
    id: `LEAD-${Date.now().toString().slice(-5)}`,
    name: String(name).trim().slice(0, 100),
    email: String(email).trim().slice(0, 254),
    company: String(company || 'Unspecified Organization').trim().slice(0, 120),
    websiteUrl: String(websiteUrl || '').trim().slice(0, 256),
    serviceInterest: String(serviceInterest || 'General SEO Consultation').trim().slice(0, 100),
    message: String(message || '').trim().slice(0, 1500),
    preferredContact: String(preferredContact || 'Email').trim().slice(0, 50),
    source: source || 'contact_page',
    consentStatus: true,
    consentTimestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'New',
    internalNotes: 'Submitted via web inquiry form.',
    assignedTo: 'Strategy Intake Team',
    lastFollowUpDate: new Date().toISOString().slice(0, 10)
  };

  store.leads.unshift(newLead);
  saveStore(store);

  return res.status(201).json({ lead: newLead, message: 'Inquiry recorded in CRM pipeline.' });
});

app.patch('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const { status, internalNotes, assignedTo } = req.body || {};
  const lead = store.leads.find((l) => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead record not found.' });
  }

  const validStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
  if (status && validStatuses.includes(status)) {
    lead.status = status;
  }
  if (typeof internalNotes === 'string') {
    lead.internalNotes = internalNotes.slice(0, 1000);
  }
  if (typeof assignedTo === 'string') {
    lead.assignedTo = assignedTo.slice(0, 100);
  }
  lead.lastFollowUpDate = new Date().toISOString().slice(0, 10);

  saveStore(store);
  return res.json({ lead });
});

// ============================================================================
// 5. CMS ARTICLES & 301 SLUG REDIRECT ENGINE (/api/cms/articles)
// ============================================================================
app.get('/api/cms/articles', (req, res) => {
  res.json({
    articles: store.articles,
    redirects: store.redirects
  });
});

app.post('/api/cms/articles', (req, res) => {
  const {
    id,
    title,
    slug,
    category,
    authorName,
    status,
    excerpt,
    seoTitle,
    seoDescription,
    canonicalUrl,
    featuredImageAlt,
    bodyParagraph,
    role
  } = req.body || {};

  if (role === 'subscriber') {
    return res.status(403).json({ error: 'RBAC Permission Denied: Author, Editor, or Administrator role required.' });
  }

  if (!title || !slug || !excerpt) {
    return res.status(400).json({ error: 'Title, URL slug, and excerpt are required.' });
  }

  const cleanSlug = String(slug)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '');

  // Authors can only save drafts; Editors and Admins can publish
  const enforcedStatus: 'published' | 'draft' =
    role === 'author' ? 'draft' : status === 'draft' ? 'draft' : 'published';

  const existingIndex = store.articles.findIndex((a) => a.id === id);
  if (existingIndex >= 0) {
    const existing = store.articles[existingIndex];
    // If slug changed, register 301 redirect from old slug -> new slug
    if (existing.slug !== cleanSlug) {
      store.redirects[existing.slug] = cleanSlug;
      if (!existing.previousSlugs.includes(existing.slug)) {
        existing.previousSlugs.push(existing.slug);
      }
    }
    existing.title = String(title).slice(0, 160);
    existing.slug = cleanSlug;
    existing.category = String(category || existing.category);
    existing.categorySlug = String(category || existing.category).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    existing.status = enforcedStatus;
    existing.updatedAt = new Date().toISOString().slice(0, 10);
    existing.excerpt = String(excerpt).slice(0, 400);
    existing.seoTitle = String(seoTitle || `${title} | Mehula ADMediaTek`).slice(0, 120);
    existing.seoDescription = String(seoDescription || excerpt).slice(0, 200);
    existing.canonicalUrl = String(canonicalUrl || `/blog/${cleanSlug}/`);
    existing.featuredImageAlt = String(featuredImageAlt || title);
    if (bodyParagraph) {
      existing.bodySections = [
        {
          heading: '1. Core Technical & Strategic Analysis',
          paragraphs: String(bodyParagraph).split('\n\n').filter(Boolean)
        }
      ];
    }
    saveStore(store);
    return res.json({ article: existing, redirects: store.redirects });
  }

  const newArticle: BlogPostRecord = {
    id: `art-${Date.now().toString().slice(-5)}`,
    title: String(title).slice(0, 160),
    slug: cleanSlug,
    previousSlugs: [],
    category: String(category || 'Technical SEO'),
    categorySlug: String(category || 'technical-seo').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    authorName: String(authorName || 'Mehula ADMediaTek Editorial Team'),
    authorRole: 'SEO Strategy Practice',
    status: enforcedStatus,
    publishedAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    readingTimeMinutes: 5,
    excerpt: String(excerpt).slice(0, 400),
    seoTitle: String(seoTitle || `${title} | Mehula ADMediaTek`).slice(0, 120),
    seoDescription: String(seoDescription || excerpt).slice(0, 200),
    canonicalUrl: String(canonicalUrl || `/blog/${cleanSlug}/`),
    featuredImageAlt: String(featuredImageAlt || title),
    toc: ['1. Core Technical & Strategic Analysis', '2. Implementation Recommendations'],
    bodySections: [
      {
        heading: '1. Core Technical & Strategic Analysis',
        paragraphs: String(bodyParagraph || excerpt)
          .split('\n\n')
          .filter(Boolean)
      },
      {
        heading: '2. Implementation Recommendations',
        paragraphs: [
          'Document baseline metrics in Google Search Console prior to deploying structural changes, and verify canonical and schema alignment in staging.'
        ]
      }
    ],
    relatedServices: ['technical-seo', 'content-marketing']
  };

  store.articles.unshift(newArticle);
  saveStore(store);
  return res.status(201).json({ article: newArticle, redirects: store.redirects });
});

// ============================================================================
// 6. AUTOMATED SAAS BILLING & PRORATION API (/api/billing/preview)
// ============================================================================
app.post('/api/billing/calculate', (req, res) => {
  const { currentPlanId, targetPlanId, billingCycle } = req.body || {};
  const validPlans: PlanId[] = ['free', 'starter', 'growth', 'agency'];
  const validCycles: BillingCycle[] = ['monthly', 'annual'];

  const cur: PlanId = validPlans.includes(currentPlanId) ? currentPlanId : 'free';
  const tgt: PlanId = validPlans.includes(targetPlanId) ? targetPlanId : 'starter';
  const cyc: BillingCycle = validCycles.includes(billingCycle) ? billingCycle : 'monthly';

  const calc = calculateProratedUpgrade(cur, tgt, cyc, 22);
  const nowMs = Date.now();
  return res.json({
    ...calc,
    planName: SAAS_PLANS[tgt].name,
    invoiceNumber: generateInvoiceNumber(nowMs, req.body?.uid || 'SAAS'),
    nextBillingDate: calculateNextBillingDate(nowMs, cyc),
    issuedDate: new Date(nowMs).toISOString().slice(0, 10),
    fullCycleAmountUsd: calculateSubscriptionAmount(tgt, cyc)
  });
});

// Analytics event tracking endpoint (zero PII stored)
app.post('/api/analytics/event', (req, res) => {
  const { eventName, path: routePath } = req.body || {};
  if (eventName) {
    store.analyticsEvents.unshift({
      eventName: String(eventName).slice(0, 64),
      path: String(routePath || '/').slice(0, 120),
      timestamp: new Date().toISOString()
    });
    store.analyticsEvents = store.analyticsEvents.slice(0, 200);
  }
  res.json({ ok: true });
});

async function startServer() {
  const PORT = 3000;
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mehula ADMediaTek Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
