const ThanhTich = require('../Models/ThanhTich');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

// Cấu hình multer để xử lý nhiều ảnh
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadMultiple = upload.array('hinhanh', 5); // Giới hạn upload tối đa 5 ảnh

// Upload multiple images lên Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'thanh_tich',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const uploadMultipleToCloudinary = async (files) => {
  const imageUrls = [];

  for (const file of files) {
    const result = await uploadToCloudinary(file.buffer);
    imageUrls.push(result.secure_url);
  }

  return imageUrls;
};

// CREATE ThanhTich
const createThanhTich = async (req, res) => {
  try {
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          status: 'error',
          message: 'Lỗi khi upload ảnh',
        });
      }

      const { nhanvien_id, ten, mota } = req.body;
      const hinhanhUrls = req.files ? await uploadMultipleToCloudinary(req.files) : [];

      const thanhTich = new ThanhTich({
        nhanvien_id,
        ten,
        mota,
        hinhanh: hinhanhUrls,
      });

      await thanhTich.save();

      res.status(201).json({
        code: 201,
        status: 'success',
        message: 'Thành tích đã được tạo thành công',
        data: thanhTich,
      });
    });
  } catch (err) {
    console.error('Error in createThanhTich:', err);
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

// GET all ThanhTich
const getAllThanhTich = async (req, res) => {
  try {
    const thanhTichs = await ThanhTich.find().populate('nhanvien_id','hoten');
    res.status(200).json({
      code: 200,
      status: 'success',
      data: thanhTichs,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

// UPDATE ThanhTich
const updateThanhTich = async (req, res) => {
  try {
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          status: 'error',
          message: 'Lỗi khi upload ảnh',
        });
      }

      const { id } = req.params;
      const { nhanvien_id, ten, mota, removedImages = '[]' } = req.body;
      const removed = JSON.parse(removedImages); // Danh sách URL ảnh bị xoá

      const thanhTichOld = await ThanhTich.findById(id);
      if (!thanhTichOld) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          message: 'Không tìm thấy thành tích để cập nhật',
        });
      }

      // Lọc ảnh cũ giữ lại (trừ những ảnh bị xóa)
      const oldImages = thanhTichOld.hinhanh.filter(img => !removed.includes(img));
      // Upload ảnh mới (nếu có)
      const newImages = req.files ? await uploadMultipleToCloudinary(req.files) : [];

      const updated = await ThanhTich.findByIdAndUpdate(id, {
        nhanvien_id,
        ten,
        mota,
        hinhanh: [...oldImages, ...newImages],
      }, { new: true });

      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Cập nhật thành tích thành công',
        data: updated,
      });
    });
  } catch (err) {
    console.error('Error in updateThanhTich:', err);
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};


// DELETE ThanhTich
const deleteThanhTich = async (req, res) => {
  try {
    const { id } = req.params;
    const thanhTich = await ThanhTich.findByIdAndDelete(id);

    if (!thanhTich) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Không tìm thấy thành tích để xóa',
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Xóa thành tích thành công',
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};


const getThanhTichById = async (req, res) => {
    try {
        const thanhTichList = await ThanhTich.find({ nhanvien_id: req.params.id });

        // In ra kết quả để kiểm tra
        console.log("Kết quả tìm kiếm thành tích: ", thanhTichList);

        if (thanhTichList.length === 0) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                message: 'Không tìm thấy thành tích cho nhân viên này.',
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



module.exports = {
  createThanhTich,
  getAllThanhTich,
  updateThanhTich,
  deleteThanhTich,
  getThanhTichById
};
