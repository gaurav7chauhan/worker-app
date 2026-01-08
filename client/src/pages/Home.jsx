import { Link } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import api from "../api/axios";

const Home = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [categories, setCategories] = useState([]);

  const selectedCategory = watch("category");

  // fetching skills
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await api.get("/meta/job-categories");
      setCategories(res.data);
    };
    fetchCategories();
  }, []);

  const handleForm = async (data) => {};
  return (
    <div>
      <nav className="flex gap-10 w-full p-5">
        <div className="flex justify-between w-[60%]">
          <Link to={"/about"}>About</Link>
          <Link to={"/contact"}>Contacts</Link>
          <Link to={"/project"}>Projects</Link>
          <Link to={"/github"}>Github</Link>
        </div>
        <div className="flex justify-between gap-2 w-[40%]">
          <Input
            type="text"
            placeholder="Search workers/employers..."
            className="w-full"
          />
          <Button>click</Button>
        </div>
      </nav>

      {/* card */}
      <div>
        <h1>form state</h1>
        <form onSubmit={handleSubmit(handleForm)}>
          <div className="bg-amber-600 p-10">
            {/* category */}
            <label className="block mb-2">Category</label>
            <select
              {...register("category", { required: "category is required" })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name.toLowerCase()}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500">{errors.category.message}</p>
            )}

            {/* skills */}
            <label className="block mb-2">Skills</label>
            <select {...register("skills")} className="w-full p-2 border rounded">
              <option value="">Select skills</option>
              {categories
                .find((c) => c.name.toLowerCase() === selectedCategory)
                ?.subcategories.map((s) => (
                  <option key={s} value={s.toLowerCase()}>
                    {s}
                  </option>
                ))}
            </select>

            <Input
              label={"description"}
              type={"text"}
              placeholder="Description"
              {...register("description")}
              error={errors.description?.message}
            />
            <Input
              label={"amount"}
              type={"text"}
              placeholder="Amount"
              {...register("amount", { required: "amount is required" })}
              error={errors.amount?.message}
            />
            <Input
              label={"address"}
              type={"text"}
              placeholder="Address"
              {...register("address", { required: "address is required" })}
              error={errors.address?.message}
            />
            <Input
              label={"location"}
              type={"text"}
              placeholder="Location"
              {...register("location", { required: "location is required" })}
              error={errors.location?.message}
            />
            <Input
              label={"status"}
              type={"text"}
              placeholder="Status"
              {...register("status", { required: "status is required" })}
              error={errors.status?.message}
            />
            <Input
              label={"media"}
              type={"text"}
              placeholder="Employer Assets"
              {...register("media", { required: "media is required" })}
              error={errors.media?.message}
            />
          </div>
          <Button></Button>
        </form>
      </div>
    </div>
  );
};

export default Home;
