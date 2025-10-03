// // // import { useState } from 'react';
// // // import { useAuth } from '../context/AuthContext';
// // // import { validateEmail, validatePassword, handleApiError, showErrorToast, showSuccessToast } from '../utils/errorHandler';

// // // const AnimatedLoginForm = ({ onLogin, onForgotPassword }) => {
// // //   const { login } = useAuth();
// // //   const [loading, setLoading] = useState(false);
// // //   const [formData, setFormData] = useState({
// // //     email: '',
// // //     password: ''
// // //   });
// // //   const [error, setError] = useState('');
// // //   const [showPassword, setShowPassword] = useState(false);

// // //   const handleChange = (e) => {
// // //     setFormData({
// // //       ...formData,
// // //       [e.target.name]: e.target.value
// // //     });
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     setLoading(true);
// // //     setError('');

// // //     // Validate form data
// // //     if (!formData.email || !formData.password) {
// // //       setError('Please fill in all fields');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     // Validate email format
// // //     if (!validateEmail(formData.email)) {
// // //       setError('Please enter a valid email address');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     // Validate password
// // //     if (!validatePassword(formData.password)) {
// // //       setError('Password must be at least 6 characters long');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     try {
// // //       console.log('🎨 AnimatedLoginForm: Attempting login with:', { email: formData.email });
      
// // //       const result = await login(formData.email.trim(), formData.password);
      
// // //       if (result.success) {
// // //         showSuccessToast('Login successful!');
// // //         if (onLogin) {
// // //           onLogin(result.user);
// // //         }
// // //       } else {
// // //         const errorMessage = result.error || 'Login failed';
// // //         setError(errorMessage);
// // //         showErrorToast(errorMessage);
// // //       }
// // //     } catch (err) {
// // //       console.error('Login error:', err);
// // //       const errorMessage = handleApiError(err, 'Login failed. Please try again.');
// // //       setError(errorMessage);
// // //       showErrorToast(errorMessage);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };
  
// // //   const handleForgotPassword = () => {
// // //     if (onForgotPassword) {
// // //       onForgotPassword();
// // //     }
// // //   };


// // //   return (
// // //     <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 font-sans">
// // //       {/* Main Login Card */}
// // //       <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl">
// // //         <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 lg:p-12">
          
// // //           {/* Logo */}
// // //           <div className="text-center mb-6">
// // //             <img 
// // //               src="https://pub-8f7d5f81a3294be18dbe97ddb794a4ae.r2.dev/logo.png" 
// // //               alt="Company Logo" 
// // //               className="mx-auto h-16 w-auto object-contain"
// // //             />
// // //           </div>
          
// // //           {/* Header */}
// // //           <div className="text-center mb-8 lg:mb-10">
// // //             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-[#FCA600]">
// // //               Welcome Back
// // //             </h1>
// // //             <p className="text-gray-500 text-sm sm:text-base lg:text-lg">Sign in to your account</p>
// // //           </div>

// // //           {/* Login Form */}
// // //           <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 max-w-md mx-auto">
// // //             {/* Email Field */}
// // //             <div>
// // //               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
// // //                 Email Address
// // //               </label>
// // //               <div className="relative">
// // //                 <input
// // //                   type="email"
// // //                   id="email"
// // //                   name="email"
// // //                   value={formData.email}
// // //                   onChange={handleChange}
// // //                   required
// // //                   className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200 text-sm sm:text-base"
// // //                   placeholder="Enter your email"
// // //                 />
// // //               </div>
// // //             </div>

