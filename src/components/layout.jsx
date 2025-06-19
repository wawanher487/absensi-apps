import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"} flex-1 bg-gray-100`}>
        <Outlet />
      </div>
    </div>
  );
}
