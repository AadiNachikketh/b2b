export interface ServiceDetail {
  slug: string;
  index: string;
  name: string;
  shortDesc: string;
  businessBenefit: string;
  heroTitle: string;
  heroSubtitle: string;
  targetAudience: string;
  problems: { title: string; detail: string }[];
  approachSteps: { step: string; title: string; detail: string }[];
  deliverables: string[];
  leadingIndicators: string[];
  businessOutcomes: string[];
  ctaText: string;
  faqs: { q: string; a: string }[];
}

export const CORE_SERVICES: ServiceDetail[] = [
  {
    slug: 'local-seo',
    index: '01',
    name: 'Local SEO',
    shortDesc: 'Capture high-intent regional searches across Ahmedabad, Gujarat, and multi-location service areas.',
    businessBenefit: 'Increases qualified local inquiries, map pack visibility, and regional consultation requests.',
    heroTitle: 'Local Search Architecture for Multi-Location & Regional B2B Operations',
    heroSubtitle: 'Establish structured entity consistency, optimized location landing pages, and verified Google Business Profile governance.',
    targetAudience: 'Regional B2B providers, healthcare clinics, real estate developers, and multi-branch commercial enterprises.',
    problems: [
      { title: 'Inconsistent NAP Citations', detail: 'Conflicting name, address, and telephone records across directories dilute regional trust signals.' },
      { title: 'Thin Location Landing Pages', detail: 'Duplicate city pages lacking unique service scope or local schema fail to rank for commercial terms.' },
      { title: 'Unmanaged Business Profiles', detail: 'Incomplete service categories, missing attributes, and unaddressed customer Q&A reduce map pack impressions.' }
    ],
    approachSteps: [
      { step: '01', title: 'Entity & Citation Audit', detail: 'Audit primary business listings, regional directories, and LocalBusiness structured data.' },
      { step: '02', title: 'Location Page Engineering', detail: 'Build distinct, intent-matched regional landing pages with localized proof points.' },
      { step: '03', title: 'GBP & Review Governance', detail: 'Standardize category hierarchies, UTM tracking on profile links, and review response workflows.' },
      { step: '04', title: 'Local Grid & Call Attribution', detail: 'Monitor geographic keyword visibility and direction/call actions in Search Console and GA4.' }
    ],
    deliverables: [
      'Google Business Profile optimization & UTM tagging checklist',
      'LocalBusiness JSON-LD schema implementation',
      'Citation consistency audit & cleanup roadmap',
      'Regional service-area landing page briefs',
      'Monthly local search impression & action reporting'
    ],
    leadingIndicators: [
      'Improved citation accuracy across top commercial directories',
      'Higher search impressions for city + service commercial queries',
      'Increased clicks on website and call actions from local profiles'
    ],
    businessOutcomes: [
      'More qualified inbound calls and regional consultation requests',
      'Lower reliance on paid local lead aggregators over time'
    ],
    ctaText: 'Request a Local SEO Assessment',
    faqs: [
      { q: 'Does Local SEO require a physical storefront in every city?', a: 'Google Business Profile guidelines require verified in-person contact or defined service areas. For cities without staffed offices, we build organic regional service pages rather than violating map listing policies.' },
      { q: 'How do you measure Local SEO separately from brand searches?', a: 'We append structured UTM parameters to profile links and segment non-branded regional queries inside Google Search Console.' }
    ]
  },
  {
    slug: 'national-seo',
    index: '02',
    name: 'National SEO',
    shortDesc: 'Scale non-branded organic visibility across India and international commercial markets.',
    businessBenefit: 'Builds durable organic pipeline for high-value B2B and enterprise solution keywords.',
    heroTitle: 'National & Cross-Market Search Strategy for Scaling Enterprises',
    heroSubtitle: 'Compete for high-intent commercial categories through topic cluster depth, technical authority, and conversion-focused landing pages.',
    targetAudience: 'B2B SaaS platforms, national manufacturers, B2B service firms, and nationwide e-commerce brands.',
    problems: [
      { title: 'Over-Reliance on Branded Traffic', detail: 'Most organic clicks originate from users already searching the company name rather than solution terms.' },
      { title: 'Fragmented Topic Coverage', detail: 'Isolated blog posts fail to support commercial solution pages through structured internal linking.' },
      { title: 'High Paid Acquisition Costs', detail: 'Rising CPCs in competitive B2B verticals compress customer acquisition margins.' }
    ],
    approachSteps: [
      { step: '01', title: 'Commercial Category Mapping', detail: 'Segment national search demand by buyer stage, competition density, and revenue relevance.' },
      { step: '02', title: 'Hub-and-Spoke Information Architecture', detail: 'Connect core solution pages with supporting comparison, integration, and technical guides.' },
      { step: '03', title: 'On-Page & Conversion Alignment', detail: 'Structure solution templates with clear proof points, technical specifications, and low-friction CTAs.' },
      { step: '04', title: 'Pipeline Attribution Review', detail: 'Track non-branded organic landing page sessions through to qualified lead submissions.' }
    ],
    deliverables: [
      'National competitor gap & search share analysis',
      'Full taxonomy & URL hierarchy blueprint',
      'Core solution page optimization specifications',
      'Supporting topic cluster editorial calendar',
      'Executive non-branded traffic & conversion reporting'
    ],
    leadingIndicators: [
      'Expansion of indexed keywords in positions 1–20 for non-branded terms',
      'Growth in impressions across solution and comparison pages'
    ],
    businessOutcomes: [
      'Sustained growth in qualified B2B demo and consultation requests',
      'Diversified acquisition mix alongside paid search campaigns'
    ],
    ctaText: 'Discuss Your National SEO Strategy',
    faqs: [
      { q: 'How long does a national SEO program take to show measurable traction?', a: 'Technical fixes and indexation improvements typically register within 4 to 8 weeks, while competitive non-branded commercial categories generally require 4 to 9 months of consistent execution.' },
      { q: 'Do you guarantee top-3 rankings for national keywords?', a: 'No ethical SEO agency can guarantee specific ranking positions because search algorithms evolve continuously. We commit to transparent deliverables, leading indicators, and verified traffic reporting.' }
    ]
  },
  {
    slug: 'technical-seo',
    index: '03',
    name: 'Technical SEO',
    shortDesc: 'Eliminate crawl bottlenecks, rendering failures, duplicate canonicals, and Core Web Vitals regressions.',
    businessBenefit: 'Ensures search engines accurately crawl, render, index, and understand your entire site architecture.',
    heroTitle: 'Technical SEO Engineering & Crawl Architecture',
    heroSubtitle: 'Resolve indexation waste, JavaScript rendering barriers, canonical conflicts, and Core Web Vitals bottlenecks with developer-ready specifications.',
    targetAudience: 'Complex web applications, large catalogs, React/Next.js SPAs, and sites undergoing domain migrations.',
    problems: [
      { title: 'Crawl Budget & Indexation Waste', detail: 'Faceted parameters, duplicate URLs, and soft-404s consume crawler resources while core pages remain unindexed.' },
      { title: 'Client-Side Rendering Blindspots', detail: 'Critical metadata, canonical tags, or body links injected late via JavaScript fail to index reliably.' },
      { title: 'Core Web Vitals Regressions', detail: 'Unoptimized LCP media, layout shifts (CLS), and heavy third-party scripts degrade user experience and search performance.' }
    ],
    approachSteps: [
      { step: '01', title: 'Crawl & Log Diagnostics', detail: 'Inspect HTTP status codes, redirect chains, robots.txt rules, XML sitemaps, and canonical alignment.' },
      { step: '02', title: 'Rendering & DOM Verification', detail: 'Compare initial server HTML against rendered DOM to ensure titles, headings, and links are accessible.' },
      { step: '03', title: 'Performance & Schema Hardening', detail: 'Specify LCP/INP/CLS optimizations and deploy validated Organization, Service, and BreadcrumbList JSON-LD.' },
      { step: '04', title: 'Release QA & Regression Monitoring', detail: 'Verify staging deployments and monitor Search Console coverage post-release.' }
    ],
    deliverables: [
      'Comprehensive technical SEO audit with severity-ranked tickets',
      'Robots.txt, XML sitemap, and canonicalization specification',
      'Redirect map (301) for legacy slugs and site migrations',
      'Validated Schema.org JSON-LD templates',
      'Core Web Vitals engineering remediation guide'
    ],
    leadingIndicators: [
      'Reduction in excluded/duplicate URLs in Google Search Console',
      'Faster crawl response times and clean 200 OK canonical coverage',
      'Measurable improvement in LCP, INP, and CLS field/lab metrics'
    ],
    businessOutcomes: [
      'Higher percentage of commercial pages actively ranking and receiving impressions',
      'Protected organic traffic during platform redesigns or migrations'
    ],
    ctaText: 'Discuss Your Technical SEO',
    faqs: [
      { q: 'Can your team work directly with our internal developers?', a: 'Yes. Supported by XENO Webworks engineering standards, we write clear technical tickets with code examples and verify fixes in staging.' },
      { q: 'What is included in your automated vs. manual technical audit?', a: 'Our automated SaaS tool checks single-page HTTP headers, metadata, headings, canonicals, and schema immediately. Our full agency audit crawls thousands of URLs, analyzes Search Console coverage, and inspects rendering behavior.' }
    ]
  },
  {
    slug: 'keyword-research',
    index: '04',
    name: 'Keyword Research and Strategy',
    shortDesc: 'Map commercial, transactional, and informational search intent directly to your buyer journey.',
    businessBenefit: 'Prevents wasted content production by prioritizing queries that drive qualified business inquiries.',
    heroTitle: 'Search Intent Modeling & Commercial Keyword Strategy',
    heroSubtitle: 'Move beyond raw search volume vanity metrics. We classify queries by buyer intent, SERP feature composition, and conversion alignment.',
    targetAudience: 'Marketing leaders, product marketers, and B2B teams planning site architecture or editorial budgets.',
    problems: [
      { title: 'Chasing High-Volume Vanity Terms', detail: 'Targeting broad informational terms brings students and researchers rather than commercial B2B buyers.' },
      { title: 'Keyword Cannibalization', detail: 'Multiple pages competing for the same search intent split link equity and confuse search engines.' },
      { title: 'Unmapped Buyer Stages', detail: 'Missing comparison, specification, or implementation pages leave prospects to convert on competitor sites.' }
    ],
    approachSteps: [
      { step: '01', title: 'ICP & Product Taxonomy Discovery', detail: 'Document your core revenue lines, ideal customer profiles, and sales team objections.' },
      { step: '02', title: 'SERP & Intent Classification', detail: 'Analyze live search results to determine whether Google rewards service pages, tools, or guides.' },
      { step: '03', title: 'URL-to-Keyword Matrix', detail: 'Assign one primary intent cluster to each canonical URL to prevent internal cannibalization.' },
      { step: '04', title: 'Prioritized Execution Roadmap', detail: 'Sequence page creation and optimization based on commercial value and competitive feasibility.' }
    ],
    deliverables: [
      'Master keyword & intent database segmented by product line',
      'URL-to-keyword mapping matrix (existing vs. net-new pages)',
      'Competitor SERP visibility & content gap report',
      '90-day prioritized content & on-page execution plan'
    ],
    leadingIndicators: [
      'Clear 1:1 mapping between commercial URLs and target query clusters',
      'Elimination of competing duplicate pages targeting identical queries'
    ],
    businessOutcomes: [
      'Higher organic conversion rates from better-qualified search visitors',
      'Predictable editorial and landing page production workflow'
    ],
    ctaText: 'Build Your Keyword Roadmap',
    faqs: [
      { q: 'How do you handle niche B2B industries where keyword tools show zero volume?', a: 'Standard third-party tools frequently underestimate low-volume, high-ticket B2B queries. We combine Search Console impression data, sales call transcripts, and technical nomenclature analysis.' }
    ]
  },
  {
    slug: 'on-page-seo',
    index: '05',
    name: 'On-Page SEO',
    shortDesc: 'Optimize semantic structure, heading hierarchies, internal link anchors, and conversion copy.',
    businessBenefit: 'Improves click-through rates from search results and clarifies topical relevance for both users and crawlers.',
    heroTitle: 'On-Page Semantic Optimization & Internal Link Architecture',
    heroSubtitle: 'Align title tags, heading hierarchies, entity coverage, and contextual internal links with commercial user intent.',
    targetAudience: 'Websites with existing pages ranking on pages 2–3 that need structured refinement to capture top positions.',
    problems: [
      { title: 'Generic or Duplicate Metadata', detail: 'Repeated title tags and truncated meta descriptions suppress organic click-through rates.' },
      { title: 'Broken Heading Semantics', detail: 'Multiple competing H1 tags or styling-driven H3/H4 jumps weaken document structure.' },
      { title: 'Orphaned Commercial Pages', detail: 'Important service pages receive few internal links from high-authority articles or navigation.' }
    ],
    approachSteps: [
      { step: '01', title: 'Page-Level Diagnostic', detail: 'Evaluate current rankings, CTR performance, heading hierarchy, and content depth.' },
      { step: '02', title: 'Metadata & Snippet Engineering', detail: 'Draft distinct, compelling title tags (30–60 chars) and actionable meta descriptions (120–160 chars).' },
      { step: '03', title: 'Semantic & Structural Refinement', detail: 'Restructure H1–H3 outlines, clarify service scope, and embed FAQ/Service structured data.' },
      { step: '04', title: 'Internal Link Graph Optimization', detail: 'Connect supporting articles and industry pages to core commercial pages with descriptive anchor text.' }
    ],
    deliverables: [
      'Page-by-page metadata register (titles, descriptions, canonicals)',
      'Content & heading restructuring briefs for priority URLs',
      'Internal linking matrix with exact source URLs and anchor text',
      'Image alt-text and media accessibility remediation list'
    ],
    leadingIndicators: [
      'Improved organic click-through rate (CTR) in Search Console',
      'Stronger ranking stability for primary and secondary page queries'
    ],
    businessOutcomes: [
      'More organic traffic extracted from existing content assets',
      'Clearer user journey from informational entry points to service forms'
    ],
    ctaText: 'Request an On-Page Review',
    faqs: [
      { q: 'Will on-page SEO ruin our brand voice with awkward keyword stuffing?', a: 'Never. Keyword stuffing is outdated and counterproductive. We write natural, authoritative B2B copy that answers buyer questions clearly.' }
    ]
  },
  {
    slug: 'link-building',
    index: '06',
    name: 'Link Building',
    shortDesc: 'Earn editorial citations, digital PR mentions, and industry-relevant backlinks through research-backed assets.',
    businessBenefit: 'Strengthens domain authority and competitive resilience without risking algorithmic link penalties.',
    heroTitle: 'Editorial Authority & White-Hat Digital PR',
    heroSubtitle: 'Build a clean, defensible backlink profile through original industry resources, partner citations, and unlinked brand mention reclamation.',
    targetAudience: 'Established B2B and e-commerce brands competing in high-authority search verticals.',
    problems: [
      { title: 'Authority Gap Against Incumbents', detail: 'Well-optimized pages stall below established competitors due to fewer trusted referring domains.' },
      { title: 'Toxic Legacy Links', detail: 'Past purchases of low-quality directory or PBN links create compliance and algorithmic risk.' },
      { title: 'Unclaimed Brand Mentions', detail: 'Trade publications, partners, or events mention your company without linking to the appropriate canonical URL.' }
    ],
    approachSteps: [
      { step: '01', title: 'Link Profile & Risk Audit', detail: 'Analyze existing referring domains, anchor text ratios, and competitor authority benchmarks.' },
      { step: '02', title: 'Linkable Asset Development', detail: 'Create original industry benchmarks, checklists, or technical guides worthy of editorial citation.' },
      { step: '03', title: 'Reclamation & Partner Outreach', detail: 'Convert unlinked brand mentions and genuine supplier/association relationships into editorial links.' },
      { step: '04', title: 'Quality & Indexation Verification', detail: 'Monitor acquired links for editorial context, proper attributes, and landing page relevance.' }
    ],
    deliverables: [
      'Backlink profile & competitor authority gap audit',
      'Linkable research asset or technical calculator concept',
      'Unlinked brand mention & broken backlink reclamation log',
      'Transparent monthly referring domain acquisition report'
    ],
    leadingIndicators: [
      'Earned editorial mentions from relevant trade and industry publications',
      'Balanced, natural anchor text distribution pointing to key hubs'
    ],
    businessOutcomes: [
      'Increased competitive standing for high-difficulty commercial terms',
      'Referral traffic from relevant industry publications'
    ],
    ctaText: 'Discuss Authority & Link Strategy',
    faqs: [
      { q: 'Do you buy links or use private blog networks (PBNs)?', a: 'No. We strictly adhere to search engine spam policies and never purchase links from link farms or PBNs. Every outreach campaign focuses on editorial relevance and real publishing standards.' }
    ]
  },
  {
    slug: 'content-marketing',
    index: '07',
    name: 'Content Marketing',
    shortDesc: 'Publish technical guides, industry playbooks, and comparison resources that educate buyers and earn organic visibility.',
    businessBenefit: 'Establishes subject-matter authority and captures prospects researching solutions early in the buying cycle.',
    heroTitle: 'B2B Editorial Engineering & Search-Led Content Marketing',
    heroSubtitle: 'Produce technically accurate, deeply researched articles and resource hubs managed through a structured CMS workflow.',
    targetAudience: 'B2B technology companies, professional services, healthcare organizations, and specialized manufacturers.',
    problems: [
      { title: 'Generic Surface-Level Articles', detail: 'Uninformed blog posts repeat obvious definitions and fail to earn trust from senior B2B decision-makers.' },
      { title: 'No Path to Conversion', detail: 'Informational traffic exits immediately because articles lack contextual tools, audits, or service pathways.' },
      { title: 'Inconsistent Publishing Governance', detail: 'Articles go live without proper heading hierarchy, canonical tags, author attribution, or internal links.' }
    ],
    approachSteps: [
      { step: '01', title: 'Subject-Matter & Intent Briefs', detail: 'Combine SERP analysis with internal expert insights to build comprehensive article blueprints.' },
      { step: '02', title: 'Editorial Production & Review', detail: 'Draft clear, zero-fluff articles with structured headings, tables, and verified citations.' },
      { step: '03', title: 'CMS & Schema Deployment', detail: 'Publish with complete BlogPosting JSON-LD, table of contents, and related service modules.' },
      { step: '04', title: 'Content Decay & Conversion Refresh', detail: 'Monitor article impressions and update aging guides to preserve organic visibility.' }
    ],
    deliverables: [
      'Quarterly editorial calendar mapped to commercial topic clusters',
      'Detailed SEO content briefs with heading outlines and entity lists',
      'Technical B2B articles and comparison guides',
      'Content refresh and internal link integration audits'
    ],
    leadingIndicators: [
      'Growth in organic impressions and top-10 rankings across informational hubs',
      'Higher assisted conversions from blog readers visiting service or audit pages'
    ],
    businessOutcomes: [
      'Stronger brand authority during B2B vendor evaluation',
      'Compounding organic traffic asset owned by your company'
    ],
    ctaText: 'Plan Your Content Strategy',
    faqs: [
      { q: 'How do you ensure technical accuracy for specialized industries?', a: 'Every article starts with a structured brief and subject-matter interview or approved reference documentation. Nothing is published without client editorial sign-off.' }
    ]
  },
  {
    slug: 'ecommerce-seo',
    index: '08',
    name: 'E-commerce SEO',
    shortDesc: 'Optimize category taxonomies, faceted navigation, Product schema, and high-intent commercial collections.',
    businessBenefit: 'Drives non-paid product discovery and recurring organic revenue across large SKU catalogs.',
    heroTitle: 'E-Commerce Catalog & Category Search Optimization',
    heroSubtitle: 'Scale organic visibility across product categories, brand collections, and high-intent commercial filters without crawl bloat.',
    targetAudience: 'D2C brands, B2B industrial catalog distributors, and multi-category online retailers.',
    problems: [
      { title: 'Faceted Navigation Crawl Traps', detail: 'Filter combinations (size, color, price, sort) generate millions of duplicate URLs that dilute crawl equity.' },
      { title: 'Thin Category Templates', detail: 'Collection pages display only product grids without contextual buying guidance or semantic structure.' },
      { title: 'Out-of-Stock & Seasonal SKU Churn', detail: 'Deleting discontinued product URLs creates 404 errors and destroys accumulated backlinks.' }
    ],
    approachSteps: [
      { step: '01', title: 'Catalog & Facet Crawl Audit', detail: 'Define indexable collection combinations vs. canonicalized or blocked filter parameters.' },
      { step: '02', title: 'Category Taxonomy Expansion', detail: 'Create high-intent sub-category and brand-plus-category landing pages.' },
      { step: '03', title: 'Product & Offer Schema Deployment', detail: 'Validate Product, Offer, and BreadcrumbList structured data for rich merchant listings.' },
      { step: '04', title: 'SKU Lifecycle Governance', detail: 'Establish rules for permanently discontinued products (301 to successor or parent category).' }
    ],
    deliverables: [
      'Faceted navigation & canonical parameter governance matrix',
      'Category & sub-category taxonomy expansion plan',
      'Product & BreadcrumbList JSON-LD validation report',
      'Discontinued & seasonal SKU redirect SOP'
    ],
    leadingIndicators: [
      'Clean indexation ratio for priority collection and product URLs',
      'Increased rich snippet eligibility for product price and availability'
    ],
    businessOutcomes: [
      'Higher organic sessions to commercial collection pages',
      'Lower blended customer acquisition cost across the catalog'
    ],
    ctaText: 'Request an E-Commerce SEO Review',
    faqs: [
      { q: 'Which e-commerce platforms do you support?', a: 'We work across custom headless storefronts (Next.js/React), Shopify Plus, WooCommerce, and enterprise B2B catalog platforms.' }
    ]
  }
];

