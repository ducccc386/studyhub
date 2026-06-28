import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudyHubLogo from '../../components/StudyHubLogo';
import { authApi } from '../../services/authApi';
import { GoogleLogin } from '@react-oauth/google';

const Register: React.FC = () => {
  const [roleSelect, setRoleSelect] = useState<'student' | 'tutor'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, isLoggedIn, role: currentRole } = useAuth();
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
        if (currentRole === 'admin') navigate('/admin/dashboard');
        else if (currentRole === 'parent') navigate('/parent/dashboard');
        else if (currentRole === 'tutor') navigate('/tutor/dashboard');
        else navigate('/');
      }
    }
  }, [isLoggedIn, currentRole, navigate, location]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        setIsSubmitting(true);
        const apiRole = roleSelect === 'student' ? 'PARENT' : 'TUTOR';
        const response = await authApi.googleLogin(credentialResponse.credential, apiRole);
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
        setErrorMsg(error.response?.data || 'Đăng nhập Google thất bại.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiRole = roleSelect === 'student' ? 'PARENT' : 'TUTOR';
      await authApi.register({ email, password, role: apiRole, fullName });
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login', { state: location.state });
    } catch (error: any) {
      setErrorMsg(error.response?.data || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    paddingLeft: '44px',
    paddingRight: '16px',
    paddingTop: '11px',
    paddingBottom: '11px',
    border: `2px solid ${focusedField === field ? '#1a3480' : '#e2e8f0'}`,
    borderRadius: '10px',
    background: focusedField === field ? '#f8faff' : '#f8fafc',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '460px', animation: 'authFadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          {/* Logo */}
          <div style={{ marginBottom: '28px', textAlign: 'center' }}>
            <StudyHubLogo iconSize={44} textSize="text-2xl" showTagline />
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: '#f0f4ff',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '28px',
            gap: '4px',
          }}>
            <Link
              to="/login"
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
              Đăng nhập
            </Link>
            <Link
              to="/register"
              style={{
                flex: 1, textAlign: 'center', padding: '10px',
                borderRadius: '10px',
                fontWeight: 600, fontSize: '14px', textDecoration: 'none',
                background: '#1a3480', color: 'white',
                boxShadow: '0 2px 8px rgba(26,52,128,0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              Đăng ký
            </Link>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '5px', letterSpacing: '-0.5px' }}>
              Tạo tài khoản mới ✨
            </h1>
            <p style={{ color: '#6b7a9a', fontSize: '13px' }}>
              Tham gia cộng đồng học thuật StudyHub ngay hôm nay.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {errorMsg && (
              <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '9px' }}>
                Bạn tham gia với vai trò?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { value: 'student' as const, label: 'Học viên', icon: 'school', desc: 'Tìm gia sư phù hợp' },
                  { value: 'tutor' as const, label: 'Gia sư', icon: 'history_edu', desc: 'Dạy học, kiếm thêm' },
                ].map(r => (
                  <label key={r.value} style={{ cursor: 'pointer' }}>
                    <input type="radio" name="role" value={r.value}
                      checked={roleSelect === r.value}
                      onChange={() => setRoleSelect(r.value)}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      padding: '14px 12px',
                      border: `2px solid ${roleSelect === r.value ? '#1a3480' : '#e2e8f0'}`,
                      borderRadius: '12px',
                      background: roleSelect === r.value ? '#f0f4ff' : '#f8fafc',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: roleSelect === r.value ? '0 2px 12px rgba(26,52,128,0.12)' : 'none',
                    }}>
                      <span className="material-symbols-outlined" style={{
                        fontSize: '26px', display: 'block', marginBottom: '5px',
                        color: roleSelect === r.value ? '#1a3480' : '#94a3b8',
                        fontVariationSettings: roleSelect === r.value ? "'FILL' 1" : "'FILL' 0",
                      }}>{r.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: roleSelect === r.value ? '#1a3480' : '#374151', display: 'block' }}>
                        {r.label}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
                        {r.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '7px' }}>
                Họ và tên
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '20px', color: focusedField === 'name' ? '#1a3480' : '#94a3b8',
                  transition: 'color 0.2s',
                }}>person</span>
                <input
                  id="fullName" type="text" placeholder="Nhập họ và tên của bạn" required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle('name')}
                />
              </div>
            </div>

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
                  id="email" type="email" placeholder="example@gmail.com" required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle('email')}
                />
              </div>
            </div>

            {/* Password grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '7px' }}>
                  Mật khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '18px', color: focusedField === 'pwd' ? '#1a3480' : '#94a3b8',
                    transition: 'color 0.2s',
                  }}>lock</span>
                  <input
                    id="password" type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••" required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('pwd')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle('pwd'), paddingLeft: '38px', paddingRight: '36px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94a3b8',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '7px' }}>
                  Xác nhận
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '18px', color: focusedField === 'confirm' ? '#1a3480' : '#94a3b8',
                    transition: 'color 0.2s',
                  }}>lock_reset</span>
                  <input
                    id="confirmPassword" type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••" required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle('confirm'), paddingLeft: '38px', paddingRight: '36px' }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94a3b8',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      {showConfirm ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" id="terms" required style={{
                width: '16px', height: '16px', marginTop: '1px',
                accentColor: '#1a3480', cursor: 'pointer', flexShrink: 0,
              }} />
              <span style={{ fontSize: '12px', color: '#6b7a9a', lineHeight: 1.5 }}>
                Tôi đồng ý với{' '}
                <a href="#" style={{ color: '#1a3480', fontWeight: 700, textDecoration: 'none' }}>Điều khoản dịch vụ</a>
                {' '}và{' '}
                <a href="#" style={{ color: '#1a3480', fontWeight: 700, textDecoration: 'none' }}>Chính sách bảo mật</a>
                {' '}của StudyHub.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '14px',
                background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #1a3480, #0097aa)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(26,52,128,0.3)',
                transition: 'all 0.2s ease',
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
                  TẠO TÀI KHOẢN
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Hoặc đăng ký nhanh bằng</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Social */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMsg('Đăng nhập Google thất bại')}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
              />
            </div>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#94a3b8' }}>
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

export default Register;
