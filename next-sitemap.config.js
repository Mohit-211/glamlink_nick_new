/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://glamlink.net',
  generateRobotsTxt: true, // Generate robots.txt along with sitemap
  generateIndexSitemap: false, // Set to true if you expect > 50,000 URLs
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  
  // Exclude private/admin routes from sitemap
  exclude: [
    '/admin',
    '/admin/*',
    '/profile',
    '/profile/*',
    '/api/*',
    '/login',
    '/signup',
    '/_next/*',
    '/static/*',
    '/404',
    '/500',
    '/content-settings', // Admin functionality
    '/magazine/editor', // Editor-only page
    '/magazine/editor/*',
  ],
  
  // Custom transform function to set priorities for different pages
  transform: async (config, path) => {
    // Set custom priority for important pages
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    // Magazine pages - important for content
    if (path.startsWith('/magazine')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    // Marketing pages
    if (path === '/for-clients' || path === '/for-professionals'||path==="/journal") {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    
    // FAQ page
    if (path === '/faqs') {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    // Default transformation
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
  
  // Additional paths to include (if you have any API-generated pages)
  additionalPaths: async (config) => {
    const result = [];
    
    // You can add dynamic pages here if needed
    // For example, if you want to add specific magazine issues:
    // const issues = await getMagazineIssues();
    // issues.forEach(issue => {
    //   result.push({
    //     loc: `/magazine/${issue.id}`,
    //     changefreq: 'weekly',
    //     priority: 0.8,
    //   });
    // });
    
    return result;
  },
  
  // Robots.txt options
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile/',
          '/login',
          '/signup',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      // Block bad bots
      {
        userAgent: 'AhrefsBot',
        disallow: '/',
      },
      {
        userAgent: 'SemrushBot',
        disallow: '/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
    ],
    // Additional sitemap URLs (if you have multiple sitemaps)
    additionalSitemaps: [
      // 'https://glamlink.net/sitemap-0.xml', // Generated automatically
    ],
  },
};