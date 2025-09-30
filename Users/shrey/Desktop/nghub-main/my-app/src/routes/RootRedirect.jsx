// // // 


// // import React from 'react';
// // import { Navigate, useLocation } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';

// // const RootRedirect = () => {
// //   const { isAuthenticated, user, loading } = useAuth();
// //   const location = useLocation();

// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center min-h-screen bg-gray-50">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600">Loading...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Not logged in → redirect to login
// //   if (!isAuthenticated) {
// //     if (location.pathname !== '/login') {
// //       return <Navigate to="/login" replace />;
// //     }
// //     return null;
// //   }

// //   // Logged in → redirect only from root
// //   if (isAuthenticated && user) {
// //     const defaultPath =
// //       user.role === 'admin' ? '/admin/dashboard' :
// //       user.role === 'employee' ? '/employee' :
// //       '/login';

// //     // Only redirect if currently at "/"
// //     if (location.pathname === '/') {
// //       return <Navigate to={defaultPath} replace />;
// //     }

// //     // If already somewhere else, do not redirect
// //     return null;
// //   }

// //   // Fallback to login
// //   return <Navigate to="/login" replace />;
// // };

// // export default RootRedirect;


// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const RootRedirect = () => {
//   const { isAuthenticated, user, loading } = useAuth();
//   const location = useLocation();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     // If already on /login, don't redirect to avoid loop
//     if (location.pathname !== '/login') {
//       return <Navigate to="/login" replace />;
//     }
//     return null;
//   }

//   if (isAuthenticated && user) {
//     let defaultPath;
//     switch (user.role) {
//       case 'admin':
//         defaultPath = '/admin/dashboard';
//         break;
//       case 'employee':
//         defaultPath = '/employee';
//         break;
//       default:
//         defaultPath = '/login';
//     }

//     // Only redirect if currently at "/"
//     if (location.pathname === '/') {
//       return <Navigate to={defaultPath} replace />;
//     }

//     // Already at a valid page, no redirect
//     return null;
//   }

//   // Fallback
//   return <Navigate to="/login" replace />;
// };

// export default RootRedirect;


import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  // Not logged in → go to login (avoid loop if already there)
  if (!user) {
    if (location.pathname === '/login') return null;
    return <Navigate to="/login" replace />;
  }

  const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/employee';
  if (location.pathname !== dashboardPath) {
    return <Navigate to={dashboardPath} replace />;
  }
  return null;
};

export default RootRedirect;
