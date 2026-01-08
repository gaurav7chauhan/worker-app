import { jobCategories } from "../common/categories.js"

export const getJobCategories = (req, res) => {
    return res.status(200).json(jobCategories)
}