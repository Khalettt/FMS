import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './layouts/sidebar';
import { Header } from './layouts/Header';
import "../../css/home.css"
// import "./index.css"

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} />

      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300`}
        style={{
          marginLeft: collapsed ? '70px' : '240px',
        }}
      >
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 transition-colors overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;
