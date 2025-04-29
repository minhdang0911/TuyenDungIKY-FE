const express = require('express');
const router = express.Router();
const {
    createKhenthuong,
    getKhenthuongs,
    getKhenthuongById,
    updateKhenthuong,
    deleteKhenthuong,
} = require('../controllers/khenthuongController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/create', createKhenthuong);
router.get('/all', getKhenthuongs);
router.get('/:id', getKhenthuongById);  
router.put('/:id', updateKhenthuong);
router.delete('/:id', deleteKhenthuong);

module.exports = router;
