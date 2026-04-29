import React from 'react';
import DynamicForm from '@/components/common/DynamicForm';
import { storeSignupConfig } from '@/config/formConfigs';

const StoreSignup = () => {
  return <DynamicForm config={storeSignupConfig} />;
};

export default StoreSignup;
