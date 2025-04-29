const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Tạo công việc mới
router.post('/create', jobController.createJob);

// Lấy tất cả công việc
router.get('/all', jobController.getAllJobs);

// Lấy công việc theo ID
router.get('/:id', jobController.getJobById);


// Cập nhật công việc theo ID
router.put('/:id', jobController.updateJob);

// Xóa công việc theo ID
router.delete('/:id', jobController.deleteJob);

module.exports = router;
