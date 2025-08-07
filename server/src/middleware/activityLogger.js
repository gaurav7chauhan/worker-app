import { UserActivity } from '../models/UserActivity.model';

export const activityLogger = (actionType) => {
  return async (req, res, next) => {
    let details = '';
    if (actionType === 'search') details = req.body.searchTerm;
    if (actionType === 'visit_page') details = req.originialUrl;

    const activity = {
      userId: req.user ? req.user._id : null,
      actions: actionType,
      details,
      timestamp: new Date(),
    };

    if (actionType === 'visit_page') {
      activity.duration = req.body.duration;
    }

    await UserActivity.create(activity);

    next();
  };
};
