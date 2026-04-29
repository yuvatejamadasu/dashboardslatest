import React from 'react';
import { ThemeProvider } from '@/context/super-admin/ThemeContext';
import { ProfileProvider } from '@/context/super-admin/ProfileContext';
import Layout from '@/components/super-admin/Layout';

const SuperAdminWrapper = () => {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <Layout />
      </ProfileProvider>
    </ThemeProvider>
  );
};

export default SuperAdminWrapper;
