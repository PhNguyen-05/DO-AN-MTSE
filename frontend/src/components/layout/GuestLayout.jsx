import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminHeader from './AdminHeader';
import GuestHeader from './GuestHeader';
import UserHeader from './UserHeader';

const GuestLayout = () => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const isStaff = ['Admin', 'Manager', 'Employee'].includes(user?.role);

  return (
    <>
      {isAuthenticated ? (isStaff ? <AdminHeader /> : <UserHeader />) : <GuestHeader />}
      <Outlet />
    </>
  );
};

export default GuestLayout;
