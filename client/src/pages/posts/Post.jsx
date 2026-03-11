import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { showErrToast } from "../../utils/toast";

const Post = () => {
  /* -----------------------category---------------------------- */
  const [fetchedCategory, setFetchedCategory] = useState([]);
  const [selectedFetchedCategory, setSelectedFetchedCategory] = useState("");
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const MAX_CATEGORIES = 3;

  /* -----------------------skills---------------------------- */
  const [fetchedSkills, setFetchedSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skillsSelected, setSkillsSelected] = useState([]);
  const MAX_SKILLS = 6;

  /* ------------------------------------------CATEGORY START-----------------------------------------------------------------*/
  /* -----------------------CATEGORY API CALLING------------------------ */
  useEffect(() => {
    api
      .get("/meta/job-categories")
      .then((res) => setFetchedCategory(res.data))
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
  const handleCategoryCancellation = () => {};

  /* ----------------------------------------------SKILLS START----------------------------------------------------------------- */
  /* -----------------------ADD OPTIONS SKILLS--------------------------- */
  useEffect(() => {
    if (categoriesSelected.length === 0) return;
    const lastCategory = categoriesSelected[categoriesSelected.length - 1];
    const category = fetchedCategory.find(
      (cat) => cat.name.toLowerCase() === lastCategory.toLowerCase(),
    );
    if (category) {
      setFetchedSkills(category.subcategories);
    }
  }, [categoriesSelected, fetchedCategory]);

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
  const handleSkillCancellation = () => {};

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
              {fetchedCategory.map((eachCategory) => (
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
              <div className="flex gap-2">
                [ <p>{category}</p>{" "}
                <span
                  className="cursor-pointer"
                  onClick={handleCategoryCancellation}
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
              <div className="flex gap-2">
                [ <p>{skill}</p>{" "}
                <span
                  className="cursor-pointer"
                  onClick={handleSkillCancellation}
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
            <select className="bg-blue-500" name="" id="status">
              <option value="" className="">
                select status
              </option>
              <option value="" className="">
                cleaning
              </option>
            </select>
            <button className="px-4 py-1 bg-green-500 text-white rounded-xl mt-2">
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Post;