export interface IndustryDetail {
  slug: string;
  name: string;
  summary: string;
  challenges: string[];
  opportunities: string[];
  recommendedServices: string[];
  engagementModel: string;
  faqs: { q: string; a: string }[];
}

export const INDUSTRIES_DATA: IndustryDetail[] = [
  {
    slug: 'ecommerce',
    name: 'E-Commerce & D2C Retail',
    summary: 'Structured catalog architecture, faceted navigation control, and category-level search acquisition.',
    challenges: [
      'Duplicate URLs generated by color, size, and sort filters consuming crawl budget.',
      'Thin collection pages competing against marketplace aggregators.',
      'Seasonal or discontinued SKU pages losing organic equity when removed improperly.'
    ],
    opportunities: [
      'Capture high-intent category + modifier searches through dedicated sub-collections.',
      'Deploy validated Product and Offer JSON-LD for rich merchant search snippets.',
      'Build buying guides that link directly into commercial product categories.'
    ],
    recommendedServices: ['ecommerce-seo', 'technical-seo', 'content-marketing'],
    engagementModel: 'Starts with a catalog crawl and parameter audit, followed by collection template engineering and continuous category expansion.',
    faqs: [
      { q: 'Should we index filter URLs?', a: 'Only when a specific attribute combination has verified standalone search demand and unique inventory; otherwise canonicalize to the parent category.' }
    ]
  },
  {
    slug: 'healthcare',
    name: 'Healthcare & Medical Clinics',
    summary: 'High-trust medical service pages, practitioner attribution, and local clinic search visibility.',
    challenges: [
      'Strict quality expectations for health and medical information requiring clinician review.',
      'Multi-specialty clinics struggling to rank individual departments and locations.',
      'Inconsistent clinic hours, addresses, and practitioner listings across local directories.'
    ],
    opportunities: [
      'Structure condition, treatment, and specialist pages with clear clinical reviewer attribution.',
      'Optimize local clinic profiles and appointment booking pathways.',
      'Implement MedicalOrganization and Physician structured data accurately.'
    ],
    recommendedServices: ['local-seo', 'on-page-seo', 'content-marketing'],
    engagementModel: 'We audit local clinic listings and build clinician-reviewed service and condition templates with strict compliance governance.',
    faqs: [
      { q: 'Who writes or approves healthcare content?', a: 'We prepare structured search briefs and drafts, which must be reviewed and approved by your qualified medical personnel before publication.' }
    ]
  },
  {
    slug: 'real-estate',
    name: 'Real Estate & Commercial Property',
    summary: 'Location-specific project visibility, micromarket guides, and high-intent commercial property lead capture.',
    challenges: [
      'Project microsites launched on separate domains that fail to build cumulative authority.',
      'PDF-heavy floor plans and brochures that search engines cannot index effectively.',
      'Intense competition from national property portals on broad city keywords.'
    ],
    opportunities: [
      'Consolidate residential and commercial developments under a unified domain structure.',
      'Target specific corridor, micromarket, and configuration queries (e.g., commercial office space in SG Highway Ahmedabad).',
      'Convert brochure downloads into verified CRM consultation leads.'
    ],
    recommendedServices: ['local-seo', 'technical-seo', 'keyword-research'],
    engagementModel: 'We unify project architecture under your core brand domain and optimize micromarket and specification landing pages.',
    faqs: [
      { q: 'What happens to a project page once all units are sold out?', a: 'Keep the URL live as a completed portfolio case study with internal links to active nearby developments rather than deleting the page.' }
    ]
  },
  {
    slug: 'education',
    name: 'Education, Universities & EdTech',
    summary: 'Program discovery, admission cycle search planning, and curriculum taxonomy optimization.',
    challenges: [
      'Complex departmental subdomains and legacy academic PDFs fragmenting search visibility.',
      'Seasonal admission windows requiring months of advance organic visibility.',
      'Prospective students searching career outcomes rather than internal course codes.'
    ],
    opportunities: [
      'Structure degree, certification, and course pages around career outcomes and syllabus depth.',
      'Align publishing calendars 6 months ahead of peak enrollment periods.',
      'Deploy Course and EducationalOrganization structured data.'
    ],
    recommendedServices: ['national-seo', 'content-marketing', 'on-page-seo'],
    engagementModel: 'Audit program taxonomy and build outcome-aligned curriculum pages ahead of enrollment windows.',
    faqs: [
      { q: 'Can you work alongside university admission and compliance teams?', a: 'Yes. All syllabus, accreditation, and fee disclosures follow your institutional approval workflow.' }
    ]
  },
  {
    slug: 'saas',
    name: 'SaaS & Enterprise Technology',
    summary: 'Non-branded solution pages, integration directories, and programmatic technical documentation SEO.',
    challenges: [
      'JavaScript-heavy marketing sites with slow hydration or missing server-rendered metadata.',
      'Over-indexing on top-of-funnel blog traffic that never converts into product trials or demos.',
      'Missing comparison, alternative, and integration landing pages.'
    ],
    opportunities: [
      'Build high-converting feature, use-case, and integration ecosystems.',
      'Use interactive tools (like calculators or technical assessments) as organic lead magnets.',
      'Align documentation and knowledge base architecture for long-tail technical discovery.'
    ],
    recommendedServices: ['technical-seo', 'national-seo', 'keyword-research'],
    engagementModel: 'Full-funnel SaaS search engineering combining technical rendering audits with commercial solution and integration clusters.',
    faqs: [
      { q: 'How do you connect SEO metrics to SaaS ARR pipeline?', a: 'We track first-touch and assisted organic landing pages into trial signups, audit usage, and demo requests.' }
    ]
  },
  {
    slug: 'local-businesses',
    name: 'Professional & Local B2B Services',
    summary: 'Regional authority for accounting, legal, engineering, logistics, and industrial B2B firms.',
    challenges: [
      'Outdated brochure websites that list services on a single generic page.',
      'Zero visibility for specialized regional commercial inquiries.',
      'Forms that fail to capture service scope or route inquiries to the right partner.'
    ],
    opportunities: [
      'Split omnibus service pages into dedicated practice-area and service-line URLs.',
      'Strengthen regional search visibility across Ahmedabad and target industrial corridors.',
      'Deploy structured consultation intake forms connected to your CRM pipeline.'
    ],
    recommendedServices: ['local-seo', 'on-page-seo', 'keyword-research'],
    engagementModel: 'Practical, high-ROI restructuring of service pages, local profiles, and lead capture workflows.',
    faqs: [
      { q: 'Do small B2B service firms need ongoing daily blog posts?', a: 'No. Usually, building 8–15 thorough service and industry pages paired with strong local profiles delivers far higher return than high-volume blogging.' }
    ]
  }
];

