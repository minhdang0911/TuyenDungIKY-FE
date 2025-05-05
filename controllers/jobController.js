
const Job = require('../Models/Job');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const moment = require('moment');

const uploadMultiple = upload.array('hinhanh', 5); // Giới hạn upload tối đa 5 ảnh

// Upload multiple images lên Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'tuyen_dung',
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

// Tạo công việc mới
exports.createJob = async (req, res) => {
  try {
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          status: 'error',
          message: 'Lỗi khi upload ảnh',
        });
      }

      // Destructure các trường từ req.body và thêm salaryType
      let { title, description, minSalary, maxSalary, location, deadline, time, salaryType } = req.body;

      // Nếu lương là "thỏa thuận", đặt minSalary và maxSalary là ''
      if (salaryType === 'negotiable') {
        minSalary = '';
        maxSalary = '';
      }

      const hinhanhUrls = req.files ? await uploadMultipleToCloudinary(req.files) : [];
      
      if (deadline) {
        const parsedDate = moment(deadline, 'DD-MM-YYYY', true);
        if (parsedDate.isValid()) {
          deadline = parsedDate.toDate();
        } else {
          return res.status(400).json({ error: 'deadline không hợp lệ' });
        }
      }

      // Tạo đối tượng Job và lưu vào DB
      const job = new Job({
        title, description, minSalary, maxSalary, location, deadline, hinhanh: hinhanhUrls, time, salaryType
      });

      await job.save();

      // Phản hồi thành công
      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Job đã được tạo thành công',
        data: job
      });
    });
  } catch (err) {
    console.error('Error in createJob:', err);
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};



  


// controllers/jobController.js
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    
    // Nếu không có công việc, trả về mảng rỗng
    if (!jobs || jobs.length === 0) {
      return res.status(200).json({
        success: true,
        data: [], // Trả về mảng rỗng nếu không có công việc
      });
    }

    res.status(200).json({ code: 200, success: true, data: jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

  
  // controllers/jobController.js
  exports.getJobById = async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res.status(200).json({
          success: true,
          data: null,  
        });
      }
      res.status(200).json({ code: 200, success: true, data: job });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
  

  exports.updateJob = async (req, res) => {
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
            let { title, description, minSalary, maxSalary, location, deadline, time, removedImages = '[]' } = req.body;

            const removed = JSON.parse(removedImages);
            const JobOld = await Job.findById(id);
            if (!JobOld) {
                return res.status(404).json({
                    code: 404,
                    status: 'error',
                    message: 'Không tìm thấy Job để cập nhật',
                });
            }

            // ✨ Format lại deadline
            if (deadline) {
                const parsedDate = moment(deadline, 'DD-MM-YYYY', true);
                if (parsedDate.isValid()) {
                    deadline = parsedDate.toDate();
                } else {
                    return res.status(400).json({ error: 'deadline không hợp lệ' });
                }
            }

            // Kiểm tra salaryType dựa trên minSalary và maxSalary
            let salaryType = 'negotiable'; // Mặc định là 'negotiable'

            if (minSalary || maxSalary) {
                salaryType = 'fix'; // Nếu có minSalary hoặc maxSalary, thì sẽ là 'fix'
            }

            // Lọc ảnh cũ giữ lại (trừ những ảnh bị xóa)
            const oldImages = JobOld.hinhanh.filter(img => !removed.includes(img));
            // Upload ảnh mới (nếu có)
            const newImages = req.files ? await uploadMultipleToCloudinary(req.files) : [];

            const updated = await Job.findByIdAndUpdate(id, {
                title,
                description,
                minSalary: salaryType === 'fix' ? minSalary : null, // Chỉ cập nhật minSalary khi salaryType là 'fix'
                maxSalary: salaryType === 'fix' ? maxSalary : null, // Chỉ cập nhật maxSalary khi salaryType là 'fix'
                location,
                deadline,
                time,
                hinhanh: [...oldImages, ...newImages],
                salaryType,  // Thêm salaryType vào phần cập nhật
            }, { new: true });

            res.status(200).json({
                code: 200,
                status: 'success',
                message: 'Cập nhật Job thành công',
                data: updated,
            });
        });
    } catch (err) {
        console.error('Error in updateJob:', err);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: err.message,
        });
    }
};


  
  

  

  // controllers/jobController.js
exports.deleteJob = async (req, res) => {
    try {
      const deletedJob = await Job.findByIdAndDelete(req.params.id);
      if (!deletedJob) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
      res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  