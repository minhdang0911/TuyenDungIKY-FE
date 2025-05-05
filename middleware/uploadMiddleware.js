const multer = require('multer');

const storage = multer.memoryStorage();  
const uploadSingle = multer({ storage }).single('resumeUrl'); 

module.exports = uploadSingle;
