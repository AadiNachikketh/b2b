import React, { useState } from 'react';
import { Check, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import {
  SAAS_PLANS,
  PlanId,
  BillingCycle,
  calculateProratedUpgrade
} from '../utils/saasEngine';
import { SEOHead } from './SEOHead';

interface PricingViewProps {
  currentPlanId: PlanId;
  currentCycle: BillingCycle;
  onSelectPlanCheckout: (planId: PlanId, cycle: BillingCycle, paymentLast4: string) => Promise<void>;
  onNavigate: (path: string) => void;
}

export function PricingView({
  currentPlanId,
  currentCycle,
  onSelectPlanCheckout,
  onNavigate
}: PricingViewProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(currentCycle || 'monthly');
  const [checkoutPlan, setCheckoutPlan] = useState<PlanId | null>(null);
  const [cardHolder, setCardHolder] = useState('Aarav Mehta');
  const [cardLast4, setCardLast4] = useState('4242');
  const [companyGstOrTaxId, setCompanyGstOrTaxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState('');

  const plansList = [SAAS_PLANS.free, SAAS_PLANS.starter, SAAS_PLANS.growth, SAAS_PLANS.agency];

  const handleOpenModal = (planId: PlanId) => {
    setCheckoutSuccess('');
    setCheckoutPlan(planId);
  };

  const handleConfirmAutomatedBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutPlan) return;
    setIsProcessing(true);
    try {
      const cleanLast4 = (cardLast4.replace(/\D/g, '').slice(-4) || '4242').padStart(4, '4');
      await onSelectPlanCheckout(checkoutPlan, billingCycle, cleanLast4);
      setCheckoutSuccess(
        `Automated subscription updated to ${SAAS_PLANS[checkoutPlan].name} (${billingCycle}). Invoice generated in your SaaS Dashboard.`
      );
      setTimeout(() => {
        setCheckoutPlan(null);
        onNavigate('/dashboard');
      }, 900);
    } finally {
      setIsProcessing(false);
    }
  };

  const prorationPreview = checkoutPlan
    ? calculateProratedUpgrade(currentPlanId, checkoutPlan, billingCycle, 22)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SEOHead
        title="SaaS Subscription Tiers & Agency Retainer Pricing | Mehula ADMediaTek"
        description="Transparent SaaS subscription tiers and automated billing for technical SEO audits, keyword tracking, CMS publishing, and enterprise B2B search engineering."
        canonicalPath="/pricing/"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'SaaS Pricing & Tiers', path: '/pricing/' }
        ]}
      />

      {/* Header & Billing Cadence Switch */}
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-[#3157E8]">SaaS Platform & Retainer Tiers</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
          Predictable Search Intelligence Tiers & Automated Billing
        </h1>
        <p className="text-base text-slate-600 mt-3 leading-relaxed">
          Start with our self-serve Audit Sandbox or scale with automated technical SEO diagnostics, keyword intent
          tracking, CMS publishing workflows, and dedicated XENO Webworks engineering support.
        </p>

        {/* Interactive Billing Cadence Control (Placed in workspace body per Top Bar Contract) */}
        <div className="mt-6 inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              billingCycle === 'annual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual Billing (Save 20%)
          </button>
        </div>
      </div>

      {/* 4-Column Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 items-stretch">
        {plansList.map((plan) => {
          const isCurrent = currentPlanId === plan.id && currentCycle === billingCycle;
          const displayMonthly =
            billingCycle === 'annual' ? plan.annualMonthlyEquivalentUsd : plan.monthlyPriceUsd;

          return (
            <div
              key={plan.id}
              className={`border rounded-xl p-6 flex flex-col justify-between bg-white ${
                plan.id === 'growth' ? 'border-[#3157E8] ring-1 ring-[#3157E8]' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="truncate">{plan.audience}</span>
                  {plan.id === 'growth' && (
                    <span className="font-semibold text-[#3157E8] whitespace-nowrap shrink-0">Most Popular</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{plan.name}</h2>

                <div className="mt-4 pb-4 border-b border-slate-200">
                  <div className="flex items-baseline gap-1 font-mono tabular-nums">
                    <span className="text-3xl font-bold text-slate-900">${displayMonthly}</span>
                    <span className="text-xs text-slate-500">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
                    {plan.id === 'free'
                      ? 'Free forever · No card required'
                      : billingCycle === 'annual'
                      ? `Billed annually at $${plan.annualPriceUsd}/yr`
                      : `Billed monthly at $${plan.monthlyPriceUsd}/mo`}
                  </p>
                </div>

                {/* Concrete Limits Summary */}
                <div className="py-4 border-b border-slate-200 space-y-1.5 text-xs font-mono tabular-nums text-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans text-slate-500 whitespace-nowrap">Monthly SEO Audits:</span>
                    <span className="font-semibold text-slate-900 whitespace-nowrap">{plan.auditLimit} / mo</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans text-slate-500 whitespace-nowrap">Tracked Keywords:</span>
                    <span className="font-semibold text-slate-900 whitespace-nowrap">{plan.keywordLimit} terms</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans text-slate-500 whitespace-nowrap">CMS Role:</span>
                    <span className="font-semibold text-slate-900 whitespace-nowrap">{plan.cmsAccessLevel}</span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs text-slate-700">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4">
                {isCurrent ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('/dashboard')}
                    className="w-full py-2.5 px-4 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    Active Plan · View Dashboard
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenModal(plan.id)}
                    className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                      plan.id === 'growth'
                        ? 'bg-[#3157E8] text-white hover:bg-blue-700'
                        : 'bg-[#101828] text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{plan.id === 'free' ? 'Switch to Sandbox' : `Subscribe to ${plan.name}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Concrete Comparison Matrix */}
      <div className="mt-16 bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-[#F6F8FC]">
          <h2 className="text-lg font-bold text-slate-900">Technical Capability & Quota Matrix</h2>
          <p className="text-xs text-slate-600 mt-1">
            Exact monthly quotas, CMS publishing permissions, and automated billing specifications across tiers.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-3.5 px-4">Capability / Limit</th>
                <th className="py-3.5 px-4 text-right">Audit Sandbox</th>
                <th className="py-3.5 px-4 text-right">Local & Emerging</th>
                <th className="py-3.5 px-4 text-right">Growth B2B Suite</th>
                <th className="py-3.5 px-4 text-right">Enterprise & Retainer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono tabular-nums text-slate-700">
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-900">Automated Single-URL Audits</td>
                <td className="py-3 px-4 text-right">3 / mo</td>
                <td className="py-3 px-4 text-right">25 / mo</td>
                <td className="py-3 px-4 text-right">100 / mo</td>
                <td className="py-3 px-4 text-right">500 / mo</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-900">Tracked Organic Keywords</td>
                <td className="py-3 px-4 text-right">5 keywords</td>
                <td className="py-3 px-4 text-right">50 keywords</td>
                <td className="py-3 px-4 text-right">250 keywords</td>
                <td className="py-3 px-4 text-right">1,500 keywords</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-900">CMS Role & 301 Redirect Engine</td>
                <td className="py-3 px-4 text-right font-sans">Read-Only</td>
                <td className="py-3 px-4 text-right font-sans">Author (Drafts)</td>
                <td className="py-3 px-4 text-right font-sans">Editor + 301 Redirects</td>
                <td className="py-3 px-4 text-right font-sans">Full RBAC Admin</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-900">CRM Lead Pipeline & CSV Export</td>
                <td className="py-3 px-4 text-right font-sans">View Summary</td>
                <td className="py-3 px-4 text-right font-sans">Standard Pipeline</td>
                <td className="py-3 px-4 text-right font-sans">Full Pipeline + CSV Export</td>
                <td className="py-3 px-4 text-right font-sans">Custom Webhook + SLA</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-900">Engineering Response SLA</td>
                <td className="py-3 px-4 text-right font-sans">Docs Only</td>
                <td className="py-3 px-4 text-right font-sans">48 Hours</td>
                <td className="py-3 px-4 text-right font-sans">24 Hours</td>
                <td className="py-3 px-4 text-right font-sans">4 Hours Dedicated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Billing & Proration Checkout Modal */}
      {checkoutPlan && prorationPreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Automated Subscription Billing Checkout"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Configure Automated Billing: {SAAS_PLANS[checkoutPlan].name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant proration calculation & automated invoice provisioning
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutPlan(null)}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium"
              >
                Close
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                {checkoutSuccess}
              </div>
            ) : (
              <form onSubmit={handleConfirmAutomatedBilling} className="space-y-4">
                <div className="bg-[#F6F8FC] border border-slate-200 rounded-lg p-4 space-y-2 text-xs font-mono tabular-nums">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Selected Tier & Cadence:</span>
                    <span className="font-semibold text-slate-900">
                      {SAAS_PLANS[checkoutPlan].name} ({billingCycle})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">New Monthly Audit Quota:</span>
                    <span className="font-semibold text-slate-900">{prorationPreview.auditLimit} audits / mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">New Tracked Keyword Limit:</span>
                    <span className="font-semibold text-slate-900">{prorationPreview.keywordLimit} keywords</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                    <span className="font-sans font-semibold text-slate-900">Recurring Cycle Charge:</span>
                    <span className="font-bold text-[#3157E8]">${prorationPreview.newRecurringAmountUsd}.00 USD</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="billing-cardholder" className="block text-xs font-semibold text-slate-800 mb-1">
                    Billing Contact / Cardholder Name
                  </label>
                  <input
                    id="billing-cardholder"
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="billing-last4" className="block text-xs font-semibold text-slate-800 mb-1">
                      Payment Card Last 4 Digits (Sandbox)
                    </label>
                    <input
                      id="billing-last4"
                      type="text"
                      maxLength={4}
                      required
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label htmlFor="billing-taxid" className="block text-xs font-medium text-slate-700 mb-1">
                      GSTIN / Tax ID (Optional)
                    </label>
                    <input
                      id="billing-taxid"
                      type="text"
                      value={companyGstOrTaxId}
                      onChange={(e) => setCompanyGstOrTaxId(e.target.value)}
                      placeholder="24AAAAA0000A1Z5"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>
                    Automated Billing Disclosure: When `STRIPE_SECRET_KEY` is configured in production environment
                    variables, payment intents process via Stripe Checkout. In preview environments without external
                    payment keys, this sandbox ledger persists your subscription state and generates verifiable invoices
                    in Firestore & local state.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2.5 bg-[#3157E8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{isProcessing ? 'Provisioning Subscription...' : 'Activate Plan & Generate Invoice'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
