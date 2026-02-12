// models/applicationInfo.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../Connection/connectDB");

const Application = sequelize.define(
  "Application",
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
    status: {
      type: DataTypes.ENUM("pending", "applied", "not_applied"),
      defaultValue: "pending",
      allowNull: false,
    },
    appliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "applied_at",
    },
  },
  {
    tableName: "applications",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Application;