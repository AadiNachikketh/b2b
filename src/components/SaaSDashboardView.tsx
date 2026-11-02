import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Search,
  FileText,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Download,
  LogIn,
  LogOut,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import {
  SAAS_PLANS,
  PlanId,
  BillingCycle
} from '../utils/saasEngine';
import {
  fetchLeadsWithFallback,
  updateLeadWithFallback,
  saveCmsArticleWithFallback
} from '../utils/staticFallback';
import { BlogPostRecord } from '../data/siteContent';
import { AuditResultPayload } from './AuditToolView';
import { SEOHead } from './SEOHead';

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  planName: string;
  billingCycle: BillingCycle;
  amountUsd: number;
  status: 'paid' | 'void';
  issuedDate: string;
}

export interface TrackedKeywordItem {
  id: string;
  keyword: string;
  targetDomain: string;
  searchIntent: 'commercial' | 'transactional' | 'informational' | 'local';
  currentPosition: number;
  monthlyVolume: number;
}

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  company: string;
  websiteUrl: string;
  serviceInterest: string;
  message: string;
  preferredContact: string;
  source: string;
  createdAt: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';
  internalNotes: string;
  assignedTo: string;
  lastFollowUpDate: string;
}

interface SaaSDashboardViewProps {
  user: { uid: string; email: string | null; displayName: string | null } | null;
  onGoogleSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  currentPlanId: PlanId;
  billingCycle: BillingCycle;
  autoRenew: boolean;
  paymentLast4: string;
  nextBillingDate: string;
  onChangePlan: (planId: PlanId, cycle: BillingCycle, last4: string) => Promise<void>;
  onToggleAutoRenew: () => Promise<void>;
  invoices: InvoiceRecord[];
  savedAudits: AuditResultPayload[];
  trackedKeywords: TrackedKeywordItem[];
  onAddKeyword: (kw: Omit<TrackedKeywordItem, 'id'>) => Promise<void>;
  onRemoveKeyword: (id: string) => Promise<void>;
  articles: BlogPostRecord[];
  redirects: Record<string, string>;
  onRefreshCms: () => Promise<void>;
  onNavigate: (path: string) => void;
}

