import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { showErrToast } from "../../utils/toast";
import { useLocation } from "react-router-dom";

const Post = () => {
  /* -----------------------category---------------------------- */
  const [fetchedApiCategory, setFetchedApiCategory] = useState([]);
  const [selectedFetchedCategory, setSelectedFetchedCategory] = useState("");
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const MAX_CATEGORIES = 3;

  /* -----------------------skills---------------------------- */
  const [fetchedSkills, setFetchedSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skillsSelected, setSkillsSelected] = useState([]);
  const MAX_SKILLS = 6;

  /* -----------------------status type----------------------------- */
  let { state } = useLocation();
  const mode = state?.mode
  const [status, setStatus] = useState("");
  let statusType =
    mode === "edit"
      ? ["Open", "Closed", "Canceled", "Completed"]
      : ["Open", "Closed"];

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
  const handleCategoryAddition = (e) => {
    e.preventDefault();
    if (!selectedFetchedCategory) return;
    if (categoriesSelected.includes(selectedFetchedCategory.toLowerCase())) {
      showErrToast("category already selected");
      return;
    }
    if (categoriesSelected.length >= MAX_CATEGORIES) {
      showErrToast(`Maximum ${MAX_CATEGORIES} categories allowed`);
      return;
    }
    setCategoriesSelected((prev) => [...prev, selectedFetchedCategory]);
    setSelectedFetchedCategory("");
  };

  /* -----------------------handleCategoryCancellation---------------------------- */
  const handleCategoryCancellation = (categoryToRemove) => {
    setCategoriesSelected((prev) =>
      prev.filter((cat) => cat !== categoryToRemove),
    );
  };

  /* ----------------------------------------------SKILLS START----------------------------------------------------------------- */

  /* -----------------------ADD OPTIONS SKILLS--------------------------- */
  useEffect(() => {
    if (categoriesSelected.length === 0) {
      setFetchedSkills([]);
      setSkillsSelected([]);
      return;
    }
    const skills = categoriesSelected.flatMap((categoryName) => {
      const category = fetchedApiCategory.find(
        (cat) => cat.name.toLowerCase() === categoryName,
      );
      return category ? category.subcategories : [];
    });
    const uniqueSkills = [...new Set(skills)];
    setFetchedSkills(uniqueSkills);
    setSkillsSelected((prev) =>
      prev.filter((skill) => uniqueSkills.includes(skill)),
    );
    setSelectedSkill("");
  }, [categoriesSelected, fetchedApiCategory]);

  /* -----------------------ADD SKILL BTN--------------------------------- */
  const handleSkillAddition = (e) => {
    e.preventDefault();
    if (!selectedSkill) return;
    if (skillsSelected.includes(selectedSkill.toLowerCase())) {
      showErrToast("skill already selected");
      return;
    }
    if (skillsSelected.length >= MAX_SKILLS) {
      showErrToast(`Maximum ${MAX_SKILLS} skills allowed`);
      return;
    }

    setSkillsSelected((prev) => [...prev, selectedSkill]);
    setSelectedSkill("");
  };

  /* -----------------------handleSkillCancellation---------------------- */
  const handleSkillCancellation = (skillToRemove) => {
    setSkillsSelected((prev) =>
      prev.filter((skill) => skill !== skillToRemove),
    );
  };

  return (
    <div className="flex flex-col text-gray-200 justify-center items-center gap-5 bg-blue-700">
      <h1 className="py-4">Create/Edit - Post</h1>
      <form>
        {/* -------------------------CATEGORY-------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <label htmlFor="category">Category</label>
          <div className="flex gap-5">
            <select
              className="bg-blue-500"
              value={selectedFetchedCategory}
              onChange={(e) => setSelectedFetchedCategory(e.target.value)}
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
            <button
              className="px-4 py-1 bg-green-500 text-white rounded-xl mt-2"
              onClick={(e) => handleCategoryAddition(e)}
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
            <select
              className="bg-blue-500"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              id="skills"
            >
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
              className="bg-blue-500"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="" className="">
                select status
              </option>
              {statusType.map((eachType) => (
                <option value={eachType} key={eachType}>
                  {eachType}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Post;
