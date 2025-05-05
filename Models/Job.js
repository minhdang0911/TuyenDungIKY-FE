// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  description: { type: String, required: true }, 
  minSalary: { type: String },
  maxSalary: { type: String },
  salaryType: { type: String, enum: ['fixed', 'negotiable'], default: 'fixed' },  
  hinhanh: { type: [String] }, 
  time: { type: String, required: true }, 
  location: { type: String, required: true },  
  deadline: { type: Date, required: true },  
  createdAt: { type: Date, default: Date.now },  
  updatedAt: { type: Date, default: Date.now }, 


}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
