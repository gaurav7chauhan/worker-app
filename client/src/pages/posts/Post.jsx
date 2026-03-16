import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  showErrToast,
  showLoadingToast,
  showSuccessToast,
} from "../../utils/toast";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";

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

  const [fetchedApiCategory, setFetchedApiCategory] = useState([]);
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  
  const [skillsSelected, setSkillsSelected] = useState([]);
  
  const MAX_CATEGORIES = 3;
  const MAX_SKILLS = 6;

  /* -----------------------status type----------------------------- */
  const [status, setStatus] = useState("");
  
  const CREATE_STATUS = ["Open", "Closed"];
  const EDIT_STATUS = ["Open", "Closed", "Canceled", "Completed"];

  const statusType = mode === "edit" ? EDIT_STATUS : CREATE_STATUS;

  let toastId;
  /* ------------------------------------------------------ category --------------------------------------------------------------------- */
  /* -----------------------CATEGORY API CALLING------------------------ */
  useEffect(() => {
    api
      .get("/meta/job-categories")
      .then((res) => setFetchedApiCategory(res.data))
      .catch((error) => {
        showErrToast("Category can not fetched", toastId);
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
      showErrToast("Category already added", toastId);
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
      showErrToast("already", toastId);
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

  /* --------------------------------------------SUBMIT BTN--------------------------------------------- */
  const isEditMode = mode === "edit";
  let text;

  if (isSubmitting) {
    text = isEditMode ? "Changing..." : "Submitting...";
  } else {
    text = isEditMode ? "Edit" : "Submit";
  }

  /* --------------------------------------HANDLE FORM SUBMISSION------------------------------------------------------------------- */
  const onSubmit = (data) => {
    const finalResult = {
      ...data,
      categories: categoriesSelected,
      skills: skillsSelected
    }
    console.log(finalResult);
  };

  return (
    <div className="flex flex-col text-gray-200 justify-center items-center gap-5 bg-blue-700">
      <h1 className="py-4">Create/Edit - Post</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* -----------------------------------CATEGORY----------------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <label htmlFor="category">Category</label>
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
          {errors?.category && (
            <p className="text-red-500 text-sm">{errors.category?.message}</p>
          )}
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
            <select {...register("status")} className="bg-blue-500">
              <option className="">select status</option>
              {statusType.map((eachType) => (
                <option value={eachType} key={eachType}>
                  {eachType}
                </option>
              ))}
            </select>
          </div>
          {errors.status && <p>{errors.status?.message}</p>}
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
