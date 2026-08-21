import api from './api';

export const getCourses = async (params = {}) => {
  const { data } = await api.get('/courses', { params });
  return data;
};

export const getCourse = async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data.course;
};

export const createCourse = async (payload) => {
  const { data } = await api.post('/courses', payload);
  return data.course;
};

export const updateCourse = async (id, payload) => {
  const { data } = await api.put(`/courses/${id}`, payload);
  return data.course;
};

export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
};

export const getInstructorCourses = async (instructorId) => {
  const { data } = await api.get(`/courses/instructor/${instructorId}`);
  return data.courses;
};

export const addLesson = async (courseId, payload) => {
  const { data } = await api.post(`/courses/${courseId}/lessons`, payload);
  return data.course;
};

export const toggleWishlist = async (courseId) => {
  const { data } = await api.post(`/users/wishlist/${courseId}`);
  return data;
};

export const getWishlist = async () => {
  const { data } = await api.get('/users/wishlist');
  return data.wishlist;
};

export const getCourseReviews = async (courseId) => {
  const { data } = await api.get(`/reviews/course/${courseId}`);
  return data.reviews;
};

export const addReview = async (payload) => {
  const { data } = await api.post('/reviews', payload);
  return data.review;
};
