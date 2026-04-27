// src\context\AuthContext.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth-services/authService';
import taxRegimeService from '@/services/tax-regime.service';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app load
    // const checkAuth = async () => {
    //   try {
    //     const savedToken = localStorage.getItem('token');
    //     const savedUser = localStorage.getItem('hrms_user');
    //     const savedCompanyId = localStorage.getItem('company_id');

    //     if (savedToken && savedUser && savedCompanyId) {
    //       setToken(savedToken);
    //       setUser(JSON.parse(savedUser));

    //       // Verify token is still valid by fetching current user
    //       const response = await authService.getCurrentUser();
    //       if (response.success) {
    //         // Update user data with fresh data from server
    //         setUser(response.data);
    //         localStorage.setItem('hrms_user', JSON.stringify(response.data));
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Auth check failed:', error);

    //     // Don't logout here - just clear invalid data
    //     // localStorage.removeItem('token');
    //     // localStorage.removeItem('hrms_user');
    //     // setUser(null);
    //     // setToken(null);

    //      // Clear all auth data
    //     localStorage.removeItem('token');
    //     localStorage.removeItem('hrms_user');
    //     localStorage.removeItem('company_id');
    //     localStorage.removeItem('company_subdomain');
    //     setUser(null);
    //     setToken(null);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('hrms_user');
        const savedCompanyId = localStorage.getItem('company_id');

        if (savedToken && savedUser) {
          setToken(savedToken);
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setToken(savedToken);

          // Ensure auth cookies exist for middleware (e.g. after manual cookie clear)
          if (typeof document !== 'undefined') {
            const cookieOptions = `path=/; max-age=86400; samesite=lax${window.location?.protocol === 'https:' ? '; secure' : ''
              }`;
            if (parsedUser?.systemRole) {
              document.cookie = `userRole=${parsedUser.systemRole}; ${cookieOptions}`;
            }
            document.cookie = `token=${savedToken}; ${cookieOptions}`;
          }

          // ✅ Bypass mode: token is not a real JWT, so don't call backend /auth/me
          const isBypassSession =
            typeof savedToken === 'string' &&
            ((parsedUser?.systemRole === 'MASTER_ADMIN' &&
              savedToken.startsWith('master-admin-bypass-token-')) ||
              (parsedUser?.systemRole === 'MANAGER' &&
                savedToken.startsWith('manager-bypass-token-')));

          if (isBypassSession) {
            // Keep UI stable and avoid "Invalid token" errors
            parsedUser.permissions = parsedUser.permissions || {};
            setUser(parsedUser);
            localStorage.setItem('hrms_user', JSON.stringify(parsedUser));
            return;
          }

          // Master admin sessions may not have company context or /auth/me support
          if (parsedUser?.systemRole === 'MASTER_ADMIN' && !savedCompanyId) {
            parsedUser.permissions = parsedUser.permissions || {};
            setUser(parsedUser);
            localStorage.setItem('hrms_user', JSON.stringify(parsedUser));
            return;
          }

          // Verify token is still valid by fetching current user
          const response = await authService.getCurrentUser();
          if (response.success) {
            const userData = response.data;

            // Fetch permissions separately
            try {
              const permissionsResponse = await authService.getUserPermissions();
              if (permissionsResponse.success) {
                userData.permissions = permissionsResponse.data;
              }
            } catch (permError) {
              console.warn('Could not fetch permissions:', permError);
              userData.permissions = {};
            }

            // Update user data with fresh data from server
            setUser(userData);
            localStorage.setItem('hrms_user', JSON.stringify(userData));

            // Check tax regime status (exclude master admin)
            if (userData.systemRole !== 'MASTER_ADMIN') {
              try {
                const taxRegimeStatus = await taxRegimeService.getTaxRegimeStatus();
                if (taxRegimeStatus.success && !taxRegimeStatus.data.hasTaxRegime) {
                  // Store flag to show popup after dashboard loads
                  localStorage.setItem('showTaxRegimePopup', 'true');
                  localStorage.setItem('taxRegimeEmployeeName', 
                    `${taxRegimeStatus.data.employee.firstName} ${taxRegimeStatus.data.employee.lastName}`
                  );
                }
              } catch (taxError) {
                console.warn('Could not check tax regime status:', taxError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);

        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('hrms_user');
        localStorage.removeItem('company_id');
        localStorage.removeItem('company_subdomain');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials, isBypass = false) => {
    try {
      const cookieOptions = `path=/; max-age=86400; samesite=lax${typeof window !== 'undefined' && window.location?.protocol === 'https:'
        ? '; secure'
        : ''
        }`;

      // Master Admin Bypass Login
      if (isBypass && credentials.email === 'masteradmin@zodeck.com' && credentials.password === 'bypass') {
        const mockMasterAdmin = {
          id: 'master-admin-1',
          email: 'masteradmin@zodeck.com',
          systemRole: 'MASTER_ADMIN',
          firstName: 'Master',
          lastName: 'Admin',
          employee: {
            firstName: 'Master',
            lastName: 'Admin',
            email: 'masteradmin@zodeck.com',
          },
          company: {
            id: 'master-company',
            name: 'Zodeck Master',
            subdomain: 'master'
          }
        };

        const mockToken = 'master-admin-bypass-token-' + Date.now();

        // Store auth data
        setUser(mockMasterAdmin);
        setToken(mockToken);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('hrms_user', JSON.stringify(mockMasterAdmin));
        localStorage.setItem('company_id', mockMasterAdmin.company.id);
        localStorage.setItem('company_subdomain', mockMasterAdmin.company.subdomain);

        // Set role/token in cookie for middleware
        document.cookie = `userRole=MASTER_ADMIN; ${cookieOptions}`;
        document.cookie = `token=${mockToken}; ${cookieOptions}`;

        return {
          success: true,
          data: mockMasterAdmin,
          redirect: '/master-admin/dashboard'
        };
      }

      // Manager (MSS) Bypass Login
      if (isBypass && credentials.email === 'manager@globalhr.com' && credentials.password === 'manager@123') {
        const mockManager = {
          id: 'manager-1',
          email: 'manager@globalhr.com',
          systemRole: 'MANAGER',
          firstName: 'Aarav',
          lastName: 'Verma',
          employee: {
            firstName: 'Aarav',
            lastName: 'Verma',
            email: 'manager@globalhr.com',
          },
          company: {
            id: 'globalhr-company',
            name: 'Global HR',
            subdomain: 'globalhr'
          }
        };

        const mockToken = 'manager-bypass-token-' + Date.now();

        setUser(mockManager);
        setToken(mockToken);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('hrms_user', JSON.stringify(mockManager));
        localStorage.setItem('company_id', mockManager.company.id);
        localStorage.setItem('company_subdomain', mockManager.company.subdomain);

        document.cookie = `userRole=MANAGER; ${cookieOptions}`;
        document.cookie = `token=${mockToken}; ${cookieOptions}`;

        return {
          success: true,
          data: mockManager,
          redirect: '/manager/dashboard'
        };
      }

      // Regular login flow
      const response = await authService.login(credentials);

      if (response.success) {
        const { user: userData, token: userToken
          // , requiresPasswordChange 
        } = response.data;

        // Use systemRole instead of role (FIX for backend)
        let userRole = userData.systemRole || userData.role;
        if (!userData.systemRole && userRole) {
          userData.systemRole = userRole;
        }
        const normalizedEmail = credentials?.email?.toLowerCase().trim();
        // Store auth data
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        localStorage.setItem('hrms_user', JSON.stringify(userData));

        // Set role/token in cookies for middleware
        document.cookie = `userRole=${userRole}; ${cookieOptions}`;
        document.cookie = `token=${userToken}; ${cookieOptions}`;

        // Check if password change is required FIRST
        // if (requiresPasswordChange) {
        //   return {
        //     success: true,
        //     data: userData,
        //     redirect: '/change-password?firstLogin=true'
        //   };
        // }

        // Redirect based on systemRole
        let redirectPath = '/employee/dashboard';
        if (userRole === 'MASTER_ADMIN') {
          redirectPath = '/master-admin/dashboard';
        } else if (userRole === 'HR_ADMIN') {
          redirectPath = '/hr/dashboard';
          // TEMP: treat SUPER_ADMIN demo login as Company Admin
        } else if (userRole === 'SUPER_ADMIN' || userRole === 'COMPANY_ADMIN' || userRole === 'COMPANY_OWNER') {
          redirectPath = '/company-admin/dashboard';
        } else if (userRole === 'PAYROLL_ADMIN') {
          redirectPath = '/payroll-compliance/dashboard';
        } else if (userRole === 'FINANCE_ADMIN') {
          redirectPath = '/finance-role/dashboard';
        } else if (userRole === 'MANAGER') {
          redirectPath = '/manager/dashboard';
        } else if (userRole === 'L_AND_D_MANAGER') {
          redirectPath = '/ld/dashboard';
        } else if (userRole === 'RECRUITER') {
          redirectPath = '/recruiter/dashboard';
        } else if (userRole === 'IT_ADMIN') {
          redirectPath = '/it-admin/dashboard';
        } else if (userRole === 'DEPARTMENT_HEAD' || userRole === 'DEPT-HEAD' || userRole === 'DEPT_HEAD') {
          redirectPath = '/dept-head/dashboard';
        }
        console.log('Redirecting to:', redirectPath, 'for role:', userRole);

        return {
          success: true,
          data: userData,
          redirect: redirectPath
        };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('hrms_user');
      let storedRole = '';
      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        storedRole = parsedUser?.systemRole?.toUpperCase?.() || '';
      } catch (err) {
        storedRole = '';
      }

      const isBypassToken =
        typeof storedToken === 'string' &&
        (storedToken.startsWith('master-admin-bypass-token-') ||
          storedToken.startsWith('manager-bypass-token-'));

      // Skip backend logout for master admin or bypass sessions
      if (!isBypassToken && storedRole !== 'MASTER_ADMIN') {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('hrms_user');
      localStorage.removeItem('company_id');
      localStorage.removeItem('company_subdomain');

      // Clear role/token cookies
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    }
  };

  const changePassword = async (passwords) => {
    try {
      const response = await authService.changePassword(passwords);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('hrms_user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const updateLocalUser = (updatedData) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('hrms_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    changePassword,
    refreshUser,
    updateLocalUser,
    isAuthenticated: !!user && !!token,
    isHR: user?.systemRole === 'HR_ADMIN', // Use systemRole
    isSuperAdmin: user?.systemRole === 'SUPER_ADMIN', // Use systemRole
    isEmployee: user?.systemRole === 'EMPLOYEE' // Use systemRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};