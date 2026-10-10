export default {
  // BASE_URL: 'https://AuraCoreappapi.kretosstechnology.com', // Demo
  BASE_URL: 'https://api.AuraCoremedical.com', // Demo
  register: '/api/v1/register',
  login: '/api/v1/login',
  socialLogin: '/api/v1/social-login',
  forgotPassword: '/api/v1/user/forget/password',
  resetPassword: '/api/v1/user/reset/password',
  changePassword: '/api/v1/user/change/password',
  profile: '/api/v1/user/profile',
  getDashboard: '/api/v1/user/dashboard',
  getDatabyVitals: '/api/v1/user/vitals/data?vital_type=', // BP, HR, HRV
  getHistory: '/api/v1/user/history',
  addVitals: '/api/v1/user/add/vitals',
  addStatus: '/api/v1/user/add/status',
  getQuestions: '/api/v1/questions',
  storeQuiz: '/api/v1/quiz',
  getQuiz: '/api/v1/quiz',
  sync: '/api/v1/sync',
  notification: '/api/v1/notification',
  updateStatus: '/api/v1/user/update-status',
  subscription: '/api/v1/user/check-subscription',
  updateSubscription: '/api/v1/user/update-subscription'
};
