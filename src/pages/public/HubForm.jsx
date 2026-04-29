import React from 'react';
import DynamicForm from '@/components/common/DynamicForm';
import { hubFormConfig } from '@/config/formConfigs';

const HubForm = () => {
  return <DynamicForm config={hubFormConfig} />;
};

export default HubForm;
