const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('FormData', FormSchema);
