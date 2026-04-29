import React from 'react';
import DynamicLoginForm from '@/components/common/DynamicLoginForm';
import { hubLoginConfig } from '@/config/formConfigs';

const HubLogin = () => {
  return <DynamicLoginForm config={hubLoginConfig} />;
};

export default HubLogin;
