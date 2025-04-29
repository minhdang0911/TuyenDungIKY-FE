const mongoose = require('mongoose');

const khenthuongSchema = new mongoose.Schema(
  {
    nhanvien_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ten: { type: String, required: true },
    lydo: { type: String },
    sotien: { type: Number },
  },
  { timestamps: true } // Thêm dòng này để Mongoose tự động thêm createdAt và updatedAt
);

module.exports = mongoose.model('Khenthuong', khenthuongSchema);
