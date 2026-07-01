import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
  return (
    <>
      <AdminHeader />
      <Outlet />
    </>
  );
};

export default AdminLayout;
