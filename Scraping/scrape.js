// Scraping/scrape.js
import scrapeInternshala from './scrapers/internshala.js';
import scrapeIndeed from './scrapers/indeed.js';
import scrapeGlassdoor from './scrapers/glassdoor.js';
import { connectDB, saveInternships, removeExpiredInternships } from './utils/dbHelper.js';

const runScraping = async () => {
  console.log('🚀 Starting InternHunt Scraper...\n');

  const startTime = Date.now();
  const allInternships = [];

  // Run scrapers in parallel for speed
  try {
    const results = [];

    results.push(await scrapeInternshala());
    results.push(await scrapeIndeed());
    results.push(await scrapeGlassdoor());


    results.forEach((result, index) => {
      const scraperName = ['Internshala', 'Indeed', 'Glassdoor'][index];

      if (result.status === 'fulfilled') {
        allInternships.push(...result.value);
        console.log(`✅ ${scraperName}: ${result.value.length} internships`);
      } else {
        console.error(`❌ ${scraperName} failed:`, result.reason);
      }
    });

    console.log(`\n📊 Total internships scraped: ${allInternships.length}`);

    // Save to database
    const dbConnected = await connectDB();
    if (dbConnected) {
      console.log('\n💾 Saving to database...');
      await saveInternships(allInternships);

      console.log('🗑️ Removing expired internships...');
      await removeExpiredInternships();
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Scraping completed in ${duration}s`);
    console.log(`📁 Data saved in /Scraping/data/`);

  } catch (error) {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  }

  process.exit(0);
};

runScraping();