// // //             {/* Password Field */}
// // //             <div>
// // //               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
// // //                 Password
// // //               </label>
// // //               <div className="relative">
// // //                 <input
// // //                   type={showPassword ? "text" : "password"}
// // //                   id="password"
// // //                   name="password"
// // //                   value={formData.password}
// // //                   onChange={handleChange}
// // //                   required
// // //                   className="w-full px-4 py-3 sm:py-4 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200 text-sm sm:text-base"
// // //                   placeholder="Enter your password"
// // //                 />
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => setShowPassword(!showPassword)}
// // //                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
// // //                   aria-label={showPassword ? "Hide password" : "Show password"}
// // //                 >
// // //                   {showPassword ? (
// // //                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
// // //                     </svg>
// // //                   ) : (
// // //                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
// // //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
// // //                     </svg>
// // //                   )}
// // //                 </button>
// // //               </div>
// // //             </div>

// // //             {/* Error Message */}
// // //             {error && (
// // //               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
// // //                 {error}
// // //               </div>
// // //             )}

// // //             {/* Login Button */}
// // //             <button
// // //               type="submit"
// // //               disabled={loading}
// // //               className="w-full text-white py-3 sm:py-4 px-6 rounded-lg font-semibold bg-[#FCB72D] hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
// // //             >
// // //               {loading ? (
// // //                 <div className="flex items-center justify-center">
// // //                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
// // //                   <span>Signing In...</span>
// // //                 </div>
// // //               ) : (
// // //                 'Sign In'
// // //               )}
// // //             </button>

// // //             {/* Forgot Password Link */}
// // //             {onForgotPassword && (
// // //               <div className="text-center">
// // //                 <button
// // //                   type="button"
// // //                   onClick={handleForgotPassword}
// // //                   className="text-sm font-medium text-[#FF6B6B] hover:underline transition-colors duration-300"
// // //                 >
// // //                   Forgot your password?
// // //                 </button>
// // //               </div>
// // //             )}
// // //           </form>

// // //         </div>
// // //       </div>
// // //     </div>
// // //   )
// // // }

// // // export default AnimatedLoginForm






// // import React, { useState } from 'react';
// // import { validateEmail, validatePassword, showErrorToast, showSuccessToast } from '../utils/errorHandler';

// // const AnimatedLoginForm = ({ onLogin, onForgotPassword }) => {
// //   const [formData, setFormData] = useState({ email: '', password: '' });
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [showPassword, setShowPassword] = useState(false);

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError('');

// //     if (!formData.email || !formData.password) {
// //       setError('Please fill in all fields');
// //       return;
// //     }

// //     if (!validateEmail(formData.email)) {
// //       setError('Please enter a valid email address');
// //       return;
// //     }

// //     if (!validatePassword(formData.password)) {
// //       setError('Password must be at least 6 characters long');
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const result = await onLogin(formData);

// //       if (result?.success) {
// //         showSuccessToast('Login successful!');
// //       } else {
// //         const message = result?.error || 'Login failed';
// //         setError(message);
// //         showErrorToast(message);
// //       }
// //     } catch (err) {
// //       setError('An unexpected error occurred');
// //       showErrorToast('An unexpected error occurred');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 font-sans">
// //       <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl">
// //         <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 lg:p-12">
          
// //           {/* Logo */}
// //           <div className="text-center mb-6">
// //             <img
// //               src="https://pub-8f7d5f81a3294be18dbe97ddb794a4ae.r2.dev/logo.png"
// //               alt="Company Logo"
// //               className="mx-auto h-16 w-auto object-contain"
// //             />
// //           </div>

// //           {/* Header */}
// //           <div className="text-center mb-8 lg:mb-10">
// //             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-[#FCA600]">
// //               Welcome Back
// //             </h1>
// //             <p className="text-gray-500 text-sm sm:text-base lg:text-lg">
// //               Sign in to your account
// //             </p>
// //           </div>

// //           {/* Login Form */}
// //           <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 max-w-md mx-auto">

// //             {/* Email */}
// //             <div>
// //               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
// //                 Email Address
// //               </label>
// //               <input
// //                 type="email"
// //                 id="email"
// //                 name="email"
// //                 value={formData.email}
// //                 onChange={handleChange}
// //                 required
// //                 className="w-full px-4 py-3 sm:py-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200 text-sm sm:text-base"
// //                 placeholder="Enter your email"
// //               />
// //             </div>

