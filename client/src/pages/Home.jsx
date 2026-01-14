import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Home = () => {
  const { state } = useLocation();
  const [sideBar, setSideBar] = useState();
  const role = state?.role || localStorage.getItem("role");

  console.log(role);
  return (
    <div>
      <nav>
        <h2>LOGO</h2>
        <div>
          <Link>About</Link>
          <Link>Blog</Link>
          <Link>Contacts</Link>
        </div>
        <div>
        <h4>notifications bell</h4>
        <input type="search input" />
        <button>search</button>
        </div>
      </nav>
      <main>
        {/* cards */}
        {role === "employer" ? (
          <div>showing a card which directs him to job creation</div>
        ) : (
          <div></div>
        )}
        <div></div>
      </main>
      <footer>footer</footer>
    </div>
  );
};

export default Home;
