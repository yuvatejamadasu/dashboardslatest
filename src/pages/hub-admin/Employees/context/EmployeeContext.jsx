import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeContext = createContext();

export const useEmployees = () => useContext(EmployeeContext);

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial mock data
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await axios.get('/data/employees.json');
        setEmployees(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const addEmployee = (employee) => {
    // Generate a unique ID
    const newEmployee = {
      ...employee,
      id: Date.now().toString(),
    };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const updateEmployee = (id, updatedData) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updatedData } : emp))
    );
  };

  return (
    <EmployeeContext.Provider value={{ employees, loading, error, addEmployee, updateEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};
