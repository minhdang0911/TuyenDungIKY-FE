const jwt = require('jsonwebtoken');

// Middleware xác thực token
const verifyToken = (req, res, next) => {
    // Kiểm tra cookie 'token' trong yêu cầu
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        status: 'error',
        message: 'Bạn cần đăng nhập để thực hiện hành động này',
      });
    }
  
    try {
      // Giải mã token và lưu vào req.user
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Lưu thông tin người dùng trong token vào req.user
      next();
    } catch (err) {
      res.status(401).json({
        code: 401,
        status: 'error',
        message: 'Token không hợp lệ',
      });
    }
};


const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
      next();
  } else {
      return res.status(403).json({
          code: 403,
          status: 'error',
          message: 'Bạn không có quyền truy cập tài nguyên này',
      });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
