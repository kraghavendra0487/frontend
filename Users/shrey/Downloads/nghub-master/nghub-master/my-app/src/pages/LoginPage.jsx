// // // // // import React, { useState, useEffect } from 'react';
// // // // // import { useNavigate, useLocation } from 'react-router-dom';
// // // // // import { useAuth } from '../context/AuthContext';
// // // // // import AnimatedLoginForm from '../components/AnimatedLoginForm';

// // // // // const LoginPage = () => {
// // // // //   const { login, user, isAuthenticated, loading } = useAuth();
// // // // //   const [error, setError] = useState('');
// // // // //   const navigate = useNavigate();
// // // // //   const location = useLocation();

// // // // //   useEffect(() => {
// // // // //     if (!loading && isAuthenticated && user) {
// // // // //       const intendedPath = location.state?.from?.pathname;

// // // // //       let defaultPath;
// // // // //       switch (user.role) {
// // // // //         case 'admin':
// // // // //           defaultPath = '/admin/dashboard';
// // // // //           break;
// // // // //         case 'employee':
// // // // //           defaultPath = '/employee';
// // // // //           break;
// // // // //         default:
// // // // //           defaultPath = '/login';
// // // // //       }

// // // // //       const isAllowed =
// // // // //         intendedPath &&
// // // // //         ((user.role === 'admin' && intendedPath.startsWith('/admin')) ||
// // // // //          (user.role === 'employee' && intendedPath.startsWith('/employee')));

// // // // //       const targetPath = isAllowed ? intendedPath : defaultPath;

// // // // //       console.log('📝 LoginPage: Redirecting authenticated user to:', targetPath);
// // // // //       console.log('📝 Path analysis:', { 
// // // // //         intendedPath, 
// // // // //         defaultPath, 
// // // // //         isAllowed, 
// // // // //         finalTarget: targetPath,
// // // // //         userRole: user.role 
// // // // //       });
      
// // // // //       navigate(targetPath, { replace: true });
// // // // //     }
// // // // //   }, [isAuthenticated, user, loading, navigate, location.state]);

// // // // //   const handleLogin = async (userData) => {
// // // // //     setError('');
// // // // //     console.log('📝 LoginPage: Login form submitted');
// // // // //   };

// // // // //   const handleForgotPassword = () => {
// // // // //     console.log('📝 Forgot password clicked');
// // // // //   };

// // // // //   if (!loading && isAuthenticated) {
// // // // //     return (
// // // // //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
// // // // //         <div className="text-center">
// // // // //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// // // // //           <p className="text-gray-600">Redirecting to dashboard...</p>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <div className="min-h-screen bg-gray-50">
// // // // //       <AnimatedLoginForm 
// // // // //         onLogin={handleLogin}
// // // // //         onForgotPassword={handleForgotPassword}
// // // // //       />
      
// // // // //       {error && (
// // // // //         <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50">
// // // // //           <div className="flex items-center">
// // // // //             <span className="mr-2">❌</span>
// // // // //             <span>{error}</span>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default LoginPage;




// // // // import React, { useState, useEffect } from 'react';
// // // // import { useNavigate, useLocation } from 'react-router-dom';
// // // // import { useAuth } from '../context/AuthContext';
// // // // import AnimatedLoginForm from '../components/AnimatedLoginForm';

// // // // const LoginPage = () => {
// // // //   const { login, user, isAuthenticated, loading } = useAuth();
// // // //   const [error, setError] = useState('');
// // // //   const navigate = useNavigate();
// // // //   const location = useLocation();

// // // //   // Redirect authenticated users
// // // //   useEffect(() => {
// // // //     if (!loading && isAuthenticated && user) {
// // // //       const intendedPath = location.state?.from?.pathname;

// // // //       let defaultPath;
// // // //       switch (user.role) {
// // // //         case 'admin':
// // // //           defaultPath = '/admin/dashboard';
// // // //           break;
// // // //         case 'employee':
// // // //           defaultPath = '/employee';
// // // //           break;
// // // //         default:
// // // //           defaultPath = '/login';
// // // //       }

