import React from 'react';
import { Outlet } from 'react-router-dom';
import GuestHeader from './GuestHeader';

const GuestLayout = () => {
  return (
    <>
      <GuestHeader />
      <Outlet />
    </>
  );
};

export default GuestLayout;
