// routes/route.jsx
import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout";
import Dashboard from "../pages/Dashboard";
import KameraPage from "../pages/kamera/kamera";
import KameraDetail from "../pages/kamera/KameraDetail";
import Laporan from "../pages/laporan/Laporan";
import Login from "../pages/login";
import Ai from "../pages/AI/AI";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "kamera", element: <KameraPage /> },
      { path: "kamera/:id", element: <KameraDetail /> },
      { path: "laporan", element: <Laporan /> },
      { path: "ai", element: <Ai /> }, // jika ada
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default router;
