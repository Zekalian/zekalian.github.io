import { useEffect } from 'react';

interface PageSEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export function usePageSEO({ title, description, image, type = 'website' }: PageSEOProps) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — Zekalian Agency`
      : 'Zekalian — Authentic Branding & Media Creative Production';

    const defaultDesc =
      'Partner kreatif terpercaya dalam merumuskan identitas merek berkarakter, memproduksi video komersial sinematik, dan mengawal pertumbuhan visual bisnis Anda.';
    const finalDesc = description || defaultDesc;

    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const updateMeta = (selector: string, attr: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [attrName, attrVal] = selector.replace(/[\[\]"]/g, '').split('=');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    updateMeta('meta[name="description"]', 'content', finalDesc);
    updateMeta('meta[property="og:title"]', 'content', fullTitle);
    updateMeta('meta[property="og:description"]', 'content', finalDesc);
    updateMeta('meta[property="og:type"]', 'content', type);
    updateMeta('meta[name="twitter:title"]', 'content', fullTitle);
    updateMeta('meta[name="twitter:description"]', 'content', finalDesc);

    if (image) {
      updateMeta('meta[property="og:image"]', 'content', image);
      updateMeta('meta[name="twitter:image"]', 'content', image);
    }
  }, [title, description, image, type]);
}
