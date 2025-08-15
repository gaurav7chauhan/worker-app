import mongoose from 'mongoose';

const userBio = new mongoose.Schema(
  {
    fullName: { type: String, minlength: 2 },
    
    userType: { type: String, enum: ['worker', 'employer'] },
   
    location: { type: String, minlength: 2 },
    
    experience: { type: Number, min: 0, max: 50 },
    
    skills: [{ type: String }],
   
    preferredCategory: {
      type: String,
      enum: [
        'Household Work',
        'Security Guard',
        'Retail & Store',
        'Construction & Skilled Labor',
        'General Manual Labor',
      ],
    },
   
    education: {
      type: String,
      enum: ['10th Pass', '12th Pass', 'Intermediate', 'College'],
      required: false, // optional by default
    },

    languages: {
      type: String,
      enum: ['English', 'Hindi'],
    },
   
    availability: { type: String, enum: ['Full-time', 'Part-time', 'Shifts'] },
   
    phone: { type: String, match: /^\+?\d{10,15}$/ },
   
    summary: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

export const UserBio = mongoose.model('UserBio', userBio);
