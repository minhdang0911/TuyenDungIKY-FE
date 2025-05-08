const express = require('express');
const router = express.Router();
const {
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
  forgotPassword,  // Thêm controller forgotPassword
  resetPassword    // Thêm controller resetPassword
} = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Các route hiện có
router.get('/me', verifyToken, getUserByToken);
router.post('/create', createUser);
router.get('/all', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/register', register);
router.get('/phongban/:phongbanId', getUserByPhongBan);
router.post('/change-password', verifyToken, changePassword);

// Route cho quên mật khẩu (gửi email khôi phục mật khẩu)
router.post('/forgot-password', forgotPassword);

// Route cho khôi phục mật khẩu (cập nhật mật khẩu mới)
router.post('/reset-password/:token', resetPassword);

module.exports = router;