export interface CaseStudyRecord {
  id: string;
  slug: string;
  title: string;
  clientLabel: string;
  industry: string;
  duration: string;
  isIllustrativeDemo: boolean;
  verificationNotice: string;
  startingConditions: string;
  auditFindings: string[];
  strategyImplemented: string[];
  resultsSummary: string;
  methodology: {
    reportingPeriod: string;
    comparisonPeriod: string;
    dataSource: string;
    metricDefinition: string;
    caveats: string;
  };
  chartData: {
    month: string;
    organicSessions: number;
    impressions: number;
    qualifiedLeads: number;
  }[];
  relatedServices: string[];
}

export const INITIAL_CASE_STUDIES: CaseStudyRecord[] = [
  {
    id: 'cs-1',
    slug: 'b2b-industrial-catalog-architecture-framework',
    title: 'Technical Crawl & Taxonomy Blueprint for Industrial B2B Catalogs',
    clientLabel: 'Illustrative Benchmark Architecture (Client Portfolio Verification Pending)',
    industry: 'Manufacturing & B2B E-Commerce',
    duration: '6-Month Reference Model',
    isIllustrativeDemo: true,
    verificationNotice: 'TRANSPARENCY NOTICE: In strict compliance with Mehula ADMediaTek measurement integrity standards, no fabricated client logos or unverified client claims are displayed. The figures below represent an illustrative simulation model demonstrating how our reporting dashboard tracks Search Console and GA4 cohorts once client data is connected.',
    startingConditions: 'Legacy product catalog with 4,200 parameterized filter URLs competing against 180 core commercial category pages, resulting in 68% crawl allocation on non-canonical URLs.',
    auditFindings: [
      'Missing self-referencing canonical tags on paginated and sorted category views.',
      'Generic H1 headings ("Products") duplicated across 42 industrial sub-categories.',
      'Zero Product or BreadcrumbList JSON-LD structured data present in initial server HTML.'
    ],
    strategyImplemented: [
      'Implemented canonical parameter governance and consolidated duplicate facet URLs.',
      'Engineered 42 distinct specification-driven category pages with tabular comparison data.',
      'Deployed automated BreadcrumbList and Service/Product JSON-LD templates.'
    ],
    resultsSummary: 'Illustrative model showing typical trajectory when crawl waste is eliminated and commercial sub-categories are properly indexed.',
    methodology: {
      reportingPeriod: 'Months 1–6 (Simulation Baseline)',
      comparisonPeriod: 'Pre-Audit 30-Day Baseline',
      dataSource: 'Illustrative Sandbox Telemetry (Google Search Console & GA4 Schema)',
      metricDefinition: 'Non-branded organic sessions to commercial category URLs and verified RFQ form completions.',
      caveats: 'Illustrative demonstration dataset only. Actual client outcomes depend on baseline domain authority, market competition, and implementation velocity.'
    },
    chartData: [
      { month: 'M1 (Baseline)', organicSessions: 1240, impressions: 28500, qualifiedLeads: 14 },
      { month: 'M2 (Crawl Fix)', organicSessions: 1480, impressions: 36200, qualifiedLeads: 18 },
      { month: 'M3 (Taxonomy)', organicSessions: 1890, impressions: 49800, qualifiedLeads: 25 },
      { month: 'M4 (On-Page)', organicSessions: 2410, impressions: 64100, qualifiedLeads: 31 },
      { month: 'M5 (Internal Links)', organicSessions: 2950, impressions: 79400, qualifiedLeads: 39 },
      { month: 'M6 (Review)', organicSessions: 3480, impressions: 94200, qualifiedLeads: 46 }
    ],
    relatedServices: ['technical-seo', 'ecommerce-seo', 'on-page-seo']
  },
  {
    id: 'cs-2',
    slug: 'regional-b2b-service-lead-architecture',
    title: 'Multi-Location Search & Consultation Funnel Architecture',
    clientLabel: 'Illustrative Benchmark Architecture (Client Portfolio Verification Pending)',
    industry: 'Professional & Healthcare Services',
    duration: '4-Month Reference Model',
    isIllustrativeDemo: true,
    verificationNotice: 'TRANSPARENCY NOTICE: This entry is a clearly labeled demonstration model illustrating how Mehula ADMediaTek documents regional search engagements without fabricating unapproved client records.',
    startingConditions: 'Single omnibus "Our Services" page attempting to target 8 distinct practice areas across Ahmedabad and Gandhinagar.',
    auditFindings: [
      'No dedicated URLs for core commercial specialties.',
      'Unclaimed and inconsistent regional directory citations.',
      'Contact form lacked service-line routing and conversion event tracking.'
    ],
    strategyImplemented: [
      'Split omnibus page into 8 dedicated service URLs with unique H1s, deliverables, and FAQs.',
      'Standardized LocalBusiness schema and UTM-tagged regional profile links.',
      'Integrated server-validated consultation intake with CRM status pipeline.'
    ],
    resultsSummary: 'Demonstrates how separating distinct search intents into dedicated indexable URLs expands non-branded impression share.',
    methodology: {
      reportingPeriod: 'Months 1–4 (Simulation Baseline)',
      comparisonPeriod: 'Initial Single-Page Baseline',
      dataSource: 'Illustrative Sandbox Telemetry',
      metricDefinition: 'Organic search impressions and consultation form submissions across dedicated service URLs.',
      caveats: 'Illustrative demonstration dataset only. Replaceable via the CMS once verified client authorization is uploaded.'
    },
    chartData: [
      { month: 'M1', organicSessions: 620, impressions: 11200, qualifiedLeads: 8 },
      { month: 'M2', organicSessions: 890, impressions: 19400, qualifiedLeads: 13 },
      { month: 'M3', organicSessions: 1310, impressions: 31800, qualifiedLeads: 21 },
      { month: 'M4', organicSessions: 1740, impressions: 44600, qualifiedLeads: 29 }
    ],
    relatedServices: ['local-seo', 'keyword-research', 'on-page-seo']
  }
];

