// // // import React, { createContext, useContext, useState, useEffect } from 'react';

// // // const AuthContext = createContext();

// // // export const useAuth = () => {
// // //   const context = useContext(AuthContext);
// // //   if (!context) {
// // //     throw new Error('useAuth must be used within an AuthProvider');
// // //   }
// // //   return context;
// // // };

// // // export const AuthProvider = ({ children }) => {
// // //   const [user, setUser] = useState(null);
// // //   const [token, setToken] = useState(null);
// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => {
// // //     const initAuth = () => {
// // //       try {
// // //         const storedToken = localStorage.getItem('token');
// // //         const storedUser = localStorage.getItem('user');

// // //         if (storedToken && storedUser) {
// // //           const parsedUser = JSON.parse(storedUser);
// // //           if (parsedUser && parsedUser.id && parsedUser.role) {
// // //             setToken(storedToken);
// // //             setUser(parsedUser);
// // //             console.log('✅ Auth restored:', parsedUser.name, `(${parsedUser.role})`);
// // //           } else {
// // //             console.log('❌ Invalid stored user data');
// // //             localStorage.clear();
// // //           }
// // //         } else {
// // //           console.log('🔍 No stored auth data found');
// // //         }
// // //       } catch (error) {
// // //         console.error('❌ Auth init error:', error);
// // //         localStorage.clear();
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     initAuth();
// // //   }, []);

// // //   const login = async (email, password) => {
// // //     try {
// // //       const response = await fetch('/api/auth/login', {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ email, password }),
// // //       });

// // //       const data = await response.json();

// // //       if (data.success && data.user && data.token) {
// // //         setUser(data.user);
// // //         setToken(data.token);
// // //         localStorage.setItem('token', data.token);
// // //         localStorage.setItem('user', JSON.stringify(data.user));
        
// // //         console.log('✅ Login successful:', data.user.name, `(${data.user.role})`);
// // //         return { success: true, user: data.user };
// // //       }

// // //       return { success: false, error: data.error || 'Login failed' };
// // //     } catch (error) {
// // //       console.error('❌ Login error:', error);
// // //       return { success: false, error: 'Network error. Please try again.' };
// // //     }
// // //   };

// // //   const logout = async () => {
// // //     try {
// // //       if (token) {
// // //         await fetch('/api/auth/logout', {
// // //           method: 'POST',
// // //           headers: { 'Authorization': `Bearer ${token}` },
// // //         });
// // //       }
// // //     } catch (error) {
// // //       console.error('❌ Logout API error:', error);
// // //     } finally {
// // //       setUser(null);
// // //       setToken(null);
// // //       localStorage.clear();
      
// // //       console.log('✅ Logged out successfully');
// // //       window.location.replace('/login');
// // //     }
// // //   };

// // //   const isAuthenticated = !!user && !!token;
  
// // //   const hasRole = (role) => user && user.role === role;
  
// // //   const getAuthHeaders = () => {
// // //     if (!token) return {};
// // //     return {
// // //       'Authorization': `Bearer ${token}`,
// // //       'Content-Type': 'application/json'
// // //     };
// // //   };

// // //   return (
// // //     <AuthContext.Provider value={{
// // //       user,
// // //       token,
// // //       loading,
// // //       isAuthenticated,
// // //       login,
// // //       logout,
// // //       hasRole,
// // //       getAuthHeaders,
// // //     }}>
// // //       {children}
// // //     </AuthContext.Provider>
// // //   );
// // // };




// // import React, { createContext, useContext, useState, useEffect } from 'react';

// // const AuthContext = createContext();

// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (!context) {
// //     throw new Error('useAuth must be used within an AuthProvider');
// //   }
// //   return context;
// // };

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [token, setToken] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   // Initialize auth from localStorage
// //   useEffect(() => {
// //     const initAuth = () => {
// //       try {
// //         const storedToken = localStorage.getItem('token');
// //         const storedUser = localStorage.getItem('user');

// //         if (storedToken && storedUser) {
// //           const parsedUser = JSON.parse(storedUser);
// //           if (parsedUser?.id && parsedUser?.role) {
// //             setUser(parsedUser);
// //             setToken(storedToken);
// //             console.log('✅ Auth restored:', parsedUser.name, `(${parsedUser.role})`);
// //           } else {
// //             console.warn('❌ Invalid stored user data, clearing auth');
// //             localStorage.removeItem('token');
// //             localStorage.removeItem('user');
// //           }
// //         } else {
// //           console.log('🔍 No stored auth data found');
// //         }
// //       } catch (err) {
// //         console.error('❌ Auth initialization error:', err);
// //         localStorage.clear();
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     initAuth();
// //   }, []);

// //   // Login function
// //   const login = async (email, password) => {
// //     try {
// //       const res = await fetch('/api/auth/login', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ email, password }),
// //       });

// //       const data = await res.json();

// //       if (data.success && data.user && data.token) {
// //         setUser(data.user);
// //         setToken(data.token);
// //         localStorage.setItem('token', data.token);
// //         localStorage.setItem('user', JSON.stringify(data.user));

// //         console.log('✅ Login successful:', data.user.name, `(${data.user.role})`);
// //         return { success: true, user: data.user };
// //       }

// //       return { success: false, error: data.error || 'Login failed' };
// //     } catch (err) {
// //       console.error('❌ Login API error:', err);
// //       return { success: false, error: 'Network error. Please try again.' };
// //     }
// //   };

