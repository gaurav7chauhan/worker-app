import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { showErrToast, showLoadingToast } from "../../utils/toast";
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

  /* -----------------------category---------------------------- */
  const [fetchedApiCategory, setFetchedApiCategory] = useState([]);
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const MAX_CATEGORIES = 3;

  /* -----------------------skills---------------------------- */
  const [fetchedSkills, setFetchedSkills] = useState([]);
  const [skillsSelected, setSkillsSelected] = useState([]);
  const MAX_SKILLS = 6;

  /* -----------------------status type----------------------------- */
  const CREATE_STATUS = ["Open", "Closed"];
  const EDIT_STATUS = ["Open", "Closed", "Canceled", "Completed"];

  const [status, setStatus] = useState("");
  const statusType = mode === "edit" ? EDIT_STATUS : CREATE_STATUS;

  /* ------------------------------------------CATEGORY START-----------------------------------------------------------------*/
  /* -----------------------CATEGORY API CALLING------------------------ */
  useEffect(() => {
    api
      .get("/meta/job-categories")
      .then((res) => setFetchedApiCategory(res.data))
      .catch((error) => {
        console.log("error at category api calling:", error);
      });
  }, []);

  /* -----------------------ADD CATEGORY BTN----------------------------- */
  const handleCategoryAddition = () => {
    const selectedFetchedCategory = getValues("category");
    if (!selectedFetchedCategory) return;
    if (categoriesSelected.includes(selectedFetchedCategory)) {
      showErrToast("Category already added");
      return;
    }
    if (categoriesSelected.length >= MAX_CATEGORIES) {
      showErrToast(`Only add upto ${MAX_CATEGORIES} categories`);
      return;
    }
    setCategoriesSelected((prev) => [...prev, selectedFetchedCategory]);
    setValue("category", "");
  };

  /* -----------------------handleCategoryCancellation---------------------------- */
  const handleCategoryCancellation = (categoryToRemove) => {
    setCategoriesSelected((prev) => {
      const updated = prev.filter((cat) => cat !== categoryToRemove);
      setValue("category", updated);
      return updated;
    });
  };
  /* ----------------------------------------------SKILLS START----------------------------------------------------------------- */
  /* -----------------------ADD OPTIONS SKILLS--------------------------- */

  /* -----------------------ADD SKILL BTN--------------------------------- */
  const handleSkillAddition = () => {};

  /* -----------------------------ADD SKILLS------------------------------------ */

  /* -----------------------handleSkillCancellation---------------------- */
  const handleSkillCancellation = () => {};

  /* --------------------------------------------SUBMIT BTN--------------------------------------------- */
  const isEditMode = mode === "edit";
  let text;

  if (isSubmitting) {
    text = isEditMode ? "Changing..." : "Submitting...";
  } else {
    text = isEditMode ? "Edit" : "Submit";
  }

  /* --------------------------------------HANDLE FORM SUBMISSION------------------------------------------------------------------- */
  const onSubmit = (data) => {};

  return (
    <div className="flex flex-col text-gray-200 justify-center items-center gap-5 bg-blue-700">
      <h1 className="py-4">Create/Edit - Post</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* -----------------------------------CATEGORY----------------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <label htmlFor="category">Category</label>
          <div className="flex gap-5">
            <select
              {...register("category", { required: "Category is required" })}
              className="bg-blue-500"
              id="category"
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
            <p className="text-red-500 text-sm">{errors.category?.message}</p>
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
            >
              <option className="">select status</option>
              {statusType.map((eachType) => (
                <option value={eachType} key={eachType}>
                  {eachType}
                </option>
              ))}
            </select>
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
