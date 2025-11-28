// update_courses_user.js
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://abhay:abhay1234@cluster0.nmv8f0n.mongodb.net/mindsphere?retryWrites=true&w=majority&appName=Cluster0';
const USER_ID = 'YOUR_USER_ID_HERE'; // Replace with your actual user _id from the users collection

const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.model('Course', courseSchema);

async function updateCourses() {
  await mongoose.connect(MONGO_URI);
  const result = await Course.updateMany(
    { user: { $exists: false } }, // Only update courses missing the user field
    { $set: { user: USER_ID } }
  );
  console.log('Courses updated:', result.modifiedCount);
  await mongoose.disconnect();
}

updateCourses();

