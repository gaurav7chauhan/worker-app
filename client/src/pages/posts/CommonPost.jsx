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

        setImagePreviews(
          post.employerAssets.map((asset) => ({
            url: asset.url,
            existing: true,
          })),
        );

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
      imagePreviews.forEach((img) => {
        if (!img.existing) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [imagePreviews]);

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
      if (!prev[index].existing) {
        URL.revokeObjectURL(prev[index].url);
      }
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
      formData.append("categories", JSON.stringify(categoriesSelected));
      formData.append("skills", JSON.stringify(skills));
      formData.append("status", data.status);
      formData.append("description", data.description);
      formData.append("budgetAmount", data.budgetAmount);
      formData.append(
        "address",
        JSON.stringify({
          line1: data.address,
          city: city,
          neighbourhood: neighbourhood,
        }),
      );

      if (location) {
        formData.append(
          "location",
          JSON.stringify({
            type: "Point",
            coordinates: [location.lng, location.lat],
          }),
        );
      }

      const existingAssets = imagePreviews
        .filter((img) => img.existing)
        .map((img) => ({
          type: "image",
          url: img.url,
        }));

      formData.append("employerAssets", JSON.stringify(existingAssets));

      data.images?.forEach((file) => {
        if (file instanceof File) {
          formData.append("employerAssets", file);
        }
      });

      if (mode === "edit") {
        await api.patch(`/post/${postId}`, formData);
      } else {
        await api.post("/post/create", formData);
      }

      showSuccessToast("Job posted successfully", toastId);

      navigate("/posts");
    } catch (err) {
      if (err.response?.status === 409) {
        return showErrToast(err.response.data.error.message, toastId);
      }
      showErrToast(err.message, toastId);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">{btnType}</h1>
          {btnType !== "Update Post" && (
            <p className="text-sm">
              Fill in the details to post your job opportunity
            </p>
          )}
        </div>

        {/* Main Card */}
        <div className="border rounded overflow-hidden">
          <div className="p-10">
            <form
              onSubmit={handleSubmit(handleForm)}
              className={`space-y-10 ${
                submitLoading ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {/* Categories & Skills */}
              <div className="border rounded p-6">
                <h3 className="text-xl font-bold mb-4">Categories & Skills</h3>

                {/* Categories */}
                <div className="mb-6">
                  <label className="block font-semibold mb-2">
                    Select Categories (max {MAX_CATEGORIES})
                  </label>

                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 border p-2 rounded"
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
                      className="border px-4 py-2 rounded"
                    >
                      Add
                    </button>
                  </div>

                  {categoriesSelected.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {categoriesSelected.map((cat) => (
                        <span
                          key={cat}
                          className="flex items-center gap-2 border px-3 py-1 rounded"
                        >
                          <span className="capitalize">{cat}</span>
                          <button
                            type="button"
                            onClick={() => removeCategory(cat)}
                            className="border px-1"
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
                  <label className="block font-semibold mb-2">
                    Select Skills (max {MAX_SKILLS})
                  </label>

                  {categoriesSelected.length === 0 ? (
                    <p>Please select at least one category first</p>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <select
                          value={selectedSkill}
                          onChange={(e) => setSelectedSkill(e.target.value)}
                          className="flex-1 border p-2 rounded"
                        >
                          <option value="">Choose a skill...</option>

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
                          className="border px-4 py-2 rounded"
                        >
                          Add
                        </button>
                      </div>

                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="flex items-center gap-2 border px-3 py-1 rounded"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="border px-1"
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

              {/* Status & Budget */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2">Status</label>

                  <select
                    {...register("status", { required: "Status is required" })}
                    className="w-full border p-2 rounded"
                  >
                    <option value="">Select status</option>
                    {statusType.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {errors.status && (
                    <p className="text-sm">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Budget"
                    type="number"
                    placeholder="Enter budget"
                    {...register("budgetAmount", {
                      required: "Budget is required",
                    })}
                    error={errors.budgetAmount?.message}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold mb-2">Description</label>

                <textarea
                  {...register("description")}
                  rows={5}
                  className="w-full border p-2 rounded"
                  placeholder="Describe the job..."
                />
              </div>

              {/* Divider */}
              <div className="border-t"></div>

              {/* Location */}
              <div className="border rounded p-6">
                <h3 className="text-xl font-bold mb-4">Location Details</h3>

                <div className="mb-4">
                  <Input
                    label="Address"
                    placeholder="Enter full address"
                    {...register("address", {
                      required: "Address is required",
                    })}
                    error={errors.address?.message}
                  />
                </div>

                <button
                  type="button"
                  onClick={getLiveLocation}
                  className="border px-4 py-2 rounded mb-4"
                >
                  {locationLoading
                    ? "Fetching location..."
                    : "Use Current Location"}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              </div>

              {/* Divider */}
              <div className="border-t"></div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Upload Images</h3>

                <label
                  htmlFor="imageUpload"
                  className="border p-4 rounded cursor-pointer inline-block"
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

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {imagePreviews.map((img, i) => (
                      <div
                        key={i}
                        className="relative border rounded overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => handleImageCancel(i)}
                          className="absolute top-1 right-1 border px-1"
                        >
                          ✕
                        </button>

                        <img
                          src={img.url}
                          alt={`Preview ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t"></div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="border px-6 py-3 rounded"
                >
                  {submitLoading ? "Processing..." : btnType}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    btnType === "Update Post"
                      ? navigate("/posts")
                      : navigate("/home")
                  }
                  className="border px-6 py-3 rounded"
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
