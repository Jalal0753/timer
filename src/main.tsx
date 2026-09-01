import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Settings from "./components/settings/Settings.tsx";
import Timer from "./components/timer/Timer.tsx";
import App from "./components/App.tsx";
import Statistics from "./components/statistics/Statistics.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Timer/>,
      },
      {
        path: "settings",
        element: <Settings/>,
      },
      {
        path: "stats",
        element: <Statistics/>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);