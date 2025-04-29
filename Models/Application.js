// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // Liên kết tới Job
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Liên kết tới User (ứng viên)
  fullName: { type: String, required: true }, // Họ tên ứng viên
  email: { type: String, required: true }, // Email ứng viên
  phone: { type: String }, // Số điện thoại ứng viên
  birthday: { type: Date }, // Ngày sinh ứng viên
  expectedSalary: { type: String }, // Mức lương mong muốn
  resumeUrl: { type: String }, // Link đến CV (nếu có)
  status: { type: String, enum: ['pending', 'interview', 'review','accepted', 'rejected'], default: 'pending' }, // Trạng thái đơn ứng tuyển
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
