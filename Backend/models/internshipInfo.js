// models/internshipInfo.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../Connection/connectDB");

const Internship = sequelize.define(
  "Internship",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    company: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: true },
    type: {
      type: DataTypes.ENUM("Remote", "Onsite", "Hybrid"),
      allowNull: false,
      defaultValue: "Remote",
    },
    stipend: { type: DataTypes.STRING, allowNull: true },
    duration: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    applyLink: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "apply_link",
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    deadline: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "internships",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Internship;