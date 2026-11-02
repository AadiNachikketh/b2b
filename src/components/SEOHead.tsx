import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  schemaType?: 'Organization' | 'Service' | 'BlogPosting' | 'WebApplication' | 'FAQPage';
  schemaData?: Record<string, unknown>;
  breadcrumbs?: { name: string; path: string }[];
}

export function SEOHead({
  title,
  description,
  canonicalPath,
  schemaType = 'Organization',
  schemaData = {},
  breadcrumbs = []
}: SEOHeadProps) {
  useEffect(() => {
    const cleanTitle = title.includes('Mehula ADMediaTek') ? title : `${title} | Mehula ADMediaTek`;
    document.title = cleanTitle;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mehula-admediatek.example.com';
    const fullCanonical = `${origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', cleanTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonical);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', cleanTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    let canonicalEl = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', fullCanonical);

    // Build validated JSON-LD graph
    const graph: Record<string, unknown>[] = [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: 'Mehula ADMediaTek',
        url: origin,
        description:
          'Enterprise B2B SEO agency and automated search intelligence SaaS platform based in Ahmedabad, India.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Ahmedabad',
          addressRegion: 'Gujarat',
          addressCountry: 'IN'
        }
      }
    ];

    if (schemaType !== 'Organization') {
      graph.push({
        '@type': schemaType,
        url: fullCanonical,
        name: cleanTitle,
        description,
        ...schemaData
      });
    }

    if (breadcrumbs.length > 0) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: `${origin}${b.path}`
        }))
      });
    }

    const jsonLdPayload = {
      '@context': 'https://schema.org',
      '@graph': graph
    };

    let scriptEl = document.head.querySelector('script[data-seo-jsonld="true"]') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.setAttribute('data-seo-jsonld', 'true');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLdPayload);
  }, [title, description, canonicalPath, schemaType, schemaData, breadcrumbs]);

  return null;
}

export function trackConversionEvent(eventName: string, path?: string) {
  const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/');
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventName, path: currentPath })
  }).catch(() => {});
}
