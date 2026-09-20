import { Outlet } from "react-router-dom"
import { useEffect } from "react";
import { initDatabase } from "../services/category_service";
import WindowTitleBar from "./windowTitleBar/WindowTitleBar";



function App() {
  
  useEffect(() => {
        initDatabase().catch(console.error);
    }, []);

  return (
    <>
      <WindowTitleBar />
      <div className="app-content">
        <Outlet />
      </div>
    </>
  )
}

export default App
