// rrd imports
import { Outlet, useLoaderData } from "react-router-dom";

//  helper functions
import { fetchData } from "../helpers";
import AppHeader from "../components/ui/AppHeader";

// loader
export function mainLoader() {
  const userName = fetchData("userName");
  return { userName };
}

const Main = () => {
  //const { userName } = useLoaderData()

  return (
    <div className="layout">
      <AppHeader showLogo={false} reserveBurgerSpace />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
export default Main;
