const mongoose = require('mongoose');
const slugify = require('slugify');

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // seconds
  resources: [{ name: String, url: String }],
  preview: { type: Boolean, default: false },
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lectures: [lectureSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 300 },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: '' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'Beginner' },
    language: { type: String, default: 'English' },
    price: { type: Number, required: true, default: 0, min: 0 },
    originalPrice: { type: Number, default: 0 },
    thumbnail: { type: String, default: '' },
    previewVideo: { type: String, default: '' },
    whatYouWillLearn: [{ type: String }],
    requirements: [{ type: String }],
    sections: [sectionSchema],
    totalDuration: { type: Number, default: 0 },
    totalLectures: { type: Number, default: 0 },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    studentsCount: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  // recompute aggregate lecture/duration counts
  let totalLectures = 0;
  let totalDuration = 0;
  (this.sections || []).forEach((s) => {
    totalLectures += s.lectures.length;
    s.lectures.forEach((l) => (totalDuration += l.duration || 0));
  });
  this.totalLectures = totalLectures;
  this.totalDuration = totalDuration;
  next();
});

module.exports = mongoose.model('Course', courseSchema);
