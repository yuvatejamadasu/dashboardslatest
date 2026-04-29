import React from 'react';
import { Outlet } from 'react-router-dom';
import { EmployeeProvider } from './context/EmployeeContext';

const EmployeeLayout = () => {
  return (
    <EmployeeProvider>
      <Outlet />
    </EmployeeProvider>
  );
};

export default EmployeeLayout;