export interface BlogPostRecord {
  id: string;
  title: string;
  slug: string;
  previousSlugs: string[];
  category: string;
  categorySlug: string;
  authorName: string;
  authorRole: string;
  status: 'published' | 'draft';
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  featuredImageAlt: string;
  toc: string[];
  bodySections: { heading: string; paragraphs: string[] }[];
  relatedServices: string[];
}

export const INITIAL_ARTICLES: BlogPostRecord[] = [
  {
    id: 'art-1',
    title: 'Technical SEO Audit Checklist for Modern B2B & SaaS Websites',
    slug: 'technical-seo-audit-checklist-b2b-saas',
    previousSlugs: ['old-technical-seo-checklist'],
    category: 'Technical SEO',
    categorySlug: 'technical-seo',
    authorName: 'Mehula ADMediaTek Editorial Team',
    authorRole: 'Technical SEO Practice',
    status: 'published',
    publishedAt: '2026-10-15',
    updatedAt: '2026-11-01',
    readingTimeMinutes: 7,
    excerpt: 'A structured engineering guide to evaluating HTTP status codes, canonical alignment, SSRF-safe crawling, XML sitemaps, and JavaScript rendering for B2B websites.',
    seoTitle: 'Technical SEO Audit Checklist for B2B & SaaS Websites | Mehula ADMediaTek',
    seoDescription: 'Learn how to audit crawlability, canonical tags, structured data, and Core Web Vitals on modern B2B and SaaS websites without guesswork.',
    canonicalUrl: '/blog/technical-seo-audit-checklist-b2b-saas/',
    featuredImageAlt: 'Diagram of HTTP crawl status, canonical tags, and structured data validation',
    toc: [
      '1. Verify Indexability & Canonical Directives',
      '2. Audit XML Sitemaps & Robots.txt Governance',
      '3. Inspect Server HTML vs. Client-Rendered DOM',
      '4. Validate Schema.org JSON-LD Without Fabrication'
    ],
    bodySections: [
      {
        heading: '1. Verify Indexability & Canonical Directives',
        paragraphs: [
          'Every indexable commercial page requires a deterministic, self-referencing canonical URL and an unambiguous 200 OK HTTP status code. When query parameters for tracking or sorting generate multiple URLs serving identical content, search engines split crawl equity unless canonical tags and parameter handling are explicitly configured.',
          'Before evaluating keyword density or backlinks, inspect the raw HTTP response headers and <head> tags to confirm that x-robots-tag and meta robots directives are not inadvertently blocking priority pages.'
        ]
      },
      {
        heading: '2. Audit XML Sitemaps & Robots.txt Governance',
        paragraphs: [
          'An XML sitemap should function as a curated manifest of canonical, 200-OK, indexable URLs—never a dump of every route in your router. Exclude authentication screens, private SaaS dashboards, internal API routes, draft articles, and non-canonical redirect URLs.',
          'Remember that robots.txt controls crawling, not indexing or security authorization. Always protect administrative and CRM routes with server-side authentication and role-based access control.'
        ]
      },
      {
        heading: '3. Inspect Server HTML vs. Client-Rendered DOM',
        paragraphs: [
          'Single-page applications and modern hybrid frameworks must ensure that titles, meta descriptions, canonical links, primary H1 headings, and core internal navigation links are consistently accessible and updated per route.',
          'Avoid lazy-loading your primary above-the-fold Largest Contentful Paint (LCP) element, and always declare explicit width and height attributes or aspect-ratio containers to keep Cumulative Layout Shift (CLS) below 0.1.'
        ]
      },
      {
        heading: '4. Validate Schema.org JSON-LD Without Fabrication',
        paragraphs: [
          'Structured data helps search engines disambiguate Organization details, Services, BlogPostings, and BreadcrumbLists. However, injecting fake AggregateRating markup or unverified review counts violates search engine guidelines and risks manual actions.',
          'Only populate JSON-LD fields that match visible, verified on-page content.'
        ]
      }
    ],
    relatedServices: ['technical-seo', 'on-page-seo']
  },
  {
    id: 'art-2',
    title: 'How to Map Commercial Search Intent Across Multi-Service B2B Funnels',
    slug: 'commercial-search-intent-mapping-b2b',
    previousSlugs: [],
    category: 'Keyword Strategy',
    categorySlug: 'keyword-strategy',
    authorName: 'Mehula ADMediaTek Editorial Team',
    authorRole: 'Search Strategy Practice',
    status: 'published',
    publishedAt: '2026-10-22',
    updatedAt: '2026-10-28',
    readingTimeMinutes: 6,
    excerpt: 'Why high search volume often produces low B2B conversion rates, and how to separate commercial solution queries from top-of-funnel research.',
    seoTitle: 'Commercial Search Intent Mapping for B2B Funnels | Mehula ADMediaTek',
    seoDescription: 'Structure your B2B service pages, industry verticals, and resource hubs to eliminate keyword cannibalization and capture qualified pipeline.',
    canonicalUrl: '/blog/commercial-search-intent-mapping-b2b/',
    featuredImageAlt: 'Matrix aligning search intent stages to dedicated service and industry landing pages',
    toc: [
      '1. The B2B Volume Trap',
      '2. One Canonical URL Per Intent Cluster',
      '3. Connecting Informational Guides to Service Pages'
    ],
    bodySections: [
      {
        heading: '1. The B2B Volume Trap',
        paragraphs: [
          'In B2B markets, broad head terms with tens of thousands of monthly searches are predominantly informational. Decision-makers evaluating an agency or enterprise software platform typically search with specific technical, industry, or regional modifiers.',
          'Evaluating keywords solely by search volume leads teams to publish generic definitions rather than high-converting service and industry pages.'
        ]
      },
      {
        heading: '2. One Canonical URL Per Intent Cluster',
        paragraphs: [
          'Keyword cannibalization happens when multiple service pages and blog articles target the exact same commercial query. Assign a single canonical URL to own each primary intent cluster, and use supporting articles to address narrow technical sub-questions.'
        ]
      },
      {
        heading: '3. Connecting Informational Guides to Service Pages',
        paragraphs: [
          'Every educational article should include natural, descriptive internal links to the corresponding core service page and an interactive diagnostic option—such as an automated technical SEO audit—so interested readers have an immediate next step.'
        ]
      }
    ],
    relatedServices: ['keyword-research', 'national-seo', 'content-marketing']
  },
  {
    id: 'art-3',
    title: 'Local SEO Architecture for Regional Enterprises in Ahmedabad & Gujarat',
    slug: 'local-seo-architecture-regional-enterprises',
    previousSlugs: [],
    category: 'Local SEO',
    categorySlug: 'local-seo',
    authorName: 'Mehula ADMediaTek Editorial Team',
    authorRole: 'Regional Search Practice',
    status: 'published',
    publishedAt: '2026-10-29',
    updatedAt: '2026-11-01',
    readingTimeMinutes: 5,
    excerpt: 'Practical standards for multi-branch citation hygiene, regional landing page differentiation, and LocalBusiness schema compliance.',
    seoTitle: 'Local SEO Architecture for Regional B2B Enterprises | Mehula ADMediaTek',
    seoDescription: 'Build durable regional search visibility across Ahmedabad and multi-city operations using verified entity signals and structured location pages.',
    canonicalUrl: '/blog/local-seo-architecture-regional-enterprises/',
    featuredImageAlt: 'Regional search visibility framework showing location pages and entity verification',
    toc: [
      '1. Entity Consistency & Verified Location Data',
      '2. Avoiding Doorway Page Penalties on City Pages',
      '3. Measuring Calls and Consultation Requests'
    ],
    bodySections: [
      {
        heading: '1. Entity Consistency & Verified Location Data',
        paragraphs: [
          'Search engines cross-reference your organization name, address, telephone number, and primary category across your website footer, Contact page, LocalBusiness JSON-LD, and official business profiles.',
          'Never publish placeholder addresses or unverified telephone numbers; wait until physical office details are confirmed so every citation matches 100%.'
        ]
      },
      {
        heading: '2. Avoiding Doorway Page Penalties on City Pages',
        paragraphs: [
          'Swapping only the city name across twenty identical landing pages violates search engine doorway page policies. Only create dedicated regional or industry pages when you can provide genuinely distinct context, service scope, and local relevance.'
        ]
      },
      {
        heading: '3. Measuring Calls and Consultation Requests',
        paragraphs: [
          'Tag regional profile links with structured UTM parameters so traffic and lead submissions from map listings are separated from standard organic search sessions in your analytics reports.'
        ]
      }
    ],
    relatedServices: ['local-seo', 'on-page-seo']
  }
];

