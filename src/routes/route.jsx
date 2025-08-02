// routes/route.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../components/layout";
import Dashboard from "../pages/Dashboard";
import KameraPage from "../pages/kamera/kamera";
import KameraDetail from "../pages/kamera/KameraDetail";
import Laporan from "../pages/laporan/Laporan";
import Login from "../pages/Login";
import Ai from "../pages/AI/AI";
import DetailAI from "../pages/AI/AiDetail";
import ProtectedRoute from "../components/protectedRoute";
import Karyawan from "../pages/karyawan/Karyawan";
import DetailKaryawan from "../pages/karyawan/DetailKaryawan";
import TambahKaryawan from "../pages/karyawan/TambahKaryawan";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "kamera", element: <KameraPage /> },
      { path: "kamera/:id", element: <KameraDetail /> },
      { path: "laporan", element: <Laporan /> },
      { path: "ai", element: <Ai /> },
      { path: "ai/:id", element: <DetailAI /> },
      { path: "karyawan", element: <Karyawan /> },
      { path: "karyawan/tambah", element: <TambahKaryawan /> },
      { path: "karyawan/:id", element: <DetailKaryawan /> },
    ],
  },
]);

export default router;
