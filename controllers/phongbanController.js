const Phongban = require('../Models/Phongban');

// Tạo phòng ban mới
const createPhongban = async (req, res) => {
  try {
    const { maphong, tenphong, mota } = req.body;
    const phongban = new Phongban({ maphong, tenphong, mota });
    await phongban.save();
    res.status(201).json({
      code: 201,
      status: 'success',
      message: 'Tạo phòng ban thành công',
      data: phongban,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

// Lấy tất cả phòng ban
const getAllPhongban = async (req, res) => {
  try {
    const phongbans = await Phongban.find();

    // Nếu không có dữ liệu, trả về mảng rỗng thay vì lỗi
    if (!phongbans || phongbans.length === 0) {
      return res.status(200).json({
        code: 200,
        status: 'success',
        data: [], // Trả về mảng rỗng nếu không có phòng ban nào
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      data: phongbans,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

// Lấy phòng ban theo ID
const getPhongbanById = async (req, res) => {
  try {
    const phongban = await Phongban.findById(req.params.id);

    // Kiểm tra nếu không có phòng ban, trả về mảng rỗng thay vì lỗi
    if (!phongban) {
      return res.status(200).json({
        code: 200,
        status: 'success',
        data: [], // Trả về mảng rỗng nếu không có phòng ban
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      data: phongban,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

// Cập nhật phòng ban
const updatePhongban = async (req, res) => {
  try {
    const { maphong, tenphong, mota } = req.body;
    const phongban = await Phongban.findByIdAndUpdate(
      req.params.id,
      { maphong, tenphong, mota },
      { new: true }
    );
    if (!phongban) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Không tìm thấy phòng ban',
      });
    }
    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Cập nhật thành công',
      data: phongban,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

// Xóa phòng ban
const deletePhongban = async (req, res) => {
  try {
    const phongban = await Phongban.findByIdAndDelete(req.params.id);
    if (!phongban) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Không tìm thấy phòng ban',
      });
    }
    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Xóa phòng ban thành công',
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

module.exports = {
  createPhongban,
  getAllPhongban,
  getPhongbanById,
  updatePhongban,
  deletePhongban,
};
