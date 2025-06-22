import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  Brain,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setShowModal(false);
    navigate("/login");
  };

  return (
    <>
      <div
        className={`fixed bg-blue-800 text-white h-screen transition-all duration-300 flex flex-col justify-between ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div>
          <div className="p-4 border-b border-blue-600 flex justify-between items-center">
            {!collapsed && (
              <span className="text-xl font-bold">Absensi IoT</span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-2 text-white"
            >
              <Menu size={20} />
            </button>
          </div>

          <nav className="flex flex-col p-4 space-y-2">
            <NavItem
              to="/app/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              collapsed={collapsed}
            />
            <NavItem
              to="/app/kamera"
              icon={<Camera size={18} />}
              label="Data Kamera"
              collapsed={collapsed}
            />
            <NavItem
              to="/app/ai"
              icon={<Brain size={18} />}
              label="Data AI"
              collapsed={collapsed}
            />
            <NavItem
              to="/app/laporan"
              icon={<FileText size={18} />}
              label="Laporan"
              collapsed={collapsed}
            />
          </nav>
        </div>

        <div className="p-4 border-t border-blue-600">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center gap-2 hover:bg-blue-700 p-2 rounded"
          >
            <LogOut size={18} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Konfirmasi Logout</h2>
            <p className="mb-6 text-gray-700">
              Apakah kamu yakin ingin logout dari aplikasi?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavItem({ to, icon, label, collapsed }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 hover:bg-blue-700 p-2 rounded"
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
