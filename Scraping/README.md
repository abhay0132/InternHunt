# InternHunt Scraper

Automated web scraper for aggregating internship listings from multiple sources.

## Features

- ✅ Scrapes Internshala, Indeed, and Glassdoor
- ✅ Extracts skills from job descriptions
- ✅ Filters expired internships automatically
- ✅ Saves to PostgreSQL database
- ✅ Retry logic with exponential backoff
- ✅ Stealth mode to avoid detection

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure `.env` with your database credentials

3. Run scraper:
```bash
npm run scrape        # Scrape all sources
npm run save          # Save to database
npm run scrape:all    # Scrape + Save
```

## Individual Scrapers
```bash
npm run scrape:internshala
npm run scrape:indeed
npm run scrape:glassdoor
```

## Data Output

- JSON files saved to `/data/` directory
- Automatically imported to PostgreSQL database

## Scheduling

Use cron to run daily:
```bash
# Run at 2 AM every day
0 2 * * * cd /path/to/Scraping && npm run scrape:all
```

Or use GitHub Actions (see `.github/workflows/scrape.yml`)