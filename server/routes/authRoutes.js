const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  auth.register
);

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  auth.login
);

router.post('/logout', protect, auth.logout);
router.post('/forgot-password', [body('email').isEmail()], validate, auth.forgotPassword);
router.put(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate,
  auth.resetPassword
);
router.get('/me', protect, auth.getMe);
router.put('/update-profile', protect, auth.updateProfile);
router.put(
  '/change-password',
  protect,
  [body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')],
  validate,
  auth.changePassword
);

module.exports = router;
