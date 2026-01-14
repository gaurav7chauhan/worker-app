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
        <h4>notifications bell</h4>
      </nav>
      <main>
        <div className="side-bar"></div>
        <div>
          <div className="search-bar"></div>
        </div>
        {/* cards */}
        {role === "worker" ? <div>showing a card</div> : <div></div>}
      </main>
      <footer>footer</footer>
    </div>
  );
};

export default Home;