export function SaaSDashboardView({
  user,
  onGoogleSignIn,
  onSignOut,
  currentPlanId,
  billingCycle,
  autoRenew,
  paymentLast4,
  nextBillingDate,
  onChangePlan,
  onToggleAutoRenew,
  invoices,
  savedAudits,
  trackedKeywords,
  onAddKeyword,
  onRemoveKeyword,
  articles,
  redirects,
  onRefreshCms,
  onNavigate
}: SaaSDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'billing' | 'keywords' | 'audits' | 'crm' | 'cms'
  >('overview');
  const [rbacRole, setRbacRole] = useState<'admin' | 'editor' | 'author'>('admin');

  // Keyword form state
  const [newKwText, setNewKwText] = useState('');
  const [newKwDomain, setNewKwDomain] = useState('mehula-admediatek.in');
  const [newKwIntent, setNewKwIntent] = useState<'commercial' | 'transactional' | 'informational' | 'local'>(
    'commercial'
  );
  const [kwError, setKwError] = useState('');

  // CRM Leads state
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [leadFilterStatus, setLeadFilterStatus] = useState<string>('ALL');
  const [leadSearch, setLeadSearch] = useState('');
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // CMS Editor state
  const [editingArticleId, setEditingArticleId] = useState<string>('');
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsSlug, setCmsSlug] = useState('');
  const [cmsCategory, setCmsCategory] = useState('Technical SEO');
  const [cmsStatus, setCmsStatus] = useState<'published' | 'draft'>('published');
  const [cmsExcerpt, setCmsExcerpt] = useState('');
  const [cmsSeoTitle, setCmsSeoTitle] = useState('');
  const [cmsSeoDesc, setCmsSeoDesc] = useState('');
  const [cmsCanonical, setCmsCanonical] = useState('');
  const [cmsBody, setCmsBody] = useState('');
  const [cmsFeedback, setCmsFeedback] = useState('');

  const currentPlan = SAAS_PLANS[currentPlanId];

  const fetchLeadsFromServer = async () => {
    setIsLoadingLeads(true);
    try {
      const list = await fetchLeadsWithFallback();
      setLeads(list);
    } catch {
      // ignore
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchLeadsFromServer();
  }, []);

  const handleCreateKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    setKwError('');
    if (!newKwText.trim() || !newKwDomain.trim()) {
      setKwError('Please enter both a search keyword and target domain.');
      return;
    }
    if (trackedKeywords.length >= currentPlan.keywordLimit) {
      setKwError(
        `Keyword limit (${currentPlan.keywordLimit}) reached for ${currentPlan.name}. Upgrade your subscription tier to track more keywords.`
      );
      return;
    }
    const deterministicPos = Math.max(1, (newKwText.trim().length * 3) % 28);
    const deterministicVol = 320 + ((newKwText.trim().length * 140) % 2400);
    await onAddKeyword({
      keyword: newKwText.trim(),
      targetDomain: newKwDomain.trim(),
      searchIntent: newKwIntent,
      currentPosition: deterministicPos,
      monthlyVolume: deterministicVol
    });
    setNewKwText('');
  };

  const handleUpdateLeadStatus = async (leadId: string, status: LeadItem['status'], internalNotes: string) => {
    try {
      await updateLeadWithFallback(leadId, status, internalNotes);
      await fetchLeadsFromServer();
    } catch {
      // ignore
    }
  };

  const handleExportLeadsCsv = () => {
    const headers = ['ID,Name,Email,Company,Website,Service,Source,Status,Created'];
    const rows = leads.map(
      (l) =>
        `"${l.id}","${l.name.replace(/"/g, '""')}","${l.email}","${l.company.replace(/"/g, '""')}","${l.websiteUrl}","${l.serviceInterest}","${l.source}","${l.status}","${l.createdAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mehula_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectArticleForEdit = (art: BlogPostRecord) => {
    setEditingArticleId(art.id);
    setCmsTitle(art.title);
    setCmsSlug(art.slug);
    setCmsCategory(art.category);
    setCmsStatus(art.status);
    setCmsExcerpt(art.excerpt);
    setCmsSeoTitle(art.seoTitle);
    setCmsSeoDesc(art.seoDescription);
    setCmsCanonical(art.canonicalUrl);
    setCmsBody(art.bodySections.map((s) => s.paragraphs.join('\n\n')).join('\n\n'));
    setCmsFeedback('');
  };

  const handleResetCmsForm = () => {
    setEditingArticleId('');
    setCmsTitle('');
    setCmsSlug('');
    setCmsCategory('Technical SEO');
    setCmsStatus('published');
    setCmsExcerpt('');
    setCmsSeoTitle('');
    setCmsSeoDesc('');
    setCmsCanonical('');
    setCmsBody('');
    setCmsFeedback('');
  };

  const handleSaveCmsArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCmsFeedback('');
    if (!cmsTitle.trim() || !cmsSlug.trim() || !cmsExcerpt.trim()) {
      setCmsFeedback('Error: Title, URL Slug, and Excerpt are required.');
      return;
    }
    try {
      const result = await saveCmsArticleWithFallback({
        id: editingArticleId || undefined,
        title: cmsTitle,
        slug: cmsSlug,
        category: cmsCategory,
        status: cmsStatus,
        excerpt: cmsExcerpt,
        seoTitle: cmsSeoTitle || `${cmsTitle} | Mehula ADMediaTek`,
        seoDescription: cmsSeoDesc || cmsExcerpt,
        canonicalUrl: cmsCanonical || `/blog/${cmsSlug}/`,
        bodyText: cmsBody || cmsExcerpt,
        role: rbacRole
      });
      if (!result.ok) {
        setCmsFeedback(result.error || 'Could not save article.');
        return;
      }
      await onRefreshCms();
      setCmsFeedback(
        editingArticleId
          ? `Updated article "${cmsTitle}" (${cmsStatus}). Any slug change was automatically registered in the 301 Redirect table.`
          : `Created new article "${cmsTitle}" (${cmsStatus}).`
      );
      if (!editingArticleId) {
        handleResetCmsForm();
      }
    } catch {
      setCmsFeedback('Network error while saving CMS article.');
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = leadFilterStatus === 'ALL' || l.status === leadFilterStatus;
    const matchesQuery =
      !leadSearch.trim() ||
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.company.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.email.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.serviceInterest.toLowerCase().includes(leadSearch.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F6F8FC] flex flex-col lg:flex-row">
      <SEOHead
        title="SaaS User Dashboard, Automated Billing & CRM | Mehula ADMediaTek"
        description="Manage your Mehula ADMediaTek SaaS subscription tier, automated billing invoices, tracked search keywords, technical SEO audits, CRM leads, and CMS articles."
        canonicalPath="/dashboard"
      />

      {/* Sidebar Navigation (260px on desktop per SaaS Dashboard Design Guidelines) */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div>
            <div className="text-xs text-slate-500">Workspace Environment</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{currentPlan.name}</div>
            <div className="text-xs font-mono tabular-nums text-slate-600 mt-0.5">
              Billing: {billingCycle} · Role: {rbacRole.toUpperCase()}
            </div>
          </div>

          <nav aria-label="SaaS Dashboard Sections" className="space-y-1">
            {[
              { id: 'overview', label: 'Workspace Overview', icon: LayoutDashboard },
              { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
              { id: 'keywords', label: 'Keyword Tracker', icon: Search },
              { id: 'audits', label: 'Saved SEO Audits', icon: FileText },
              { id: 'crm', label: 'CRM Lead Pipeline', icon: Users },
              { id: 'cms', label: 'CMS & 301 Redirects', icon: BookOpen }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#3157E8] text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Cloud Sync / Firebase Auth Box */}
        <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
          {user ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {user.displayName || user.email}
              </div>
              <div className="text-[11px] text-[#16A34A] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Synced with Cloud Firestore</span>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-900">Cloud Account Sync</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Sign in with Google to sync your subscription, invoices, and keywords to Firestore across devices.
              </p>
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="w-full py-2 px-3 bg-[#101828] hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 p-6 lg:p-8 max-w-6xl">
        {/* Top Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
          <div>
            <div className="text-xs text-slate-500">
              SaaS Workspace / <span className="text-slate-900 font-medium capitalize">{activeTab}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Mehula ADMediaTek Search Intelligence & Agency Console
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/free-seo-audit/')}
              className="px-3.5 py-2 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              Run New SEO Audit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className="px-3.5 py-2 bg-[#3157E8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 whitespace-nowrap shrink-0"
            >
              Manage Subscription
            </button>
          </div>
        </div>

        {/* TAB 1: WORKSPACE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4-Column KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Active Subscription Tier</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{currentPlan.name}</div>
                <div className="text-xs font-mono tabular-nums text-slate-600 mt-1">
                  ${billingCycle === 'annual' ? currentPlan.annualPriceUsd : currentPlan.monthlyPriceUsd} /{' '}
                  {billingCycle === 'annual' ? 'yr' : 'mo'} · Next: {nextBillingDate}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Monthly Audit Quota</div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {savedAudits.length} / {currentPlan.auditLimit}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {Math.max(0, currentPlan.auditLimit - savedAudits.length)} automated checks remaining
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Tracked Search Keywords</div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {trackedKeywords.length} / {currentPlan.keywordLimit}
                </div>
                <div className="text-xs text-slate-600 mt-1">Active commercial & local queries</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">CRM Pipeline Inquiries</div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {leads.length}
                </div>
                <div className="text-xs text-[#16A34A] mt-1">
                  {leads.filter((l) => l.status === 'New').length} new inquiries awaiting review
                </div>
              </div>
            </div>

            {/* Recent Tracked Keywords & Latest Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Tracked Organic Keyword Positions</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('keywords')}
                    className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1"
                  >
                    <span>Manage Keywords</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="py-2.5 px-4">Keyword</th>
                        <th className="py-2.5 px-4">Intent</th>
                        <th className="py-2.5 px-4 text-right">Rank</th>
                        <th className="py-2.5 px-4 text-right">Monthly Vol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                      {trackedKeywords.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-sans font-medium text-slate-900">{item.keyword}</td>
                          <td className="py-2.5 px-4 font-sans text-slate-600 capitalize">{item.searchIntent}</td>
                          <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                            #{item.currentPosition}
                          </td>
                          <td className="py-2.5 px-4 text-right text-slate-600">
                            {item.monthlyVolume.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Automated Billing Summary</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Card ending in <span className="font-mono font-semibold text-slate-800">•••• {paymentLast4}</span> ·
                    Auto-renew: {autoRenew ? 'Enabled' : 'Paused'}
                  </p>

                  <div className="mt-4 divide-y divide-slate-200 border border-slate-200 rounded-lg">
                    {invoices.slice(0, 3).map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 flex items-center justify-between text-xs font-mono tabular-nums"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{inv.invoiceNumber}</div>
                          <div className="font-sans text-[11px] text-slate-500">
                            {inv.planName} ({inv.billingCycle}) · {inv.issuedDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">${inv.amountUsd}.00</div>
                          <div className="text-[11px] text-[#16A34A] uppercase">{inv.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('billing')}
                    className="text-xs font-semibold text-[#3157E8] hover:underline"
                  >
                    View All Invoices & Upgrade Options
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUTOMATED BILLING & INVOICES */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Current Subscription: {currentPlan.name}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Billing Cadence: <span className="font-semibold capitalize">{billingCycle}</span> · Payment Method:
                    Visa/Mastercard ending in <span className="font-mono">•••• {paymentLast4}</span> · Next Automated
                    Charge: <span className="font-mono">{nextBillingDate}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onToggleAutoRenew}
                    className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    {autoRenew ? 'Pause Auto-Renew' : 'Resume Auto-Renew'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/pricing/')}
                    className="px-3.5 py-2 bg-[#3157E8] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 whitespace-nowrap shrink-0"
                  >
                    Compare Full Pricing Matrix
                  </button>
                </div>
              </div>

              {/* Quick Tier Switcher inside Dashboard */}
              <div className="mt-5">
                <h3 className="text-xs font-semibold text-slate-700 mb-3">
                  Instant Tier Upgrade / Downgrade (Generates Prorated Invoice)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['free', 'starter', 'growth', 'agency'] as PlanId[]).map((pid) => {
                    const p = SAAS_PLANS[pid];
                    const active = pid === currentPlanId;
                    return (
                      <div
                        key={pid}
                        className={`p-4 border rounded-lg flex flex-col justify-between ${
                          active ? 'border-[#3157E8] bg-blue-50/30' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{p.name}</div>
                          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
                            ${billingCycle === 'annual' ? p.annualPriceUsd : p.monthlyPriceUsd}
                            <span className="text-xs font-normal text-slate-500">
                              /{billingCycle === 'annual' ? 'yr' : 'mo'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1 font-mono tabular-nums">
                            {p.auditLimit} audits · {p.keywordLimit} keywords
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={active}
                          onClick={() => onChangePlan(pid, billingCycle, paymentLast4)}
                          className={`mt-4 w-full py-2 px-3 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                            active
                              ? 'bg-slate-200 text-slate-600 cursor-default'
                              : 'bg-[#101828] text-white hover:bg-slate-800'
                          }`}
                        >
                          {active ? 'Current Active Plan' : `Switch to ${p.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Automated Billing Ledger & Invoices</h2>
                  <p className="text-xs text-slate-500">
                    All subscription cycle charges and prorated upgrades with printable receipts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg"
                >
                  Print Statement
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="py-3 px-4">Invoice Number</th>
                      <th className="py-3 px-4">Subscription Tier</th>
                      <th className="py-3 px-4">Billing Cadence</th>
                      <th className="py-3 px-4">Issued Date</th>
                      <th className="py-3 px-4 text-right">Amount (USD)</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 font-sans text-slate-800">{inv.planName}</td>
                        <td className="py-3 px-4 font-sans capitalize text-slate-600">{inv.billingCycle}</td>
                        <td className="py-3 px-4 text-slate-600">{inv.issuedDate}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">
                          ${inv.amountUsd.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[#16A34A] font-semibold uppercase">{inv.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KEYWORD TRACKER */}
        {activeTab === 'keywords' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Add Commercial Keyword to Tracker</h2>
                  <p className="text-xs text-slate-500">
                    Tracking {trackedKeywords.length} of {currentPlan.keywordLimit} allowed keywords on{' '}
                    {currentPlan.name}
                  </p>
                </div>
              </div>

              {kwError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  {kwError}
                </div>
              )}

              <form onSubmit={handleCreateKeyword} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4">
                  <label htmlFor="kw-input" className="block text-xs font-medium text-slate-700 mb-1">
                    Search Query / Keyword
                  </label>
                  <input
                    id="kw-input"
                    type="text"
                    value={newKwText}
                    onChange={(e) => setNewKwText(e.target.value)}
                    placeholder="e.g. technical seo agency ahmedabad"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="kw-domain" className="block text-xs font-medium text-slate-700 mb-1">
                    Target Domain
                  </label>
                  <input
                    id="kw-domain"
                    type="text"
                    value={newKwDomain}
                    onChange={(e) => setNewKwDomain(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="kw-intent" className="block text-xs font-medium text-slate-700 mb-1">
                    Search Intent
                  </label>
                  <select
                    id="kw-intent"
                    value={newKwIntent}
                    onChange={(e) =>
                      setNewKwIntent(
                        e.target.value as 'commercial' | 'transactional' | 'informational' | 'local'
                      )
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="commercial">Commercial Investigation</option>
                    <option value="transactional">Transactional</option>
                    <option value="local">Local / Regional</option>
                    <option value="informational">Informational</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-3 bg-[#3157E8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Term</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-3 px-4">Tracked Keyword</th>
                    <th className="py-3 px-4">Target Domain</th>
                    <th className="py-3 px-4">Intent Classification</th>
                    <th className="py-3 px-4 text-right">SERP Position</th>
                    <th className="py-3 px-4 text-right">Est. Monthly Volume</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                  {trackedKeywords.map((kw) => (
                    <tr key={kw.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">{kw.keyword}</td>
                      <td className="py-3 px-4 text-slate-600">{kw.targetDomain}</td>
                      <td className="py-3 px-4 font-sans capitalize text-slate-700">{kw.searchIntent}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">#{kw.currentPosition}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{kw.monthlyVolume.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onRemoveKeyword(kw.id)}
                          aria-label={`Remove keyword ${kw.keyword}`}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SAVED SEO AUDITS */}
        {activeTab === 'audits' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Saved Technical SEO Audit Reports</h2>
                <p className="text-xs text-slate-500">
                  Single-URL diagnostic inspections executed in your workspace ({savedAudits.length} of{' '}
                  {currentPlan.auditLimit} monthly quota used).
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/free-seo-audit/')}
                className="px-4 py-2 bg-[#3157E8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
              >
                New Website Audit
              </button>
            </div>

            {savedAudits.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-900">No Technical Audits Run in This Cycle Yet</p>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Launch the Automated SEO Audit Tool to inspect HTTP headers, canonical tags, heading hierarchy, and
                  JSON-LD structured data on any public URL.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/free-seo-audit/')}
                  className="px-4 py-2 bg-[#101828] text-white text-xs font-semibold rounded-lg"
                >
                  Launch SEO Audit Tool
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="py-3 px-4">Audit ID</th>
                      <th className="py-3 px-4">Analyzed URL</th>
                      <th className="py-3 px-4 text-right">Diagnostic Score</th>
                      <th className="py-3 px-4 text-right">Passed / Warn / Fail</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                    {savedAudits.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{a.id}</td>
                        <td className="py-3 px-4 font-sans text-slate-800">{a.normalizedUrl}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{a.overallScore} / 100</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-[#16A34A]">{a.passedCount}P</span> ·{' '}
                          <span className="text-amber-600">{a.warningCount}W</span> ·{' '}
                          <span className="text-red-600">{a.failedCount}F</span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500">
                          {new Date(a.completedAt).toISOString().slice(0, 10)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CRM LEAD PIPELINE */}
        {activeTab === 'crm' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {['ALL', 'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setLeadFilterStatus(st)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      leadFilterStatus === st
                        ? 'bg-[#101828] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="crm-search" className="sr-only">
                  Search leads
                </label>
                <input
                  id="crm-search"
                  type="text"
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Filter by name, company, service..."
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleExportLeadsCsv}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {isLoadingLeads ? (
              <div className="p-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
                Loading CRM pipeline records...
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="py-3 px-4">Lead ID & Date</th>
                        <th className="py-3 px-4">Contact & Organization</th>
                        <th className="py-3 px-4">Service & Source</th>
                        <th className="py-3 px-4">Pipeline Stage</th>
                        <th className="py-3 px-4">Internal Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50 align-top">
                          <td className="py-3.5 px-4 font-mono tabular-nums">
                            <div className="font-semibold text-slate-900">{lead.id}</div>
                            <div className="text-[11px] text-slate-500">{lead.createdAt.slice(0, 10)}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{lead.name}</div>
                            <div className="text-slate-600">{lead.email}</div>
                            <div className="text-[11px] text-slate-500">
                              {lead.company} {lead.websiteUrl ? `· ${lead.websiteUrl}` : ''}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900">{lead.serviceInterest}</div>
                            <div className="text-[11px] text-slate-500">Source: {lead.source}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <label htmlFor={`status-${lead.id}`} className="sr-only">
                              Pipeline Stage for {lead.name}
                            </label>
                            <select
                              id={`status-${lead.id}`}
                              value={lead.status}
                              onChange={(e) =>
                                handleUpdateLeadStatus(
                                  lead.id,
                                  e.target.value as LeadItem['status'],
                                  lead.internalNotes
                                )
                              }
                              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs font-medium bg-white"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Proposal Sent">Proposal Sent</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              aria-label={`Internal notes for ${lead.name}`}
                              defaultValue={lead.internalNotes}
                              onBlur={(e) => handleUpdateLeadStatus(lead.id, lead.status, e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs text-slate-700"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CMS & 301 SLUG REDIRECT MANAGER */}
        {activeTab === 'cms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Article List & 301 Redirect Registry */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">CMS Role-Based Access Control</h2>
                    <p className="text-[11px] text-slate-500">
                      Authors save drafts; Editors & Admins publish and manage 301 slug redirects.
                    </p>
                  </div>
                  <select
                    aria-label="Active CMS Role"
                    value={rbacRole}
                    onChange={(e) => setRbacRole(e.target.value as 'admin' | 'editor' | 'author')}
                    className="px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold bg-white"
                  >
                    <option value="admin">Role: Administrator</option>
                    <option value="editor">Role: Editor</option>
                    <option value="author">Role: Author (Drafts Only)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-800">
                    Articles ({articles.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleResetCmsForm}
                    className="text-xs font-semibold text-[#3157E8] hover:underline"
                  >
                    + Create New Article
                  </button>
                </div>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                  {articles.map((art) => (
                    <div key={art.id} className="p-3 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{art.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">
                          /blog/{art.slug}/ · {art.status.toUpperCase()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectArticleForEdit(art)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 301 Redirect Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Automated 301 Slug Redirect Registry</h3>
                <p className="text-xs text-slate-600">
                  Whenever an existing article slug is updated in the CMS, the legacy URL slug is automatically mapped
                  to the new canonical slug to prevent 404 link rot.
                </p>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg font-mono text-xs">
                  {Object.entries(redirects).map(([oldSlug, newSlug]) => (
                    <div key={oldSlug} className="p-2.5 flex items-center justify-between gap-2">
                      <span className="text-slate-500 truncate">/blog/{oldSlug}/</span>
                      <span className="text-[#16A34A] font-semibold shrink-0">301 →</span>
                      <span className="text-slate-900 font-medium truncate">/blog/{newSlug}/</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Article & Metadata Editor */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-base font-bold text-slate-900">
                {editingArticleId ? 'Edit Article & Technical SEO Metadata' : 'Create New Resource Article'}
              </h2>
              {cmsFeedback && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-medium">
                  {cmsFeedback}
                </div>
              )}

              <form onSubmit={handleSaveCmsArticle} className="mt-4 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cms-title" className="block font-semibold text-slate-800 mb-1">
                      Article H1 Title *
                    </label>
                    <input
                      id="cms-title"
                      type="text"
                      value={cmsTitle}
                      onChange={(e) => {
                        setCmsTitle(e.target.value);
                        if (!editingArticleId && !cmsSlug) {
                          setCmsSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-|-$/g, '')
                          );
                        }
                      }}
                      placeholder="Enterprise Crawl Budget Optimization Guide"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label htmlFor="cms-slug" className="block font-semibold text-slate-800 mb-1">
                      URL Slug (Changing triggers 301 Redirect) *
                    </label>
                    <input
                      id="cms-slug"
                      type="text"
                      value={cmsSlug}
                      onChange={(e) => setCmsSlug(e.target.value)}
                      placeholder="enterprise-crawl-budget-guide"
                      className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cms-cat" className="block font-medium text-slate-700 mb-1">
                      Topic Category
                    </label>
                    <select
                      id="cms-cat"
                      value={cmsCategory}
                      onChange={(e) => setCmsCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Technical SEO">Technical SEO</option>
                      <option value="Keyword Strategy">Keyword Strategy</option>
                      <option value="Local SEO">Local SEO</option>
                      <option value="Content Marketing">Content Marketing</option>
                      <option value="E-Commerce SEO">E-Commerce SEO</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cms-status" className="block font-medium text-slate-700 mb-1">
                      Publication Status {rbacRole === 'author' && '(Author restricted to Draft)'}
                    </label>
                    <select
                      id="cms-status"
                      value={rbacRole === 'author' ? 'draft' : cmsStatus}
                      disabled={rbacRole === 'author'}
                      onChange={(e) => setCmsStatus(e.target.value as 'published' | 'draft')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="published">Published (Indexed in Sitemap)</option>
                      <option value="draft">Draft (Unpublished Preview)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="cms-excerpt" className="block font-semibold text-slate-800 mb-1">
                    Summary Excerpt *
                  </label>
                  <textarea
                    id="cms-excerpt"
                    rows={2}
                    value={cmsExcerpt}
                    onChange={(e) => setCmsExcerpt(e.target.value)}
                    placeholder="Concise summary displayed on resource listing cards..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label htmlFor="cms-body" className="block font-semibold text-slate-800 mb-1">
                    Article Body Content
                  </label>
                  <textarea
                    id="cms-body"
                    rows={4}
                    value={cmsBody}
                    onChange={(e) => setCmsBody(e.target.value)}
                    placeholder="Write technical insights, audit steps, and implementation guidelines..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="p-4 bg-[#F6F8FC] border border-slate-200 rounded-lg space-y-3">
                  <div className="font-semibold text-slate-900">SEO Metadata & Canonical Controls</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="cms-seo-title" className="block text-slate-700 mb-1">
                        Custom Title Tag (30–60 chars)
                      </label>
                      <input
                        id="cms-seo-title"
                        type="text"
                        value={cmsSeoTitle}
                        onChange={(e) => setCmsSeoTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="cms-canonical" className="block text-slate-700 mb-1">
                        Canonical URL Override
                      </label>
                      <input
                        id="cms-canonical"
                        type="text"
                        value={cmsCanonical}
                        onChange={(e) => setCmsCanonical(e.target.value)}
                        placeholder={`/blog/${cmsSlug || 'slug'}/`}
                        className="w-full px-2.5 py-1.5 font-mono border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cms-seo-desc" className="block text-slate-700 mb-1">
                      Meta Description (120–160 chars)
                    </label>
                    <input
                      id="cms-seo-desc"
                      type="text"
                      value={cmsSeoDesc}
                      onChange={(e) => setCmsSeoDesc(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#3157E8] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingArticleId ? 'Save Changes & Sync Sitemap' : 'Publish / Save Article'}
                  </button>
                  {editingArticleId && (
                    <button
                      type="button"
                      onClick={() => onNavigate(`/blog/${cmsSlug}/`)}
                      className="px-4 py-2.5 bg-slate-100 text-slate-800 font-semibold rounded-lg hover:bg-slate-200"
                    >
                      View Article Page
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
