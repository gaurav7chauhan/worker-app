import React from "react";
import { useLocation } from "react-router-dom";

const EditPost = () => {
  const { state } = useLocation();
  const postId = state.id;
  
  return <div>EditPost</div>;
};

export default EditPost;
