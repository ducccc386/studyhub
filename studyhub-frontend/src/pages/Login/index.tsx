import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudyHubLogo from '../../components/StudyHubLogo';
import { authApi } from '../../services/authApi';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (isLoggedIn) {
      const fromState = location.state as { from?: { pathname: string; search?: string } } | null;
      const redirectTo = fromState?.from?.pathname
        ? fromState.from.pathname + (fromState.from.search || '')
        : '';

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'parent') navigate('/parent/dashboard');
        else if (role === 'tutor') navigate('/tutor/dashboard');
        else navigate('/');
      }
    }
  }, [isLoggedIn, role, navigate, location]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        setIsSubmitting(true);
        const response = await authApi.googleLogin(credentialResponse.credential);
        login(
          response.token,
          response.role.toLowerCase() as any,
          response.name || 'Người dùng',
          response.email,
          response.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          response.tutorId || null,
          response.userId || null
        );
      } catch (error: any) {
        const errorMsg = error.response?.data || '';
        if (errorMsg.includes('NEW_GOOGLE_USER')) {
          setErrorMsg('Tài khoản chưa tồn tại. Vui lòng sang trang Đăng ký để tạo tài khoản.');
        } else {
          setErrorMsg(errorMsg || 'Đăng nhập Google thất bại.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const response = await authApi.login({ email, password });
      login(
        response.token,
        response.role.toLowerCase() as any,
        response.name || 'Người dùng',
        response.email,
        response.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        response.tutorId || null,
        response.userId || null
      );
      // Navigation is handled by the useEffect above

    } catch (error: any) {
      setErrorMsg(error.response?.data || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '460px', animation: 'authFadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          {/* Logo */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <StudyHubLogo iconSize={44} textSize="text-2xl" showTagline />
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: '#f0f4ff',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '32px',
            gap: '4px',
          }}>
            <Link
              to="/login"
              style={{
                flex: 1, textAlign: 'center', padding: '10px',
                borderRadius: '10px',
                fontWeight: 600, fontSize: '14px', textDecoration: 'none',
                background: '#1a3480', color: 'white',
                boxShadow: '0 2px 8px rgba(26,52,128,0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              state={location.state}
              style={{
                flex: 1, textAlign: 'center', padding: '10px',
                borderRadius: '10px',
                fontWeight: 600, fontSize: '14px', textDecoration: 'none',
                color: '#6b7a9a', background: 'transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(26,52,128,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              Đăng ký
            </Link>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Chào mừng trở lại 👋
            </h1>
            <p style={{ color: '#6b7a9a', fontSize: '14px' }}>
              Vui lòng nhập thông tin để truy cập tài khoản của bạn.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {errorMsg && (
              <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '7px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '20px', color: focusedField === 'email' ? '#1a3480' : '#94a3b8',
                  transition: 'color 0.2s',
                }}>mail</span>
                <input
                  id="email" type="email" placeholder="example@email.com" required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: '100%', paddingLeft: '44px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px',
                    border: `2px solid ${focusedField === 'email' ? '#1a3480' : '#e2e8f0'}`,
                    borderRadius: '10px', background: focusedField === 'email' ? '#f8faff' : '#f8fafc',
                    fontSize: '14px', color: '#0f172a', outline: 'none',
                    transition: 'all 0.2s ease', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Mật khẩu</label>
                <a href="#" style={{ fontSize: '12px', color: '#1a3480', fontWeight: 600, textDecoration: 'none' }}>
                  Quên mật khẩu?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '20px', color: focusedField === 'password' ? '#1a3480' : '#94a3b8',
                  transition: 'color 0.2s',
                }}>lock</span>
                <input
                  id="password" type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: '100%', paddingLeft: '44px', paddingRight: '48px', paddingTop: '12px', paddingBottom: '12px',
                    border: `2px solid ${focusedField === 'password' ? '#1a3480' : '#e2e8f0'}`,
                    borderRadius: '10px', background: focusedField === 'password' ? '#f8faff' : '#f8fafc',
                    fontSize: '14px', color: '#0f172a', outline: 'none',
                    transition: 'all 0.2s ease', boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                    color: '#94a3b8', display: 'flex', alignItems: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" id="remember" style={{
                width: '16px', height: '16px', accentColor: '#1a3480', cursor: 'pointer',
              }} />
              <span style={{ fontSize: '13px', color: '#6b7a9a' }}>Duy trì đăng nhập</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '14px',
                background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #1a3480, #003d9b)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(26,52,128,0.3)',
                transition: 'all 0.2s ease',
                transform: 'translateY(0)',
              }}
              onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              {isSubmitting ? (
                <>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  ĐĂNG NHẬP
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Hoặc đăng nhập với</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Social */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMsg('Đăng nhập Google thất bại')}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '12px', color: '#94a3b8' }}>
            © 2024 StudyHub Academic Platform. All rights reserved.
          </p>
        </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes authFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
