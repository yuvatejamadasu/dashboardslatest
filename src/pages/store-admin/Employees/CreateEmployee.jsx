import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "@/context/store-admin/ThemeContext";
import { ArrowLeft } from 'lucide-react';
import { useEmployees } from './context/EmployeeContext';
import EmployeeForm from './EmployeeForm';

const CreateEmployee = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { addEmployee } = useEmployees();

  const handleSave = (employeeData) => {
    addEmployee(employeeData);
    navigate('/store-dashboard/employees');
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/store-dashboard/employees')}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Create Employee
          </h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Add a new staff member to the directory
          </p>
        </div>
      </div>

      <EmployeeForm onSave={handleSave} onCancel={() => navigate('/store-dashboard/employees')} />
    </div>
  );
};

export default CreateEmployee;
