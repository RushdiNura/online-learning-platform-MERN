const express = require('express');
const router = express.Router();
const review = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, review.addReview);
router.get('/course/:courseId', review.getCourseReviews);
router.put('/:id', protect, review.updateReview);
router.delete('/:id', protect, review.deleteReview);

module.exports = router;
