const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  hoten: { type: String, required: true },
  slug: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  gioitinh: { type: String },
  ngaysinh: { type: Date },
  sdt: { type: String },
  chucvu: { type: String },
  phongban_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Phongban' },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null }, // Default là null nếu không có role
  avatar: { type: String },
  password: { type: String },
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);


 
