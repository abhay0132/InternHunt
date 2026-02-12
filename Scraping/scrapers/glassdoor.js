// Scraping/scrapers/glassdoor.js
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {
  delay,
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

const scrapeGlassdoor = async () => {
  console.log('🟡 Starting Glassdoor scraper...');
  
  const browser = await puppeteer.launch(config.puppeteerOptions);
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());

  let results = [];
  let currentPage = 1;
  const maxJobs = config.maxJobsGlassdoor;

  try {
    while (results.length < maxJobs && currentPage <= 5) {
      const url = `https://www.glassdoor.co.in/Job/india-software-engineer-intern-jobs-SRCH_IL.0,5_IN115_KO6,30_IP${currentPage}.htm`;
      console.log(`📄 [Glassdoor] Page ${currentPage}: ${url}`);

      await retryWithBackoff(async () => {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      });

      await delay(config.pageDelay);

      // Wait for job cards
      try {
        await page.waitForSelector('a.JobCard_jobTitle__GLfKQ, li.JobsList_jobListItem__JBBUV', { 
          timeout: 10000 
        });
      } catch {
        console.log('⚠️ No job listings found on Glassdoor page');
        break;
      }

      const jobLinks = await page.$$eval(
        'a.JobCard_jobTitle__GLfKQ, a[data-test="job-link"]',
        (els) => els.map((a) => a.href).filter(Boolean)
      );

      console.log(`🔗 Found ${jobLinks.length} jobs on page ${currentPage}`);

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
              title: getText('h1[data-test="job-title"], h1.heading_Level1__soLWh'),
              company: getText('[data-test="employer-name"], h4.heading_Subhead__e_8wJ'),
              location: getText('[data-test="location"], .JobDetails_location__mSg5h'),
              stipend: getText('.salary-estimate, [data-test="detailSalary"]'),
              description: getText('[data-test="jobDescriptionContent"], .JobDetails_jobDescription__6VeBn'),
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
            deadline: null,
            source: 'glassdoor',
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
    const savePath = path.join(__dirname, '../data/glassdoor.json');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    fs.writeFileSync(savePath, JSON.stringify(results, null, 2));
    console.log(`✅ Glassdoor: Saved ${results.length} internships to ${savePath}`);

  } catch (error) {
    console.error('❌ Glassdoor scraper error:', error);
  } finally {
    await browser.close();
  }

  return results;
};

export default scrapeGlassdoor;