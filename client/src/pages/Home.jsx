import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../utils/toast";

const Home = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [locationLoading, setLocationLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");
  const [city, setCity] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  const statusType = ["Open", "Closed", "Canceled", "Completed"];
  const selectedCategory = watch("category");

  /* ---------------- Fetch Categories ---------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/meta/job-categories");
        setCategories(res.data);
      } catch (err) {
        showErrToast("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  /* Reset skills when category changes */
  useEffect(() => {
    setValue("skills", "");
  }, [selectedCategory, setValue]);

  /* cleans up memory when image previews are no longer needed */
  useEffect(() => {
    return () => {
      imagePreviews.forEach((img) => {
        URL.revokeObjectURL(img.url);
      });
    };
  }, []);

  const handleImageCancel = (index) => {
    setImagePreviews((prev) => {
      // cleanup memory
      URL.revokeObjectURL(prev[index].url);

      // remove preview
      const updatedPreviews = prev.filter((_, i) => i !== index);

      return updatedPreviews;
    });

    // update react-hook-form images
    const currentFiles = getValues("images") || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== index);

    setValue("images", updatedFiles, { shouldValidate: true });
  };

  /* handle image change */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setValue("images", files, { shouldValidate: true });

    setImagePreviews((prev) => {
      const remainingSlots = 5 - prev.length;

      if (remainingSlots <= 0) return prev;

      const selectedFiles = files.slice(0, remainingSlots);

      const newPreviews = selectedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...newPreviews];
    });

    e.target.value = "";
  };

  /* ---------------- Reverse Geocoding ---------------- */
  const getAddressFromCoords = async (lat, lng) => {
    let toastId;
    try {
      toastId = showLoadingToast("Fetching location...");

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      if (!res.ok) {
        showErrToast("Failed to fetch location", toastId);
        return;
      }

      const data = await res.json();

      setCity(
        data.address.city || data.address.town || data.address.village || ""
      );
      setNeighbourhood(data.address.neighbourhood || "");

      showSuccessToast("Location fetched successfully", toastId);
    } catch (err) {
      showErrToast("Unable to fetch location", toastId);
      console.error(err);
    }
  };

  /* ---------------- Get Live Location ---------------- */
  const getLiveLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation({ lat, lng });
        await getAddressFromCoords(lat, lng);

        setLocationLoading(false);
      },
      () => {
        setLocationError("Permission denied or unable to fetch location");
        setLocationLoading(false);
      }
    );
  };

  /* ---------------- Submit Form ---------------- */
  const handleForm = async (data) => {
    let toastId;
    try {
      setSubmitLoading(true);
      toastId = showLoadingToast("Posting job...");

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

      if (data.images?.length) {
        Array.from(data.images || []).forEach((file) => {
          formData.append("images", file);
        });
      }

      await api.post("/jobs/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccessToast("Job posted successfully", toastId);
    } catch (err) {
      showErrToast(err?.response?.data?.message || "Job post failed", toastId);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex gap-8 text-sm font-medium text-gray-700">
            <Link to="/about" className="hover:text-black">
              About
            </Link>
            <Link to="/contact" className="hover:text-black">
              Contact
            </Link>
            <Link to="/project" className="hover:text-black">
              Projects
            </Link>
            <Link to="/github" className="hover:text-black">
              Github
            </Link>
          </div>

          <div className="flex gap-2 min-w-96">
            <Input placeholder="Search workers or employers..." />
            <Button>Search</Button>
          </div>
        </div>
      </nav>

      {/* Form */}
      <div className="flex justify-center py-12 px-4">
        <div className="w-full max-w-2xl bg-white border rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-semibold mb-1">Create Job Post</h1>
          <p className="text-sm text-blue-700 mb-6">
            Fields marked * are required
          </p>

          {/* FORM */}
          <form
            onSubmit={handleSubmit(handleForm)}
            className={`space-y-6 ${
              submitLoading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {/* Category */}
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Category *
              </label>
              <select
                {...register("category", { required: "Category is required" })}
                className=" w-full
                px-4 py-2
                rounded-lg
                bg-white text-gray-500
                border border-gray-300 outline-1 outline-transparent
                focus:outline-black
                focus:border-black
                transition"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name.toLowerCase()}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Skills
              </label>
              <select
                {...register("skills")}
                className=" w-full
                px-4 py-2
                rounded-lg
                bg-white text-gray-500
                border border-gray-300 outline-1 outline-transparent
                focus:outline-black
                focus:border-black
                transition"
              >
                <option value="">Select skills</option>
                {categories
                  .find((c) => c.name.toLowerCase() === selectedCategory)
                  ?.subcategories.map((s) => (
                    <option key={s} value={s.toLowerCase()}>
                      {s}
                    </option>
                  ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Status
              </label>
              <select
                {...register("status")}
                className=" w-full
                px-4 py-2
                rounded-lg
                bg-white text-gray-500
                border border-gray-300 outline-1 outline-transparent
                focus:outline-black
                focus:border-black
                transition"
              >
                <option value="">Select status</option>
                {statusType.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Description"
              placeholder="Describe the job"
              {...register("description")}
            />

            <Input
              label="Budget (₹) *"
              placeholder="Enter amount"
              {...register("amount", { required: "Amount is required" })}
              error={errors.amount?.message}
            />

            <Input
              label="Address *"
              placeholder="House no, street, area"
              {...register("address", { required: "Address is required" })}
              error={errors.address?.message}
            />

            {/* BTN live location */}
            <div>
              <Button
                type="button"
                onClick={getLiveLocation}
                disabled={locationLoading}
              >
                {locationLoading
                  ? "📍 Fetching location..."
                  : city && neighbourhood
                  ? "✅ Location added"
                  : "📍 Use current location"}
              </Button>

              <p className="text-xs text-gray-500 mt-1">
                City & neighbourhood will be auto-filled
              </p>
              {locationError && (
                <p className="text-xs text-red-500 mt-1">{locationError}</p>
              )}
            </div>

            {/* city & neighbourhood */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="neighbourhood"
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
              />
            </div>

            {/* image upload */}
            <div>
              <label
                htmlFor="imageUpload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition"
              >
                📸 Upload max 5 Images
              </label>
              <input
                type="file"
                id="imageUpload"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e)}
              />
              {imagePreviews.length === 5 && (
                <p className="text-xs text-red-500 mt-1">
                  You can upload a maximum of 5 images
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-3 flex-wrap">
              {imagePreviews.map((img, index) => (
                <div className="relative w-16 h-16 border rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleImageCancel(index)}
                    className="absolute top-0 right-0 bg-black text-white text-xs px-1 rounded-bl"
                  >
                    ✕
                  </button>

                  <img
                    src={img.url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You can upload multiple images (JPG, PNG)
            </p>
            <Button className="w-full py-2 text-base" disabled={submitLoading}>
              {submitLoading ? "Uploading..." : "Upload Job"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
