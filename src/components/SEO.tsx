import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
}

export function SEO({ title, description, image }: SEOProps) {
  const siteName = 'NcSound Publishing';
  const fullTitle = `${title} | ${siteName}`;
  const desc = description || 'Sync-first publishing platform. Non-exclusive admin, beat store, and AI-powered brief matching for independent producers.';
  const img = image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}
