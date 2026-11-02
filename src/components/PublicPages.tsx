import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  BarChart3,
  Shield,
  Layers,
  Globe,
  FileCode
} from 'lucide-react';
import {
  CORE_SERVICES,
  INDUSTRIES_DATA,
  INITIAL_CASE_STUDIES,
  HOMEPAGE_FAQS,
  BlogPostRecord
} from '../data/siteContent';
import { SAAS_PLANS } from '../utils/saasEngine';
import { SEOHead, trackConversionEvent } from './SEOHead';

interface PublicPagesProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  articles: BlogPostRecord[];
  redirects: Record<string, string>;
}

export function PublicPages({
  currentPath,
  onNavigate,
  articles,
  redirects
}: PublicPagesProps) {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategory, setBlogCategory] = useState('ALL');

  // Lead / Consultation form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formService, setFormService] = useState('Technical SEO');
  const [formMessage, setFormMessage] = useState('');
  const [formPreferredContact, setFormPreferredContact] = useState('Email');
  const [formConsent, setFormConsent] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formErrorMsg, setFormErrorMsg] = useState('');

  const handleLeadFormSubmit = async (
    e: React.FormEvent,
    source: 'homepage_form' | 'service_page' | 'consultation_booking' | 'contact_page'
  ) => {
    e.preventDefault();
    setFormErrorMsg('');
    if (!formName.trim() || !formEmail.trim()) {
      setFormStatus('error');
      setFormErrorMsg('Please enter your full name and business email address.');
      return;
    }
    if (!formConsent) {
      setFormStatus('error');
      setFormErrorMsg('Please check the consent box so we can process your request.');
      return;
    }

    setFormStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          company: formCompany,
          websiteUrl: formWebsite,
          serviceInterest: formService,
          message: formMessage,
          preferredContact: formPreferredContact,
          source,
          consentStatus: formConsent
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setFormStatus('error');
        setFormErrorMsg(data.error || 'Could not submit inquiry.');
        return;
      }
      setFormStatus('success');
      trackConversionEvent(
        source === 'consultation_booking' ? 'consultation_requested' : 'contact_form_submitted',
        currentPath
      );
      setFormName('');
      setFormEmail('');
      setFormCompany('');
      setFormWebsite('');
      setFormMessage('');
    } catch {
      setFormStatus('error');
      setFormErrorMsg('Network error while submitting form.');
    }
  };

  // Normalize path
  const cleanPath = currentPath === '/' ? '/' : currentPath.replace(/\/+$/, '') + '/';

  // ==========================================================================
  // 1. DEDICATED SERVICE DETAIL PAGE (/services/[slug]/)
  // ==========================================================================
  if (cleanPath.startsWith('/services/') && cleanPath !== '/services/') {
    const slug = cleanPath.replace('/services/', '').replace(/\/$/, '');
    const service = CORE_SERVICES.find((s) => s.slug === slug);
    if (service) {
      const relatedArticles = articles.filter(
        (a) => a.status === 'published' && a.relatedServices.includes(service.slug)
      );
      const relatedCases = INITIAL_CASE_STUDIES.filter((c) => c.relatedServices.includes(service.slug));

      return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
          <SEOHead
            title={`${service.name} Services in Ahmedabad & India | Mehula ADMediaTek`}
            description={`${service.shortDesc} ${service.businessBenefit}`}
            canonicalPath={`/services/${service.slug}/`}
            schemaType="Service"
            schemaData={{
              serviceType: service.name,
              provider: { '@type': 'Organization', name: 'Mehula ADMediaTek' }
            }}
            breadcrumbs={[
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services/' },
              { name: service.name, path: `/services/${service.slug}/` }
            ]}
          />

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-2">
            <button type="button" onClick={() => onNavigate('/')} className="hover:text-slate-900">
              Home
            </button>
            <span>/</span>
            <button type="button" onClick={() => onNavigate('/services/')} className="hover:text-slate-900">
              Services
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium">{service.name}</span>
          </nav>

          {/* Service Hero */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-xs text-[#3157E8] font-semibold">
                  {service.index}. Mehula ADMediaTek Service Practice
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 text-balance">
                  {service.heroTitle}
                </h1>
                <p className="text-base text-slate-600 leading-relaxed">{service.heroSubtitle}</p>
                <div className="pt-2 text-xs text-slate-600">
                  <strong className="text-slate-900">Built For:</strong> {service.targetAudience}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    trackConversionEvent('service_cta_clicked', `/services/${service.slug}/`);
                    onNavigate('/book-a-consultation/');
                  }}
                  className="px-5 py-3 bg-[#3157E8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>{service.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/free-seo-audit/')}
                  className="px-5 py-3 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  Run Automated Technical Audit
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#101828] text-white rounded-xl p-6 flex flex-col justify-between border border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Service Outcome Architecture</div>
                <h2 className="text-lg font-bold mt-1">{service.name} Deliverables & Indicators</h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{service.businessBenefit}</p>

                <div className="mt-5 space-y-2.5 border-t border-slate-800 pt-4">
                  <div className="text-xs font-semibold text-slate-300">Core Deliverables (Scope-Confirmed):</div>
                  {service.deliverables.map((deliv, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                Included in Growth B2B Suite ($399/mo) & Enterprise Retainer ($999/mo) SaaS tiers.
              </div>
            </div>
          </section>

          {/* Problems Addressed */}
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Common Challenges & Diagnostic Indicators</h2>
              <p className="text-sm text-slate-600 mt-1">
                Technical and strategic issues our team investigates before prescribing an execution roadmap.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {service.problems.map((prob, i) => (
                <div key={i} className="bg-[#F6F8FC] border border-slate-200 rounded-xl p-6 space-y-2">
                  <div className="text-xs font-mono text-slate-500">0{i + 1}. Diagnostic Area</div>
                  <h3 className="text-base font-bold text-slate-900">{prob.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{prob.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Our 4-Step Approach */}
          <section className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Our Engineering & Execution Methodology</h2>
              <p className="text-sm text-slate-600 mt-1">
                How Mehula ADMediaTek investigates, prioritizes, implements, and measures {service.name}.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.approachSteps.map((st) => (
                <div key={st.step} className="space-y-2 border-t border-slate-200 pt-4">
                  <div className="text-xs font-mono font-bold text-[#3157E8]">{st.step}. Phase</div>
                  <h3 className="text-sm font-bold text-slate-900">{st.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Expected Outcomes: Leading Indicators vs Business Outcomes */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900">Measurable Leading Indicators</h2>
              <p className="text-xs text-slate-500">
                Early technical and search visibility signals verified in Google Search Console:
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-1">
                {service.leadingIndicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#3157E8] shrink-0 mt-0.5" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900">Long-Term Business Outcomes</h2>
              <p className="text-xs text-slate-500">
                Commercial pipeline benefits without unrealistic ranking guarantees:
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-1">
                {service.businessOutcomes.map((out, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Related Case Studies & Resources */}
          {(relatedCases.length > 0 || relatedArticles.length > 0) && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {relatedCases.length > 0 && (
                <div className="bg-[#F6F8FC] border border-slate-200 rounded-xl p-6 space-y-3">
                  <h2 className="text-base font-bold text-slate-900">Related Architecture Blueprint</h2>
                  {relatedCases.map((cs) => (
                    <div key={cs.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                      <div className="text-xs text-slate-500">{cs.industry} · {cs.duration}</div>
                      <h3 className="text-sm font-bold text-slate-900">{cs.title}</h3>
                      <p className="text-xs text-slate-600">{cs.startingConditions}</p>
                      <button
                        type="button"
                        onClick={() => onNavigate(`/case-studies/${cs.slug}/`)}
                        className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1"
                      >
                        <span>Inspect Architecture & Methodology</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {relatedArticles.length > 0 && (
                <div className="bg-[#F6F8FC] border border-slate-200 rounded-xl p-6 space-y-3">
                  <h2 className="text-base font-bold text-slate-900">Supporting Technical Guides</h2>
                  {relatedArticles.map((art) => (
                    <div key={art.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
                      <div className="text-xs text-slate-500">
                        {art.category} · {art.publishedAt} · {art.readingTimeMinutes} min read
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{art.title}</h3>
                      <button
                        type="button"
                        onClick={() => onNavigate(`/blog/${art.slug}/`)}
                        className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1"
                      >
                        <span>Read Full Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Service FAQs */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions: {service.name}</h2>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white">
              {service.faqs.map((faq, idx) => (
                <div key={idx} className="p-5 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    }
  }

  // ==========================================================================
  // 2. SERVICES DIRECTORY PAGE (/services/)
  // ==========================================================================
  if (cleanPath === '/services/') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <SEOHead
          title="B2B SEO Services Directory & Search Engineering | Mehula ADMediaTek"
          description="Explore Mehula ADMediaTek's 8 dedicated SEO service lines: Local SEO, National SEO, Technical SEO, Keyword Strategy, On-Page SEO, Link Building, Content Marketing, and E-commerce SEO."
          canonicalPath="/services/"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services/' }
          ]}
        />

        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold text-[#3157E8]">01–08 Core Capabilities</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Dedicated Search Engineering & Organic Growth Services
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Every service line is supported by our automated SaaS diagnostic tools, transparent Search Console
            measurement, and technical implementation standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_SERVICES.map((srv) => (
            <div
              key={srv.slug}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-500">
                  {srv.index}. {srv.targetAudience.split(',')[0]}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{srv.name}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{srv.shortDesc}</p>
                <p className="text-xs text-slate-700 pt-1">
                  <strong className="text-slate-900">Business Impact:</strong> {srv.businessBenefit}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onNavigate(`/services/${srv.slug}/`)}
                  className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1.5"
                >
                  <span>Explore {srv.name} Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 3. INDUSTRY DETAIL PAGE (/industries/[slug]/) & DIRECTORY (/industries/)
  // ==========================================================================
  if (cleanPath.startsWith('/industries/')) {
    if (cleanPath !== '/industries/') {
      const slug = cleanPath.replace('/industries/', '').replace(/\/$/, '');
      const ind = INDUSTRIES_DATA.find((i) => i.slug === slug);
      if (ind) {
        return (
          <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
            <SEOHead
              title={`${ind.name} SEO Strategy & Search Architecture | Mehula ADMediaTek`}
              description={ind.summary}
              canonicalPath={`/industries/${ind.slug}/`}
              breadcrumbs={[
                { name: 'Home', path: '/' },
                { name: 'Industries', path: '/industries/' },
                { name: ind.name, path: `/industries/${ind.slug}/` }
              ]}
            />

            <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-2">
              <button type="button" onClick={() => onNavigate('/')} className="hover:text-slate-900">
                Home
              </button>
              <span>/</span>
              <button type="button" onClick={() => onNavigate('/industries/')} className="hover:text-slate-900">
                Industries
              </button>
              <span>/</span>
              <span className="text-slate-900 font-medium">{ind.name}</span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <div className="text-xs font-semibold text-[#3157E8]">Industry Search Practice</div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{ind.name}</h1>
              <p className="text-base text-slate-600 leading-relaxed">{ind.summary}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/book-a-consultation/')}
                  className="px-5 py-2.5 bg-[#3157E8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                >
                  Request Industry SEO Consultation
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/free-seo-audit/')}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Audit Your Website
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F6F8FC] border border-slate-200 rounded-xl p-6 space-y-3">
                <h2 className="text-lg font-bold text-slate-900">Sector-Specific Search Challenges</h2>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {ind.challenges.map((ch, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-slate-500">0{idx + 1}.</span>
                      <span>{ch}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                <h2 className="text-lg font-bold text-slate-900">Organic Growth Opportunities</h2>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {ind.opportunities.map((op, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{op}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">How an Engagement Works & Recommended Services</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{ind.engagementModel}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                {ind.recommendedServices.map((srvSlug) => {
                  const s = CORE_SERVICES.find((cs) => cs.slug === srvSlug);
                  if (!s) return null;
                  return (
                    <button
                      key={srvSlug}
                      type="button"
                      onClick={() => onNavigate(`/services/${s.slug}/`)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      <span>{s.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        <SEOHead
          title="Industries We Serve – B2B, SaaS, E-Commerce & Healthcare SEO | Mehula ADMediaTek"
          description="Industry-specific search strategies for E-Commerce, Healthcare, Real Estate, Education, SaaS, and Regional B2B Services."
          canonicalPath="/industries/"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Industries', path: '/industries/' }
          ]}
        />
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold text-[#3157E8]">Vertical Search Specialization</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Industries Served</h1>
          <p className="text-base text-slate-600">
            Search intent, compliance rules, and site architecture differ radically between a multi-specialty medical
            clinic, a 10,000-SKU e-commerce catalog, and a B2B SaaS platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIES_DATA.map((ind) => (
            <div
              key={ind.slug}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900">{ind.name}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{ind.summary}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`/industries/${ind.slug}/`)}
                className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1.5"
              >
                <span>View Industry Playbook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 4. CASE STUDIES & MEASUREMENT INTEGRITY (/case-studies/ & /case-studies/[slug]/)
  // ==========================================================================
  if (cleanPath.startsWith('/case-studies/')) {
    if (cleanPath !== '/case-studies/') {
      const slug = cleanPath.replace('/case-studies/', '').replace(/\/$/, '');
      const cs = INITIAL_CASE_STUDIES.find((c) => c.slug === slug);
      if (cs) {
        return (
          <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
            <SEOHead
              title={`${cs.title} | Mehula ADMediaTek Case Study Architecture`}
              description={cs.startingConditions}
              canonicalPath={`/case-studies/${cs.slug}/`}
              breadcrumbs={[
                { name: 'Home', path: '/' },
                { name: 'Case Studies', path: '/case-studies/' },
                { name: cs.title, path: `/case-studies/${cs.slug}/` }
              ]}
            />

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              {cs.verificationNotice}
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-500">
                {cs.industry} · {cs.duration} · {cs.clientLabel}
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{cs.title}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                <h2 className="text-base font-bold text-slate-900">Initial Technical Audit Findings</h2>
                <p className="text-xs text-slate-600">{cs.startingConditions}</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  {cs.auditFindings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-slate-500">0{i + 1}.</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                <h2 className="text-base font-bold text-slate-900">Engineering Strategy Implemented</h2>
                <p className="text-xs text-slate-600">{cs.resultsSummary}</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  {cs.strategyImplemented.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reusable Data Visualization Table & Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Illustrative Cohort Trajectory (Demonstration Model)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Source: {cs.methodology.dataSource} · Period: {cs.methodology.reportingPeriod}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="py-2.5 px-4">Reporting Interval</th>
                      <th className="py-2.5 px-4 text-right">Organic Sessions</th>
                      <th className="py-2.5 px-4 text-right">Search Impressions</th>
                      <th className="py-2.5 px-4 text-right">Qualified Inquiries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                    {cs.chartData.map((row) => (
                      <tr key={row.month}>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{row.month}</td>
                        <td className="py-2.5 px-4 text-right text-slate-800">
                          {row.organicSessions.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-600">
                          {row.impressions.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-[#16A34A]">{row.qualifiedLeads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-[#F6F8FC] border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <div>
                  <strong className="text-slate-900">Metric Definition:</strong> {cs.methodology.metricDefinition}
                </div>
                <div>
                  <strong className="text-slate-900">Measurement Caveat:</strong> {cs.methodology.caveats}
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        <SEOHead
          title="SEO Case Studies & Measurement Integrity Portfolio | Mehula ADMediaTek"
          description="Explore Mehula ADMediaTek's transparent case study architecture, measurement methodology, and verified reporting standards."
          canonicalPath="/case-studies/"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Case Studies', path: '/case-studies/' }
          ]}
        />
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold text-[#3157E8]">Measurement Integrity First</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Case Studies & Search Architecture Benchmarks
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            We never publish fabricated client names, invented logos, or unverified revenue claims. Below are our
            transparent reference architectures demonstrating how we structure technical audits and track Search Console
            cohorts once client authorization is granted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_CASE_STUDIES.map((cs) => (
            <div
              key={cs.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  {cs.industry} · {cs.duration}
                </div>
                <h2 className="text-lg font-bold text-slate-900">{cs.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{cs.startingConditions}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`/case-studies/${cs.slug}/`)}
                className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1.5"
              >
                <span>Inspect Methodology & Cohort Model</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 5. BLOG & RESOURCE CENTER (/blog/ & /blog/[slug]/) WITH 301 REDIRECTS
  // ==========================================================================
  if (cleanPath.startsWith('/blog/')) {
    if (cleanPath !== '/blog/') {
      const requestedSlug = cleanPath.replace('/blog/', '').replace(/\/$/, '');
      // Check if requestedSlug is in 301 redirect map
      const redirectedSlug = redirects[requestedSlug] || requestedSlug;
      const article = articles.find((a) => a.slug === redirectedSlug);

      if (article) {
        return (
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
            <SEOHead
              title={article.seoTitle}
              description={article.seoDescription}
              canonicalPath={article.canonicalUrl}
              schemaType="BlogPosting"
              schemaData={{
                headline: article.title,
                datePublished: article.publishedAt,
                dateModified: article.updatedAt,
                author: { '@type': 'Organization', name: article.authorName }
              }}
              breadcrumbs={[
                { name: 'Home', path: '/' },
                { name: 'Blog', path: '/blog/' },
                { name: article.title, path: `/blog/${article.slug}/` }
              ]}
            />

            {requestedSlug !== redirectedSlug && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-mono">
                301 Permanent Redirect Active: /blog/{requestedSlug}/ → /blog/{redirectedSlug}/
              </div>
            )}

            <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-2">
              <button type="button" onClick={() => onNavigate('/')} className="hover:text-slate-900">
                Home
              </button>
              <span>/</span>
              <button type="button" onClick={() => onNavigate('/blog/')} className="hover:text-slate-900">
                SEO Insights & Resources
              </button>
              <span>/</span>
              <span className="text-slate-900 font-medium truncate">{article.title}</span>
            </nav>

            <header className="space-y-3 border-b border-slate-200 pb-6">
              <div className="text-xs text-slate-500">
                <span>{article.category}</span>
                <span aria-hidden="true"> · </span>
                <span>Published {article.publishedAt}</span>
                <span aria-hidden="true"> · </span>
                <span>Updated {article.updatedAt}</span>
                <span aria-hidden="true"> · </span>
                <span>{article.readingTimeMinutes} min read</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 text-balance">{article.title}</h1>
              <p className="text-base text-slate-600 leading-relaxed">{article.excerpt}</p>
              <div className="text-xs text-slate-500">
                By <strong className="text-slate-800">{article.authorName}</strong> ({article.authorRole})
              </div>
            </header>

            {/* Table of Contents */}
            <div className="bg-[#F6F8FC] border border-slate-200 rounded-xl p-5 space-y-2">
              <div className="text-xs font-bold text-slate-900">Table of Contents</div>
              <ul className="space-y-1 text-xs text-slate-700">
                {article.toc.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Article Body */}
            <article className="space-y-6">
              {article.bodySections.map((sec, idx) => (
                <section key={idx} className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-900">{sec.heading}</h2>
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm text-slate-700 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </article>

            {/* Contextual Conversion CTA */}
            <div className="bg-[#101828] text-white rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold">Verify These Checks on Your Own Domain</h2>
                <p className="text-xs text-slate-300">
                  Run our instant SSRF-protected technical SEO audit or manage this article inside the CMS dashboard.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    trackConversionEvent('article_cta_clicked', `/blog/${article.slug}/`);
                    onNavigate('/free-seo-audit/');
                  }}
                  className="px-4 py-2 bg-[#3157E8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                >
                  Run Free SEO Audit
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/dashboard')}
                  className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-700"
                >
                  Edit in CMS
                </button>
              </div>
            </div>
          </div>
        );
      }
    }

    const publishedArticles = articles.filter((a) => {
      if (a.status !== 'published') return false;
      const matchesCat = blogCategory === 'ALL' || a.category === blogCategory;
      const matchesSearch =
        !blogSearch.trim() ||
        a.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(blogSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });

    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        <SEOHead
          title="SEO Engineering Insights & B2B Search Resource Center | Mehula ADMediaTek"
          description="Technical SEO guides, commercial keyword intent playbooks, and regional search architecture articles by Mehula ADMediaTek."
          canonicalPath="/blog/"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog/' }
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold text-[#3157E8]">Search Engineering Knowledge Base</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">SEO Insights & Technical Playbooks</h1>
            <p className="text-sm text-slate-600">
              Practical guides written for marketing leaders and technical teams. Managed via our RBAC Content
              Management System.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="blog-search-input" className="sr-only">
              Search articles
            </label>
            <input
              id="blog-search-input"
              type="text"
              value={blogSearch}
              onChange={(e) => setBlogSearch(e.target.value)}
              placeholder="Search articles..."
              className="px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            />
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0"
            >
              Open CMS Editor
            </button>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
          {['ALL', 'Technical SEO', 'Keyword Strategy', 'Local SEO'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setBlogCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                blogCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedArticles.map((art) => (
            <div
              key={art.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="text-xs text-slate-500">
                  <span>{art.category}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{art.publishedAt}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{art.readingTimeMinutes} min read</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{art.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">{art.excerpt}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`/blog/${art.slug}/`)}
                className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1.5 pt-2"
              >
                <span>Read Technical Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 6. ABOUT PAGE (/about/)
  // ==========================================================================
  if (cleanPath === '/about/') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <SEOHead
          title="About Mehula ADMediaTek – B2B SEO Agency & SaaS Platform"
          description="Learn about Mehula ADMediaTek's data-informed SEO methodology, measurement integrity standards, and engineering architecture built by XENO Webworks."
          canonicalPath="/about/"
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about/' }
          ]}
        />

        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-semibold text-[#3157E8]">Ahmedabad, India · B2B Search & SaaS Practice</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Search Engineering Built on Technical Rigor and Transparent Measurement
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Mehula ADMediaTek is an SEO and digital marketing agency based in Ahmedabad, Gujarat, combining hands-on B2B
            search consulting with a self-serve Search Intelligence SaaS platform engineered by XENO Webworks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">01. Zero Fabricated Claims</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never promise "guaranteed #1 rankings overnight" or display invented testimonials. Every recommendation
              is grounded in verifiable crawl diagnostics, Search Console impressions, and commercial search intent.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">02. Developer-Ready Execution</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rather than handing over generic 100-page PDFs that sit in a drawer, we write clear technical
              specifications for canonical tags, schema.org JSON-LD, faceted navigation, and Core Web Vitals.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
            <h2 className="text-base font-bold text-slate-900">03. Integrated SaaS Workspace</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every client receives access to our automated SEO audit engine, keyword tracker, subscription billing
              portal, and RBAC content management system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 7. CONTACT & CONSULTATION BOOKING (/contact/ & /book-a-consultation/)
  // ==========================================================================
  if (cleanPath === '/contact/' || cleanPath === '/book-a-consultation/') {
    const isBooking = cleanPath === '/book-a-consultation/';
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <SEOHead
          title={
            isBooking
              ? 'Book an SEO & SaaS Strategy Consultation | Mehula ADMediaTek'
              : 'Contact Mehula ADMediaTek – Ahmedabad SEO & Digital Marketing Agency'
          }
          description="Request a technical SEO consultation, enterprise SaaS demo, or custom search strategy proposal from Mehula ADMediaTek."
          canonicalPath={isBooking ? '/book-a-consultation/' : '/contact/'}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: isBooking ? 'Book a Consultation' : 'Contact', path: cleanPath }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#3157E8]">
                {isBooking ? 'Strategy & Technical Intake' : 'Direct Agency & SaaS Support'}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mt-2">
                {isBooking ? 'Request an SEO Architecture Consultation' : 'Contact Mehula ADMediaTek'}
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {isBooking
                  ? 'Share your website URL and primary business objectives. Because live external calendar availability is not connected in this preview environment, our Ahmedabad strategy team will review your domain and follow up via email to confirm a consultation time.'
                  : 'Have questions about our 8 core SEO services or our SaaS subscription tiers? Submit your inquiry below and it will route directly into our authenticated CRM pipeline.'}
              </p>
            </div>

            <div className="bg-[#F6F8FC] border border-slate-200 rounded-xl p-5 space-y-3 text-xs text-slate-700">
              <div className="font-bold text-slate-900">Regional Headquarters & Verification Notice</div>
              <div>
                <strong>Location:</strong> Ahmedabad, Gujarat, India (Exact street address, verified business telephone,
                and official email placeholders pending final corporate sign-off).
              </div>
              <div>
                <strong>Platform Engineering:</strong> Designed & Engineered by XENO Webworks.
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {isBooking ? 'Consultation Request Form' : 'B2B Inquiry & Lead Intake Form'}
            </h2>

            {formStatus === 'success' && (
              <div
                role="status"
                className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-2"
              >
                <div className="font-bold">Inquiry Recorded in CRM Pipeline</div>
                <p>
                  Thank you! Your request has been saved to our persistent Lead Management system. You can view and
                  update its pipeline status inside the SaaS Dashboard under the CRM Lead Pipeline tab.
                </p>
              </div>
            )}

            {formStatus === 'error' && formErrorMsg && (
              <div
                role="alert"
                className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium"
              >
                {formErrorMsg}
              </div>
            )}

            <form
              onSubmit={(e) => handleLeadFormSubmit(e, isBooking ? 'consultation_booking' : 'contact_page')}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block font-semibold text-slate-800 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block font-semibold text-slate-800 mb-1">
                    Business Email *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="priya@company.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-company" className="block font-semibold text-slate-800 mb-1">
                    Company / Organization
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Horizon Enterprise Pvt Ltd"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="contact-website" className="block font-semibold text-slate-800 mb-1">
                    Website URL
                  </label>
                  <input
                    id="contact-website"
                    type="text"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://horizon-example.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-service" className="block font-semibold text-slate-800 mb-1">
                    Primary Service or SaaS Tier Required
                  </label>
                  <select
                    id="contact-service"
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {CORE_SERVICES.map((s) => (
                      <option key={s.slug} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    <option value="Growth B2B SaaS Subscription">Growth B2B SaaS Subscription ($399/mo)</option>
                    <option value="Enterprise Retainer & SaaS">Enterprise Retainer & SaaS ($999/mo)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-pref" className="block font-semibold text-slate-800 mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    id="contact-pref"
                    value={formPreferredContact}
                    onChange={(e) => setFormPreferredContact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Email">Business Email</option>
                    <option value="Video Call (Google Meet)">Video Call (Google Meet)</option>
                    <option value="Telephone">Telephone</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block font-semibold text-slate-800 mb-1">
                  Project Scope, Current Challenges & Goals
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Share your target markets, technical challenges, or desired timeline..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <label className="flex items-start gap-2.5 text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formConsent}
                  onChange={(e) => setFormConsent(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I consent to Mehula ADMediaTek storing and processing these details to respond to my inquiry, as
                  outlined in the Privacy Policy. *
                </span>
              </label>

              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="px-6 py-3 bg-[#3157E8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {formStatus === 'submitting'
                  ? 'Submitting Inquiry...'
                  : isBooking
                  ? 'Request Consultation Follow-Up'
                  : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 8. PRIVACY POLICY & TERMS (/privacy-policy/ & /terms/)
  // ==========================================================================
  if (cleanPath === '/privacy-policy/' || cleanPath === '/terms/') {
    const isPrivacy = cleanPath === '/privacy-policy/';
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <SEOHead
          title={isPrivacy ? 'Privacy Policy | Mehula ADMediaTek' : 'Terms & Conditions | Mehula ADMediaTek'}
          description="Data protection, privacy practices, and SaaS subscription terms for Mehula ADMediaTek."
          canonicalPath={cleanPath}
        />
        <h1 className="text-3xl font-bold text-slate-900">
          {isPrivacy ? 'Privacy Policy (Editable Draft)' : 'Terms & Conditions (Editable Draft)'}
        </h1>
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700">
          <strong>Legal Review Notice:</strong> This template explains how the Mehula ADMediaTek website and SaaS
          platform handle data. It is not formal legal advice and must be reviewed and approved by the business owner's
          legal counsel before commercial publication.
        </div>
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            <strong>1. Information Collected:</strong> We collect information you explicitly submit via our Contact,
            Consultation, Chatbot, and Automated SEO Audit forms (such as your name, work email, company name, and
            submitted website URL), as well as authenticated Google Sign-In profile data when using the SaaS Dashboard.
          </p>
          <p>
            <strong>2. Purpose & Storage:</strong> Submitted inquiries are stored to evaluate your website, generate
            technical SEO audit reports, manage SaaS subscriptions, and follow up on consultation requests. User PII in
            Firestore is strictly isolated under owner-only security rules.
          </p>
          <p>
            <strong>3. SSRF & Security Controls:</strong> The Automated SEO Audit Tool fetches only the single public
            HTTP/HTTPS URL you submit and enforces strict DNS and private-IP blocks.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 9. HOMEPAGE (/) — ALL 12 REQUIRED SECTIONS + SAAS TIER PREVIEW
  // ==========================================================================
  return (
    <div className="space-y-20 pb-16">
      <SEOHead
        title="Mehula ADMediaTek – Enterprise SEO SaaS & B2B Digital Marketing Agency"
        description="Turn search visibility into sustainable business growth with Mehula ADMediaTek. Data-driven B2B SEO services, automated technical audit SaaS tools, and subscription tiers."
        canonicalPath="/"
      />

      {/* SECTION 2: HERO (Split 2-Column with Illustrative Search-Performance & SaaS Telemetry Dashboard) */}
      <section className="bg-[#F6F8FC] border-b border-slate-200 py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-semibold text-[#3157E8]">
                Ahmedabad B2B SEO Agency & Automated Search Intelligence SaaS
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-[1.12] text-balance">
                Turn Search Visibility Into Sustainable Business Growth.
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                Build a stronger organic presence with data-driven SEO strategies and our self-serve SaaS platform—designed
                to help your business attract qualified visitors, audit technical bottlenecks, and create measurable
                opportunities for growth.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/free-seo-audit/')}
                className="px-5 py-3 bg-[#3157E8] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>Get a Free SEO Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/pricing/')}
                className="px-5 py-3 bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                View SaaS Tiers & Billing
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/services/')}
                className="px-4 py-3 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold underline-offset-4 hover:underline whitespace-nowrap shrink-0"
              >
                Explore Our Services
              </button>
            </div>
          </div>

          {/* Right Side: Original Search-Performance & SaaS Telemetry Dashboard (Explicitly Labeled Illustrative) */}
          <div className="lg:col-span-6 bg-[#101828] text-white rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-semibold text-white">
                  Search Performance & SaaS Audit Telemetry
                </div>
                <div className="text-[11px] text-slate-400">
                  Illustrative Platform Preview · Non-Branded Organic Cohort Model
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/dashboard')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md whitespace-nowrap shrink-0"
              >
                Open Live Dashboard →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono tabular-nums">
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
                <div className="text-[11px] font-sans text-slate-400">Organic Impressions</div>
                <div className="text-lg font-bold text-white mt-1">94,200</div>
                <div className="text-[11px] text-[#16A34A] mt-0.5">Illustrative 6M Model</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
                <div className="text-[11px] font-sans text-slate-400">Technical Health</div>
                <div className="text-lg font-bold text-white mt-1">92 / 100</div>
                <div className="text-[11px] text-slate-400 mt-0.5">11 Core Checks</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
                <div className="text-[11px] font-sans text-slate-400">Qualified Inquiries</div>
                <div className="text-lg font-bold text-[#16A34A] mt-1">46 / mo</div>
                <div className="text-[11px] text-slate-400 mt-0.5">CRM Tracked</div>
              </div>
            </div>

            {/* SVG Trend Chart */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                <span>Non-Branded Commercial Visibility Trajectory (M1 → M6)</span>
                <span>Source: Sandbox Model</span>
              </div>
              <svg
                viewBox="0 0 500 120"
                className="w-full h-28 overflow-visible"
                role="img"
                aria-label="Illustrative organic traffic and impression trend chart from Month 1 to Month 6"
              >
                <line x1="0" y1="100" x2="500" y2="100" stroke="#1E293B" strokeWidth="1" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#1E293B" strokeWidth="1" />
                <line x1="0" y1="20" x2="500" y2="20" stroke="#1E293B" strokeWidth="1" />
                <polyline
                  fill="none"
                  stroke="#3157E8"
                  strokeWidth="3"
                  points="10,95 105,82 200,66 295,48 390,30 485,14"
                />
                <polyline
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points="10,104 105,96 200,85 295,72 390,56 485,40"
                />
                {[
                  { x: 10, y: 95, label: 'M1' },
                  { x: 105, y: 82, label: 'M2' },
                  { x: 200, y: 66, label: 'M3' },
                  { x: 295, y: 48, label: 'M4' },
                  { x: 390, y: 30, label: 'M5' },
                  { x: 485, y: 14, label: 'M6' }
                ].map((pt) => (
                  <g key={pt.label}>
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#3157E8" />
                    <text x={pt.x - 8} y="115" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="text-[11px] text-slate-400">
              * Figures above are explicitly labeled as an illustrative demonstration model. Connect your domain in the
              Free SEO Audit tool or User Dashboard to inspect live page data.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TRUST AND CREDIBILITY (Transparent Verification Framework — Zero Fake Logos) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl space-y-1.5">
            <div className="text-xs font-semibold text-[#3157E8]">Verified Proof & Governance Policy</div>
            <h2 className="text-lg font-bold text-slate-900">
              Built on Verifiable Technical Standards—Never Fabricated Claims
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              In compliance with strict editorial integrity, we do not display invented client logos or fake star
              ratings. Every client engagement is measured against first-party Google Search Console, GA4, and server
              HTTP audit benchmarks.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs tabular-nums shrink-0">
            <div className="p-3.5 bg-[#F6F8FC] border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900">11 Checks</div>
              <div className="font-sans text-[11px] text-slate-500 mt-0.5">Automated URL Audit</div>
            </div>
            <div className="p-3.5 bg-[#F6F8FC] border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900">SSRF Safe</div>
              <div className="font-sans text-[11px] text-slate-500 mt-0.5">DNS & IP Hardened</div>
            </div>
            <div className="p-3.5 bg-[#F6F8FC] border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900">JSON-LD</div>
              <div className="font-sans text-[11px] text-slate-500 mt-0.5">Schema.org Validated</div>
            </div>
            <div className="p-3.5 bg-[#F6F8FC] border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900">4 Tiers</div>
              <div className="font-sans text-[11px] text-slate-500 mt-0.5">SaaS & Agency Billing</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CORE SERVICES (8 Dedicated Indexable Services) */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-semibold text-[#3157E8]">01–08 Core Capabilities</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Full-Spectrum B2B Search Optimization Services
            </h2>
            <p className="text-sm text-slate-600">
              Each service has a dedicated, indexable architecture page detailing diagnostic problems, deliverables, and
              expected leading indicators.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/services/')}
            className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <span>View Full Services Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CORE_SERVICES.map((service) => (
            <div
              key={service.slug}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="text-xs font-mono font-semibold text-[#3157E8]">{service.index}. Service</div>
                <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{service.shortDesc}</p>
                <p className="text-[11px] text-slate-500 pt-1">
                  <strong className="text-slate-800">Outcome:</strong> {service.businessBenefit}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`/services/${service.slug}/`)}
                className="text-xs font-semibold text-slate-900 hover:text-[#3157E8] flex items-center gap-1 pt-2 border-t border-slate-100"
              >
                <span>{service.name} Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SAAS SUBSCRIPTION TIERS & AUTOMATED BILLING PREVIEW */}
      <section className="bg-[#101828] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="text-xs font-semibold text-blue-400">Integrated SaaS Platform & Automated Billing</div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Self-Serve Search Intelligence Tiers & Agency Retainers
              </h2>
              <p className="text-sm text-slate-300">
                Subscribe to automated monthly or annual plans with instant proration, PDF invoice generation, keyword
                tracking, and CMS publishing controls.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/pricing/')}
                className="px-4 py-2.5 bg-[#3157E8] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 whitespace-nowrap shrink-0"
              >
                Compare Tiers & Subscribe
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/dashboard')}
                className="px-4 py-2.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-700 whitespace-nowrap shrink-0"
              >
                Open User Dashboard
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(['free', 'starter', 'growth', 'agency'] as const).map((pid) => {
              const p = SAAS_PLANS[pid];
              return (
                <div
                  key={pid}
                  className={`rounded-xl p-5 border flex flex-col justify-between space-y-4 ${
                    pid === 'growth'
                      ? 'bg-slate-900 border-[#3157E8]'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-400">{p.audience}</div>
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white">
                      ${p.monthlyPriceUsd}
                      <span className="text-xs font-normal text-slate-400">/mo</span>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-300 pt-1">
                      {p.auditLimit} Audits/mo · {p.keywordLimit} Keywords
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('/pricing/')}
                    className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Select {p.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5 & 6: WHY CHOOSE US + 4-STEP SEO PROCESS */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-semibold text-[#3157E8]">Engineering Principles</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Why B2B Teams Choose Mehula ADMediaTek</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We treat search engine optimization as an engineering and commercial discipline—aligning crawl architecture,
            structured content, and lead attribution.
          </p>
          <div className="space-y-3 pt-2 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <BarChart3 className="w-4 h-4 text-[#3157E8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Data-Informed Decision Making:</strong> Prioritizing pages by
                commercial search intent and pipeline contribution rather than vanity traffic.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FileCode className="w-4 h-4 text-[#3157E8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Technical Precision:</strong> Validated JSON-LD schemas, canonical
                hygiene, and SSRF-safe diagnostic tooling engineered by XENO Webworks.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-[#3157E8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Transparent Reporting:</strong> Every metric records reporting
                intervals, data sources, and realistic caveats.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#F6F8FC] border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Our Four-Stage Search Execution Process</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                step: '01. Discover',
                desc: 'Understand your revenue model, buyer personas, commercial margins, and search competitors.'
              },
              {
                step: '02. Audit',
                desc: 'Identify technical crawl barriers, canonical conflicts, content gaps, and authority opportunities.'
              },
              {
                step: '03. Execute',
                desc: 'Deploy technical fixes, optimize service templates, and publish intent-aligned content via the CMS.'
              },
              {
                step: '04. Measure & Improve',
                desc: 'Monitor Search Console cohorts, keyword rankings, and CRM lead progression continuously.'
              }
            ].map((item) => (
              <div key={item.step} className="bg-white border border-slate-200 rounded-lg p-4 space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#3157E8]">{item.step}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 & 8: CASE STUDIES + INDUSTRIES SERVED */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#3157E8]">Vertical Specialization</div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Industries Served & Architecture Models</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/industries/')}
            className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1"
          >
            <span>Explore All 6 Industry Verticals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INDUSTRIES_DATA.map((ind) => (
            <div
              key={ind.slug}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900">{ind.name}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ind.summary}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`/industries/${ind.slug}/`)}
                className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1 pt-2"
              >
                <span>View {ind.name} Strategy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9: SEO INSIGHTS (Recent Articles from CMS) */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#3157E8]">From Our CMS Resource Center</div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Recent Technical SEO Insights</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/blog/')}
            className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1"
          >
            <span>All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles
            .filter((a) => a.status === 'published')
            .slice(0, 3)
            .map((art) => (
              <div
                key={art.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">
                    <span>{art.category}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{art.publishedAt}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{art.readingTimeMinutes} min read</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{art.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{art.excerpt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/blog/${art.slug}/`)}
                  className="text-xs font-semibold text-[#3157E8] hover:underline flex items-center gap-1"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
        </div>
      </section>

      {/* SECTION 10: FREE SEO AUDIT CTA */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-[#101828] text-white rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Discover What's Holding Your Website Back.</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Request an initial SEO assessment to identify potential technical issues, search optimization
              opportunities, and areas worth investigating.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/free-seo-audit/')}
              className="px-6 py-3 bg-[#3157E8] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              Check My Website
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/book-a-consultation/')}
              className="px-5 py-3 bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              Book a Consultation
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 11: ACCESSIBLE FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs font-semibold text-[#3157E8]">Transparent Answers</div>
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white">
          {HOMEPAGE_FAQS.map((item, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div key={idx} className="p-5">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left text-sm font-bold text-slate-900"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && <p className="mt-3 text-xs text-slate-600 leading-relaxed">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
