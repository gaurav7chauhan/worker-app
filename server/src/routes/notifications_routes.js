import { Router } from 'express';
import {
  allNotificationsRead,
  listNotifications,
  notificationRead,
  sentNotification,
} from '../singleImport';

const router = Router();

router.get('/', listNotifications);
router.post('/send', sentNotification);
router.patch('/readAll', allNotificationsRead);
router.patch('/:notificationId/read', notificationRead);

export default router;
