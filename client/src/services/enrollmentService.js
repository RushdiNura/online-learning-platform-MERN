import api from './api';

export const enrollInCourse = async (courseId) => {
  const { data } = await api.post('/enrollments', { courseId });
  return data.enrollment;
};

export const getUserEnrollments = async (userId) => {
  const { data } = await api.get(`/enrollments/user/${userId}`);
  return data.enrollments;
};

export const getCourseEnrollments = async (courseId) => {
  const { data } = await api.get(`/enrollments/course/${courseId}`);
  return data.enrollments;
};

export const unenroll = async (enrollmentId) => {
  const { data } = await api.delete(`/enrollments/${enrollmentId}`);
  return data;
};
