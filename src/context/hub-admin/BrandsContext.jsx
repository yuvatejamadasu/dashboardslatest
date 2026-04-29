import React, { createContext, useContext, useState, useEffect } from 'react';
import { hubAdminService } from '@/services/hub-admin/hubAdminService';
import { useAuth } from '@/context/AuthContext';

const BrandsContext = createContext();

export const useBrands = () => useContext(BrandsContext);

export const BrandsProvider = ({ children }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();
  const hubId = userData?.hubId || userData?.entityId;

  const fetchBrands = async () => {
    if (!hubId) return;
    try {
      setLoading(true);
      const data = await hubAdminService.getBrands(hubId);
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [hubId]);

  const addBrand = async (newBrandData) => {
    if (!hubId) return;
    try {
      const result = await hubAdminService.addBrand(hubId, newBrandData);
      setBrands(prev => [result, ...prev]);
      return result;
    } catch (error) {
      console.error('Error adding brand:', error);
      throw error;
    }
  };

  const updateBrand = async (brandId, updatedData) => {
    if (!hubId) return;
    try {
      const result = await hubAdminService.updateBrand(brandId, updatedData);
      setBrands(prev => prev.map(b => b.id === brandId ? { ...b, ...result } : b));
      return result;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  };

  const deleteBrand = async (brandId) => {
    if (!hubId) return;
    try {
      await hubAdminService.deleteBrand(brandId, hubId);
      setBrands(prev => prev.filter(b => b.id !== brandId));
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  };

  return (
    <BrandsContext.Provider value={{ brands, addBrand, updateBrand, deleteBrand, loading, refreshBrands: fetchBrands }}>
      {children}
    </BrandsContext.Provider>
  );
};
