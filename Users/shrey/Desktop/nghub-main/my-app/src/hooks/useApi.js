import { useState, useEffect, useCallback, useRef } from 'react';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const useApi = (url, endpoint) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const { getAuthHeaders, logout } = useAuth();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const cacheBuster = `_t=${Date.now()}`;
    const base = url || API_BASE_URL;
    const finalUrl = endpoint.includes('?')
      ? `${base}${endpoint}&${cacheBuster}`
      : `${base}${endpoint}?${cacheBuster}`;

    try {
      const res = await fetch(finalUrl, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        // best-effort error body
        let msg = 'Failed to fetch data';
        try {
          const errJson = await res.json();
          msg = errJson?.message || msg;
        } catch {}
        if (res.status === 401 || res.status === 403) {
          // Auto-logout on auth failures
          logout(true);
        }
        const errorObj = new Error(msg);
        errorObj.status = res.status;
        throw errorObj;
      }

      const result = await res.json();
      if (mounted.current) setData(result);
    } catch (err) {
      if (mounted.current) setError(err.message || 'Request failed');
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [url, endpoint]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

export default useApi;
