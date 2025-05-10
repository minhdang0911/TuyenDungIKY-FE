const User = require('../Models/User');
const Phongban = require('../Models/Phongban');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const slugify = require('slugify');
const moment = require('moment');
require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');



const emailJSServiceID = process.env.EMAILJS_SERVICE_ID;
const emailJSTemplateID = process.env.EMAILJS_TEMPLATE_ID;
const emailJSUserID = process.env.EMAILJS_USER_ID;

console.log(emailJSServiceID,emailJSTemplateID,emailJSUserID)

const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  

const streamifier = require('streamifier');
const cookieParser = require('cookie-parser');

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'tuyendungiky',
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

const createUser = async (req, res) => {
  try {
    upload.single('avatar')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          status: 'error',
          message: 'Lỗi khi upload file',
        });
      }

      let {
        hoten,
        email,
        gioitinh,
        ngaysinh,
        sdt,
        chucvu,
        phongban_id,
        role,
        password,
      } = req.body;

      // Check email đã tồn tại
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          code: 400,
          status: 'error',
          message: 'Email đã tồn tại',
        });
      }

      let avatarUrl = '';

      // Nếu có file, upload lên Cloudinary
      if (req.file && req.file.buffer) {
        try {
          const result = await uploadToCloudinary(req.file.buffer);
          console.log('Cloudinary upload response:', result);
          avatarUrl = result.secure_url;
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          return res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Lỗi khi upload ảnh lên Cloudinary',
          });
        }
      }

      // Hash password nếu có nhập
      let hashedPassword = '';
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const slug = slugify(hoten, { lower: true, strict: true });

      if (ngaysinh) {
        const parsedDate = moment(ngaysinh, 'DD-MM-YYYY', true);
        if (parsedDate.isValid()) {
          ngaysinh = parsedDate.toDate();
        } else {
          return res.status(400).json({ error: 'Ngày sinh không hợp lệ' });
        }
      }

      // Nếu role không có thì gán là null
      let roleId = null;
