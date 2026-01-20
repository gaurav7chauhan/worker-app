import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";

const CreatePost = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const [categories, setCategories] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skills, setSkills] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");

  const statusType = ["Open", "Closed", "Canceled", "Completed"];
  const selectedCategory = watch("category");
  const MAX_SKILLS = 5;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  /* ---------------- Fetch Categories ---------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/meta/job-categories");
        setCategories(res.data);
      } catch {
        showErrToast("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  /* reset skills on category change */
  useEffect(() => {
    setSelectedSkill("");
  }, [selectedCategory, setValue]);

  /* cleanup image URLs */
  useEffect(() => {
    return () => {
      imagePreviews.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, []);

  /* ---------------- Image Handlers ---------------- */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const remainingSlots = 5 - imagePreviews.length;
    if (remainingSlots <= 0) return;

    const validFiles = [];
    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE) {
        showErrToast(`${file.name} exceeds 5MB`);
        continue;
      }
      validFiles.push(file);
      if (validFiles.length >= remainingSlots) break;
    }

    if (!validFiles.length) return;

    setValue("images", [...(getValues("images") || []), ...validFiles], {
      shouldValidate: true,
    });

    const previews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const handleImageCancel = (index) => {
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });

    const files = getValues("images") || [];
    setValue(
      "images",
      files.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  };

  /* ---------------- Location ---------------- */
  const getAddressFromCoords = async (lat, lng) => {
    let toastId = showLoadingToast("Fetching location...");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      setCity(data.address.city || data.address.town || "");
      setNeighbourhood(data.address.neighbourhood || "");
      showSuccessToast("Location fetched", toastId);
    } catch {
      showErrToast("Failed to fetch location", toastId);
    }
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      showErrToast("Geolocation not supported");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        await getAddressFromCoords(latitude, longitude);
        setLocationLoading(false);
      },
      () => {
        showErrToast("Location permission denied");
        setLocationLoading(false);
      },
    );
  };

  /* ---------------- Addition ---------------- */
  const addSkill = () => {
    if (!selectedSkill) return;
    if (skills.length >= MAX_SKILLS) return;
    if (skills.includes(selectedSkill)) return;

    const updated = [...skills, selectedSkill.toLowerCase()];

    setSkills(updated);
    setValue("skills", updated);
    setSelectedSkill("");
  };

  /* ---------------- Submit ---------------- */
  const handleForm = async (data) => {
    let toastId = showLoadingToast("Posting job...");
    try {
      setSubmitLoading(true);

      const formData = new FormData();
      formData.append("category", data.category);
      formData.append("skills", JSON.stringify(data.skills ?? []));
      formData.append("status", data.status);
      formData.append("description", data.description);
      formData.append("budgetAmount", data.budgetAmount);
      formData.append("address[line1]", data.address);
      formData.append("address[city]", city);
      formData.append("address[neighbourhood]", neighbourhood);

      if (location) {
        formData.append("location[type]", "Point");
        formData.append("location[coordinates]", location.lat);
        formData.append("location[coordinates]", location.lng);
      }

      data.images?.forEach((file) => {
        formData.append("images", file);
      });

      await api.post("/post/create", formData);

      showSuccessToast("Job posted successfully", toastId);

      navigate("/login");
    } catch (err) {
      if (err.response.status === 409) {
        return showErrToast(err.response.data.error.message, toastId);
      }
      showErrToast(err.message, toastId);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Create Job Post
          </h1>
          <p className="text-slate-600 text-sm">
            Fill in the details to post your job opportunity
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <form
              onSubmit={handleSubmit(handleForm)}
              className={`space-y-8 ${
                submitLoading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {/* Category & Skills Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("category", {
                      required: "Category is required",
                    })}
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-700 
                    transition-all duration-200 focus:bg-white focus:border-indigo-500 focus:ring-4 
                    focus:ring-indigo-100 outline-none ${
                      errors.category
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200"
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.name} value={c.name.toLowerCase()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5 mt-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Skills Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Skills{" "}
                    <span className="text-slate-400 text-xs font-normal">
                      (max 6)
                    </span>
                  </label>

                  {/* Select + Add */}
                  <div className="flex gap-2">
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl 
                      focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 
                      outline-none transition-all duration-200"
                    >
                      <option value="">Select skill</option>
                      {categories
                        .find((c) => c.name.toLowerCase() === selectedCategory)
                        ?.subcategories.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </select>

                    <Button
                      type="button"
                      onClick={addSkill}
                      disabled={!selectedSkill || skills.length >= MAX_SKILLS}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                      font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 
                      shadow-md hover:shadow-lg"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Selected skills */}
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 
                          border-2 border-indigo-200 px-4 py-2 rounded-full text-sm font-medium 
                          text-indigo-700 hover:border-indigo-300 transition-all duration-200"
                        >
                          <span className="capitalize">{skill}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = skills.filter((s) => s !== skill);
                              setSkills(updated);
                              setValue("skills", updated);
                            }}
                            className="text-red-500 hover:text-red-700 hover:scale-110 
                            transition-all duration-200 font-bold text-lg leading-none"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic py-2">
                        No skills added yet
                      </p>
                    )}
                  </div>

                  {/* Counter */}
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full"></span>
                    {MAX_SKILLS - skills.length} skill
                    {MAX_SKILLS - skills.length !== 1 ? "s" : ""} remaining
                  </p>

                  <input type="hidden" {...register("skills")} />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200"></div>

              {/* Status & Budget Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("status", { required: "Status is required" })}
                    className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-700 
                    transition-all duration-200 focus:bg-white focus:border-indigo-500 focus:ring-4 
                    focus:ring-indigo-100 outline-none ${
                      errors.status
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200"
                    }`}
                  >
                    <option value="">Select status</option>
                    {statusType.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5 mt-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.status.message}
                    </p>
                  )}
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        Budget <span className="text-red-500">*</span>
                      </span>
                    }
                    {...register("budgetAmount", {
                      required: "Budget is required",
                    })}
                    error={errors.budgetAmount?.message}
                    className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl 
                    focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 
                    outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={5}
                  placeholder="Describe the job, requirements, and any additional details..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl 
                  text-slate-700 placeholder-slate-400 focus:bg-white focus:border-indigo-500 
                  focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 
                  resize-none"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200"></div>

              {/* Location Section Header */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Location Details
                </h3>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Input
                  label={
                    <span>
                      Address <span className="text-red-500">*</span>
                    </span>
                  }
                  {...register("address", { required: "Address is required" })}
                  error={errors.address?.message}
                  className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl 
                  focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 
                  outline-none transition-all duration-200"
                />
              </div>

              {/* Get Location Button */}
              <Button
                type="button"
                onClick={getLiveLocation}
                className="w-full sm:w-auto px-6 py-3 bg-white! border-2 border-indigo-600!
                text-indigo-600! font-medium rounded-xl hover:bg-indigo-50! transition-all 
                duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {locationLoading
                  ? "Fetching location..."
                  : "Use Current Location"}
              </Button>

              {/* City & Neighbourhood */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Input
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl 
                    focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 
                    outline-none transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Neighbourhood"
                    value={neighbourhood}
                    onChange={(e) => setNeighbourhood(e.target.value)}
                    className="px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl 
                    focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 
                    outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200"></div>

              {/* Images Section */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Images
                  </h3>
                </div>

                {/* Info Message */}
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-800">
                        Image Upload Guidelines
                      </p>
                      <p className="text-sm text-indigo-700 mt-1">
                        You can upload up to{" "}
                        <span className="font-semibold">5 images</span>. Each
                        image must be under{" "}
                        <span className="font-semibold">5MB</span> in size.
                      </p>
                    </div>
                  </div>
                </div>

                <label
                  htmlFor="imageUpload"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 
                   bg-slate-50 border-2 border-dashed border-slate-300 text-slate-700 
                    rounded-xl font-medium cursor-pointer hover:bg-indigo-50 
                   hover:border-indigo-400 hover:text-indigo-700 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Images
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">
                      {imagePreviews.length} / 5 images uploaded
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {imagePreviews.map((img, i) => (
                        <div
                          key={i}
                          className="relative group aspect-square border-2 border-slate-200 
              rounded-xl overflow-hidden hover:border-indigo-400 transition-all duration-200"
                        >
                          <button
                            type="button"
                            onClick={() => handleImageCancel(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 
                rounded-full flex items-center justify-center text-sm font-bold 
                opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all 
                duration-200 shadow-lg z-10"
                          >
                            ✕
                          </button>
                          <img
                            src={img.url}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200"></div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  type="submit"
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 
                  text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 
                  transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {submitLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Post Job"
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={() => navigate("/")}
                  className="bg-white! text-slate-700! border-2 border-slate-300! 
    font-semibold rounded-xl hover:bg-slate-50! hover:border-slate-400!
    transition-all duration-200 shadow-sm hover:shadow-md flex-1 px-8 py-4"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
