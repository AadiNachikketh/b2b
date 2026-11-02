import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { AuditCheckItem } from '../utils/saasEngine';
import { runAuditWithFallback } from '../utils/staticFallback';
import { SEOHead, trackConversionEvent } from './SEOHead';

export interface AuditResultPayload {
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
}

interface AuditToolViewProps {
  onNavigate: (path: string) => void;
  onSaveAuditToWorkspace?: (audit: AuditResultPayload) => Promise<void>;
  auditsUsed?: number;
  auditLimit?: number;
  currentPlanName?: string;
}

export function AuditToolView({
  onNavigate,
  onSaveAuditToWorkspace,
  auditsUsed = 0,
  auditLimit = 3,
  currentPlanName = 'Audit Sandbox'
}: AuditToolViewProps) {
  const [urlInput, setUrlInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [targetMarket, setTargetMarket] = useState('India / Regional B2B');
  const [consent, setConsent] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [auditResult, setAuditResult] = useState<AuditResultPayload | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [saveMessage, setSaveMessage] = useState('');

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveMessage('');

    if (!urlInput.trim()) {
      setErrorMessage('Please enter a website URL to analyze (e.g., https://example.com).');
      return;
    }
    if (!emailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    if (auditsUsed >= auditLimit) {
      setErrorMessage(
        `You have reached the monthly audit quota (${auditsUsed}/${auditLimit}) for your ${currentPlanName} plan. Please upgrade your subscription tier on the Pricing page.`
      );
      return;
    }

    setIsAnalyzing(true);
    trackConversionEvent('audit_request_submitted', '/free-seo-audit/');

    try {
      const result = await runAuditWithFallback({
        url: urlInput,
        email: emailInput,
        name: nameInput,
        company: companyInput,
        targetMarket,
        consent
      });
      if (!result.ok || !result.data) {
        setErrorMessage(result.error || 'Could not complete website analysis.');
        return;
      }
      setAuditResult(result.data);
      trackConversionEvent('audit_completed', '/free-seo-audit/');
      if (onSaveAuditToWorkspace) {
        await onSaveAuditToWorkspace(result.data);
        setSaveMessage('Saved to your SaaS User Dashboard & quota updated.');
      }
    } catch {
      setErrorMessage('Network error while connecting to the SEO Audit Engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSampleDomain = (domain: string) => {
    setUrlInput(domain);
    if (!emailInput) setEmailInput('seo-evaluation@enterprise-client.in');
    trackConversionEvent('audit_form_started', '/free-seo-audit/');
  };

  const filteredChecks = auditResult
    ? categoryFilter === 'ALL'
      ? auditResult.checks
      : auditResult.checks.filter((c) => c.category === categoryFilter)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SEOHead
        title="Free Automated Technical SEO Audit Tool | Mehula ADMediaTek"
        description="Run an instant SSRF-protected technical SEO diagnostic checking HTTP status, HTTPS, title and meta lengths, H1 hierarchy, canonical tags, robots.txt, and JSON-LD schema."
        canonicalPath="/free-seo-audit/"
        schemaType="WebApplication"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Free SEO Audit', path: '/free-seo-audit/' }
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-6 flex items-center gap-2 no-print">
        <button type="button" onClick={() => onNavigate('/')} className="hover:text-slate-900">
          Home
        </button>
        <span>/</span>
        <span className="text-slate-900 font-medium">Automated SEO Audit Tool</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Form & Quota Info */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 no-print">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Automated Technical SEO Audit</h1>
              <p className="text-xs text-slate-500 mt-1">
                Single-page HTTP, metadata, heading, canonical & schema inspection
              </p>
            </div>
            <div className="text-right font-mono text-xs tabular-nums">
              <div className="text-slate-500">Plan Quota</div>
              <div className="font-semibold text-slate-900">
                {auditsUsed} / {auditLimit} used
              </div>
            </div>
          </div>

          <form onSubmit={handleRunAudit} className="space-y-4">
            {errorMessage && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium"
              >
                {errorMessage}
              </div>
            )}

            <div>
              <label htmlFor="audit-url-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                Website URL to Analyze *
              </label>
              <input
                id="audit-url-input"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#3157E8]"
              />
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                <span>Quick test:</span>
                <button
                  type="button"
                  onClick={() => handleLoadSampleDomain('https://example.com')}
                  className="text-[#3157E8] hover:underline font-medium"
                >
                  example.com
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleLoadSampleDomain('https://mehula-industrial-demo.in')}
                  className="text-[#3157E8] hover:underline font-medium"
                >
                  mehula-industrial-demo.in
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="audit-email-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                Work Email Address *
              </label>
              <input
                id="audit-email-input"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#3157E8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="audit-name-input" className="block text-xs font-medium text-slate-700 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  id="audit-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Rohan Patel"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="audit-company-input" className="block text-xs font-medium text-slate-700 mb-1">
                  Company Name (Optional)
                </label>
                <input
                  id="audit-company-input"
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  placeholder="Acme B2B Ltd"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="audit-market-select" className="block text-xs font-medium text-slate-700 mb-1">
                Primary Target Market
              </label>
              <select
                id="audit-market-select"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Ahmedabad / Gujarat Regional">Ahmedabad / Gujarat Regional</option>
                <option value="India National B2B">India National B2B</option>
                <option value="Global / Multi-Region SaaS">Global / Multi-Region SaaS</option>
                <option value="E-Commerce Catalog">E-Commerce Catalog</option>
              </select>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I understand this tool inspects the submitted public URL and stores my audit request in accordance with
                the Mehula ADMediaTek Privacy Policy.
              </span>
            </label>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-3 px-4 bg-[#3157E8] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              <span>{isAnalyzing ? 'Running Technical SEO Checks...' : 'Analyze My Website'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>SSRF & Security Hardening Active</span>
            </div>
            <p className="leading-relaxed">
              Our server-side audit engine validates HTTP/HTTPS protocols, resolves DNS records, and blocks loopback
              (`127.0.0.1`), RFC1918 private networks (`10.x`, `192.168.x`), and cloud metadata endpoints
              (`169.254.169.254`).
            </p>
          </div>
        </div>

        {/* Right Column: Audit Results & Printable Report */}
        <div className="lg:col-span-7">
          {!auditResult ? (
            <div className="bg-[#F6F8FC] border border-slate-200 rounded-xl p-8">
              <h2 className="text-lg font-bold text-slate-900">What This Initial Assessment Evaluates</h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Enter any public webpage URL on the left to execute 11 automated technical checks across four core SEO
                pillars.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-900">01. Indexability & Crawl</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    HTTP status code, meta robots directives, canonical tag presence, robots.txt availability, and XML
                    sitemap discovery.
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-900">02. On-Page Semantics</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Title tag character length (30–60 chars), meta description bounds, and primary H1 heading hierarchy.
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-900">03. Structured Data & Links</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Schema.org JSON-LD blocks, internal link discovery, and image alt-text accessibility coverage.
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-slate-900">04. Technical Foundation</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    HTTPS encryption, HTML `lang` declaration, mobile viewport configuration, and server response time.
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                <strong className="text-slate-900">Scope & Methodology Disclosure:</strong> This automated tool analyzes
                the single submitted URL and its domain-level `robots.txt`. It does not crawl your entire multi-page
                website or access private Google Search Console data. The calculated score (0–100) is a weighted
                diagnostic indicator, not an official Google ranking metric.
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="text-xs text-slate-500 font-mono tabular-nums">
                    Report ID: {auditResult.id} · {new Date(auditResult.completedAt).toLocaleString()}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1 break-all">{auditResult.normalizedUrl}</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Response Time: <span className="font-mono tabular-nums">{auditResult.responseTimeMs}ms</span> · HTML
                    Size: <span className="font-mono tabular-nums">{Math.round(auditResult.pageSizeBytes / 1024)} KB</span>{' '}
                    · Mode: {auditResult.isLiveFetch ? 'Live HTTP Inspection' : 'Single-Page Heuristic Inspection'}
                  </p>
                  {saveMessage && <p className="text-xs text-[#16A34A] font-medium mt-1">{saveMessage}</p>}
                </div>

                <div className="flex items-center gap-2 no-print">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/dashboard')}
                    className="px-3 py-2 text-xs font-medium text-white bg-[#101828] hover:bg-slate-800 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Open in Dashboard</span>
                  </button>
                </div>
              </div>

              {/* Summary KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-[#F6F8FC] border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500">Diagnostic Score</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                    {auditResult.overallScore} / 100
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Weighted Check Index</div>
                </div>
                <div className="p-4 bg-[#F6F8FC] border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500">Passed Checks</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#16A34A] mt-1">
                    {auditResult.passedCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Verified Compliant</div>
                </div>
                <div className="p-4 bg-[#F6F8FC] border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500">Warnings</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 mt-1">
                    {auditResult.warningCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Optimization Needed</div>
                </div>
                <div className="p-4 bg-[#F6F8FC] border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500">Failed Checks</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-red-600 mt-1">
                    {auditResult.failedCount}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Priority Blockers</div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg no-print">
                {['ALL', 'Indexability', 'On-Page Content', 'Structured Data & Links', 'Technical Foundation'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        categoryFilter === cat
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Checks (11)' : cat}
                    </button>
                  )
                )}
              </div>

              {/* Findings List */}
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                {filteredChecks.map((chk) => (
                  <div key={chk.id} className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {chk.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />}
                        {chk.status === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                        {chk.status === 'fail' && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                        <h3 className="text-sm font-semibold text-slate-900">{chk.checkName}</h3>
                      </div>
                      <div className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
                        {chk.category} · Status: {chk.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                      Observed: {chk.observedValue}
                    </div>
                    <p className="text-xs text-slate-600">{chk.explanation}</p>
                    <p className="text-xs font-medium text-slate-900">
                      Recommended Action: <span className="font-normal text-slate-700">{chk.recommendation}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Limitations & Consultation CTA */}
              <div className="p-4 bg-[#F6F8FC] border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <FileText className="w-4 h-4 text-[#3157E8]" />
                  <span>Assessment Scope & Limitations</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This report reflects an automated single-URL inspection conducted at{' '}
                  {new Date(auditResult.completedAt).toISOString()}. It does not execute client-side JavaScript or audit
                  site-wide crawl logs, backlink toxicity, or competitor keyword gaps. The diagnostic score is calculated
                  from weighted technical checks (Pass = 100%, Warning = 50%, Fail = 0%) and is not a Google metric.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3 no-print">
                  <button
                    type="button"
                    onClick={() => onNavigate('/book-a-consultation/')}
                    className="px-4 py-2 bg-[#3157E8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>Book a Technical Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/pricing/')}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                  >
                    Compare SaaS Audit Tiers
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
