const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
 

// Đăng ký ứng tuyển cho công việc
router.post('/apply', applicationController.applyForJob);
router.get('/all', applicationController.getAllApply);
router.get('/:id', applicationController.getApplyById);
router.get('/job/:jobId', applicationController.getApplicationsByJob);
router.get('/user/:userId', applicationController.getApplyByUserId);
router.get('/:applicationId/resume',applicationController.getResume)
router.delete('/:id', applicationController.deleteApply);
router.put('/:id', applicationController.updateApply);
module.exports = router;
