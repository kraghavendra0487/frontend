// // // // // import React from 'react';
// // // // // import { Navigate, useLocation } from 'react-router-dom';
// // // // // import { useAuth } from '../context/AuthContext';

// // // // // const ProtectedRoute = ({ children, allowedRoles = [] }) => {
// // // // //   const { isAuthenticated, user, loading } = useAuth();
// // // // //   const location = useLocation();

// // // // //   console.log('🛡️ ProtectedRoute:', { 
// // // // //     path: location.pathname, 
// // // // //     isAuthenticated, 
// // // // //     userRole: user?.role, 
// // // // //     allowedRoles,
// // // // //     loading 
// // // // //   });

// // // // //   if (loading) {
// // // // //     return (
// // // // //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
// // // // //         <div className="text-center">
// // // // //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// // // // //           <p className="text-gray-600">Checking permissions...</p>
// // // // //         </div>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   // Not logged in → login
// // // // //   if (!isAuthenticated) {
// // // // //     console.log('🛡️ → /login (not authenticated)');
// // // // //     return <Navigate to="/login" state={{ from: location }} replace />;
// // // // //   }

// // // // //   // Wrong role → redirect to correct dashboard
// // // // //   if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
// // // // //     let correctPath;
// // // // //     switch (user?.role) {
// // // // //       case 'admin':
// // // // //         correctPath = '/admin/dashboard';
// // // // //         break;
// // // // //       case 'employee':
// // // // //         correctPath = '/employee';
// // // // //         break;
// // // // //       default:
// // // // //         correctPath = '/login';
// // // // //     }

// // // // //     if (location.pathname !== correctPath) {
// // // // //       console.log('🛡️ → ' + correctPath + ' (wrong role)');
// // // // //       return <Navigate to={correctPath} replace />;
// // // // //     }

// // // // //     console.log('🛡️ ⚠️ Role mismatch but already at fallback path');
// // // // //     return null;
// // // // //   }

// // // // //   console.log('🛡️ ✅ Access granted');
// // // // //   return children;
// // // // // };

// // // // // export default ProtectedRoute;









// // // // import React from 'react';
// // // // import { Navigate, useLocation } from 'react-router-dom';
// // // // import { useAuth } from '../context/AuthContext';

// // // // const ProtectedRoute = ({ children, allowedRoles = [] }) => {
// // // //   const { isAuthenticated, user, loading } = useAuth();
// // // //   const location = useLocation();

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
// // // //         <div className="text-center">
// // // //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// // // //           <p className="text-gray-600">Checking permissions...</p>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   // Not authenticated → redirect to login
// // // //   if (!isAuthenticated) {
// // // //     return <Navigate to="/login" state={{ from: location }} replace />;
// // // //   }

// // // //   // Role not allowed → redirect to correct dashboard
// // // //   if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
// // // //     let redirectPath;
// // // //     switch (user?.role) {
// // // //       case 'admin':
// // // //         redirectPath = '/admin/dashboard';
// // // //         break;
// // // //       case 'employee':
// // // //         redirectPath = '/employee';
// // // //         break;
// // // //       default:
// // // //         redirectPath = '/login';
// // // //     }
// // // //     return <Navigate to={redirectPath} replace />;
// // // //   }

// // // //   // Access granted
// // // //   return children;
// // // // };

// // // // export default ProtectedRoute;



// // // import React from 'react';
// // // import { Navigate, useLocation } from 'react-router-dom';
// // // import { useAuth } from '../context/AuthContext';

// // // const ProtectedRoute = ({ children, allowedRoles = [] }) => {
// // //   const { isAuthenticated, user, loading } = useAuth();
// // //   const location = useLocation();

// // //   // Show loading while auth initializes
// // //   if (loading) {
// // //     return (
// // //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
// // //         <div className="text-center">
// // //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// // //           <p className="text-gray-600">Checking permissions...</p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   // Not logged in → redirect to login
// // //   if (!isAuthenticated) {
// // //     return <Navigate to="/login" state={{ from: location }} replace />;
// // //   }

// // //   // Check role
// // //   if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
// // //     // Redirect to user's dashboard based on role
// // //     let redirectPath;
// // //     switch (user.role) {
// // //       case 'admin':
// // //         redirectPath = '/admin/dashboard';
// // //         break;
// // //       case 'employee':
// // //         redirectPath = '/employee';
// // //         break;
// // //       default:
// // //         redirectPath = '/login';
// // //     }

// // //     if (location.pathname !== redirectPath) {
// // //       return <Navigate to={redirectPath} replace />;
// // //     }

// // //     return null;
// // //   }

// // //   // Access granted
// // //   return children;
// // // };

// // // export default ProtectedRoute;



// // import React from 'react';
// // import { Navigate, useLocation } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';

// // const ProtectedRoute = ({ children, allowedRoles = [] }) => {
// //   const { isAuthenticated, user, loading } = useAuth();
// //   const location = useLocation();

// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600">Checking permissions...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Not logged in → redirect to login
// //   if (!isAuthenticated) {
// //     return <Navigate to="/login" state={{ from: location }} replace />;
// //   }

// //   // Check allowed roles
// //   if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
// //     // Redirect to correct dashboard based on role
// //     const fallbackPath = user?.role === 'admin' ? '/admin/dashboard' :
// //                          user?.role === 'employee' ? '/employee' :
// //                          '/login';
// //     return <Navigate to={fallbackPath} replace />;
// //   }

// //   // Access granted
// //   return children;
// // };

// // export default ProtectedRoute;



// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const ProtectedRoute = ({ children, allowedRoles = [] }) => {
//   const { isAuthenticated, user, loading } = useAuth();
//   const location = useLocation();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Checking permissions...</p>
//         </div>
//       </div>
//     );
//   }

//   // Not authenticated → redirect to login
//   if (!isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // Role not allowed → redirect to correct dashboard
//   if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
//     let correctPath =
//       user?.role === 'admin' ? '/admin/dashboard' :
//       user?.role === 'employee' ? '/employee' :
//       '/login';

//     // Only redirect if not already on the correct dashboard
//     if (location.pathname !== correctPath) {
//       return <Navigate to={correctPath} replace />;
//     }

//     // If already on correct dashboard, allow rendering
//     return children;
//   }

//   // Access granted
//   return children;
// };

// export default ProtectedRoute;


import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for auth init to avoid flicker/loops
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login, preserving intended location
  if (!user) {
    if (location.pathname === '/login') return null;
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role → redirect to role dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/employee';
    if (location.pathname !== dashboardPath) {
      return <Navigate to={dashboardPath} replace />;
    }
    return null;
  }

  return children;
};

export default ProtectedRoute;
