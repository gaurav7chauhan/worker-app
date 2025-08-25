import { Types } from 'mongoose';
import { JobPost } from '../../models/jobModel';
import { jobPostSchema } from '../../validators/userValidate';

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
      Object.entries(result.data).filter(
        (_, val) => val !== undefined && val !== null
      )
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
      const allowedStatus = ['Open', 'In Progress', 'Completed', 'Cancelled'];
      if (!allowedStatus.includes(req.query.status)) {
        return res.status(400).json({ message: 'Invalid status query' });
      }
      query.status = req.query.status;
    }

    const totalDocs = await JobPost.countDocuments(query);

    const jobPosts = await JobPost.find(query)
      .limit(limit)
      .skip(skip)
      .populate('selectedWorker', 'name email')
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

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Job post ID is required' });
    }

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Job post ID format' });
    }

    const jobPost = await JobPost.findOne({
      _id: id,
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
