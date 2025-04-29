const multer = require('multer');

const storage = multer.memoryStorage(); // Lưu file vào RAM
const uploadSingle = multer({ storage }).single('resumeUrl'); // chỉ upload 1 file field name = 'resume'

module.exports = uploadSingle;
