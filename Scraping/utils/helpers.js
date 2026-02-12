// Scraping/utils/helpers.js

export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Parse deadline from various formats
 */
export const parseDeadline = (deadline) => {
  if (!deadline) return null;

  // Remove extra text like "Apply by", "'", etc.
  const cleaned = deadline
    .replace(/apply by/gi, '')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Try direct parsing
  let parsed = new Date(cleaned);
  if (!isNaN(parsed) && parsed > new Date()) {
    return parsed;
  }

  // Try common formats
  const formats = [
    // "31 Dec 2025", "31 Dec'25"
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s']?(\d{2,4})/i,
    // "Dec 31, 2025"
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
  ];

  for (const format of formats) {
    const match = cleaned.match(format);
    if (match) {
      const dateStr = match[0];
      parsed = new Date(dateStr);
      if (!isNaN(parsed) && parsed > new Date()) {
        return parsed;
      }
    }
  }

  return null;
};

/**
 * Extract skills from description
 */
export const extractSkills = (text) => {
  if (!text) return [];

  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular',
    'Vue', 'Django', 'Flask', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
    'HTML', 'CSS', 'TypeScript', 'Git', 'Docker', 'Kubernetes', 'AWS',
    'Azure', 'GCP', 'Machine Learning', 'Deep Learning', 'TensorFlow',
    'PyTorch', 'Data Analysis', 'Excel', 'PowerBI', 'Tableau', 'Figma',
    'Photoshop', 'Illustrator', 'UI/UX', 'REST API', 'GraphQL', 'Redis',
    'Firebase', 'React Native', 'Flutter', 'Swift', 'Kotlin', 'Android',
    'iOS', 'Linux', 'Bash', 'CI/CD', 'Agile', 'Scrum', 'JIRA'
  ];

  const foundSkills = new Set();
  const lowerText = text.toLowerCase();
  const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

  for (const skill of commonSkills) {
  const escapedSkill = escapeRegex(skill.toLowerCase());
  const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
  if (regex.test(lowerText)) {
    foundSkills.add(skill);
  }
}

  return Array.from(foundSkills);
};

/**
 * Normalize internship type
 */
export const normalizeType = (type) => {
  if (!type) return 'Remote';
  
  const lower = type.toLowerCase();
  
  if (lower.includes('remote') || lower.includes('work from home') || lower.includes('wfh')) {
    return 'Remote';
  }
  if (lower.includes('hybrid')) {
    return 'Hybrid';
  }
  if (lower.includes('onsite') || lower.includes('office') || lower.includes('in-office')) {
    return 'Onsite';
  }
  
  return 'Remote'; // Default
};

/**
 * Clean and format stipend
 */
export const formatStipend = (stipend) => {
  if (!stipend) return null;
  
  // Remove extra spaces and normalize
  return stipend.trim().replace(/\s+/g, ' ');
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delayTime = initialDelay * Math.pow(2, i);
      console.log(`⚠️ Retry ${i + 1}/${maxRetries} after ${delayTime}ms...`);
      await delay(delayTime);
    }
  }
};

/**
 * Random user agent generator
 */
export const getRandomUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  ];
  
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};