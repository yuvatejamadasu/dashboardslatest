import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from "@/context/hub-admin/ThemeContext";
import { useEmployees } from './context/EmployeeContext';
import { ArrowLeft, Edit3, User, Briefcase, Phone, Mail, Hash, MapPin, Calendar, Activity } from 'lucide-react';
import EmployeeForm from './EmployeeForm';

const EmployeeDetails = () => {
  const { isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, updateEmployee } = useEmployees();
  const [isEditing, setIsEditing] = useState(false);

  const employee = employees.find((emp) => emp.id === id);

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-bold text-slate-700">Employee not found</h2>
        <button onClick={() => navigate('/hub-dashboard/employees')} className="mt-4 text-brand font-bold hover:underline">
          Return to directory
        </button>
      </div>
    );
  }

  const handleSave = (updatedData) => {
    updateEmployee(id, updatedData);
    setIsEditing(false); // return to view mode on successful edit save
  };

  const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b last:border-0 border-slate-100 dark:border-slate-800">
      <div className={`mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{icon}</div>
      <div className="min-w-0">
        <span className={`block text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {label}
        </span>
        <span className={`block text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {value || '—'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/hub-dashboard/employees')}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {employee.fullName}
              <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {employee.employeeId}
              </span>
            </h2>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {employee.designation} • {employee.department}
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors shadow-sm ${
              isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <EmployeeForm initialData={employee} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Basic View */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2c3136] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className={`text-lg font-bold mb-4 pb-3 border-b ${isDark ? 'text-white border-slate-700' : 'text-slate-800 border-slate-100'}`}>
               Basic Details
            </h3>
            <div className="space-y-1">
              <DetailRow icon={<User size={16} />} label="Full Name" value={employee.fullName} />
              <DetailRow icon={<Hash size={16} />} label="Employee ID" value={employee.employeeId} />
              <DetailRow icon={<User size={16} />} label="Father / Guardian" value={employee.fatherName} />
              <DetailRow icon={<Calendar size={16} />} label="Date of Birth" value={employee.dob} />
              <DetailRow icon={<User size={16} />} label="Gender" value={employee.gender} />
              <DetailRow icon={<Phone size={16} />} label="Mobile Number" value={employee.phone} />
              <DetailRow icon={<Mail size={16} />} label="Email Address" value={employee.email} />
              <DetailRow icon={<Activity size={16} />} label="Emergency Contact" value={employee.emergencyContact} />
              <DetailRow icon={<MapPin size={16} />} label="Address" value={employee.address} />
            </div>
          </div>

          {/* Card 2: Employment View */}
          <div className={`p-6 rounded-2xl border h-fit ${isDark ? 'bg-[#2c3136] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className={`text-lg font-bold mb-4 pb-3 border-b ${isDark ? 'text-white border-slate-700' : 'text-slate-800 border-slate-100'}`}>
               Employment Details
            </h3>
            <div className="space-y-1">
              <DetailRow icon={<Calendar size={16} />} label="Joining Date" value={employee.joiningDate} />
              <DetailRow icon={<Briefcase size={16} />} label="Employee Type" value={employee.employeeType} />
              <DetailRow icon={<Briefcase size={16} />} label="Department" value={employee.department} />
              <DetailRow icon={<Briefcase size={16} />} label="Designation" value={employee.designation} />
              <DetailRow icon={<Activity size={16} />} label="Shift Timing" value={employee.shiftTiming} />
              <DetailRow icon={<Hash size={16} />} label="Salary / Wage" value={employee.salary ? `KES ${Number(employee.salary).toLocaleString()}` : ''} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
