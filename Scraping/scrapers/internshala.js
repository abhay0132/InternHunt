// Scraping/scrapers/internshala.js
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

const scrapeInternshala = async () => {
  console.log('🔵 Starting Internshala scraper...');
  
  const browser = await puppeteer.launch(config.puppeteerOptions);
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());
  
  const allInternships = [];
  const maxPages = config.maxPagesInternshala;

  try {
    for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
      const url = `https://internshala.com/internships/page-${currentPage}/`;
      console.log(`📄 [Internshala] Page ${currentPage}/${maxPages}`);

      await retryWithBackoff(async () => {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      });

      await delay(config.pageDelay);

      // Extract internship links
      const internships = await page.evaluate(() => {
        const internshipElements = document.querySelectorAll('.individual_internship, .internship_meta');
        return Array.from(internshipElements).map((el) => {
          const titleEl = el.querySelector('.job-title-href, .profile a, h3 a');
          const title = titleEl?.innerText.trim() || null;
          const link = titleEl?.href || null;
          
          const company = el.querySelector('.company-name, .company h5, .company_name')?.innerText.trim() || null;
          const location = el.querySelector('.locations span, .location_link')?.innerText.trim() || null;
          const stipend = el.querySelector('.stipend')?.innerText.trim() || null;
          const duration = el.querySelector('.duration, .internship_duration')?.innerText.trim() || null;
          const type = el.querySelector('.dot.dot_1 span, .location_link')?.innerText.trim() || null;

          return { title, company, location, stipend, duration, type, applyLink: link };
        }).filter(item => item.title && item.applyLink);
      });

      console.log(`🔗 Found ${internships.length} internships on page ${currentPage}`);

      // Scrape details for each internship
      const detailPage = await browser.newPage();
      await detailPage.setUserAgent(getRandomUserAgent());

      for (const internship of internships) {
        try {
          await retryWithBackoff(async () => {
            await detailPage.goto(internship.applyLink, { 
              waitUntil: 'networkidle2', 
              timeout: 30000 
            });
          });

          const details = await detailPage.evaluate(() => {
            const getText = (sel) => document.querySelector(sel)?.innerText.trim() || null;
            
            return {
              description: getText('.internship_details .text-container, .internship_other_details_container'),
              deadline: getText('.apply_by span, .apply_by'),
            };
          });

          // Process internship data
          const skills = extractSkills(details.description || '');
          const deadline = parseDeadline(details.deadline);
          
          // Only add if deadline is in future or null
          if (!deadline || deadline > new Date()) {
            allInternships.push({
              id: uuidv4(),
              title: internship.title,
              company: internship.company,
              location: internship.location,
              type: normalizeType(internship.type || internship.location),
              stipend: formatStipend(internship.stipend),
              duration: internship.duration,
              description: details.description,
              applyLink: internship.applyLink,
              skills,
              deadline,
              source: 'internshala',
            });

            console.log(`✅ Scraped: ${internship.title} @ ${internship.company}`);
          } else {
            console.log(`⏰ Skipped expired: ${internship.title}`);
          }

          await delay(config.requestDelay);
        } catch (err) {
          console.error(`❌ Failed to scrape ${internship.title}:`, err.message);
        }
      }

      await detailPage.close();
      await delay(config.pageDelay);
    }

    // Save to file
    const savePath = path.join(__dirname, '../data/internshala.json');
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    fs.writeFileSync(savePath, JSON.stringify(allInternships, null, 2));
    console.log(`✅ Internshala: Saved ${allInternships.length} internships to ${savePath}`);

  } catch (error) {
    console.error('❌ Internshala scraper error:', error);
  } finally {
    await browser.close();
  }

  return allInternships;
};

export default scrapeInternshala;