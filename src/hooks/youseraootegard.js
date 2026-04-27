// // src/hooks/useRouteGuard.js
// "use client";
// import { useAuth } from '@/context/AuthContext';
// import { useRouter, usePathname } from 'next/navigation';
// import { useEffect } from 'react';

// export function useRouteGuard() {
//   const { isAuthenticated, loading } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (!loading) {
//       const isAuthPage = pathname.includes('/signin') || 
//                          pathname.includes('/signup') || 
//                          pathname.includes('/forgot-password');
      
//       // Redirect authenticated users away from auth pages
//       if (isAuthPage && isAuthenticated) {
//         router.push('/hr/dashboard');
//       }
      
//       // Redirect unauthenticated users away from protected pages
//       if (!isAuthPage && !isAuthenticated) {
//         router.push('/signin');
//       }
//     }
//   }, [isAuthenticated, loading, pathname, router]);

//   return { loading };
// }