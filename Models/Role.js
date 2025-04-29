const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  tenRole: { type: String, required: true },
  mota: { type: String },
},{ timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
