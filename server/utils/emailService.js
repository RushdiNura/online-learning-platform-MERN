const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  // Fails gracefully in dev if SMTP isn't configured, so it never blocks core flows
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

exports.sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to LMS Platform!',
    html: `<h2>Welcome, ${user.name}!</h2><p>Thanks for joining. Start exploring courses today.</p>`,
  });

exports.sendEnrollmentEmail = (user, course) =>
  sendEmail({
    to: user.email,
    subject: `You're enrolled in ${course.title}`,
    html: `<h2>Enrollment Confirmed</h2><p>You are now enrolled in <strong>${course.title}</strong>. Happy learning!</p>`,
  });

exports.sendCertificateEmail = (user, course, verificationCode) =>
  sendEmail({
    to: user.email,
    subject: `Certificate issued for ${course.title}`,
    html: `<h2>Congratulations, ${user.name}!</h2><p>You've completed <strong>${course.title}</strong>. Your certificate verification code is <strong>${verificationCode}</strong>.</p>`,
  });

exports.sendPasswordResetEmail = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `<h2>Password Reset</h2><p>Click the link below to reset your password. This link expires in 10 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

exports.sendEmail = sendEmail;
