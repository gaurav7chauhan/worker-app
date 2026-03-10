import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { showErrToast } from "../../utils/toast";

const Post = () => {
  /* -----------------------category---------------------------- */
  const [fetchedCategory, setFetchedCategory] = useState([]);
  const [selectFetchedCategory, setSelectFetchedCategory] = useState("");
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const MAX_CATEGORIES = 3;

  /* -----------------------skills---------------------------- */
  const [fetchedSkills, setFetchedSkills] = useState([]);
  const [selectSkill, setSelectSkill] = useState("");
  const [skillsSelected, setSkilledSelected] = useState([]);

  /* -----------------------CATEGORY API CALLING------------------------ */
  useEffect(() => {
    api
      .get("/meta/job-categories")
      .then((res) => setFetchedCategory(res.data))
      .catch((error) => {
        console.log("error at category api calling:", error);
      });
  }, []);

  /* -----------------------ADD CATEGORY----------------------------------- */
  const addCategory = (e) => {
    e.preventDefault();
    if (!selectFetchedCategory) return;
    if (categoriesSelected.includes(selectFetchedCategory.toLowerCase())) {
      showErrToast("category already selected");
      return;
    }
    if (categoriesSelected.length >= MAX_CATEGORIES) {
      showErrToast(`Maximum ${MAX_CATEGORIES} categories allowed`);
      return;
    }
    setCategoriesSelected((prev) => [...prev, selectFetchedCategory]);
    setSelectFetchedCategory("");
  };

  /* -----------------------ADD SKILLS----------------------------------- */
  useEffect(() => {
    const lastCategory = categoriesSelected[categoriesSelected.length - 1];
    const category = fetchedCategory.find(
      (cat) => cat.name === lastCategory,
    );
    if (category) {
      setFetchedSkills(category.subcategories);
    } else {
      setFetchedCategory([])
    }
  }, [categoriesSelected]);

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
              value={selectFetchedCategory}
              onChange={(e) => setSelectFetchedCategory(e.target.value)}
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
              onClick={(e) => addCategory(e)}
            >
              Add
            </button>
          </div>
        </div>

        {/* -------------------------SKILLS-------------- */}
        <div className="flex flex-col bg-blue-800 w-screen items-center py-8">
          <label htmlFor="skills">skills</label>
          <div className="flex gap-5">
            <select className="bg-blue-500" name="" id="skills">
              <option value="" className="">
                select skills
              </option>
              {fetchedSkills.map((skill) => (
                <option value={skill} key={skill}>
                  {skill}
                </option>
              ))}
            </select>
            <button className="px-4 py-1 bg-green-500 text-white rounded-xl mt-2">
              Add
            </button>
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
