import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/hub-admin/ThemeContext';

const DeliveryPersonnel = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  return (
    <div className={`p-8 animate-fade-in ${isDark ? 'text-white' : 'text-slate-800'}`}>
      <h2 className="text-2xl font-bold">{t('nav.delivery_personnel')}</h2>
      <p className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        This page is under construction.
      </p>
    </div>
  );
};

export default DeliveryPersonnel;
