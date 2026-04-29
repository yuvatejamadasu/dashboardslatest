import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API, API_HEADERS } from '@/config/store-admin/api';

// Reviews are fetched from API.REVIEWS on first load (falls back to local JSON),
// then persisted to localStorage for subsequent visits.

export const ReviewsContext = createContext();

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // On mount: load from localStorage or fetch from JSON
  useEffect(() => {
    const saved = localStorage.getItem('primebasket_reviews');
    if (saved) {
      try {
        setReviews(JSON.parse(saved));
        setLoaded(true);
        return;
      } catch (e) { /* fall through */ }
    }
    
    // Helper: try a URL, return parsed JSON or throw
    const tryFetch = async (url, config = {}) => {
      const { data } = await axios.get(url, config);
      return Array.isArray(data) ? data : (data?.reviews ?? data?.Reviews ?? []);
    };

    const loadReviews = async () => {
      try {
        // 1. Try the API endpoint
        const data = await tryFetch(API.REVIEWS, { headers: API_HEADERS });
        setReviews(data);
      } catch (err) {
        try {
          // 2. If API fails, fall back to local JSON
          const data = await tryFetch('/data/reviews.json');
          setReviews(data);
        } catch (fallbackErr) {
          setReviews([]);
        }
      } finally {
        setLoaded(true);
      }
    };
    loadReviews();
  }, []);

  // Persist to localStorage whenever reviews change (after initial load)
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('primebasket_reviews', JSON.stringify(reviews));
    }
  }, [reviews, loaded]);

  const addReview = (review) => {
    const nextId = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
    const newDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
    setReviews([{ id: nextId, date: newDate, status: 'active', ...review }, ...reviews]);
  };

  const updateReview = (updatedReview) => {
    setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r));
  };

  const deleteReview = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  return (
    <ReviewsContext.Provider value={{ reviews, setReviews, addReview, updateReview, deleteReview }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error('useReviews must be used within a ReviewsProvider');
  return context;
};
