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
        .select('-password') // loại bỏ field password
        .populate('phongban_id', 'tenphong')
        .populate('role', 'tenRole');
  
      if (users.length === 0) {
        return res.status(200).json({
          code: 200,
          status: 'success',
          message: 'Không có người dùng nào',
          data: [], // Trả về mảng rỗng nếu không có người dùng
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
      // Lấy id từ token
      const userId = req.user.id;
     
      
      // Tìm người dùng bằng id từ token
      const user = await User.findById(userId)
        .select('-password')
        .populate('phongban_id', 'tenphong')
        .populate('role', 'tenRole');
  
      // Nếu không tìm thấy người dùng, trả về mảng rỗng
      if (!user) {
        return res.status(200).json({
          code: 200,
          status: 'success',
          data: [], // Mảng rỗng nếu không tìm thấy người dùng
        });
      }
  
      // Trả về thông tin người dùng
      res.status(200).json({
        code: 200,
        status: 'success',
        data: user,
      });
    } catch (err) {
      console.error('Lỗi khi tìm người dùng:', err.message); // Thêm log chi tiết lỗi
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
        sameSite: 'None',  // Cho phép gửi cookies giữa các domain khác nhau
        secure: true,      // Cookies sẽ chỉ được gửi qua HTTPS
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
      .populate('phongban_id', 'tenphong')
      .populate('role', 'name');

    if (!user) {
      return res.status(200).json({
        code: 200,
        status: 'success',
        data: [], // Mảng rỗng nếu không tìm thấy người dùng
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
  changePassword
};
