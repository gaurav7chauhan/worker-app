import { Link, useNavigate } from "react-router-dom";
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
  const [imagePreviews, setImagePreviews] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [city, setCity] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");

  const statusType = ["Open", "Closed", "Canceled", "Completed"];
  const selectedCategory = watch("category");

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
    setValue("skills", "");
  }, [selectedCategory, setValue]);

  /* cleanup image URLs */
  useEffect(() => {
    return () => {
      imagePreviews.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [imagePreviews]);

  /* ---------------- Image Handlers ---------------- */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const remainingSlots = 5 - imagePreviews.length;
    if (remainingSlots <= 0) return;

    const selectedFiles = files.slice(0, remainingSlots);

    setValue("images", [...(getValues("images") || []), ...selectedFiles]);

    const previews = selectedFiles.map((file) => ({
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
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
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
        setLocationError("Location permission denied");
        setLocationLoading(false);
      }
    );
  };

  /* ---------------- Submit ---------------- */
  const handleForm = async (data) => {
    let toastId = showLoadingToast("Posting job...");
    try {
      setSubmitLoading(true);

      const formData = new FormData();
      formData.append("category", data.category);
      formData.append("skills", data.skills);
      formData.append("status", data.status);
      formData.append("description", data.description);
      formData.append("amount", data.amount);
      formData.append("address[line1]", data.address);
      formData.append("address[city]", city);
      formData.append("address[neighbourhood]", neighbourhood);

      if (location) {
        formData.append("lat", location.lat);
        formData.append("lng", location.lng);
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
              <div>
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
                  <p className="text-xs text-red-500 mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <select
                {...register("skills")}
                className="input bg-white border-slate-300 text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              >
                <option value="">Select skills</option>
                {categories
                  .find((c) => c.name.toLowerCase() === selectedCategory)
                  ?.subcategories.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
              </select>
            </div>

            {/* Group 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select
                  {...register("status", { required: "Status is required" })}
                  className={`input bg-white border-slate-300 text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                    errors.status ? "border-red-500!" : ""
                  }`}
                >
                  <option value="">Select status</option>
                  {statusType.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>

              <Input
                label="Budget *"
                {...register("amount", { required: "Budget is required" })}
                error={errors.amount?.message}
              />
            </div>

            {/* Description */}
            <textarea
              {...register("description")}
              rows={5}
              placeholder="Describe the job"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-700 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />

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
