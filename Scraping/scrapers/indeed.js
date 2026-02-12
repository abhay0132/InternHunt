// Scraping/scrapers/indeed.js
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {
  delay,
  parseDeadline,
  extractSkills,
  normalizeType,
  formatStipend,
  retryWithBackoff,
  getRandomUserAgent,
} from '../utils/helpers.js';
import { config } from '../utils/config.js';

puppeteer.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scrapeIndeed = async () => {
  console.log('🟢 Starting Indeed scraper...');
  
  const browser = await puppeteer.launch(config.puppeteerOptions);
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());

  let results = [];
  let currentPage = 0;
  const maxJobs = config.maxJobsIndeed;

  try {
    while (results.length < maxJobs) {
      const url = `https://in.indeed.com/jobs?q=software+developer+intern&l=India&start=${currentPage * 10}`;
      console.log(`📄 [Indeed] Page ${currentPage + 1}: ${url}`);

      await retryWithBackoff(async () => {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      });

      await delay(config.pageDelay);

      // Check if we've reached the end
      const noResults = await page.$('.no_results_container, .no-jobs-container');
      if (noResults) {
        console.log('⚠️ No more results on Indeed');
        break;
      }

      // Wait for job listings
      try {
        await page.waitForSelector('a.jcs-JobTitle, .job_seen_beacon', { timeout: 10000 });
      } catch {
        console.log('⚠️ No job listings found on this page');
        break;
      }

      const jobLinks = await page.$$eval('a.jcs-JobTitle, h2.jobTitle a', (els) =>
        els.map((a) => {
          const href = a.getAttribute('href') || a.href;
          return href.startsWith('http') 
            ? href 
            : `https://in.indeed.com${href}`;
        }).filter(Boolean)
      );

      console.log(`🔗 Found ${jobLinks.length} jobs on page ${currentPage + 1}`);

      if (jobLinks.length === 0) break;

      const detailPage = await browser.newPage();
      await detailPage.setUserAgent(getRandomUserAgent());

      for (const link of jobLinks) {
        if (results.length >= maxJobs) break;

        try {
          await retryWithBackoff(async () => {
            await detailPage.goto(link, { waitUntil: 'networkidle2', timeout: 30000 });
          });

          const job = await detailPage.evaluate(() => {
            const getText = (sel) => document.querySelector(sel)?.innerText.trim() || null;

            return {
              title: getText('h1.jobsearch-JobInfoHeader-title span, h1.jobTitle'),
              company: getText('div[data-company-name], .jobsearch-InlineCompanyRating-companyHeader'),
              location: getText('div.jobsearch-JobInfoHeader-subtitle div, div.jobLocation'),
              stipend: getText('.salary-snippet-container, .metadata.salary-snippet-container'),
              description: getText('div#jobDescriptionText, .jobsearch-jobDescriptionText'),
              applyLink: window.location.href,
            };
          });

          if (!job.title || !job.company) {
            console.log(`⚠️ Skipping incomplete job data`);
            continue;
          }

          const skills = extractSkills(job.description || '');
          const type = normalizeType(job.description);

          results.push({
            id: uuidv4(),
            title: job.title,
            company: job.company,
            location: job.location,
            type,
            stipend: formatStipend(job.stipend),
            duration: null,
            description: job.description,
            applyLink: job.applyLink,
            skills,
            deadline: null, // Indeed doesn't show deadlines
            source: 'indeed',
          });

          console.log(`✅ Scraped: ${job.title} @ ${job.company}`);
          await delay(config.requestDelay);

        } catch (err) {
          console.error(`❌ Failed to scrape ${link}:`, err.message);
        }
      }

      await detailPage.close();
      currentPage++;
      await delay(config.pageDelay);
    }

    // Save to file
    const savePath = path.join(__dirname, '../data/indeed.json');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    fs.writeFileSync(savePath, JSON.stringify(results, null, 2));
    console.log(`✅ Indeed: Saved ${results.length} internships to ${savePath}`);

  } catch (error) {
    console.error('❌ Indeed scraper error:', error);
  } finally {
    await browser.close();
  }

  return results;
};

export default scrapeIndeed;