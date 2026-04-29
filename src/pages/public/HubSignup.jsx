import React from 'react';
import DynamicForm from '@/components/common/DynamicForm';
import { hubSignupConfig } from '@/config/formConfigs';

const HubSignup = () => {
  return <DynamicForm config={hubSignupConfig} />;
};

export default HubSignup;
