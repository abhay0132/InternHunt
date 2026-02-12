// seed.js
const { v4: uuidv4 } = require("uuid");
const sequelize = require("./Connection/connectDB");
const { User, Internship, Application, Bookmark } = require("./models/associations");

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to DB");

    // Recreate tables fresh
    await sequelize.sync({ force: true });
    console.log("✅ All tables dropped and recreated");

    // Create a user
    const user = await User.create({
      id: uuidv4(),
      name: "Test User",
      email: "test@example.com",
      password: "hashed_password_here", // replace with bcrypt.hash if needed
      age: 22,
      contact: "9876543210",
      sex: "Male",
    });

    // Create internships
    const internship1 = await Internship.create({
      id: uuidv4(),
      title: "Backend Developer Intern",
      company: "Google",
      location: "Remote",
      type: "Remote",
      stipend: "1000 USD",
      duration: "3 months",
      description: "Work on backend services with Node.js",
      applyLink: "https://careers.google.com/apply",
      skills: ["Node.js", "Postgres"],
      deadline: new Date("2025-12-31"),
    });

    const internship2 = await Internship.create({
      id: uuidv4(),
      title: "Frontend Intern",
      company: "Microsoft",
      location: "Bangalore",
      type: "Onsite",
      stipend: "20,000 INR",
      duration: "6 months",
      description: "React + Next.js UI projects",
      applyLink: "https://careers.microsoft.com/apply",
      skills: ["React", "CSS", "Next.js"],
      deadline: new Date("2025-11-30"),
    });

    // Create an application (user applied to internship1)
    await Application.create({
      id: uuidv4(),
      userId: user.id,
      internshipId: internship1.id,
    });

    // Create a bookmark (user bookmarked internship2)
    await Bookmark.create({
      id: uuidv4(),
      userId: user.id,
      internshipId: internship2.id,
    });

    console.log("✅ Seed data inserted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
