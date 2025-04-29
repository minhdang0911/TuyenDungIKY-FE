const mongoose = require('mongoose');

const phongbanSchema = new mongoose.Schema({
  maphong: { type: String, required: true },
  tenphong: { type: String, required: true },
  mota: { type: String },
},{ timestamps: true });

module.exports = mongoose.model('Phongban', phongbanSchema);
