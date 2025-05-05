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
  changePassword
} = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');
router.get('/me', verifyToken,getUserByToken);
router.post('/create',  createUser);
router.get('/all', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/login', loginUser);
router.post('/logout',  logoutUser);
router.post('/register',  register);
router.get('/phongban/:phongbanId',getUserByPhongBan );
router.post('/change-password', verifyToken, changePassword);
module.exports = router;
