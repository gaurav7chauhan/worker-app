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
    setSkills([]);
    setValue("skills", []);
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
      { shouldValidate: true }
    );
  };

  /* ---------------- Location ---------------- */
  const getAddressFromCoords = async (lat, lng) => {
    let toastId = showLoadingToast("Fetching location...");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
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
      }
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
    <div className="min-h-screen bg-slate-100">
      <div className="flex justify-center py-12 px-4">
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-800 mb-8">
            Create Job Post
          </h1>

          <form
            onSubmit={handleSubmit(handleForm)}
            className={`space-y-6 ${
              submitLoading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {/* Group 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className={`input bg-white border-slate-300 text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                    errors.category ? "border-red-500!" : ""
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
                  <>
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
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
                  </>
                )}
              </div>

              {/* Skills Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Skills (max 6)
                </label>

                {/* Select + Add */}
                <div className="flex gap-3 max-w-xl">
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="flex-1 input bg-white border-slate-300"
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
                  >
                    Add
                  </Button>
                </div>

                {/* Selected skills */}
                <div className="flex flex-wrap gap-1">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-2 bg-slate-100 border border-slate-300
                     px-3 py-1.5 rounded-full text-sm"
                      >
                        <span className="capitalize">{skill}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = skills.filter((s) => s !== skill);
                            setSkills(updated);
                            setValue("skills", updated);
                          }}
                          className="text-red-600 text-xl hover:scale-125 transition-all duration-300 font-medium"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No skills added</p>
                  )}
                </div>

                {/* Counter */}
                <p className="text-xs text-slate-500">
                  {MAX_SKILLS - skills.length} skills remaining
                </p>

                <input type="hidden" {...register("skills")} />
              </div>
            </div>

            {/* Group 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  {...register("status", { required: "Status is required" })}
                  className={`input bg-white border-slate-300 text-slate-700 focus:border-slate-900
                    focus:ring-1 focus:ring-slate-900 ${
                      errors.status ? "border-red-500!" : ""
                    }`}
                >
                  <option value="">Select status</option>
                  {statusType.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {errors.status && (
                  <>
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
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
                  </>
                )}
              </div>

              {/* Budget */}
              <Input
                label="Budget *"
                {...register("budgetAmount", {
                  required: "Budget is required",
                })}
                error={errors.budgetAmount?.message}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={5}
                placeholder="Describe the job, add more additional skills..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Address */}
            <Input
              label="Address *"
              {...register("address", { required: "Address is required" })}
              error={errors.address?.message}
            />

            {/* Location */}
            <Button
              type="button"
              onClick={getLiveLocation}
              className="bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              {locationLoading ? "Fetching..." : "Use current location"}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="Neighbourhood"
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
              />
            </div>

            {/* Images */}
            <div>
              <label
                htmlFor="imageUpload"
                className="inline-flex items-center justify-center border border-slate-300 text-slate-700 
                px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:text-white hover:bg-slate-800 transition"
              >
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
            </div>

            <div className="flex gap-3 flex-wrap">
              {imagePreviews.map((img, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 border border-slate-300 rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => handleImageCancel(i)}
                    className="absolute top-1 right-1 bg-slate-900 text-white text-xs px-1.5 py-0.5 rounded"
                  >
                    ✕
                  </button>
                  <img src={img.url} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="w-full bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                {submitLoading ? "Uploading..." : "Upload Job"}
              </Button>

              <Button
                type="button"
                onClick={() => navigate("/")}
                className="w-full border border-slate-300 text-slate-700 hover:bg-slate-900 transition"
              >
                Home
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
