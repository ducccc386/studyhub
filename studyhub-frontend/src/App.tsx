import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import ScrollToTop from './components/Shared/ScrollToTop';
import { Toaster, toast } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

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
      <BrowserRouter>
        <ScrollToTop />
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
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
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
