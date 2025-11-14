export const singleWorker = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    if (!workerId) {
      throw new AppError('workerId param is required', { status: 400 });
    }
    if (!mongoose.isValidObjectId(workerId)) {
      throw new AppError('Invalid workerId', { status: 400 });
    }

    const doc = await WorkerProfile.findById(workerId)
      .select('-location')
      .lean();
    if (!doc) {
      throw new AppError('Worker profile not found', { status: 404 });
    }

    return res.status(200).json({
      success: true,
      message: 'Worker fetched successfully',
      worker: doc,
    });
  } catch (e) {
    if (e?.name === 'CasteError') {
      return next(new AppError('Invalid workerId', { status: 400 }));
    }
    return next(e);
  }
};
