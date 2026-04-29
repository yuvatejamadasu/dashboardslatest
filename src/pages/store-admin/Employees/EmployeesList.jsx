import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from "@/context/store-admin/ThemeContext";
import { Search, Plus, Eye, Briefcase, Mail, Phone, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { useEmployees } from './context/EmployeeContext';

const EmployeesList = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { employees, loading, error } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState(localStorage.getItem('storeEmployeesViewMode') || 'list');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('storeEmployeesViewMode', mode);
  };

  // Pagination State via URL queries for seamless back-navigation
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const rowsPerPage = parseInt(searchParams.get('limit') || '10', 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-brand animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  
  const startIndex = (validPage - 1) * rowsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString(), limit: rowsPerPage.toString() });
  };

  const handleLimitChange = (newLimit) => {
    setSearchParams({ page: '1', limit: newLimit.toString() });
  };

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Employees
          </h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your staff and internal team members
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/store-dashboard/employees/create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-transform active:scale-95 shadow-md shadow-brand/20 whitespace-nowrap"
          >
            <Plus size={16} />
            Create Employee
          </button>
        </div>
      </div>

      {/* Table / Grid */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark ? 'bg-[#2c3136] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchParams({ page: '1', limit: rowsPerPage.toString() });
              }}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand'
              }`}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#1a1d21] border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-[#1d5ba0] shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
              title="List View"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-[#1d5ba0] shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b ${
                    isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Employee ID
                  </th>
                  <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Employee Name
                  </th>
                  <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Role / Dept
                  </th>
                  <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Contact
                  </th>
                  <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'} text-right`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className={`border-b last:border-b-0 transition-colors ${
                        isDark ? 'border-slate-700/50 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="p-4">
                        <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-brand'}`}>
                          {emp.employeeId}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0`}
                          >
                            {emp.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {emp.fullName}
                            </p>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {emp.employeeType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>
                            {emp.designation}
                          </span>
                          <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Briefcase size={12} />
                            {emp.department}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 cursor-default">
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-white' : 'text-slate-600'}`}>
                            <Phone size={12} className="text-emerald-500" />
                            {emp.phone}
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Mail size={12} />
                            {emp.email}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate(`/store-dashboard/employees/${emp.id}`)}
                          className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'bg-slate-800 text-slate-300 hover:bg-brand hover:text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-brand hover:text-white'
                          }`}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 text-sm font-medium">
                      No employees found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((emp) => (
                <div key={emp.id} className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#212529] border-slate-700/50' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {emp.employeeType}
                    </span>
                    <span className={`text-[10px] font-black ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>
                      {emp.employeeId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0">
                      {emp.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{emp.fullName}</h4>
                      <p className={`text-xs mt-0.5 font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{emp.designation}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{emp.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{emp.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={`text-xs font-semibold truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{emp.email}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <button 
                      onClick={() => navigate(`/store-dashboard/employees/${emp.id}`)}
                      className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-black transition-all bg-brand text-white hover:bg-brand-hover shadow-md"
                    >
                      <Eye size={14} className="mr-2" /> View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm font-medium">
                No employees found matching your search.
              </div>
            )}
          </div>
        )}
        
        {/* Pagination Controls */}
        {filteredEmployees.length > 0 && (
          <div className={`flex flex-col sm:flex-row items-center justify-between p-4 border-t ${isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className={`text-xs font-medium mb-4 sm:mb-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Showing <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{startIndex + 1}</span> to{' '}
              <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {Math.min(startIndex + rowsPerPage, filteredEmployees.length)}
              </span>{' '}
              of <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{filteredEmployees.length}</span> entries
              <span className="mx-3 border-l border-slate-300 dark:border-slate-600"></span>
              <select
                value={rowsPerPage}
                onChange={(e) => handleLimitChange(e.target.value)}
                className={`ml-2 outline-none cursor-pointer rounded-md border p-1 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(validPage - 1)}
                disabled={validPage === 1}
                className={`p-1.5 rounded-lg transition-colors ${
                  validPage === 1
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Numeric Page Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  // Optional: Basic windowing if too many pages
                  .filter(p => p === 1 || p === totalPages || (p >= validPage - 1 && p <= validPage + 1))
                  .map((p, i, arr) => {
                    // Inject ellipsis logic securely
                    if (i > 0 && arr[i] - arr[i - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${p}`}>
                          <span className={`text-xs px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>...</span>
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                              validPage === p
                                ? 'bg-brand text-white shadow-md shadow-brand/20'
                                : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          validPage === p
                            ? 'bg-brand text-white shadow-md shadow-brand/20'
                            : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(validPage + 1)}
                disabled={validPage === totalPages}
                className={`p-1.5 rounded-lg transition-colors ${
                  validPage === totalPages
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesList;