// //   // Logout function
// //   const logout = async () => {
// //     try {
// //       if (token) {
// //         await fetch('/api/auth/logout', {
// //           method: 'POST',
// //           headers: { Authorization: `Bearer ${token}` },
// //         });
// //       }
// //     } catch (err) {
// //       console.error('❌ Logout API error:', err);
// //     } finally {
// //       setUser(null);
// //       setToken(null);
// //       localStorage.clear();
// //       console.log('✅ Logged out successfully');
// //       window.location.replace('/login');
// //     }
// //   };

// //   // Helpers
// //   const isAuthenticated = !!user && !!token;

// //   const hasRole = (role) => user?.role === role;

// //   const getAuthHeaders = () => {
// //     if (!token) return {};
// //     return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
// //   };

// //   return (
// //     <AuthContext.Provider
// //       value={{
// //         user,
// //         token,
// //         loading,
// //         isAuthenticated,
// //         login,
// //         logout,
// //         hasRole,
// //         getAuthHeaders,
// //       }}
// //     >
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };


// import React, { createContext, useContext, useState, useEffect } from 'react';

// // Create context
// const AuthContext = createContext();

// // Custom hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within an AuthProvider');
//   return context;
// };

// // Provider component
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Initialize auth state from localStorage
//   useEffect(() => {
//     const initAuth = () => {
//       try {
//         const storedToken = localStorage.getItem('token');
//         const storedUser = localStorage.getItem('user');

//         if (storedToken && storedUser) {
//           const parsedUser = JSON.parse(storedUser);
//           if (parsedUser?.id && parsedUser?.role) {
//             setToken(storedToken);
//             setUser(parsedUser);
//             console.log('✅ Auth restored:', parsedUser.name, `(${parsedUser.role})`);
//           } else {
//             console.warn('❌ Invalid stored user data, clearing storage');
//             localStorage.clear();
//           }
//         }
//       } catch (error) {
//         console.error('❌ Auth init error:', error);
//         localStorage.clear();
//       } finally {
//         setLoading(false);
//       }
//     };

//     initAuth();
//   }, []);

//   // Login function
//   const login = async (email, password) => {
//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (data?.success && data?.user && data?.token) {
//         setUser(data.user);
//         setToken(data.token);
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));

//         console.log('✅ Login successful:', data.user.name, `(${data.user.role})`);
//         return { success: true, user: data.user };
//       }

//       return { success: false, error: data?.error || 'Login failed' };
//     } catch (error) {
//       console.error('❌ Login error:', error);
//       return { success: false, error: 'Network error. Please try again.' };
//     }
//   };

//   // Logout function
//   const logout = async () => {
//     try {
//       if (token) {
//         await fetch('/api/auth/logout', {
//           method: 'POST',
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }
//     } catch (error) {
//       console.error('❌ Logout API error:', error);
//     } finally {
//       setUser(null);
//       setToken(null);
//       localStorage.clear();
//       console.log('✅ Logged out successfully');
//       window.location.replace('/login');
//     }
//   };

//   // Derived states
//   const isAuthenticated = !!user && !!token;
//   const hasRole = (role) => user?.role === role;

//   // Helper for API calls
//   const getAuthHeaders = () => {
//     if (!token) return {};
//     return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         loading,
//         isAuthenticated,
//         login,
//         logout,
//         hasRole,
//         getAuthHeaders,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };




import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import API_BASE_URL from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Decode a JWT without external libraries to read expiry (exp)
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const jsonPayload = decodeURIComponent(atob(padded).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  const scheduleAutoLogout = useMemo(() => (
    (jwt) => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      const decoded = jwt ? decodeJwt(jwt) : null;
      if (!decoded?.exp) return;
      const expiryMs = decoded.exp * 1000;
      const delay = Math.max(expiryMs - Date.now(), 0);
      logoutTimerRef.current = setTimeout(() => {
        logout(true);
      }, delay);
    }
  ), []);

  // Validate existing token on mount
  useEffect(() => {
    const init = async () => {
      try {
        if (token) {
          // If token appears expired locally, logout immediately
          const decoded = decodeJwt(token);
          if (decoded?.exp && decoded.exp * 1000 <= Date.now()) {
            return logout(true);
          }
          // Validate with backend
          const res = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Invalid token');
          const data = await res.json();
          if (data?.success && data?.user) {
            setUser(data.user);
            // Refresh stored user with server copy
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          scheduleAutoLogout(token);
        } else {
          // No token: ensure clean state
          localStorage.removeItem('user');
        }
      } catch {
        logout(true);
      } finally {
        setLoading(false);
      }
    };
    init();
    // Cleanup timer on unmount
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [token, scheduleAutoLogout]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        return { success: false, error: data?.error || 'Login failed' };
      }
      if (data?.token && data?.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        scheduleAutoLogout(data.token);
        return { success: true, user: data.user };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (err) {
      return { success: false, error: err?.message || 'Network error' };
    }
  };

  const logout = async (silent = false) => {
    try {
      if (token && !silent) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // ignore
    } finally {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!silent) {
        window.location.replace('/login');
      }
    }
  };

  const isAuthenticated = !!user && !!token;

  const getAuthHeaders = () => {
    if (!token) return { 'Content-Type': 'application/json' };
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
