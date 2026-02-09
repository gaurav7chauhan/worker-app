import { useLocation } from "react-router-dom";
import CommonPost from "./CommonPost";

const EditPost = () => {
  const { state } = useLocation();
  const postId = state;

  return (
    <>
      <CommonPost btnType={"Update Post"} mode={"edit"} postId={postId} />
    </>
  );
};

export default EditPost;
