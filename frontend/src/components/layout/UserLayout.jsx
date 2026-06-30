import React from 'react';
import { Outlet } from 'react-router-dom';
import UserHeader from './UserHeader';

const UserLayout = () => {
  return (
    <>
      <UserHeader />
      <Outlet />
    </>
  );
};

export default UserLayout;