// //             {/* Password */}
// //             <div>
// //               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
// //                 Password
// //               </label>
// //               <div className="relative">
// //                 <input
// //                   type={showPassword ? 'text' : 'password'}
// //                   id="password"
// //                   name="password"
// //                   value={formData.password}
// //                   onChange={handleChange}
// //                   required
// //                   className="w-full px-4 py-3 sm:py-4 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-200 text-sm sm:text-base"
// //                   placeholder="Enter your password"
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={() => setShowPassword(!showPassword)}
// //                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
// //                   aria-label={showPassword ? "Hide password" : "Show password"}
// //                 >
// //                   {showPassword ? '🙈' : '👁️'}
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Error Message */}
// //             {error && (
// //               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
// //                 {error}
// //               </div>
// //             )}

// //             {/* Submit */}
// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className="w-full text-white py-3 sm:py-4 px-6 rounded-lg font-semibold bg-[#FCB72D] hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
// //             >
// //               {loading ? 'Signing In...' : 'Sign In'}
// //             </button>

// //             {/* Forgot Password */}
// //             {onForgotPassword && (
// //               <div className="text-center">
// //                 <button
// //                   type="button"
// //                   onClick={onForgotPassword}
// //                   className="text-sm font-medium text-[#FF6B6B] hover:underline transition-colors duration-300"
// //                 >
// //                   Forgot your password?
// //                 </button>
// //               </div>
// //             )}
// //           </form>

// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AnimatedLoginForm;



// import React, { useState } from 'react';

// const AnimatedLoginForm = ({ onLogin, onForgotPassword, error }) => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     if (!formData.email || !formData.password) {
//       setLoading(false);
//       return;
//     }

//     await onLogin(formData);
//     setLoading(false);
//   };

//   return (
//     <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
//       <h2 className="text-2xl font-bold text-center mb-6 text-yellow-600">Sign in</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-yellow-400 focus:border-yellow-400"
//             placeholder="Enter your email"
//           />
//         </div>

//         <div>
//           <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
//           <div className="relative">
//             <input
//               type={showPassword ? 'text' : 'password'}
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-yellow-400 focus:border-yellow-400"
//               placeholder="Enter your password"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
//             >
//               {showPassword ? 'Hide' : 'Show'}
//             </button>
//           </div>
//         </div>

//         {error && <p className="text-red-500 text-sm">{error}</p>}

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-50"
//         >
//           {loading ? 'Signing in...' : 'Sign In'}
//         </button>

//         {onForgotPassword && (
//           <button
//             type="button"
//             onClick={onForgotPassword}
//             className="w-full text-sm text-red-500 hover:underline mt-2"
//           >
//             Forgot password?
//           </button>
//         )}
//       </form>
//     </div>
//   );
// };

// export default AnimatedLoginForm;



import React, { useState } from 'react';

const AnimatedLoginForm = ({ onLogin, onForgotPassword, error: externalError }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await onLogin(formData);
      if (!result?.success) {
        setError(result?.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = () => {
    if (onForgotPassword) onForgotPassword();
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/95 rounded-3xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <img src="https://pub-8f7d5f81a3294be18dbe97ddb794a4ae.r2.dev/logo.png" alt="Logo" className="mx-auto h-14 w-auto object-contain" />
      </div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-gray-500 text-sm">Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m5.657-5.657L17.657 6.343M15.121 14.121a3 3 0 01-4.243 0m4.243 0a3 3 0 000-4.243m0 4.243L12 12m0 0l-3.121 3.121M12 12l3.121-3.121" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {(error || externalError) && (
          <p className="text-red-500 text-sm">{error || externalError}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#fcb72d' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div className="mt-4 text-right">
        <button onClick={handleForgot} className="text-sm text-blue-600 hover:underline">
          Forgot Password?
        </button>
      </div>
    </div>
  );
};

export default AnimatedLoginForm;
