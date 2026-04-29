import React from 'react';
import DynamicForm from '@/components/common/DynamicForm';
import { storeFormConfig } from '@/config/formConfigs';

const StoreForm = () => {
  return <DynamicForm config={storeFormConfig} />;
};

export default StoreForm;
