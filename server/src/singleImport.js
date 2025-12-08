import {
  registerEmployer,
  registerWorker,
} from './controllers/user/registerUser.js';
import { login } from './controllers/user/login.js';
import { updateProfile } from './controllers/updateUser/updateProfile.js';
import { jwtVerify } from './middlewares/jwtAuth.js';
import { switchRole } from './controllers/toggle/switchRole.js';
import { createPost } from './controllers/posts/createPost.js';
import { logout } from './controllers/user/logout.js';
import { submitApplication } from './controllers/userApplication/submitApplication.js';
import { listWorkerApplication } from './controllers/userApplication/listWorkerApplication.js';
import { listJobApplications } from './controllers/userApplication/listJobApplication.js';
import { listNotifications } from './controllers/notification/listNotifications.js';
import { sentNotification } from './controllers/notification/sentNotification.js';
import { notificationRead } from './controllers/notification/notificationRead.js';
import { allNotificationsRead } from './controllers/notification/allNotificationsRead.js';
import { setRating } from './controllers/ratings/setRating.js';
import { listUserRatings } from './controllers/ratings/listUserRatings.js';
import { myGivenRatings } from './controllers/ratings/myGivenRatings.js';
import { editPost } from './controllers/posts/editPost.js';
import { statusUpdate } from './controllers/posts/statusUpdate.js';
import { deletePost } from './controllers/posts/deletePost.js';
import { deleteRating } from './controllers/ratings/deleteRating.js';
import { getProfile } from './controllers/user/getProfile.js';
import { requireActiveUser } from './middlewares/authReq.js';
import { listJobs } from './controllers/fetching/listJobs.js';
import { listWorkers } from './controllers/fetching/listWorkers.js';
import { listEmployers } from './controllers/fetching/listEmployers.js';
import { getEmployer } from './controllers/fetching/getEmployer.js';
import { getWorker } from './controllers/fetching/getWorker.js';
import { getJob } from './controllers/fetching/getJob.js';

export {
  deletePost,
  deleteRating,
  editPost,
  getEmployer,
  getJob,
  getProfile,
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
  notificationRead,
  allNotificationsRead,
  submitApplication,
  listWorkerApplication,
  requireActiveUser,
  sentNotification,
  registerEmployer,
  registerWorker,
  login,
  updateProfile,
  switchRole,
  createPost,
  logout,
  setRating,
};
