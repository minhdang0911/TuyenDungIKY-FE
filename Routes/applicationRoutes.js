const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Đăng ký ứng tuyển cho công việc
router.post('/apply', applicationController.applyForJob);
router.get('/all', applicationController.getAllApply);
router.get('/:id', applicationController.getApplyById);
// Lấy tất cả ứng viên đã ứng tuyển cho công việc theo jobId
// router.get('/job/:jobId', applicationController.getApplicationsByJob);
// Sửa tên tham số ở đây
router.get('/:applicationId', applicationController.getApplicationsByJob);


// Lấy tất cả công việc mà người dùng đã ứng tuyển theo userId
router.get('/user/:userId', applicationController.getApplyByUserId);
router.get('/:applicationId/resume',applicationController.getResume)
router.delete('/:id', applicationController.deleteApply);
router.put('/:id', applicationController.updateApply);
module.exports = router;
