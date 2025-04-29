const express = require('express');
const router = express.Router();
const {
    createThanhTich,
    getAllThanhTich,
    updateThanhTich,
    deleteThanhTich,
    getThanhTichById
} = require('../controllers/thanhTichController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/create',  createThanhTich);
router.get('/all', getAllThanhTich);
router.put('/:id', updateThanhTich);
router.delete('/:id', deleteThanhTich);
router.get('/:id', getThanhTichById);

module.exports = router;
