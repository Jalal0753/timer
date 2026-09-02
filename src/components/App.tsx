import { Outlet } from "react-router-dom"
import { useEffect } from "react";
import { initDatabase } from "../services/category_service";



function App() {
  
  useEffect(() => {
        initDatabase().catch(console.error);
    }, []);

  return (
    <>
    <Outlet/>
    </>
  )
}

export default App
