// Scraping/utils/config.js

export const config = {
  // Scraping limits
  maxPagesInternshala: parseInt(process.env.MAX_PAGES_INTERNSHALA) || 5,
  maxJobsIndeed: 150,
  maxJobsGlassdoor: 100,
  maxJobsLinkedIn: 100,

  // Delays (ms)
  pageDelay: 1000,
  requestDelay: 800,
  retryDelay: 2000,

  // Search queries
  queries: {
    internshala: [
      'software-development',
      'web-development',
      'data-science',
      'machine-learning',
      'ui-ux-design',
      'content-writing',
      'digital-marketing',
    ],
    indeed: [
      'software developer intern',
      'web developer intern',
      'data science intern',
      'machine learning intern',
    ],
    glassdoor: [
      'software engineer intern',
      'data analyst intern',
      'product management intern',
    ],
  },

  // Locations
  locations: {
    internshala: ['delhi', 'mumbai', 'bangalore', 'pune', 'hyderabad'],
    indeed: 'India',
    glassdoor: 'India',
  },

  // Puppeteer options
  puppeteerOptions: {
  headless: "new",
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1920x1080'
  ]
},
};