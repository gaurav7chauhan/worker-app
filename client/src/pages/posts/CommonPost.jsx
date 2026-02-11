import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import Input from "../../components/ui/Input";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";

const CommonPost = ({ btnType, mode, postId }) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const [categories, setCategories] = useState([]); // API categories list
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoriesSelected, setCategoriesSelected] = useState([]);

  const [selectedSkill, setSelectedSkill] = useState("");
  const [skills, setSkills] = useState([]);

  const [imagePreviews, setImagePreviews] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);

  const MAX_CATEGORIES = 3;
  const MAX_SKILLS = 6;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  let statusType =
    mode === "edit"
      ? ["Open", "Closed", "Canceled", "Completed"]
      : ["Open", "Closed"];

  /* ---------------- Fetch Posts Data For Update --------------- */
  useEffect(() => {
    const fetchData = async () => {
      if (mode === "edit") {
        const res = await api.get(`/post/${postId}`);
        const post = res.data.jobPost;
        setCategoriesSelected(post.category || []);
        setSkills(post.skills || []);

        setValue("categories", post.category || []);
        setValue("skills", post.skills || []);
        setValue("status", post.status);
        setValue("description", post.description);
        setValue("budgetAmount", post.budgetAmount);
        setValue("address", post.address?.line1);

        setCity(post.address?.city || "");
        setNeighbourhood(post.address?.neighbourhood || "");
      }
    };
    fetchData();
  }, [mode, postId]);

  /* ---------------- Fetch Categories ---------------- */
  useEffect(() => {
    api
      .get("/meta/job-categories")
      .then((res) => setCategories(res.data))
      .catch(() => showErrToast("Failed to load categories"));
  }, []);

  /* cleanup image URLs */
  useEffect(() => {
    return () => {
      imagePreviews.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, []);

  /* ---------- FILTER SKILLS FROM SELECTED CATEGORIES ---------- */

  const availableSkills = useMemo(() => {
    const set = new Set();
    categoriesSelected.forEach((cat) => {
      const found = categories.find((c) => c.name.toLowerCase() === cat);
      found?.subcategories?.forEach((s) => set.add(s));
    });

    return [...set];
  }, [categoriesSelected, categories]);

  /* ---------- CLEAR INVALID SKILLS WHEN CATEGORIES CHANGE ---------- */
  useEffect(() => {
    // Filter out skills that are no longer available based on current categories
    const validSkills = skills.filter((skill) =>
      availableSkills.includes(skill),
    );

    // Only update if there are invalid skills to remove
    if (validSkills.length !== skills.length) {
      setSkills(validSkills);
      setValue("skills", validSkills);
    }
  }, [availableSkills]); // Run when available skills change

  /* ---------- ADD CATEGORY ---------- */
  const addCategory = () => {
    if (!selectedCategory) return;
    if (categoriesSelected.includes(selectedCategory)) {
      showErrToast("Category already added");
      return;
    }
    if (categoriesSelected.length >= MAX_CATEGORIES) {
      showErrToast(`Maximum ${MAX_CATEGORIES} categories allowed`);
      return;
    }

    const updated = [...categoriesSelected, selectedCategory];
    setCategoriesSelected(updated);
    setValue("categories", updated);
    setSelectedCategory("");
  };

  /* ---------- REMOVE CATEGORY ---------- */
  const removeCategory = (cat) => {
    const updated = categoriesSelected.filter((c) => c !== cat);
    setCategoriesSelected(updated);
    setValue("categories", updated);
    // Skills will be automatically filtered by the useEffect above
  };

  /* ---------------- Image Handlers ---------------- */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const remainingSlots = 5 - imagePreviews.length;
    if (remainingSlots <= 0) {
      showErrToast("Maximum 5 images allowed");
      return;
    }

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

  /* ---------- ADD SKILL ---------- */
  const addSkill = () => {
    if (!selectedSkill) return;
    if (skills.includes(selectedSkill)) {
      showErrToast("Skill already added");
      return;
    }
    if (skills.length >= MAX_SKILLS) {
      showErrToast(`Maximum ${MAX_SKILLS} skills allowed`);
      return;
    }

    const updated = [...skills, selectedSkill];
    setSkills(updated);
    setValue("skills", updated);
    setSelectedSkill("");
  };

  const removeSkill = (skill) => {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    setValue("skills", updated);
  };

  /* ---------------- Submit ---------------- */
  const handleForm = async (data) => {
    if (categoriesSelected.length === 0) {
      showErrToast("Please select at least one category");
      return;
    }

    let toastId = showLoadingToast("Posting job...");
    try {
      setSubmitLoading(true);

      const formData = new FormData();
      formData.append("category", JSON.stringify(categoriesSelected));
      formData.append("skills", JSON.stringify(skills));
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
      console.log(data.images);

      await api.post("/post/create", formData);

      showSuccessToast("Job posted successfully", toastId);

      navigate("/posts");
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
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {btnType}
          </h1>
          {btnType !== "Update Post" && (
            <p className="text-slate-600 text-base">
              Fill in the details to post your job opportunity
            </p>
          )}
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden">
          <div className="p-10 sm:p-12">
            <form
              onSubmit={handleSubmit(handleForm)}
              className={`space-y-10 ${
                submitLoading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {/* Categories & Skills Section */}
              <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <svg
                    className="w-7 h-7 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Categories & Skills
                </h3>

                {/* Categories */}
                <div className="mb-8">
                  <label className="block text-base font-semibold text-slate-800 mb-3">
                    Select Categories <span className="text-red-500">*</span>
                    <span className="text-sm font-normal text-slate-500 ml-2">
                      (max {MAX_CATEGORIES})
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl 
                      text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 
                      outline-none transition-all duration-200"
                      disabled={categoriesSelected.length >= MAX_CATEGORIES}
                    >
                      <option value="">Choose a category...</option>
                      {categories.map((c) => (
                        <option
                          key={c.name}
                          value={c.name.toLowerCase()}
                          disabled={categoriesSelected.includes(
                            c.name.toLowerCase(),
                          )}
                        >
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={addCategory}
                      disabled={
                        !selectedCategory ||
                        categoriesSelected.length >= MAX_CATEGORIES
                      }
                      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl 
                      hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed 
                      transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
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
                      Add
                    </button>
                  </div>

                  {/* CATEGORY CHIPS */}
                  {categoriesSelected.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {categoriesSelected.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 
                          border-indigo-300 text-indigo-700 rounded-full font-medium shadow-sm 
                          hover:shadow-md transition-all duration-200 group"
                        >
                          <span className="capitalize">{cat}</span>
                          <button
                            type="button"
                            onClick={() => removeCategory(cat)}
                            className="w-5 h-5 flex items-center justify-center bg-red-500 
                            text-white rounded-full hover:bg-red-600 transition-colors text-xs 
                            font-bold group-hover:scale-110"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <input type="hidden" {...register("categories")} />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-base font-semibold text-slate-800 mb-3">
                    Select Skills
                    <span className="text-sm font-normal text-slate-500 ml-2">
                      (max {MAX_SKILLS})
                    </span>
                  </label>

                  {categoriesSelected.length === 0 ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-6 h-6 text-yellow-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm font-medium text-yellow-800">
                          Please select at least one category to add skills
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-3">
                        <select
                          value={selectedSkill}
                          onChange={(e) => setSelectedSkill(e.target.value)}
                          className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl 
                          text-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 
                          outline-none transition-all duration-200"
                          disabled={
                            skills.length >= MAX_SKILLS ||
                            availableSkills.length === 0
                          }
                        >
                          <option value="">
                            {availableSkills.length === 0
                              ? "No skills available for selected categories"
                              : "Choose a skill..."}
                          </option>
                          {availableSkills.map((skill) => (
                            <option
                              key={skill}
                              value={skill}
                              disabled={skills.includes(skill)}
                            >
                              {skill}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={addSkill}
                          disabled={
                            !selectedSkill || skills.length >= MAX_SKILLS
                          }
                          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl 
                          hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed 
                          transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
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
                          Add
                        </button>
                      </div>

                      {/* SKILL CHIPS */}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white 
                              border-2 border-purple-300 text-purple-700 rounded-full font-medium 
                              shadow-sm hover:shadow-md transition-all duration-200 group"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="w-5 h-5 flex items-center justify-center bg-red-500 
                                text-white rounded-full hover:bg-red-600 transition-colors text-xs 
                                font-bold group-hover:scale-110"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <input type="hidden" {...register("skills")} />
                </div>
              </div>

              {/* Status & Budget Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status */}
                <div className="space-y-3">
                  <label className="block text-base font-semibold text-slate-800">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("status", { required: "Status is required" })}
                    className={`w-full px-4 py-4 bg-slate-50 border-2 rounded-xl text-slate-700 
                    transition-all duration-200 focus:bg-white focus:border-indigo-500 focus:ring-4 
                    focus:ring-indigo-100 outline-none ${
                      errors.status
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200"
                    }`}
                  >
                    <option value="">Select status</option>
                    {statusType.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                      <svg
                        className="w-5 h-5"
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
                <div className="space-y-3">
                  <Input
                    label={
                      <span className="text-base font-semibold text-slate-800">
                        Budget <span className="text-red-500">*</span>
                      </span>
                    }
                    type="number"
                    placeholder="Enter budget amount"
                    {...register("budgetAmount", {
                      required: "Budget is required",
                      min: { value: 1, message: "Budget must be positive" },
                    })}
                    error={errors.budgetAmount?.message}
                    className="px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl 
                    focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 
                    outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-800">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={6}
                  placeholder="Describe the job, requirements, and any additional details..."
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl 
                  text-slate-700 placeholder-slate-400 focus:bg-white focus:border-indigo-500 
                  focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 
                  resize-none"
                />
              </div>

              {/* Divider */}
              <div className="border-t-2 border-slate-200"></div>

              {/* Location Section */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <svg
                    className="w-7 h-7 text-blue-600"
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

                {/* Address */}
                <div className="space-y-3 mb-6">
                  <Input
                    label={
                      <span className="text-base font-semibold text-slate-800">
                        Address <span className="text-red-500">*</span>
                      </span>
                    }
                    placeholder="Enter full address"
                    {...register("address", {
                      required: "Address is required",
                    })}
                    error={errors.address?.message}
                    className="px-4 py-4 bg-white border-2 border-slate-200 rounded-xl 
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                    outline-none transition-all duration-200"
                  />
                </div>

                {/* Get Location Button */}
                <button
                  type="button"
                  onClick={getLiveLocation}
                  disabled={locationLoading}
                  className="w-full sm:w-auto px-6 py-4 bg-white border-2 border-blue-600
                  text-blue-600 font-semibold rounded-xl hover:bg-blue-50 disabled:bg-slate-100
                  disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed
                  transition-all duration-200 flex items-center justify-center gap-3 shadow-md 
                  hover:shadow-lg mb-6"
                >
                  {locationLoading ? (
                    <>
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
                      Fetching location...
                    </>
                  ) : (
                    <>
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
                      </svg>
                      Use Current Location
                    </>
                  )}
                </button>

                {/* City & Neighbourhood */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Input
                      label={
                        <span className="text-base font-semibold text-slate-800">
                          City
                        </span>
                      }
                      placeholder="City name"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="px-4 py-4 bg-white border-2 border-slate-200 rounded-xl 
                      focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                      outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <Input
                      label={
                        <span className="text-base font-semibold text-slate-800">
                          Neighbourhood
                        </span>
                      }
                      placeholder="Neighbourhood name"
                      value={neighbourhood}
                      onChange={(e) => setNeighbourhood(e.target.value)}
                      className="px-4 py-4 bg-white border-2 border-slate-200 rounded-xl 
                      focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                      outline-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-slate-200"></div>

              {/* Images Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <svg
                    className="w-7 h-7 text-indigo-600"
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
                  Upload Images
                </h3>

                {/* Info Message */}
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-5 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-indigo-600 mt-0.5 shrink-0"
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
                      <p className="text-base font-semibold text-indigo-800">
                        Image Upload Guidelines
                      </p>
                      <p className="text-sm text-indigo-700 mt-1">
                        You can upload up to{" "}
                        <span className="font-bold">5 images</span>. Each image
                        must be under <span className="font-bold">5MB</span> in
                        size.
                      </p>
                    </div>
                  </div>
                </div>

                <label
                  htmlFor="imageUpload"
                  className={`inline-flex items-center justify-center gap-3 px-8 py-4 
                  bg-slate-50 border-2 border-dashed text-slate-700 
                  rounded-xl font-semibold cursor-pointer hover:bg-indigo-50 
                  hover:border-indigo-400 hover:text-indigo-700 transition-all duration-200
                  ${imagePreviews.length >= 5 ? "opacity-50 cursor-not-allowed" : "border-slate-300"}`}
                >
                  <svg
                    className="w-6 h-6"
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
                  {imagePreviews.length >= 5
                    ? "Maximum images reached"
                    : "Add Images"}
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={imagePreviews.length >= 5}
                />

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-slate-700">
                        Uploaded Images: {imagePreviews.length} / 5
                      </p>
                      <div className="w-full max-w-xs bg-slate-200 rounded-full h-2 ml-4">
                        <div
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(imagePreviews.length / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {imagePreviews.map((img, i) => (
                        <div
                          key={i}
                          className="relative group aspect-square border-2 border-slate-200 
                          rounded-2xl overflow-hidden hover:border-indigo-400 transition-all 
                          duration-200 shadow-md hover:shadow-xl"
                        >
                          <button
                            type="button"
                            onClick={() => handleImageCancel(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 
                            rounded-full flex items-center justify-center text-sm font-bold 
                            opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all 
                            duration-200 shadow-lg z-10 hover:scale-110"
                          >
                            ✕
                          </button>
                          <img
                            src={img.url}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs font-medium text-center">
                              Image {i + 1}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-slate-200"></div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 
                  text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 
                  disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  {submitLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg
                        className="animate-spin h-6 w-6"
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
                      Processing...
                    </span>
                  ) : (
                    `${btnType}`
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    btnType === "Update Post"
                      ? navigate("/posts")
                      : navigate("/home")
                  }
                  disabled={submitLoading}
                  className="flex-1 sm:flex-none px-8 py-5 bg-white text-slate-700 border-2 
                  border-slate-300 font-bold text-lg rounded-xl hover:bg-slate-50 
                  hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonPost;
