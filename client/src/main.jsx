import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Chatai from "./pages/Chatai.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App element={<Home />} />,
  },
  {
    path: "/chatai",
    element: <App element={<Chatai />} />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
