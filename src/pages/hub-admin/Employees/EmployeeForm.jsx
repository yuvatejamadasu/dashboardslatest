import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "@/context/hub-admin/ThemeContext";
import { useEmployees } from './context/EmployeeContext';
import { Save, X } from 'lucide-react';

const INITIAL_FORM = {
  employeeId: '',
  fullName: '',
  fatherName: '',
  dob: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  emergencyContact: '',
  joiningDate: '',
  employeeType: '',
  department: '',
  designation: '',
  shiftTiming: '',
  salary: '',
};

const EmployeeForm = ({ initialData, onSave, onCancel }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!formData.employeeId) errs.employeeId = 'Employee ID is required';
    if (!formData.fullName) errs.fullName = 'Full Name is required';
    if (!formData.phone) errs.phone = 'Contact Number is required';
    if (!formData.email) errs.email = 'Email is required';
    if (!formData.joiningDate) errs.joiningDate = 'Joining Date is required';
    if (!formData.designation) errs.designation = 'Designation is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let finalValue = value;
    if (name === 'phone' || name === 'emergencyContact') {
      if ('+254 '.startsWith(value) || value === '') {
        finalValue = value;
      } else {
        let digits = value.replace(/\D/g, '');
        if (digits.startsWith('254')) {
          digits = digits.substring(3);
        } else if (digits.startsWith('0')) {
          digits = digits.substring(1);
        }
        if (digits.length > 9) digits = digits.substring(0, 9);
        finalValue = '+254 ' + digits;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  const inputClass = `w-full px-4 py-2.5 rounded-lg text-sm border outline-none transition-colors ${
    isDark
      ? 'bg-[#2c3136] border-slate-600 text-white focus:border-brand'
      : 'bg-white border-slate-300 text-slate-800 focus:border-brand'
  }`;
  
  const labelClass = `block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {/* Basic Details Section */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2c3136] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${isDark ? 'text-white border-slate-700' : 'text-slate-800 border-slate-100'}`}>
          Basic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Employee ID <span className="text-red-500">*</span></label>
            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} className={inputClass} placeholder="e.g. EMP-1001" />
            {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
          </div>
          <div>
            <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} placeholder="Full legal name" />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className={labelClass}>Father / Guardian Name</label>
            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputClass} placeholder="Guardian name" />
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+254 7XX XXXXXX" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className={labelClass}>Email ID <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="name@company.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className={labelClass}>Emergency Contact Number</label>
            <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className={inputClass} placeholder="Emergency Phone" />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className={labelClass}>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className={inputClass} placeholder="Full residential physical address" />
          </div>
        </div>
      </div>

      {/* Employment Details Section */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#2c3136] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className={`text-lg font-bold mb-6 pb-4 border-b ${isDark ? 'text-white border-slate-700' : 'text-slate-800 border-slate-100'}`}>
           Employment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Joining Date <span className="text-red-500">*</span></label>
            <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className={inputClass} />
            {errors.joiningDate && <p className="text-red-500 text-xs mt-1">{errors.joiningDate}</p>}
          </div>
          <div>
            <label className={labelClass}>Employee Type</label>
            <select name="employeeType" value={formData.employeeType} onChange={handleChange} className={inputClass}>
              <option value="">Select Type</option>
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Department</label>
            <select name="department" value={formData.department} onChange={handleChange} className={inputClass}>
              <option value="">Select Department</option>
              <option value="Operations">Operations</option>
              <option value="Sales">Sales</option>
              <option value="IT">IT</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Designation <span className="text-red-500">*</span></label>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange} className={inputClass} placeholder="e.g. Area Manager" />
            {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
          </div>
          <div>
            <label className={labelClass}>Shift Timing</label>
            <select name="shiftTiming" value={formData.shiftTiming} onChange={handleChange} className={inputClass}>
              <option value="">Select Shift</option>
              <option value="9:00 AM - 6:00 PM">Morning (9 AM - 6 PM)</option>
              <option value="2:00 PM - 11:00 PM">Evening (2 PM - 11 PM)</option>
              <option value="10:00 PM - 7:00 AM">Night (10 PM - 7 AM)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Salary / Wage</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>KES</span>
              <input type="number" name="salary" value={formData.salary} onChange={handleChange} className={`${inputClass} pl-12`} placeholder="Monthly Salary" min="0" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mt-8 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <X size={16} /> Cancel
          </button>
        )}
        <button
          type="submit"
          className="cursor-pointer flex items-center gap-2 px-8 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-lg transition-transform active:scale-95 shadow-md shadow-brand/20"
        >
          <Save size={16} /> Save Employee
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
