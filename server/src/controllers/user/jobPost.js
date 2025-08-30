import { isValidObjectId, set, Types } from 'mongoose';
import { JobPost } from '../../models/jobModel.js';
import { jobPostSchema } from '../../validators/userValidate.js';

export const createJobPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }
    const userId = req.user?._id;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Please send Data' });
    }

    const result = jobPostSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const fields = Object.fromEntries(
      Object.entries(result.data).filter((_, val) => val !== null)
    );

    const jobPost = await JobPost.create({
      owner: userId,
      ...fields,
    });

    if (!jobPost) {
      return res.status(400).json({ message: 'Failed to create job post' });
    }

    return res
      .status(201)
      .json({ message: 'Job post created successfully', jobPost });
  } catch (error) {
    console.error('Error creating job post:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUserJobPosts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized User' });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ message: 'Invalid page or limit' });
    }

    const skip = (page - 1) * limit;

    const query = { owner: req.user._id };

    if (req.query?.status) {
      const allowedStatus = new Set([
        'Open',
        'In Progress',
        'Completed',
        'Cancelled',
      ]);

      if (req.query.status && !allowedStatus.has(req.query.status)) {
        return res.status(400).json({ message: 'Invalid status query' });
      }
      query.status = req.query.status;
    }

    const totalDocs = await JobPost.countDocuments(query);

    const jobPosts = await JobPost.find(query)
      .limit(limit)
      .skip(skip)
      .populate('worker', 'name email')
      .sort({ createdAt: -1 });

    if (jobPosts.length === 0 && totalDocs === 0) {
      return res.status(404).json({ message: 'No job posts found' });
    }

    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      message: 'Job posts fetched successfully',
      jobPosts,
      totalPages,
      hasNextPage,
      hasPrevPage,
      totalDocs,
    });
  } catch (error) {
    console.error('Error fetching user job posts:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserJobPostById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized User' });
    }

    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ message: 'Job post ID is required' });
    }

    if (!Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid Job post ID format' });
    }

    const jobPost = await JobPost.findOne({
      _id: jobId,
      owner: req.user._id,
    }).populate('selectedWorker', 'name email');

    if (!jobPost) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    return res
      .status(200)
      .json({ message: 'Job post fetched successfully', jobPost });
  } catch (error) {
    console.error('Error fetching user job post by ID:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleStatusToCompleted = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized User' });
  }

  const { jobId } = req.params;
  const { status } = req.body;

  if (!jobId || !isValidObjectId(jobId)) {
    return res.status(400).json({ message: 'Invalid Job post ID' });
  }

  const allowed = new Set(['Completed', 'Cancelled']);

  if (!allowed.has(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const job = await JobPost.findOneAndUpdate(
    {
      _id: jobId,
      employer: req.user._id,
      status: { $ne: 'Completed' },
    },
    { $set: { status: 'Completed' } },
    { new: true, runValidators: true }
  ).select('employer status');

  if (!job) {
    return res
      .status(404)
      .json({ message: 'Job not found or already in target status' });
  }

  return res.status(200).json({ message: `Job marked as ${status}`, job });
};
