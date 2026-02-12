// models/bookmarks.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../Connection/connectDB");

const Bookmark = sequelize.define(
  "Bookmark",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    internshipId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "internship_id",
    },
  },
  {
    tableName: "bookmarks",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Bookmark;