if (role && mongoose.Types.ObjectId.isValid(role)) {
  roleId = new mongoose.Types.ObjectId(role);
}



      // Tạo user
      const user = new User({
        hoten,
        slug,
        email,
        gioitinh,
        ngaysinh,
        sdt,
        chucvu,
        phongban_id,
        role: roleId, // Gán role là null nếu không có giá trị
        avatar: avatarUrl,
        ...(password && { password: hashedPassword }),
      });

      await user.save();

      res.status(201).json({
        code: 201,
        status: 'success',
        message: 'Tạo người dùng thành công',
        data: user,
      });
    });
  } catch (err) {
    console.error('Error in createUser:', err);
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

const register = async (req, res) => {
  try {
    upload.single('avatar')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          code: 500,
          status: 'error',
          message: 'Lỗi khi upload file',
        });
      }

      let { hoten, email, gioitinh, ngaysinh, password } = req.body;

      // Kiểm tra email đã tồn tại
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          code: 400,
          status: 'error',
          message: 'Email đã tồn tại',
        });
      }

      let avatarUrl = '';

      // Nếu có file ảnh, upload lên Cloudinary
      if (req.file && req.file.buffer) {
        try {
          const result = await uploadToCloudinary(req.file.buffer);
          avatarUrl = result.secure_url;
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          return res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Lỗi khi upload ảnh lên Cloudinary',
          });
        }
      }

      // Mã hoá mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo slug từ hoten
      const slug = slugify(hoten, { lower: true, strict: true });

      // Format ngày sinh nếu có
      if (ngaysinh) {
        const parsedDate = moment(ngaysinh, 'DD-MM-YYYY', true);
        if (parsedDate.isValid()) {
          ngaysinh = parsedDate.toDate();
        } else {
          return res.status(400).json({
            code: 400,
            status: 'error',
            message: 'Ngày sinh không hợp lệ',
          });
        }
      }

      const user = new User({
        hoten,
        slug,
        email,
        gioitinh,
        ngaysinh,
        role: new mongoose.Types.ObjectId("6814358d4d95f34e1730558f"),
        avatar: avatarUrl,
        password: hashedPassword,
      });

      await user.save();

      res.status(201).json({
        code: 201,
        status: 'success',
        message: 'Đăng ký người dùng thành công',
        data: user,
      });
    });
  } catch (err) {
    console.error('Error in register:', err);
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};


  
  
  
  
  // Lấy tất cả user
  const getAllUsers = async (req, res) => {
    try {
      const users = await User.find()
        .select('-password')
        .populate('phongban_id', 'tenphong -_id') // Chỉ lấy tenphong, loại _id
        .populate('role', 'tenRole -_id');        // Chỉ lấy tenRole, loại _id
  
      if (users.length === 0) {
        return res.status(200).json({
          code: 200,
          status: 'success',
          message: 'Không có người dùng nào',
          data: [],
        });
      }
  
      res.status(200).json({
        code: 200,
        status: 'success',
        data: users,
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        status: 'error',
        message: err.message,
      });
    }
  };
  
  
  
  // Lấy user theo Token
  const getUserByToken = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const user = await User.findById(userId)
        .select('-password')
        .populate('phongban_id', 'tenphong -_id') // loại bỏ _id
        .populate('role', 'tenRole -_id');        // loại bỏ _id
  
      if (!user) {
        return res.status(200).json({
          code: 200,
          status: 'success',
          data: [],
        });
      }
  
      res.status(200).json({
        code: 200,
        status: 'success',
        data: user,
      });
    } catch (err) {
      console.error('Lỗi khi tìm người dùng:', err.message);
      res.status(500).json({
        code: 500,
        status: 'error',
        message: 'Đã có lỗi xảy ra khi lấy thông tin người dùng.',
      });
    }
  };
  
  ;
  
  // Cập nhật user
  
  const updateUser = async (req, res) => {
    try {
      upload.single('avatar')(req, res, async (err) => {
        if (err) {
          return res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Lỗi khi upload file',
          });
        }
  
        const { id } = req.params;
        let {
          hoten,
          email,
          gioitinh,
          ngaysinh,
          sdt,
          chucvu,
          phongban_id,
          role,
          password,
        } = req.body;
  
        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({
            code: 404,
            status: 'error',
            message: 'Không tìm thấy người dùng',
          });
        }
  
        let avatarUrl = user.avatar;
  
        // Nếu có file mới, upload lên Cloudinary
        if (req.file && req.file.buffer) {
          try {
            const result = await uploadToCloudinary(req.file.buffer);
            avatarUrl = result.secure_url;
          } catch (uploadErr) {
            console.error('Upload error:', uploadErr);
            return res.status(500).json({
              code: 500,
              status: 'error',
              message: 'Lỗi khi upload ảnh lên Cloudinary',
            });
          }
        }
  
        // Parse lại ngày sinh
        if (ngaysinh) {
          const parsedDate = moment(ngaysinh, 'DD-MM-YYYY', true);
          if (parsedDate.isValid()) {
            ngaysinh = parsedDate.toDate();
          } else {
            return res.status(400).json({ error: 'Ngày sinh không hợp lệ' });
          }
        }
  
        // Mã hóa password nếu có truyền
        let hashedPassword = user.password; // Giữ password cũ nếu không có
        if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
        }
  
        // Gán role (nếu có)
        let roleId = null;
        if (role && mongoose.Types.ObjectId.isValid(role)) {
          roleId = new mongoose.Types.ObjectId(role);
        }
  
        // Cập nhật thông tin
        user.hoten = hoten || user.hoten;
        user.email = email || user.email;
        user.gioitinh = gioitinh || user.gioitinh;
        user.ngaysinh = ngaysinh || user.ngaysinh;
        user.sdt = sdt || user.sdt;
        user.chucvu = chucvu || user.chucvu;
        user.phongban_id = phongban_id || user.phongban_id;
        user.role = roleId || user.role;
        user.avatar = avatarUrl;
        user.password = hashedPassword;
        user.slug = slugify(user.hoten, { lower: true, strict: true });
  
        await user.save();
  
        res.status(200).json({
          code: 200,
          status: 'success',
          message: 'Cập nhật người dùng thành công',
          data: user,
        });
      });
    } catch (err) {
      console.error('Error in updateUser:', err);
      res.status(500).json({
        code: 500,
        status: 'error',
        message: err.message,
      });
    }
  };

  
  const changePassword = async (req, res) => {
    try {
      const userId = req.user.id; // Lấy từ token đã decode
  
      const { oldPassword, newPassword, confirmPassword } = req.body;
      console.log(req.body)
  
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          code: 400,
          status: 'error',
          message: 'Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.',
        });
      }
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          code: 400,
          status: 'error',
          message: 'Mật khẩu mới và xác nhận mật khẩu không khớp.',
        });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          message: 'Không tìm thấy người dùng.',
        });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          code: 400,
          status: 'error',
          message: 'Mật khẩu cũ không đúng.',
        });
      }
  
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
  
      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Đổi mật khẩu thành công.',
      });
    } catch (err) {
      console.error('Error in changePassword:', err);
      res.status(500).json({
        code: 500,
        status: 'error',
        message: 'Lỗi server: ' + err.message,
      });
    }
  };
  
  // Xóa user
  const deleteUser = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          message: 'Không tìm thấy người dùng',
        });
      }
  
      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Xóa người dùng thành công',
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        status: 'error',
        message: err.message,
      });
    }
  };


 
  const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        message: 'Email và mật khẩu không thể để trống',
      });
    }
  
    try {
      const user = await User.findOne({ email }).populate('role', 'tenRole');
      if (!user) {
        return res.status(400).json({
          code: 400,
          status: 'error',
          message: 'Email không tồn tại',
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          code: 400,
          status: 'error',
          message: 'Mật khẩu không đúng',
        });
      }
  
      // Lấy role name hoặc role id để nhét vào token
      const payload = {
        id: user._id,
        role: user.role ? user.role.tenRole : null, // hoặc user.role nếu muốn lưu ObjectId
      };
  
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'Strict',
      });
  
      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Đăng nhập thành công',
        token, // có thể gửi luôn token để frontend dùng
       
      });
    } catch (err) {
      res.status(500).json({
        code: 500,
        status: 'error',
        message: err.message,
      });
    }
  };
  


  const logoutUser = (req, res) => {
    try {
        // Xóa token trong cookie
        res.clearCookie('token', {
            httpOnly: true, // Chỉ có thể truy cập token qua HTTP requests
            sameSite: 'Strict', // Cấm gửi cookie trong yêu cầu từ trang khác
        });

        // Trả về phản hồi thành công
        res.status(200).json({
            code: 200,
            status: 'success',
            message: 'Đăng xuất thành công',
        });
    } catch (err) {
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Có lỗi khi đăng xuất: ' + err.message,
        });
    }
};



  


