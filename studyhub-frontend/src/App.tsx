import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import ScrollToTop from './components/Shared/ScrollToTop';
import { Toaster, toast } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import ChatWidget from './components/Shared/ChatWidget';

// Ghi đè hàm alert mặc định của trình duyệt để sử dụng giao diện toast xịn xò
window.alert = (message?: any) => {
  const msgStr = String(message || '');
  const lowerMsg = msgStr.toLowerCase();
  
  if (lowerMsg.includes('lỗi') || lowerMsg.includes('thất bại') || lowerMsg.includes('không') || lowerMsg.includes('vui lòng') || lowerMsg.includes('phải')) {
    toast.error(msgStr);
  } else if (lowerMsg.includes('thành công') || lowerMsg.includes('cảm ơn') || lowerMsg.includes('đã')) {
    toast.success(msgStr);
  } else {
    toast(msgStr);
  }
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              color: '#1f2937',
              padding: '16px 24px',
              borderRadius: '100px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
              border: '1px solid rgba(229, 231, 235, 0.5)',
              fontWeight: 600,
              fontSize: '15px'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AppRouter />
        <ChatWidget />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
