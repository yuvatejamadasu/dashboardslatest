import React from 'react';
import DynamicLoginForm from '@/components/common/DynamicLoginForm';
import { storeLoginConfig } from '@/config/formConfigs';

const StoreLogin = () => {
  return <DynamicLoginForm config={storeLoginConfig} />;
};

export default StoreLogin;
