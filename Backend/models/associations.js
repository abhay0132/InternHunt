// models/associations.js
const User = require("./userInfo");
const Internship = require("./internshipInfo");
const Application = require("./applicationInfo");
const Bookmark = require("./bookmarks");

// Applications
User.hasMany(Application, { foreignKey: "userId", onDelete: "CASCADE" });
Application.belongsTo(User, { foreignKey: "userId" });

Internship.hasMany(Application, { foreignKey: "internshipId", onDelete: "CASCADE" });
Application.belongsTo(Internship, { foreignKey: "internshipId" });

// Bookmarks
User.hasMany(Bookmark, { foreignKey: "userId", onDelete: "CASCADE" });
Bookmark.belongsTo(User, { foreignKey: "userId" });

Internship.hasMany(Bookmark, { foreignKey: "internshipId", onDelete: "CASCADE" });
Bookmark.belongsTo(Internship, { foreignKey: "internshipId" });

module.exports = { User, Internship, Application, Bookmark };