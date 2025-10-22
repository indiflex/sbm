import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // const baseUrl = 'https://sbm.topician.com';
  const baseUrl = 'http://localhost:3000';
  console.log('🚀 ~ baseUrl:', baseUrl);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/my/', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/sign/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
