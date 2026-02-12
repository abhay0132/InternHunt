import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

puppeteer.use(StealthPlugin());

const scrapeIndeed = async () => {
  const browser = await puppeteer.launch({ headless: false }); // set true for production
  const page = await browser.newPage();

  const url = "https://in.indeed.com/jobs?q=software+developer+intern&l=Delhi";
  console.log(`📄 Opening ${url}`);
  await page.goto(url, { waitUntil: "networkidle2" });

  // Wait for job cards
  await page.waitForSelector("a.tapItem, a.jcs-JobTitle", { timeout: 10000 });

  // Extract job links (first 5 for test)
  const jobLinks = await page.$$eval("a.tapItem, a.jcs-JobTitle", (els) =>
    els.slice(0, 5).map((a) =>
      a.href.startsWith("http")
        ? a.href
        : `https://in.indeed.com${a.getAttribute("href")}`
    )
  );

  console.log(`🔗 Found ${jobLinks.length} jobs`);
  const detailPage = await browser.newPage();
  const results = [];

  for (const link of jobLinks) {
    try {
      console.log(`➡️ Opening ${link}`);
      await detailPage.goto(link, { waitUntil: "networkidle2", timeout: 0 });

      const job = await detailPage.evaluate(() => {
        const getText = (sel) => {
          const el = document.querySelector(sel);
          return el ? el.innerText.trim() : null;
        };
        const getHref = (sel) => {
          const el = document.querySelector(sel);
          return el ? el.href : null;
        };

        // Collect metadata (job type, schedule, etc.)
        const metadata = Array.from(
          document.querySelectorAll("div.jobsearch-JobMetadataHeader-item")
        ).map((el) => el.innerText.trim());

        return {
          title:
            getText("h1.jobsearch-JobInfoHeader-title span") ||
            getText("h2 span"),
          company:
            getText("div[data-company-name]") ||
            getText("a[data-tn-element='companyName']"),
          companyLink:
            getHref("a[data-tn-element='companyName']") ||
            window.location.origin,
          location:
            getText("div.jobsearch-JobInfoHeader-subtitle div") || metadata[0],
          type:
            metadata.find((m) =>
              m.toLowerCase().includes("intern") ||
              m.toLowerCase().includes("full") ||
              m.toLowerCase().includes("part") ||
              m.toLowerCase().includes("contract")
            ) || null,
          stipend:
            getText("span.css-1oc7tea") ||
            getText("div.salary-snippet-container"),
          skills: Array.from(
            document.querySelectorAll(
              "span.js-match-insights-provider-18uwqyc.e1wnkr790"
            )
          ).map((s) => s.innerText.trim()),
          description:
            getText("div#jobDescriptionText") ||
            getText("div.jobsearch-JobComponent-description"),
          applyLink: window.location.href,
        };
      });

      job.id = uuidv4();
      job.source = "indeed";

      results.push(job);
      console.log(`✅ Scraped: ${job.title} @ ${job.company}`);

      await new Promise((r) => setTimeout(r, 1000)); // polite delay
    } catch (err) {
      console.error(`❌ Error scraping ${link}`, err);
    }
  }

  await detailPage.close();
  await browser.close();

  // Save to JSON
fs.writeFileSync(
  path.join(__dirname, "indeed_test.json"),
  JSON.stringify(results, null, 2)
);
  console.log("🎉 Saved details to data/indeed.json");
};

scrapeIndeed();