// // // //       // Allow redirect to intended path if allowed for the user's role
// // // //       const isAllowed =
// // // //         intendedPath &&
// // // //         ((user.role === 'admin' && intendedPath.startsWith('/admin')) ||
// // // //          (user.role === 'employee' && intendedPath.startsWith('/employee')));

// // // //       const targetPath = isAllowed ? intendedPath : defaultPath;
// // // //       navigate(targetPath, { replace: true });
// // // //     }
// // // //   }, [isAuthenticated, user, loading, navigate, location.state]);

// // // //   const handleLogin = async (formData) => {
// // // //     setError('');
// // // //     const { email, password } = formData;

// // // //     const result = await login(email.trim(), password);
// // // //     if (!result.success) {
// // // //       setError(result.error || 'Login failed');
// // // //     }
// // // //   };

// // // //   const handleForgotPassword = () => {
// // // //     console.log('Forgot password clicked');
// // // //   };

// // // //   if (!loading && isAuthenticated) {
// // // //     return (
// // // //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
// // // //         <div className="text-center">
// // // //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// // // //           <p className="text-gray-600">Redirecting to dashboard...</p>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="min-h-screen bg-gray-50">
// // // //       <AnimatedLoginForm
// // // //         onLogin={handleLogin}
// // // //         onForgotPassword={handleForgotPassword}
// // // //       />
// // // //       {error && (
// // // //         <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50">
// // // //           <div className="flex items-center">
// // // //             <span className="mr-2">❌</span>
// // // //             <span>{error}</span>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default LoginPage;





// // // import React, { useState, useEffect } from 'react';
// // // import { useNavigate, useLocation } from 'react-router-dom';
// // // import { useAuth } from '../context/AuthContext';
// // // import AnimatedLoginForm from '../components/AnimatedLoginForm';

// // // const LoginPage = () => {
// // //   const { login, user, isAuthenticated, loading } = useAuth();
// // //   const [error, setError] = useState('');
// // //   const navigate = useNavigate();
// // //   const location = useLocation();

// // //   // Redirect after successful login
// // //   useEffect(() => {
// // //     if (!loading && isAuthenticated && user) {
// // //       const intendedPath = location.state?.from?.pathname;

// // //       // Decide default dashboard based on role
// // //       const defaultPath =
// // //         user.role === 'admin' ? '/admin/dashboard' :
// // //         user.role === 'employee' ? '/employee' :
// // //         '/login';

// // //       // Check if intended path is allowed for the role
// // //       const isAllowed =
// // //         intendedPath &&
// // //         ((user.role === 'admin' && intendedPath.startsWith('/admin')) ||
// // //          (user.role === 'employee' && intendedPath.startsWith('/employee')));

// // //       const targetPath = isAllowed ? intendedPath : defaultPath;

// // //       navigate(targetPath, { replace: true });
// // //     }
// // //   }, [isAuthenticated, user, loading, navigate, location.state]);

// // //   // Handle login form submission
// // //   const handleLogin = async ({ email, password }) => {
// // //     setError('');
// // //     const result = await login(email.trim(), password);
// // //     if (!result.success) {
// // //       setError(result.error || 'Login failed. Please try again.');
// // //     }
// // //   };

// // //   const handleForgotPassword = () => {
// // //     console.log('Forgot password clicked');
// // //     // Implement forgot password logic here
// // //   };

// // //   if (!loading && isAuthenticated) {
// // //     return (
// // //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
// // //         <div className="text-center">
// // //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// // //           <p className="text-gray-600">Redirecting to dashboard...</p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// // //       <AnimatedLoginForm
// // //         onLogin={handleLogin}
// // //         onForgotPassword={handleForgotPassword}
// // //         error={error}
// // //       />
// // //     </div>
// // //   );
// // // };

// // // export default LoginPage;


// // import React, { useState, useEffect } from 'react';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';
// // import AnimatedLoginForm from '../components/AnimatedLoginForm';

// // const LoginPage = () => {
// //   const { login, isAuthenticated, user, loading } = useAuth();
// //   const [error, setError] = useState('');
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const from = location.state?.from?.pathname || '/';

