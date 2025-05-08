const express = require('express');
const router = express.Router();
const {
  createPhongban,
  getAllPhongban,
  getPhongbanById,
  updatePhongban,
  deletePhongban,
} = require('../controllers/phongbanController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/', createPhongban);
router.get('/', getAllPhongban);
router.get('/:id', getPhongbanById);
router.put('/:id', updatePhongban);
router.delete('/:id', deletePhongban);

module.exports = router;
