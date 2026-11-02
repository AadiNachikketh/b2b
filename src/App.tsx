/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { Menu, X } from 'lucide-react';
import {
  auth,
  db,
  signInWithGooglePopup,
  signOutUser,
  handleFirestoreError,
  OperationType
} from './lib/firebase';
import {
  SAAS_PLANS,
  PlanId,
  BillingCycle,
  calculateSubscriptionAmount,
  generateInvoiceNumber,
  calculateNextBillingDate
} from './utils/saasEngine';
import { CORE_SERVICES, INDUSTRIES_DATA, INITIAL_ARTICLES, BlogPostRecord } from './data/siteContent';
import { AuditToolView, AuditResultPayload } from './components/AuditToolView';
import { PricingView } from './components/PricingView';
import {
  SaaSDashboardView,
  InvoiceRecord,
  TrackedKeywordItem
} from './components/SaaSDashboardView';
import { PublicPages } from './components/PublicPages';
import { AIChatbotWidget } from './components/AIChatbotWidget';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // SaaS Subscription & Automated Billing state
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>('growth');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [paymentLast4, setPaymentLast4] = useState<string>('4242');
  const [nextBillingDate, setNextBillingDate] = useState<string>(() =>
    calculateNextBillingDate(Date.now(), 'monthly')
  );

  // Invoices Ledger
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([
    {
      id: 'inv-seed-1',
      invoiceNumber: 'INV-20261101-MEHU',
      planName: 'Growth B2B Suite',
      billingCycle: 'monthly',
      amountUsd: 399,
      status: 'paid',
      issuedDate: '2026-11-01'
    },
    {
      id: 'inv-seed-2',
      invoiceNumber: 'INV-20261001-MEHU',
      planName: 'Local & Emerging',
      billingCycle: 'monthly',
      amountUsd: 149,
      status: 'paid',
      issuedDate: '2026-10-01'
    }
  ]);

  // Saved Audits
  const [savedAudits, setSavedAudits] = useState<AuditResultPayload[]>([]);

  // Tracked Keywords
  const [trackedKeywords, setTrackedKeywords] = useState<TrackedKeywordItem[]>([
    {
      id: 'kw-1',
      keyword: 'b2b technical seo agency ahmedabad',
      targetDomain: 'mehula-admediatek.in',
      searchIntent: 'commercial',
      currentPosition: 3,
      monthlyVolume: 720
    },
    {
      id: 'kw-2',
      keyword: 'enterprise ecommerce seo audit india',
      targetDomain: 'mehula-admediatek.in',
      searchIntent: 'transactional',
      currentPosition: 5,
      monthlyVolume: 1180
    },
    {
      id: 'kw-3',
      keyword: 'local seo services gujarat',
      targetDomain: 'mehula-admediatek.in',
      searchIntent: 'local',
      currentPosition: 2,
      monthlyVolume: 940
    },
    {
      id: 'kw-4',
      keyword: 'saas search intent keyword mapping',
      targetDomain: 'mehula-admediatek.in',
      searchIntent: 'informational',
      currentPosition: 7,
      monthlyVolume: 610
    }
  ]);

  // CMS Articles & Redirects
  const [articles, setArticles] = useState<BlogPostRecord[]>(INITIAL_ARTICLES);
  const [redirects, setRedirects] = useState<Record<string, string>>({
    'old-technical-seo-checklist': 'technical-seo-audit-checklist-b2b-saas'
  });

  const navigate = useCallback((path: string) => {
    const target = path.startsWith('/') ? path : `/${path}`;
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentPath(target);
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const refreshCmsFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/articles');
      const data = await res.json();
      if (Array.isArray(data.articles)) setArticles(data.articles);
      if (data.redirects) setRedirects(data.redirects);
    } catch {
      // fallback to initial state
    }
  }, []);

  useEffect(() => {
    refreshCmsFromServer();
  }, [refreshCmsFromServer]);

  // Listen to Firebase Auth and sync user profile & subscription
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u && u.emailVerified) {
        try {
          const userDocRef = doc(db, 'users', u.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              uid: u.uid,
              displayName: (u.displayName || u.email || 'Subscriber').slice(0, 100),
              role: u.email === 'aadipasso1@gmail.com' ? 'admin' : 'subscriber',
              tier: currentPlanId,
              createdAt: serverTimestamp()
            });
          } else {
            const data = snap.data();
            if (data.tier && SAAS_PLANS[data.tier as PlanId]) {
              setCurrentPlanId(data.tier as PlanId);
            }
          }
        } catch (err) {
          // Only report permission errors via handleFirestoreError if unexpected
          console.warn('Firestore profile sync skipped or pending:', err);
        }
      }
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGooglePopup();
    } catch (err) {
      console.warn('Google sign-in popup closed or blocked in preview:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn('Sign-out error:', err);
    }
  };

  // Automated Billing & Plan Change Handler
  const handleSelectPlanCheckout = async (
    planId: PlanId,
    cycle: BillingCycle,
    last4: string
  ) => {
    const plan = SAAS_PLANS[planId];
    const amountUsd = calculateSubscriptionAmount(planId, cycle);
    const nowMs = Date.now();
    const nextDate = calculateNextBillingDate(nowMs, cycle);
    const invNumber = generateInvoiceNumber(nowMs, firebaseUser?.uid || 'SAAS');

    setCurrentPlanId(planId);
    setBillingCycle(cycle);
    setPaymentLast4(last4);
    setNextBillingDate(nextDate);

    const newInvoice: InvoiceRecord = {
      id: `inv-${nowMs}`,
      invoiceNumber: invNumber,
      planName: plan.name,
      billingCycle: cycle,
      amountUsd,
      status: 'paid',
      issuedDate: new Date(nowMs).toISOString().slice(0, 10)
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    if (firebaseUser && firebaseUser.emailVerified) {
      const subPath = `subscriptions/${firebaseUser.uid}`;
      try {
        const subRef = doc(db, 'subscriptions', firebaseUser.uid);
        const existingSub = await getDoc(subRef);
        if (!existingSub.exists()) {
          await setDoc(subRef, {
            ownerId: firebaseUser.uid,
            planId,
            billingCycle: cycle,
            status: 'active',
            amountUsd,
            auditsUsed: savedAudits.length,
            auditLimit: plan.auditLimit,
            keywordsTracked: trackedKeywords.length,
            keywordLimit: plan.keywordLimit,
            autoRenew: true,
            paymentLast4: last4,
            nextBillingDate: nextDate,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(
            subRef,
            {
              ownerId: firebaseUser.uid,
              planId,
              billingCycle: cycle,
              status: 'active',
              amountUsd,
              auditsUsed: savedAudits.length,
              auditLimit: plan.auditLimit,
              keywordsTracked: trackedKeywords.length,
              keywordLimit: plan.keywordLimit,
              autoRenew,
              paymentLast4: last4,
              nextBillingDate: nextDate,
              createdAt: existingSub.data().createdAt,
              updatedAt: serverTimestamp()
            },
            { merge: false }
          );
        }

        await addDoc(collection(db, 'invoices'), {
          ownerId: firebaseUser.uid,
          invoiceNumber: invNumber,
          planName: plan.name,
          billingCycle: cycle,
          amountUsd,
          status: 'paid',
          issuedDate: newInvoice.issuedDate,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, subPath);
      }
    }
  };

  const handleToggleAutoRenew = async () => {
    setAutoRenew((prev) => !prev);
  };

  const handleSaveAuditToWorkspace = async (audit: AuditResultPayload) => {
    setSavedAudits((prev) => [audit, ...prev]);
    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await addDoc(collection(db, 'saved_audits'), {
          ownerId: firebaseUser.uid,
          targetUrl: audit.normalizedUrl.slice(0, 256),
          overallScore: audit.overallScore,
          passedCount: audit.passedCount,
          warningCount: audit.warningCount,
          failedCount: audit.failedCount,
          summaryText: `Passed: ${audit.passedCount}, Warnings: ${audit.warningCount}, Failed: ${audit.failedCount}`,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'saved_audits');
      }
    }
  };

  const handleAddKeyword = async (kw: Omit<TrackedKeywordItem, 'id'>) => {
    const newItem: TrackedKeywordItem = {
      ...kw,
      id: `kw-${Date.now()}`
    };
    setTrackedKeywords((prev) => [newItem, ...prev]);

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await addDoc(collection(db, 'tracked_keywords'), {
          ownerId: firebaseUser.uid,
          keyword: kw.keyword.slice(0, 120),
          targetDomain: kw.targetDomain.slice(0, 256),
          searchIntent: kw.searchIntent,
          currentPosition: kw.currentPosition,
          monthlyVolume: kw.monthlyVolume,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'tracked_keywords');
      }
    }
  };

  const handleRemoveKeyword = async (id: string) => {
    setTrackedKeywords((prev) => prev.filter((k) => k.id !== id));
    if (firebaseUser && firebaseUser.emailVerified && !id.startsWith('kw-')) {
      try {
        await deleteDoc(doc(db, 'tracked_keywords', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `tracked_keywords/${id}`);
      }
    }
  };

  const normalizedRoute = currentPath === '/' ? '/' : currentPath.replace(/\/+$/, '');

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      {/* ====================================================================
          TOP BAR CONTRACT (Strictly 3 Zones separated by gap-8:
          Zone 1: Single text element Brand wordmark
          Zone 2: 5 concise single-line text navigation links
          Zone 3: 1 primary CTA button)
          ==================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E5E7EB] no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Mehula ADMediaTek
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="/services/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/services/');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                normalizedRoute.startsWith('/services') ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Services
            </a>
            <a
              href="/industries/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/industries/');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                normalizedRoute.startsWith('/industries') ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Industries
            </a>
            <a
              href="/pricing/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/pricing/');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                normalizedRoute === '/pricing' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Pricing
            </a>
            <a
              href="/blog/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/blog/');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                normalizedRoute.startsWith('/blog') ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Insights
            </a>
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                normalizedRoute === '/dashboard' ? 'text-slate-900 font-semibold underline underline-offset-8' : ''
              }`}
            >
              Dashboard
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/free-seo-audit/')}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-[#3157E8] rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              Get a Free SEO Audit
            </button>

            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg shrink-0"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 text-sm font-medium text-slate-700">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="block w-full text-left py-1.5 hover:text-slate-900"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate('/services/')}
              className="block w-full text-left py-1.5 hover:text-slate-900"
            >
              Services (All 8 Practices)
            </button>
            <button
              type="button"
              onClick={() => navigate('/industries/')}
              className="block w-full text-left py-1.5 hover:text-slate-900"
            >
              Industries
            </button>
            <button
              type="button"
              onClick={() => navigate('/pricing/')}
              className="block w-full text-left py-1.5 hover:text-slate-900"
            >
              SaaS Pricing & Billing
            </button>
            <button
              type="button"
              onClick={() => navigate('/case-studies/')}
              className="block w-full text-left py-1.5 hover:text-slate-900"
            >
              Case Studies
            </button>
            <button
              type="button"
              onClick={() => navigate('/blog/')}
              className="block w-full text-left py-1.5 hover:text-slate-900"
            >
              SEO Insights & Blog
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="block w-full text-left py-1.5 font-semibold text-[#3157E8]"
            >
              SaaS User Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact/')}
              className="block w-full text-left py-1.5 hover:text-slate-900"
            >
              Contact & Consultation
            </button>
          </div>
        )}
      </header>

      {/* ====================================================================
          MAIN ROUTE VIEWPORT
          ==================================================================== */}
      <main className="flex-1">
        {normalizedRoute === '/free-seo-audit' ? (
          <AuditToolView
            onNavigate={navigate}
            onSaveAuditToWorkspace={handleSaveAuditToWorkspace}
            auditsUsed={savedAudits.length}
            auditLimit={SAAS_PLANS[currentPlanId].auditLimit}
            currentPlanName={SAAS_PLANS[currentPlanId].name}
          />
        ) : normalizedRoute === '/pricing' ? (
          <PricingView
            currentPlanId={currentPlanId}
            currentCycle={billingCycle}
            onSelectPlanCheckout={handleSelectPlanCheckout}
            onNavigate={navigate}
          />
        ) : normalizedRoute === '/dashboard' || normalizedRoute === '/admin' ? (
          <SaaSDashboardView
            user={
              firebaseUser
                ? {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName
                  }
                : null
            }
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
            currentPlanId={currentPlanId}
            billingCycle={billingCycle}
            autoRenew={autoRenew}
            paymentLast4={paymentLast4}
            nextBillingDate={nextBillingDate}
            onChangePlan={handleSelectPlanCheckout}
            onToggleAutoRenew={handleToggleAutoRenew}
            invoices={invoices}
            savedAudits={savedAudits}
            trackedKeywords={trackedKeywords}
            onAddKeyword={handleAddKeyword}
            onRemoveKeyword={handleRemoveKeyword}
            articles={articles}
            redirects={redirects}
            onRefreshCms={refreshCmsFromServer}
            onNavigate={navigate}
          />
        ) : (
          <PublicPages
            currentPath={currentPath}
            onNavigate={navigate}
            articles={articles}
            redirects={redirects}
          />
        )}
      </main>

      {/* ====================================================================
          SECTION 12: QUIET FOOTER (With Unobtrusive XENO Webworks Attribution)
          ==================================================================== */}
      <footer className="bg-[#101828] text-slate-300 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-xs">
          <div className="lg:col-span-2 space-y-3">
            <div className="text-base font-bold text-white tracking-tight">Mehula ADMediaTek</div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Enterprise B2B SEO agency and Search Intelligence SaaS platform based in Ahmedabad, Gujarat, India. Built
              on technical SEO foundations, transparent measurement, and conversion-focused engineering.
            </p>
            <div className="text-[11px] text-slate-400 pt-1">
              Location: Ahmedabad, Gujarat, India (Street address & telephone placeholders pending verification).
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="font-bold text-white">Core SEO Services</div>
            <ul className="space-y-1.5 text-slate-400">
              {CORE_SERVICES.map((s) => (
                <li key={s.slug}>
                  <a
                    href={`/services/${s.slug}/`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/services/${s.slug}/`);
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-bold text-white">Industries & Portfolio</div>
            <ul className="space-y-1.5 text-slate-400">
              {INDUSTRIES_DATA.map((ind) => (
                <li key={ind.slug}>
                  <a
                    href={`/industries/${ind.slug}/`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/industries/${ind.slug}/`);
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {ind.name}
                  </a>
                </li>
              ))}
              <li className="pt-1">
                <a
                  href="/case-studies/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/case-studies/');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Case Studies & Benchmarks
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-bold text-white">SaaS Platform & Company</div>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a
                  href="/pricing/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/pricing/');
                  }}
                  className="hover:text-white transition-colors"
                >
                  SaaS Subscription Tiers
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/dashboard');
                  }}
                  className="hover:text-white transition-colors"
                >
                  User Dashboard & Billing
                </a>
              </li>
              <li>
                <a
                  href="/free-seo-audit/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/free-seo-audit/');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Free Automated SEO Audit
                </a>
              </li>
              <li>
                <a
                  href="/blog/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/blog/');
                  }}
                  className="hover:text-white transition-colors"
                >
                  SEO Insights & CMS Blog
                </a>
              </li>
              <li>
                <a
                  href="/about/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/about/');
                  }}
                  className="hover:text-white transition-colors"
                >
                  About Mehula ADMediaTek
                </a>
              </li>
              <li>
                <a
                  href="/contact/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/contact/');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/book-a-consultation/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/book-a-consultation/');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Book a Consultation
                </a>
              </li>
              <li className="pt-1">
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  XML Sitemap
                </a>
                {' · '}
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  robots.txt
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              © {new Date().getFullYear()} Mehula ADMediaTek. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/privacy-policy/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/privacy-policy/');
                }}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <span>·</span>
              <a
                href="/terms/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/terms/');
                }}
                className="hover:text-white transition-colors"
              >
                Terms & Conditions
              </a>
              <span>·</span>
              <span className="text-slate-400">Website by XENO Webworks</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI-Assisted Inquiry & Lead Capture Chatbot */}
      <AIChatbotWidget onNavigate={navigate} />
    </div>
  );
}
