const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
});

adminSchema.pre('save', async function (next) {
  if (this.isModified(password)) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  }
  return next();
});

adminSchema.methods.isPasswordMatch = async function (password) {
  return await bcrypt.compare(password, this.password);
};
export const Admin = mongoose.model('Admin', adminSchema);
