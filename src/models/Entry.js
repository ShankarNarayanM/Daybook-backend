const { Schema, model } = require('mongoose');
const num = { type: Number, min: 0 };
const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD
  steps: num, walkKm: num, meditationMins: num, yogaMins: num, screenHrs: num,
  finance: num, readingMins: num, hobbyMins: num,
  readingType: { type: String, enum: ['subject', 'story'] },
  hobbyName: { type: String, maxlength: 80 },
  learningWhat: { type: String, maxlength: 300 },
  medMorning: Number, medNight: Number, skinMorning: Number, skinNight: Number,
  showerBath: Number, showerHair: Number, period: Number, cheatMeal: Number,
  junkFood: Number, reducedSugar: Number, journaling: Number, friendConnect: Number
}, { timestamps: true });
schema.index({ user: 1, date: 1 }, { unique: true });
module.exports = model('Entry', schema);
