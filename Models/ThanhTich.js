const mongoose = require('mongoose');

const thanhtichSchema = new mongoose.Schema({
  nhanvien_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ten: { type: String, required: true },
  mota: { type: String },
  hinhanh: { type: [String] },  // Sử dụng mảng để lưu trữ nhiều ảnh
}, { timestamps: true });  // Thêm timestamps để tự động tạo createdAt và updatedAt

module.exports = mongoose.model('ThanhTich', thanhtichSchema);
