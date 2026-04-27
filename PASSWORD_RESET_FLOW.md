# Password Reset Flow - Zodeck

## Overview
Complete password reset implementation with three screens:
1. Forgot Password (request reset link)
2. Reset Password (set new password with token)
3. Success states for both flows

## Routes Created

### 1. Forgot Password
- **Route**: `/forgot-password`
- **File**: `src/app/(auth)/forgot-password/page.js`
- **Component**: `src/components/auth/ForgotPasswordForm.js`

### 2. Reset Password
- **Route**: `/reset-password?token=<JWT_TOKEN>`
- **File**: `src/app/(auth)/reset-password/page.js`
- **Component**: `src/components/auth/ResetPasswordForm.js`

## User Flow

### Step 1: User Forgets Password
1. User clicks "Forgot password?" link on sign-in page
2. Navigates to `/forgot-password`
3. Enters email address
4. Clicks "Reset password" button
5. Shows success screen with confirmation

### Step 2: User Receives Email
1. User receives email with reset link
2. Link format: `https://yourdomain.com/reset-password?token=<JWT_TOKEN>`
3. Example: `http://localhost:3000/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: User Resets Password
1. User clicks link in email
2. System validates token (shows loading state)
3. If token is valid: Shows reset password form
4. If token is invalid/expired: Shows error with option to request new link
5. User enters new password (with strength indicator)
6. User confirms password
7. Clicks "Reset Password" button
8. Shows success screen
9. Auto-redirects to sign-in page after 3 seconds

## Features Implemented

### Forgot Password Form
- ✅ Email input with validation
- ✅ Loading states during submission
- ✅ Error handling with animated messages
- ✅ Success screen with confirmation
- ✅ "Back to Sign In" navigation
- ✅ "Contact Support" link
- ✅ Option to resend email

### Reset Password Form
- ✅ Token validation from URL query parameter
- ✅ Loading state during token validation
- ✅ Invalid token error screen
- ✅ Password strength indicator (real-time)
  - Weak (< 40%): Red
  - Medium (40-70%): Yellow
  - Strong (> 70%): Green
- ✅ Password requirements checklist:
  - At least 8 characters
  - Upper & lowercase letters
  - At least one number
- ✅ Show/hide password toggle for both fields
- ✅ Password confirmation validation
- ✅ Success screen with auto-redirect
- ✅ Error handling
- ✅ "Back to Sign In" navigation

## States Handled

### Forgot Password States
1. **Initial Form** - Email input
2. **Loading** - Sending reset link
3. **Success** - Confirmation message
4. **Error** - Failed to send email

### Reset Password States
1. **Validating Token** - Loading spinner while checking token
2. **Invalid Token** - Error screen with option to request new link
3. **Reset Form** - Password input with strength indicator
4. **Loading** - Resetting password
5. **Success** - Confirmation with auto-redirect
6. **Error** - Failed to reset password

## Integration Notes

### Backend API Integration
Currently, the forms use simulated API calls. To integrate with your backend:

#### Forgot Password API
```javascript
// In ForgotPasswordForm.js, line 23-29
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
});
```

#### Token Validation API
```javascript
// In ResetPasswordForm.js, line 32-42
const response = await fetch(`/api/auth/validate-token?token=${token}`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});
```

#### Reset Password API
```javascript
// In ResetPasswordForm.js, line 113-120
const response = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    token, 
    password: formData.password 
  })
});
```

### Email Template
Your backend should send an email with a link like:
```
https://yourdomain.com/reset-password?token=<JWT_TOKEN>
```

The JWT token should contain:
- User ID
- Email
- Type: "password_reset"
- Expiration time (recommended: 15-30 minutes)

## Design Consistency
All screens maintain the same premium design:
- ✅ Consistent left branding panel
- ✅ Dark mode support
- ✅ Smooth animations (Framer Motion)
- ✅ Indigo accent color (#4F46E5)
- ✅ Professional typography
- ✅ Responsive layout
- ✅ Accessible form inputs

## Testing

### Test Forgot Password
1. Navigate to `http://localhost:3000/signin`
2. Click "Forgot password?"
3. Enter any email
4. Click "Reset password"
5. See success screen

### Test Reset Password (Valid Token)
1. Navigate to `http://localhost:3000/reset-password?token=test123`
2. Wait for token validation (1.5 seconds)
3. Enter new password (try different strengths)
4. Confirm password
5. Click "Reset Password"
6. See success screen
7. Auto-redirect to sign-in

### Test Reset Password (Invalid Token)
1. Navigate to `http://localhost:3000/reset-password` (no token)
2. See invalid token error
3. Click "Request New Reset Link" to go to forgot password

## Security Considerations
- ✅ Token-based authentication
- ✅ Password strength validation
- ✅ Token expiration handling
- ✅ Secure password input (hidden by default)
- ⚠️ Implement rate limiting on backend
- ⚠️ Use HTTPS in production
- ⚠️ Implement CSRF protection
- ⚠️ Hash passwords on backend (bcrypt/argon2)
