
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

      let { title,description,minSalary,maxSalary,location,deadline,time} = req.body;

      const hinhanhUrls = req.files ? await uploadMultipleToCloudinary(req.files) : [];
       if (deadline) {
              const parsedDate = moment(deadline, 'DD-MM-YYYY', true);
              if (parsedDate.isValid()) {
                deadline = parsedDate.toDate();
              } else {
                return res.status(400).json({ error: 'deadline không hợp lệ' });
              }
            }

      const job = new Job({
        title,description,minSalary,maxSalary,location,deadline,hinhanh:hinhanhUrls,time
      });

      await job.save();

      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'JOb đã được tạo thành công',
        data: job
      });
    });
  } catch (err) {
    console.error('Error in creatẹob:', err);
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
      res.status(200).json({code:200, success: true, data: jobs });
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
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
      res.status(200).json({code:200, success: true, data: job });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  

  // controllers/jobController.js
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
  
        // Lọc ảnh cũ giữ lại (trừ những ảnh bị xóa)
        const oldImages = JobOld.hinhanh.filter(img => !removed.includes(img));
        // Upload ảnh mới (nếu có)
        const newImages = req.files ? await uploadMultipleToCloudinary(req.files) : [];
  
        const updated = await Job.findByIdAndUpdate(id, {
          title,
          description,
          minSalary,
          maxSalary,
          location,
          deadline,
          time,
          hinhanh: [...oldImages, ...newImages],
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
  