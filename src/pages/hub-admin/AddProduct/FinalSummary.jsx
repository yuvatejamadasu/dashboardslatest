import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { hubAdminService } from '@/services/hub-admin/hubAdminService';
import { useAuth } from '@/context/AuthContext';
import './styles/FinalSummary.css';

const DetailsCell = ({ details }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!details) return <span>—</span>;
  if (details.length <= 40) return <span>{details}</span>;
  
  return (
    <div className="details-cell">
      <span>{isExpanded ? details : `${details.substring(0, 40)}...`}</span>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ color: '#1d5ba0', background: 'none', border: 'none', padding: 0, marginLeft: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline' }}
      >
        {isExpanded ? 'Less' : 'More'}
      </button>
    </div>
  );
};

const FinalSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const products = location.state?.products ?? [];
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBack = () => navigate('/hub-dashboard/add-product', { state: { products } });

  const handleConsoleSubmit = async (e) => {
    if (e) e.preventDefault();
    const hubId = userData?.hubId || userData?.entityId;
    if (!hubId) {
      alert('Hub ID not found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const newProducts = products.map((p) => ({
        name: p.productName,
        price: Number(p.sellingPrice) || 0,
        mrp: Number(p.mrp) || 0,
        category: p.category,
        brand: p.brand || '',
        stock: Number(p.itemsCount) || 1,
        image: p.imageUrl || '',
        weight: p.weight || "N/A",
        details: p.details || '',
        status: 'Active'
      }));

      await hubAdminService.addProducts(hubId, newProducts);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error saving products:', error);
      alert('Failed to save products to database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="add-product-page">
        <div className="summary-page" style={{ justifyContent: 'center', alignItems: 'center', padding: '60px 20px' }}>
          <div className="summary-success animate-scale-in" style={{ textAlign: 'center' }}>
            <div className="success-icon" style={{
              width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              color: 'white', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1d5ba0', marginBottom: '12px' }}>Submission Successful!</h1>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Your {products.length} products have been successfully transmitted to the server.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-back" onClick={handleBack} style={{ padding: '12px 24px' }}>
                Add More Products
              </button>
              <button
                className="btn-api-submit"
                onClick={() => navigate('/hub-dashboard/products')}
                style={{ padding: '12px 24px' }}
              >
                Go to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-product-page">
      <div className="summary-page">
        {/* ── Navbar ── */}
        <header className="summary-nav">
          <button className="btn-back" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Edit the Form
          </button>
          <div className="nav-title">
            <h1>Final Submitted Products</h1>
            <span className="nav-count">{products.length} Products</span>
          </div>
          <button className="btn-api-submit" onClick={handleConsoleSubmit} disabled={products.length === 0 || loading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            {loading ? 'Submitting...' : 'Confirm & Submit'}
          </button>
        </header>

        {/* ── Content ── */}
        <div className="summary-content">
          {products.length === 0 ? (
            <div className="summary-empty">
              <p>No products were submitted. Please go back and add products.</p>
              <button className="btn-back-large" onClick={handleBack}>← Go Back</button>
            </div>
          ) : (
            <div className="summary-table-wrapper">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Weight / Qty</th>
                    <th>Selling Price</th>
                    <th>MRP</th>
                    <th>Discount</th>
                    <th>Items</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => {
                    const discount = p.sellingPrice && p.mrp && Number(p.sellingPrice) < Number(p.mrp)
                      ? Math.round(((Number(p.mrp) - Number(p.sellingPrice)) / Number(p.mrp)) * 100)
                      : 0;
                    const unitClass = p.weightType === 'liquid' ? 'liquid' : p.weightType === 'pack' ? 'pack' : 'weight';
                    return (
                      <tr key={p.id}>
                        <td className="td-index">{i + 1}</td>
                        <td className="td-image">
                          <img src={p.imageUrl} alt={p.productName} className="summary-img" />
                        </td>
                        <td className="td-product">
                          <span className="product-name">{p.productName}</span>
                        </td>
                        <td>
                          <span className="badge-cat" style={{ background: '#f1f5f9', color: '#475569' }}>{p.brand || '—'}</span>
                        </td>
                        <td>
                          <span className="badge-cat">{p.category}</span>
                        </td>
                        <td>
                          <span className={`badge-weight badge-weight--${unitClass}`}>{p.weight}</span>
                        </td>
                        <td className="td-price">KES {Number(p.sellingPrice).toFixed(2)}</td>
                        <td className="td-mrp">
                          <span className={discount > 0 ? 'strikethrough' : ''}>KES {Number(p.mrp).toFixed(2)}</span>
                        </td>
                        <td>
                          {discount > 0
                            ? <span className="badge-discount">{discount}% off</span>
                            : <span className="no-discount">—</span>}
                        </td>
                        <td className="td-items">{p.itemsCount || '—'}</td>
                        <td className="td-details">
                          <DetailsCell details={p.details} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalSummary;
