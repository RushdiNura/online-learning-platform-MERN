/**
 * Seed script: populates the database with sample instructors, students,
 * courses, quizzes, reviews and progress records.
 *
 * Run with: npm run seed   (from the /server directory)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Review = require('../models/Review');

const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'Mobile Development'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const courseTitles = [
  'Complete React Developer Course',
  'Python for Data Science Bootcamp',
  'UI/UX Design Masterclass',
  'Digital Marketing Fundamentals',
  'Node.js & Express API Development',
  'Advanced JavaScript Concepts',
  'Machine Learning A-Z',
  'iOS App Development with Swift',
  'Business Strategy Essentials',
  'Full Stack MERN Development',
  'Figma for Product Designers',
  'SEO & Content Marketing Mastery',
];

const buildCourse = (instructorId, title) => {
  const price = rand([0, 19.99, 29.99, 49.99, 79.99, 99.99]);
  return {
    title,
    description: `A comprehensive, project-based course covering everything you need to know about ${title.toLowerCase()}. Includes hands-on projects, quizzes, and downloadable resources.`,
    shortDescription: `Master ${title} from the ground up with real-world projects.`,
    instructor: instructorId,
    category: rand(CATEGORIES),
    level: rand(LEVELS),
    price,
    originalPrice: price > 0 ? Math.round(price * 1.6 * 100) / 100 : 0,
    thumbnail: `https://picsum.photos/seed/${encodeURIComponent(title)}/640/360`,
    whatYouWillLearn: [
      'Build real-world projects from scratch',
      'Understand core concepts deeply, not just syntax',
      'Follow industry best practices',
      'Prepare for technical interviews',
    ],
    requirements: ['A computer with internet access', 'Basic computer literacy', 'Willingness to learn!'],
    sections: [
      {
        title: 'Getting Started',
        lectures: [
          { title: 'Course Introduction', videoUrl: 'https://example.com/video1.mp4', duration: 300, preview: true },
          { title: 'Setting Up Your Environment', videoUrl: 'https://example.com/video2.mp4', duration: 600, preview: true },
        ],
      },
      {
        title: 'Core Concepts',
        lectures: [
          { title: 'Fundamentals Part 1', videoUrl: 'https://example.com/video3.mp4', duration: 900 },
          { title: 'Fundamentals Part 2', videoUrl: 'https://example.com/video4.mp4', duration: 850 },
          { title: 'Hands-on Project', videoUrl: 'https://example.com/video5.mp4', duration: 1200 },
        ],
      },
      {
        title: 'Advanced Topics',
        lectures: [
          { title: 'Best Practices', videoUrl: 'https://example.com/video6.mp4', duration: 700 },
          { title: 'Final Project & Wrap Up', videoUrl: 'https://example.com/video7.mp4', duration: 1000 },
        ],
      },
    ],
    status: 'published',
    tags: title.toLowerCase().split(' ').slice(0, 4),
  };
};

const run = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Quiz.deleteMany({}),
    Enrollment.deleteMany({}),
    Progress.deleteMany({}),
    Review.deleteMany({}),
  ]);

  console.log('Creating instructors...');
  const instructors = [];
  for (let i = 1; i <= 5; i++) {
    const instructor = await User.create({
      name: `Instructor ${i}`,
      email: `instructor${i}@lms.com`,
      password: 'password123',
      role: 'instructor',
      bio: 'Passionate educator with years of industry experience.',
      headline: rand(['Senior Software Engineer', 'Lead Designer', 'Marketing Strategist', 'Data Scientist']),
      avatar: `https://i.pravatar.cc/150?u=instructor${i}`,
    });
    instructors.push(instructor);
  }

  console.log('Creating students...');
  const students = [];
  for (let i = 1; i <= 20; i++) {
    const student = await User.create({
      name: `Student ${i}`,
      email: `student${i}@lms.com`,
      password: 'password123',
      role: 'student',
      avatar: `https://i.pravatar.cc/150?u=student${i}`,
    });
    students.push(student);
  }

  console.log('Creating admin...');
  await User.create({
    name: 'Admin User',
    email: 'admin@lms.com',
    password: 'admin123',
    role: 'admin',
  });

  console.log('Creating courses...');
  const courses = [];
  for (const title of courseTitles) {
    const instructor = rand(instructors);
    const course = await Course.create(buildCourse(instructor._id, title));
    courses.push(course);
  }

  console.log('Creating quizzes...');
  for (const course of courses) {
    await Quiz.create({
      courseId: course._id,
      title: `${course.title} - Final Quiz`,
      passingScore: 70,
      timeLimit: 600,
      questions: [
        {
          question: 'What is the main benefit covered in this course?',
          options: ['Speed', 'Practical, real-world skills', 'Certification only', 'None of the above'],
          correctAnswer: 1,
          explanation: 'The course focuses on practical, real-world application.',
          marks: 1,
        },
        {
          question: 'Which section covers hands-on projects?',
          options: ['Getting Started', 'Core Concepts', 'Advanced Topics', 'Introduction'],
          correctAnswer: 1,
          explanation: 'Core Concepts includes a hands-on project lecture.',
          marks: 1,
        },
        {
          question: 'True or False: This course requires prior expert-level knowledge.',
          options: ['True', 'False'],
          correctAnswer: 1,
          explanation: 'The course is designed to be accessible with just basic computer literacy.',
          marks: 1,
        },
      ],
    });
  }

  console.log('Enrolling students, generating progress and reviews...');
  for (const student of students) {
    const enrollCount = randInt(1, 4);
    const shuffled = [...courses].sort(() => 0.5 - Math.random());
    const pickedCourses = shuffled.slice(0, enrollCount);

    for (const course of pickedCourses) {
      const progressPct = randInt(0, 100);
      const enrollment = await Enrollment.create({
        userId: student._id,
        courseId: course._id,
        progress: progressPct,
        status: progressPct >= 100 ? 'completed' : 'active',
        paymentStatus: course.price > 0 ? 'paid' : 'free',
        amountPaid: course.price,
      });

      const totalLectures = course.totalLectures;
      const completedCount = Math.round((progressPct / 100) * totalLectures);
      const allLectureIds = course.sections.flatMap((s) => s.lectures.map((l) => l._id));

      await Progress.create({
        userId: student._id,
        courseId: course._id,
        completedLectures: allLectureIds.slice(0, completedCount),
        overallProgress: progressPct,
        completed: progressPct >= 100,
      });

      await User.findByIdAndUpdate(student._id, {
        $push: { enrolledCourses: { courseId: course._id, progress: progressPct } },
      });

      course.studentsCount += 1;
      await course.save();

      if (Math.random() > 0.4) {
        await Review.create({
          userId: student._id,
          courseId: course._id,
          rating: randInt(3, 5),
          comment: rand([
            'Great course, learned a lot!',
            'Very well structured and easy to follow.',
            'Instructor explains concepts clearly.',
            'Could use more advanced examples, but overall solid.',
            'Exactly what I needed for my career transition.',
          ]),
        });
      }
    }
  }

  // Recalculate ratings
  for (const course of courses) {
    const reviews = await Review.find({ courseId: course._id });
    const count = reviews.length;
    const average = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
    course.rating = { average: Math.round(average * 10) / 10, count };
    await course.save();
  }

  console.log('Seed complete!');
  console.log(`Created ${instructors.length} instructors, ${students.length} students, ${courses.length} courses.`);
  console.log('Sample login -> student1@lms.com / password123, instructor1@lms.com / password123, admin@lms.com / admin123');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
