import {
  registerEmployer,
  registerWorker,
} from './controllers/user/register.js';
import { loginUser } from './controllers/user/login.js';
import { updateUserProfile } from './controllers/updateUser/updateProfile.js';
import { jwtVerify } from './middlewares/jwtAuth.js';
import { switchRole } from './controllers/toggle/toggleRole.js';
import { post } from './controllers/posts/createPost.js';
import { logoutUser } from './controllers/user/logout.js';
import { submitApplication } from './controllers/userApplication/createApp.js';
import { listMyApplications } from './controllers/userApplication/workerApp.js';
import { listJobApplications } from './controllers/userApplication/jobApp.js';
import { listNotifications } from './controllers/notification/getNotif.js';
import { notifyAll } from './controllers/notification/notif.js';
import { markNotificationRead } from './controllers/notification/readSingleNotif.js';
import { markAllNotificationsRead } from './controllers/notification/readAllNotif.js';
import { createRating } from './controllers/ratings/setRate.js';
import { listUserRatings } from './controllers/ratings/fetchingRate.js';
import { myGivenRatings } from './controllers/ratings/ownRate.js';
import { editPost } from './controllers/posts/editPost.js';
import { statusUpdate } from './controllers/posts/statusUpdate.js';
import { deletePost } from './controllers/posts/removePost.js';
import { deleteRating } from './controllers/ratings/removeRate.js';
import { getUserProfile } from './controllers/user/getUser.js';
import { requireActiveUser } from './middlewares/authReq.js';
import { listJobs } from './controllers/fetching/jobList.js';
import { listWorkers } from './controllers/fetching/workerList.js';
import { listEmployers } from './controllers/fetching/employerList.js';
import { getEmployer } from './controllers/fetching/fetchEmployer.js';
import { getWorker } from './controllers/fetching/fetchWorker.js';
import { getJob } from './controllers/fetching/fetchjob.js';

export {
  createRating,
  deletePost,
  deleteRating,
  editPost,
  getEmployer,
  getJob,
  getUserProfile,
  getWorker,
  jwtVerify,
  listEmployers,
  listJobApplications,
  listJobs,
  listWorkers,
  statusUpdate,
  myGivenRatings,
  listUserRatings,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  submitApplication,
  listMyApplications,
  requireActiveUser,
  notifyAll,
  registerEmployer,
  registerWorker,
  loginUser,
  updateUserProfile,
  switchRole,
  post,
  logoutUser,
};
