const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    proficiency: {
      type: String,
      enum: ['learning', 'familiar', 'expert'],
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate connections (a given person↔skill pair is unique).
connectionSchema.index({ personId: 1, skillId: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