export const HOMEPAGE_FAQS = [
  {
    q: 'What is included in the Mehula ADMediaTek SaaS platform vs. agency retainers?',
    a: 'Our platform combines self-serve SaaS capabilities—including automated single-page technical SEO audits, keyword tracking, and subscription billing—with full-service B2B SEO agency retainers for technical engineering, content production, and authority building.'
  },
  {
    q: 'How long does SEO take to produce measurable business outcomes?',
    a: 'Technical indexation fixes and on-page metadata improvements typically show measurable Search Console impression and click-through changes within 4 to 8 weeks. Competitive commercial keyword growth and sustained lead pipeline expansion generally compound over 4 to 9 months. We never guarantee overnight rankings.'
  },
  {
    q: 'How is the Free SEO Audit score calculated?',
    a: 'Our automated audit tool inspects real HTTP response headers, HTTPS encryption, title and meta description lengths, H1 hierarchy, canonical tags, robots directives, image alt coverage, structured data presence, and internal links on the submitted URL. The score (0–100) is a weighted calculation of passed (100%), warning (50%), and failed (0%) checks. It is a diagnostic indicator, not an official Google ranking score.'
  },
  {
    q: 'Do you fabricate case studies or guarantee #1 Google rankings?',
    a: 'Never. No ethical SEO provider can guarantee a #1 ranking on Google. Furthermore, we strictly prohibit fabricated testimonials, invented client logos, or unverified revenue claims. Any demonstration charts in our platform are explicitly labeled as illustrative until populated with authorized client telemetry.'
  },
  {
    q: 'Can our marketing team manage blog articles, SEO metadata, and 301 redirects without a developer?',
    a: 'Yes. Our built-in CMS with Role-Based Access Control (Author, Editor, Administrator) lets your team draft and publish articles, customize SEO titles, meta descriptions, and canonical URLs, and automatically register 301 redirects whenever an article slug changes.'
  },
  {
    q: 'How do subscription tiers and automated billing work?',
    a: 'You can start on the Free Audit Sandbox tier and upgrade to Local & Emerging ($149/mo), Growth B2B Suite ($399/mo), or Enterprise & Retainer ($999/mo) on monthly or annual billing cycles (with 20% annual savings). Plan changes calculate prorated amounts and generate downloadable invoices immediately inside your User Dashboard.'
  }
];