const getUserByPhongBan = async (req, res) => {
  try {
    const phongbanId = req.params.phongbanId;

    // Kiểm tra xem phòng ban có tồn tại không
    const phongban = await Phongban.findById(phongbanId);
    if (!phongban) {
      return res.status(200).json({
        code: 200,
        status: 'success',
        data: [], // Mảng rỗng nếu phòng ban không tồn tại
      });
    }

    // Tìm tất cả người dùng thuộc phòng ban này, loại bỏ trường password
    const users = await User.find({ phongban_id: phongbanId })
      .select('-password') // Loại bỏ trường password
      .populate('phongban_id', 'tenphong');

    res.status(200).json({
      code: 200,
      status: 'success',
      data: users.length > 0 ? users : [], // Mảng rỗng nếu không có người dùng trong phòng ban
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};

 

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password') // nếu cần ẩn password
      .populate('phongban_id', 'tenphong -_id') // chỉ lấy tenphong
      .populate('role', 'tenRole -_id');        // chỉ lấy tenRole

    if (!user) {
      return res.status(200).json({
        code: 200,
        status: 'success',
        data: [],
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      status: 'error',
      message: err.message,
    });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        message: 'Vui lòng cung cấp email.',
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        code: 401,
        status: 'error',
        message: 'Email không tồn tại trong hệ thống.',
      });
    }
    
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    
    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
    
    // Cấu hình transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    
    // Lấy tên công ty từ biến môi trường hoặc sử dụng mặc định
    const companyName = process.env.COMPANY_NAME || 'Công ty Cổ Phần Công Nghệ Tiện Ích Thông Minh';
    const companyLogo = process.env.COMPANY_LOGO || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk6i1YvxT8gFWyAwk3tW8MjzQJocD3SUZ64A&s';
    const companyAddress = process.env.COMPANY_ADDRESS || 'Công ty Cổ Phần Công Nghệ Tiện Ích Thông Minh';
    const companyPhone = process.env.COMPANY_PHONE || '(+84) 02 806 999';
    const companyEmail = process.env.COMPANY_EMAIL || process.env.GMAIL_USER;
    const companyWebsite = process.env.COMPANY_WEBSITE || 'iky.vn';
    
    // Cấu hình nội dung email với thiết kế chuyên nghiệp
    const mailOptions = {
      from: `"${companyName}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `[${companyName}] Khôi phục mật khẩu`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Khôi phục mật khẩu</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            body {
              font-family: 'Roboto', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            
            .header {
              background: linear-gradient(135deg, #0062E6, #33A8FF);
              padding: 30px 20px;
              text-align: center;
            }
            
            .logo-container {
              background-color: white;
              display: inline-block;
              border-radius: 50%;
              padding: 10px;
              margin-bottom: 15px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            .logo {
              max-height: 60px;
            }
            
            .company-name {
              margin: 10px 0 0;
              color: #ffffff;
              font-size: 24px;
              font-weight: 600;
              letter-spacing: 0.5px;
            }
            
            .content {
              padding: 40px 30px;
              background-color: #ffffff;
            }
            
            .greeting {
              font-size: 22px;
              font-weight: 500;
              color: #222222;
              margin-top: 0;
            }
            
            .message {
              font-size: 16px;
              color: #555555;
              margin-bottom: 30px;
            }
            
            .button-container {
              text-align: center;
              margin: 35px 0;
            }
            
            .button {
              display: inline-block;
              background: linear-gradient(to right, #0062E6, #33A8FF);
              color: #ffffff !important;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 50px;
              font-weight: bold;
              font-size: 16px;
              letter-spacing: 0.5px;
              box-shadow: 0 5px 15px rgba(0, 98, 230, 0.3);
              transition: all 0.3s;
            }
            
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 7px 20px rgba(0, 98, 230, 0.4);
            }
            
            .notice {
              margin: 30px 0;
              padding: 15px;
              background-color: #f8f9fa;
              border-left: 4px solid #0062E6;
              border-radius: 4px;
            }
            
            .notice-title {
              font-weight: 600;
              color: #0062E6;
              margin: 0 0 5px 0;
            }
            
            .notice-content {
              margin: 0;
              color: #555555;
            }
            
            .divider {
              border: none;
              border-top: 1px solid #e9ecef;
              margin: 30px 0;
            }
            
            .signature {
              font-size: 16px;
              color: #555555;
            }
            
            .signature-name {
              font-weight: 600;
              color: #333333;
            }
            
            .footer {
              background-color: #f8f9fa;
              padding: 30px 20px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            
            .company-info {
              margin-bottom: 20px;
            }
            
            .company-info p {
              margin: 5px 0;
              color: #6c757d;
              font-size: 14px;
            }
            
            .company-info strong {
              color: #495057;
            }
            
            .social-links {
              margin: 20px 0;
            }
            
            .social-link {
              display: inline-block;
              margin: 0 8px;
              color: #0062E6 !important;
              text-decoration: none;
              font-weight: 500;
            }
            
            .warning {
              font-size: 12px;
              color: #6c757d;
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #e9ecef;
            }
            
            /* Responsive styling */
            @media only screen and (max-width: 480px) {
              .content {
                padding: 30px 20px;
              }
              
              .button {
                padding: 12px 25px;
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <img src="${companyLogo}" alt="${companyName}" class="logo">
              </div>
              <h1 class="company-name">${companyName}</h1>
            </div>
            
            <div class="content">
              <h2 class="greeting">Xin chào ${user.firstName || 'Quý khách'},</h2>
              <p class="message">Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Để tiếp tục quá trình này, vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
              
              <div class="button-container">
                <a href="${resetURL}" class="button">ĐẶT LẠI MẬT KHẨU</a>
              </div>
              
              <div class="notice">
                <p class="notice-title">Lưu ý quan trọng:</p>
                <p class="notice-content">Liên kết này sẽ hết hạn sau 1 giờ kể từ khi email được gửi. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi ngay lập tức để được hỗ trợ.</p>
              </div>
              
              <hr class="divider">
              
              <p class="signature">Trân trọng,<br><span class="signature-name">Đội ngũ Hỗ trợ ${companyName}</span></p>
            </div>
            
            <div class="footer">
              <div class="company-info">
                <p><strong>${companyName}</strong></p>
                <p>${companyAddress}</p>
                <p>Điện thoại: ${companyPhone}</p>
               
                <p>Website: <a href="https://${companyWebsite}" style="color: #0062E6;">${companyWebsite}</a></p>
              </div>
              
              <div class="social-links">
                <a href="https://www.facebook.com/tienichthongminh/" class="social-link">Facebook</a> |
                <a href="https://www.linkedin.com/company/" class="social-link">LinkedIn</a> |
                <a href="https://www.youtube.com/channel/" class="social-link">YouTube</a>
              </div>
              
              <p class="warning">Email này được gửi tự động, vui lòng không trả lời. Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua hotline hoặc email ${companyEmail}.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Một email khôi phục mật khẩu đã được gửi.',
    });
    
  } catch (err) {
    console.error('Error in forgotPassword:', err);
    res.status(500).json({
      code: 500,
      status: 'error',
      message: 'Lỗi server: ' + err.message,
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // Token từ URL
    const { newPassword } = req.body; // Mật khẩu mới từ form

    if (!newPassword) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        message: 'Vui lòng cung cấp mật khẩu mới.',
      });
    }

    // Giải mã token để lấy userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Tìm user theo ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'User không tồn tại.',
      });
    }

    // Cập nhật mật khẩu mới cho người dùng
    user.password = await bcrypt.hash(newPassword, 10); // Băm mật khẩu trước khi lưu
    await user.save();

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Mật khẩu đã được cập nhật thành công.',
    });

  } catch (err) {
    console.error('Error in resetPassword:', err);
    res.status(500).json({
      code: 500,
      status: 'error',
      message: 'Lỗi server: ' + err.message,
    });
  }
};

 
module.exports = {
  createUser,
  getAllUsers,
  getUserByToken,
  updateUser,
  deleteUser,
  loginUser,
  getUserByPhongBan,
  getUserById,
  logoutUser,
  register,
  changePassword,
  forgotPassword,
  resetPassword
};
