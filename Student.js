const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    firstName:  String,
    lastName: String,
  });

const Student = mongoose.model('Student', studentSchema)

module.exports = Student