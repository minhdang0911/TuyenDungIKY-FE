const Khenthuong = require('../Models/Khenthuong'); // Đảm bảo đường dẫn đúng
const User = require('../Models/User'); // Đảm bảo có mô hình User (nhân viên)
 const Phongban = require('../Models/Phongban');
// Tạo khen thưởng mới
const createKhenthuong = async (req, res) => {
  try {
    const { nhanvien_id, ten, lydo, sotien } = req.body;

    // Kiểm tra nếu nhân viên tồn tại
    const user = await User.findById(nhanvien_id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Nhân viên không tồn tại.',
      });
    }

    const newKhenthuong = new Khenthuong({
      nhanvien_id,
      ten,
      lydo,
      sotien,
    });

    await newKhenthuong.save();

    res.status(201).json({
      code: 201,
      status: 'success',
      message: 'Tạo khen thưởng thành công.',
      data: newKhenthuong,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};


const getKhenthuongs = async (req, res) => {
  try {
    const khenthuongs = await Khenthuong.find()
      .populate({
        path: 'nhanvien_id',
        select: 'hoten chucvu avatar phongban_id',
        populate: {
          path: 'phongban_id',
          select: 'tenphong'
        }
      });

    // Kiểm tra nếu không có dữ liệu, trả về mảng rỗng
    if (!khenthuongs || khenthuongs.length === 0) {
      return res.status(200).json({
        code: 200,
        status: 'success',
        data: [] // Trả về mảng rỗng khi không có dữ liệu
      });
    }

    // Lọc lại dữ liệu trả về
    const filteredData = khenthuongs.map(item => ({
      _id: item._id,
      nhanvien_id: item.nhanvien_id ? item.nhanvien_id._id : null, // Kiểm tra null/undefined
      hoten: item.nhanvien_id?.hoten || 'N/A',  // Dự phòng nếu không có dữ liệu
      chucvu: item.nhanvien_id?.chucvu || 'N/A', // Dự phòng nếu không có dữ liệu
      avatar: item.nhanvien_id?.avatar || '', // Dự phòng nếu không có avatar
      phongban_id: item.nhanvien_id?.phongban_id?._id || null, // Kiểm tra phongban_id
      tenphong: item.nhanvien_id?.phongban_id?.tenphong || 'Không có thông tin', // Kiểm tra tenphong
      ten: item.ten || 'Không có tên', // Dự phòng nếu không có tên
      lydo: item.lydo || 'Không có lý do', // Dự phòng nếu không có lý do
      sotien: item.sotien || 0, // Dự phòng nếu không có số tiền
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    res.status(200).json({
      code: 200,
      status: 'success',
      data: filteredData
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message
    });
  }
};


const getKhenthuongById = async (req, res) => {
  try {
    const thanhTichList = await Khenthuong.find({ nhanvien_id: req.params.id });

    // In ra kết quả để kiểm tra
    console.log("Kết quả tìm kiếm thành tích: ", thanhTichList);

    // Nếu không có kết quả, trả về mảng rỗng thay vì lỗi
    if (!thanhTichList || thanhTichList.length === 0) {
      return res.status(200).json({
        code: 200,
        status: 'success',
        data: [], // Trả về mảng rỗng nếu không tìm thấy thành tích
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      data: thanhTichList,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

  
  const updateKhenthuong = async (req, res) => {
    try {
      const { ten, lydo, sotien } = req.body;
  
      const khenthuong = await Khenthuong.findByIdAndUpdate(
        req.params.id,
        { ten, lydo, sotien },
        { new: true }
      );
  
      if (!khenthuong) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          message: 'Không tìm thấy khen thưởng.',
        });
      }
  
      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Cập nhật khen thưởng thành công.',
        data: khenthuong,
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        status: 'error',
        message: err.message,
      });
    }
  };
  const deleteKhenthuong = async (req, res) => {
    try {
      const khenthuong = await Khenthuong.findByIdAndDelete(req.params.id);
      if (!khenthuong) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          message: 'Không tìm thấy khen thưởng.',
        });
      }
  
      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Xóa khen thưởng thành công.',
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
  createKhenthuong,
  getKhenthuongs,
  getKhenthuongById,
  updateKhenthuong,
  deleteKhenthuong,
};