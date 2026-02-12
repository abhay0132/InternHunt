// Scraping/utils/dbHelper.js
import { fileURLToPath } from 'url';
import path from 'path';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'InternHunt',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Define Internship model (simplified for scraping)
const Internship = sequelize.define(
  'Internship',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    title: { type: Sequelize.STRING, allowNull: false },
    company: { type: Sequelize.STRING, allowNull: false },
    location: { type: Sequelize.STRING, allowNull: true },
    type: {
      type: Sequelize.ENUM('Remote', 'Onsite', 'Hybrid'),
      allowNull: false,
      defaultValue: 'Remote',
    },
    stipend: { type: Sequelize.STRING, allowNull: true },
    duration: { type: Sequelize.STRING, allowNull: true },
    description: { type: Sequelize.TEXT, allowNull: true },
    applyLink: { type: Sequelize.STRING, allowNull: true },
    skills: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true },
    deadline: { type: Sequelize.DATE, allowNull: true },
    source: { type: Sequelize.STRING, allowNull: true },
  },
  {
    tableName: 'internships',
    timestamps: true,
    underscored: true,
  }
);

export { sequelize, Internship };

/**
 * Connect to database
 */
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

/**
 * Save internships to database
 */
export const saveInternships = async (internships) => {
  try {
    // Filter invalid records
    const cleaned = internships.filter(i =>
      i.title &&
      i.company &&
      i.title.trim() !== "" &&
      i.company.trim() !== ""
    );

    console.log(`🧹 Filtered out ${internships.length - cleaned.length} invalid records`);

    const result = await Internship.bulkCreate(cleaned);

    console.log(`✅ Saved ${result.length} internships to database`);
    return result.length;
  } catch (error) {
    console.error('❌ Error saving to database:', error.message);
    return 0;
  }
};

/**
 * Remove expired internships
 */
export const removeExpiredInternships = async () => {
  try {
    const result = await Internship.destroy({
      where: {
        deadline: {
          [Sequelize.Op.lt]: new Date(),
        },
      },
    });
    
    console.log(`🗑️ Removed ${result} expired internships`);
    return result;
  } catch (error) {
    console.error('❌ Error removing expired internships:', error.message);
    return 0;
  }
};