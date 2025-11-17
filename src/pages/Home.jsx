import Aside from "../components/Aside";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex min-h-screen">
      <Aside />
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default Home;
