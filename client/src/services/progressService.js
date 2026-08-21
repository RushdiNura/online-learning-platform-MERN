import api from './api';

export const getProgress = async (userId, courseId) => {
  const { data } = await api.get(`/progress/${userId}/${courseId}`);
  return data.progress;
};

export const getAllProgress = async (userId) => {
  const { data } = await api.get(`/progress/${userId}`);
  return data.progress;
};

export const completeLecture = async (courseId, lectureId) => {
  const { data } = await api.post('/progress/complete-lecture', { courseId, lectureId });
  return data.progress;
};

export const getCourseQuizzes = async (courseId) => {
  const { data } = await api.get(`/quizzes/course/${courseId}`);
  return data.quizzes;
};

export const submitQuiz = async (quizId, answers) => {
  const { data } = await api.post(`/quizzes/${quizId}/submit`, { answers });
  return data;
};