// //   // Redirect if already authenticated
// //   useEffect(() => {
// //     if (!loading && isAuthenticated && user) {
// //       const defaultPath = user.role === 'admin' ? '/admin/dashboard' :
// //                           user.role === 'employee' ? '/employee' :
// //                           '/login';
      
// //       const targetPath = from.startsWith(`/${user.role}`) ? from : defaultPath;
// //       navigate(targetPath, { replace: true });
// //     }
// //   }, [isAuthenticated, user, loading, navigate, from]);

// //   const handleLogin = async ({ email, password }) => {
// //     setError('');
// //     const result = await login(email.trim(), password);
// //     if (!result.success) {
// //       setError(result.error || 'Login failed');
// //     }
// //   };

// //   const handleForgotPassword = () => {
// //     console.log('Forgot password clicked');
// //     // Optional: redirect to forgot password page
// //   };

// //   if (loading || (isAuthenticated && user)) {
// //     return (
// //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600">Redirecting...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// //       <AnimatedLoginForm 
// //         onLogin={handleLogin} 
// //         onForgotPassword={handleForgotPassword} 
// //         error={error}
// //       />
// //     </div>
// //   );
// // };

// // export default LoginPage;







// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import AnimatedLoginForm from '../components/AnimatedLoginForm';

// const LoginPage = () => {
//   const { login, user, isAuthenticated, loading } = useAuth();
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Extract 'from' path if user was redirected to login
//   const from = location.state?.from?.pathname;

//   useEffect(() => {
//     if (!loading && isAuthenticated && user) {
//       const defaultPath =
//         user.role === 'admin' ? '/admin/dashboard' :
//         user.role === 'employee' ? '/employee' :
//         '/login';

//       let targetPath = defaultPath;

//       // Only use 'from' path if it's a valid subpath of the user's role
//       if (from && from !== '/' && from.startsWith(`/${user.role}`)) {
//         targetPath = from;
//       }

//       console.log('📝 LoginPage: Redirecting authenticated user to:', targetPath);
//       navigate(targetPath, { replace: true });
//     }
//   }, [isAuthenticated, user, loading, navigate, from]);

//   const handleLogin = async (userData) => {
//     setError('');
//     console.log('📝 LoginPage: Login form submitted');
//     // Actual login handled in AnimatedLoginForm
//   };

//   const handleForgotPassword = () => {
//     console.log('📝 Forgot password clicked');
//   };

//   if (!loading && isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Redirecting to dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <AnimatedLoginForm 
//         onLogin={handleLogin}
//         onForgotPassword={handleForgotPassword}
//       />
      
//       {error && (
//         <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50">
//           <div className="flex items-center">
//             <span className="mr-2">❌</span>
//             <span>{error}</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginPage;

import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedLoginForm from '../components/AnimatedLoginForm';

const LoginPage = () => {
  const { login, user, loading } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const intendedPath = location.state?.from?.pathname;

  // If already logged in, redirect to dashboard/intended path
  useEffect(() => {
    if (!loading && user) {
      const defaultPath = user.role === 'admin' ? '/admin/dashboard' : '/employee';
      const isAllowedPath = intendedPath && (
        (user.role === 'admin' && intendedPath.startsWith('/admin')) ||
        (user.role === 'employee' && intendedPath.startsWith('/employee'))
      );
      const targetPath = isAllowedPath ? intendedPath : defaultPath;
      if (location.pathname !== targetPath) {
        navigate(targetPath, { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname, intendedPath]);

  const handleLogin = async ({ email, password }) => {
    setError('');
    const result = await login(email.trim(), password);
    if (result.success) {
      const role = result.user.role;
      const defaultPath = role === 'admin' ? '/admin/dashboard' : '/employee';
      const isAllowedPath = intendedPath && (
        (role === 'admin' && intendedPath.startsWith('/admin')) ||
        (role === 'employee' && intendedPath.startsWith('/employee'))
      );
      const targetPath = isAllowedPath ? intendedPath : defaultPath;
      navigate(targetPath, { replace: true });
      return { success: true };
    }
    setError(result.error || 'Login failed');
    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AnimatedLoginForm onLogin={handleLogin} error={error} />
    </div>
  );
};

export default LoginPage;
