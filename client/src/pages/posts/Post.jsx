import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import Input from "../../components/ui/Input";

const Post = () => {
  let { state } = useLocation();
  const mode = state?.mode;

  const postData = "";
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ defaultValues: postData });

  const [imagePreviews, setImagePreviews] = useState([]);

  const [fetchedApiCategory, setFetchedApiCategory] = useState([]);
  const [categoriesSelected, setCategoriesSelected] = useState([]);

  const [skillsSelected, setSkillsSelected] = useState([]);

  const MAX_CATEGORIES = 3;
  const MAX_SKILLS = 6;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_IMAGE = 5;

  /* -----------------------status type----------------------------- */
  const [status, setStatus] = useState("");

  const CREATE_STATUS = ["Open", "Closed"];
  const EDIT_STATUS = ["Open", "Closed", "Canceled", "Completed"];

  const statusType = mode === "edit" ? EDIT_STATUS : CREATE_STATUS;

  /* ------------------------------------------------------ category --------------------------------------------------------------------- */
  /* -----------------------CATEGORY API CALLING------------------------ */
  useEffect(() => {
    api
      .get("/meta/job-categories")
      .then((res) => setFetchedApiCategory(res.data))
      .catch((error) => {
        showErrToast("Category can not fetched");
        console.log("error at category api calling:", error);
      });
  }, []);

  /* -----------------------CATEGORY ADD BTN----------------------------- */
  const handleCategoryAddition = () => {
    const selectedCategory = getValues("categories");
    if (!selectedCategory) {
      showErrToast("Please select a category first");
      return;
    }
    if (categoriesSelected.includes(selectedCategory)) {
      showErrToast("Category already added");
      return;
    }
    if (categoriesSelected.length >= MAX_CATEGORIES) {
      showErrToast(`You can only add upto ${MAX_CATEGORIES} categories`);
      return;
    }
    setCategoriesSelected((prev) => [...prev, selectedCategory]);
    setValue("categories", "");
  };

  /* -----------------------handleCategoryCancellation---------------------------- */
  const handleCategoryCancellation = (categoryToRemove) => {
    if (!categoryToRemove) return;
    setCategoriesSelected((prev) => {
      const updated = prev.filter((category) => category !== categoryToRemove);
      setValue("categories", "");
      return updated;
    });
  };

  /* ---------------------------------------------------- SKILLS ----------------------------------------------------------------- */
  /* -----------------------Derived skills--------------------------- */
  const fetchedSkills = useMemo(() => {
    const selectedSet = new Set(categoriesSelected);
    return fetchedApiCategory
      .filter((obj) => selectedSet.has(obj.name))
      .reverse()
      .flatMap((obj) => obj.subcategories);
  }, [categoriesSelected, fetchedApiCategory]);

  /* -----------------------------------------Cleanup invalid skills--------------------------------- */
  useEffect(() => {
    setSkillsSelected((prev) =>
      prev.filter((skill) => fetchedSkills.includes(skill)),
    );
  }, [fetchedSkills]);

  /* -----------------------SKILL ADD BTN--------------------------------- */
  const handleSkillAddition = () => {
    const selectedSkill = getValues("skills");
    if (!selectedSkill) {
      showErrToast("Please select a skill first");
      return;
    }
    if (skillsSelected.includes(selectedSkill)) {
      showErrToast("already");
      return;
    }
    if (skillsSelected.length >= MAX_SKILLS) {
      showErrToast("", toastId);
      return;
    }
    setSkillsSelected((prev) => [...prev, selectedSkill]);
    setValue("skills", "");
  };

  /* -----------------------handleSkillCancellation---------------------- */
  const handleSkillCancellation = (skillToRemove) => {
    if (!skillToRemove) return;
    setSkillsSelected((prev) => {
      const updated = prev.filter((skill) => skill !== skillToRemove);
      setValue("skills", "");
      return updated;
    });
  };

  /* -------------------------------------------HANDLE IMAGE CHANGE--------------------------------------------- */
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    let hasSizeError = false;
    let hasDuplicateError = false;

    const validFiles = selectedFiles
      .filter((file) => {
        if (file.size > MAX_IMAGE_SIZE) {
          hasSizeError = true;
          return false;
        }
        let isDuplicate = imagePreviews.some(
          (image) =>
            image.file.name === file.name &&
            image.file.size === file.size &&
            image.file.lastModified === file.lastModified,
        );
        if (isDuplicate) {
          hasDuplicateError = true;
          return false;
        }
        return true;
      })
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

    if (hasSizeError) {
      showErrToast("Some images exceed size limit");
    }
    if (hasDuplicateError) {
      showErrToast("Some images are duplicates");
      console.log("DUPLICATE FOUND");
    }
    if (imagePreviews.length + selectedFiles.length > MAX_IMAGE) {
      showErrToast(`Upload only ${MAX_IMAGE} images.`);
      return;
    }

    setImagePreviews((prev) => [...prev, ...validFiles]);
  };

  const handleImageCancel = (cancelledImage) => {
    if (!cancelledImage || imagePreviews.length === 0) return;

    // revoke first
    URL.revokeObjectURL(cancelledImage.preview);

    // then remove
    setImagePreviews((prev) =>
      prev.filter((image) => image.preview !== cancelledImage.preview),
    );
  };

  /* --------------------------------------HANDLE FORM SUBMISSION------------------------------------------------------------------- */
  const onSubmit = (data) => {
    let toastId;
    if (categoriesSelected.length === 0) {
      showErrToast("Add at least one category");
      return;
    }

    toastId = showLoadingToast("Submitting Info");

    const finalResult = {
      ...data,
      employerAssets: imagePreviews ?? [],
      categories: categoriesSelected,
      skills: skillsSelected,
    };
    console.log(finalResult);
  };

  /* --------------------------------------------SUBMIT BTN--------------------------------------------- */
  const isEditMode = mode === "edit";
  let text;

  if (isSubmitting) {
    text = isEditMode ? "Changing..." : "Submitting...";
  } else {
    text = isEditMode ? "Edit" : "Submit";
  }

  return (
    <div className="flex flex-col text-gray-200 justify-center items-center gap-5 bg-blue-700">
      <h1 className="py-4">Create/Edit - Post</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* -----------------------------------CATEGORY----------------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <label htmlFor="categories">Category</label>
          <div className="flex gap-5">
            <select
              {...register("categories")}
              className="bg-blue-500"
              id="categories"
            >
              <option value="" className="">
                select category
              </option>
              {fetchedApiCategory.map((eachCategory) => (
                <option
                  key={eachCategory.name}
                  value={eachCategory.name.toLowerCase()}
                >
                  {eachCategory.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="px-4 py-1 bg-green-500 text-white rounded-xl mt-2"
              onClick={handleCategoryAddition}
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 p-2">
            {categoriesSelected.map((category) => (
              <div key={category} className="flex gap-2">
                [ <p>{category}</p>{" "}
                <span
                  className="cursor-pointer"
                  onClick={() => handleCategoryCancellation(category)}
                >
                  ❌
                </span>{" "}
                ]
              </div>
            ))}
          </div>
        </div>

        {/* -------------------------SKILLS-------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <label htmlFor="skills">skills</label>
          <div className="flex gap-5">
            <select {...register("skills")} className="bg-blue-500" id="skills">
              <option value="" className="">
                select skills
              </option>
              {fetchedSkills.map((skill) => (
                <option value={skill} key={skill}>
                  {skill}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="px-4 py-1 bg-green-500 text-white rounded-xl mt-2"
              onClick={handleSkillAddition}
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 p-2">
            {skillsSelected.map((skill) => (
              <div key={skill} className="flex gap-2">
                [ <p>{skill}</p>{" "}
                <span
                  className="cursor-pointer"
                  onClick={() => handleSkillCancellation(skill)}
                >
                  ❌
                </span>{" "}
                ]
              </div>
            ))}
          </div>
        </div>

        {/* -------------------------STATUS-------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <label htmlFor="status">status</label>
          <div className="flex gap-5">
            <select
              {...register("status", { required: "Status is required" })}
              className="bg-blue-500"
              id="status"
            >
              <option value="">select status</option>
              {statusType.map((eachType) => (
                <option value={eachType} key={eachType}>
                  {eachType}
                </option>
              ))}
            </select>
          </div>
          {errors.status && (
            <p className="text-red-500 text-sm">{errors.status?.message}</p>
          )}
        </div>

        {/* -------------------------BUDGET-------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <label htmlFor="budget">Budget</label>
          <Input
            type="number"
            id="budget"
            {...register("budget", { valueAsNumber: true })}
          />
        </div>

        {/* -------------------------DESCRIPTION-------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            {...register("description")}
            placeholder="Enter neccessary details here..."
          ></textarea>
        </div>

        {/* -------------------------ADDRESS-------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <div className="address">
            <label htmlFor="address">Address</label>
            <Input
              id="address"
              {...register("address", { require: "Please filled address" })}
            />
          </div>
        </div>

        {/* -------------------------IMAGES-------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <label htmlFor="images">Upload Images</label>
          <Input
            type="file"
            id="images"
            multiple
            accept="image/png, image/jpeg, image/webp"
            {...register("images", { onChange: (e) => handleImageChange(e) })}
          />
          <div className="flex justify-between">
            {imagePreviews.map((file, index) => (
              <div key={index} className="flex">
                <span onClick={() => handleImageCancel(file)}>❌</span>
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-32 h-32 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* -------------------------------------SUBMIT BTN------------------------------------------------- */}
        <button disabled={isSubmitting || (isEditMode && !isDirty)}>
          {text}
        </button>
      </form>
    </div>
  );
};

export default Post;
