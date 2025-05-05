const Application = require('../Models/Application');
const Job = require('../Models/Job');
const User = require('../Models/User');  // Import User model
const cloudinary = require('cloudinary').v2;
const moment = require('moment');
const uploadSingle = require('../middleware/uploadMiddleware');
const streamifier = require('streamifier');

 
const uploadFileToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    // Xử lý tên file - loại bỏ ký tự đặc biệt và khoảng trắng
    const sanitizedName = originalname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
      .replace(/[^a-zA-Z0-9.]/g, '_')   // Thay thế ký tự đặc biệt bằng dấu gạch dưới
      .replace(/\s+/g, '_');            // Thay thế khoảng trắng bằng dấu gạch dưới
    
    const fileExt = sanitizedName.split('.').pop().toLowerCase();
    const fileName = sanitizedName.replace(/\.[^/.]+$/, '');
    
 
    
    let uploadOptions;
    
    if (fileExt === 'pdf') {
      // Cấu hình cho PDF với tên file đã được làm sạch
      uploadOptions = {
        folder: 'tuyen_dung',
        resource_type: 'auto',
        public_id: fileName,
        format: 'pdf',
        overwrite: true,
        access_mode: 'public'
      };
    } else {
      uploadOptions = {
        folder: 'tuyen_dung',
        resource_type: 'auto',
        public_id: fileName
      };
    }
    
   
    
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Upload error:", error);
          return reject(error);
        }
        
        console.log("Cloudinary upload result:", JSON.stringify(result, null, 2));
        
        // Trả về kết quả từ Cloudinary
        resolve(result);
      }
    );
    
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// REST API để lấy PDF trực tiếp từ Cloudinary
exports.getResume = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    // Tìm ứng dụng theo ID
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    // Nếu không có resumeUrl
    if (!application.resumeUrl) {
      return res.status(404).json({ success: false, message: 'No resume found for this application' });
    }
    
    // Chuyển hướng người dùng đến URL của PDF
    return res.redirect(application.resumeUrl);
    
  } catch (error) {
    console.error('Error getting resume:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Chỉnh sửa hàm applyForJob
exports.applyForJob = async (req, res) => {
  try {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          status: 'error',
          message: 'Lỗi khi upload CV',
          error: err.message
        });
      }

      const { jobId, userId, fullName, email, phone, birthday, expectedSalary } = req.body;
      const resumeFile = req.file;
      
      // Kiểm tra xem file có hợp lệ không
      if (resumeFile) {
        const validFileTypes = ['application/pdf'];
        if (!validFileTypes.includes(resumeFile.mimetype)) {
          return res.status(400).json({
            success: false,
            message: 'File không hợp lệ. Chỉ chấp nhận file PDF.'
          });
        }
      }
      
      // Tiếp tục các kiểm tra khác...
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      let resumeUrl = '';

      // Upload file lên Cloudinary
      if (resumeFile) {
        try {
          const result = await uploadFileToCloudinary(resumeFile.buffer, resumeFile.originalname);
          resumeUrl = result.secure_url;
          console.log("Final PDF URL:", resumeUrl);
        } catch (uploadError) {
          console.error("Error uploading to Cloudinary:", uploadError);
          return res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi tải file lên cloud', 
            error: uploadError.message 
          });
        }
      }
      
      // Xử lý birthday
      let birthdayDate = null;
      if (birthday) {
        const parsedDate = moment(birthday, 'DD-MM-YYYY', true);
        if (parsedDate.isValid()) {
          birthdayDate = parsedDate.toDate();
        } else {
          return res.status(400).json({ error: 'Ngày sinh không hợp lệ' });
        }
      }

      // Tạo application
      const newApplication = new Application({
        jobId,
        userId,
        fullName,
        email,
        phone,
        birthday: birthdayDate,
        expectedSalary,
        resumeUrl,
      });

      await newApplication.save();
      
      // Trả về thông tin chi tiết hơn cho client
      res.status(201).json({ 
        success: true, 
        message: 'Application submitted successfully', 
        data: {
          ...newApplication.toObject(),
          resumeUrl,
          pdfViewUrl: `/api/application/${newApplication._id}/resume` // URL để xem PDF
        }
      });
    });
  } catch (error) {
    console.error('Error in applyForJob:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get applications by Job ID
exports.getApplicationsByJob = async (req, res) => {
  try {
     

    // Lấy danh sách ứng viên cho công việc từ jobId
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'hoten email sdt');

    // Trường hợp không có ứng viên nào apply
    if (applications.length === 0) {
      return res.status(200).json({ success: true, data: [] });  // Trả về mảng rỗng thay vì lỗi
    }

    // Trường hợp có ứng viên apply
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Get applications by User ID
 
exports.getAllApply = async (req, res) => {
  try {
      const apply = await Application.find();

      
      if (!apply || apply.length === 0) {
          return res.status(200).json({ code: 200, success: true, data: [] });
      }

       
      res.status(200).json({ code: 200, success: true, data: apply });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteApply = async (req, res) => {
  try {
    const apply = await Application.findByIdAndDelete(req.params.id);
    if (!apply) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Không tìm thấy apply.',
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Xóa apply thành công.',
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

exports.updateApply = async (req, res) => {
  try {
    const { id } = req.params; // ID của application cần sửa
    const {
      fullName,
      email,
      phone,
      birthday,
      expectedSalary,
      status,
    } = req.body;

    // Tìm application
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển',
      });
    }

    // Cập nhật các trường nếu có
    if (fullName !== undefined) application.fullName = fullName;
    if (email !== undefined) application.email = email;
    if (phone !== undefined) application.phone = phone;
    if (expectedSalary !== undefined) application.expectedSalary = expectedSalary;
    if (status !== undefined) application.status = status;

    // Xử lý ngày sinh nếu truyền vào
    if (birthday !== undefined) {
      const parsedDate = moment(birthday, 'DD-MM-YYYY', true);
      if (!parsedDate.isValid()) {
        return res.status(400).json({ success: false, message: 'Ngày sinh không hợp lệ' });
      }
      application.birthday = parsedDate.toDate();
    }

    // Lưu thay đổi
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật đơn ứng tuyển thành công',
      data: application,
    });
  } catch (error) {
    console.error('Error in updateApply:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ',
      error: error.message,
    });
  }
};


// Get a specific application by ID
exports.getApplyById = async (req, res) => {
  try {
    const { id } = req.params;  
    
    const application = await Application.findById(id)
      .populate('jobId', 'title location salary deadline') // Populate thông tin công việc
      .populate('userId', 'fullName email phone'); // Populate thông tin ứng viên

    if (!application) {
      return res.status(200).json({
        success: true,
        data: null, // Trả về null nếu không tìm thấy ứng viên
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


// Get all applications by User ID
exports.getApplyByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Kiểm tra trước khi query
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        code: 400,
        status: 'error',
        message: 'Thiếu hoặc sai userId',
      });
    }

    const applications = await Application.find({ userId })
      .populate('jobId', 'title location salary deadline')
      .populate('userId', 'fullName email phone');

    return res.status(200).json({
      success: true,
      data: applications || [],
    });
  } catch (error) {
    console.error(error); // Nếu vẫn muốn ẩn log thì có thể xoá dòng này
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
