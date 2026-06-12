import React, { useState, useEffect } from 'react';

const TestPayment: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS'>('IDLE');
  const [error, setError] = useState<string | null>(null);

  // Function to simulate clicking "Confirm Hire"
  const handleConfirmHire = async () => {
    setLoading(true);
    setError(null);
    try {
      // Dùng ID = 1 là ID của lớp TRIAL đã được seed sẵn trong DB
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/payment/confirm-hire/1`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setQrUrl(data.qrUrl);
        setPaymentStatus('PENDING');
        
        // Trích xuất mã giao dịch (SHxxxx) từ qrUrl
        const urlObj = new URL(data.qrUrl);
        const addInfo = urlObj.searchParams.get('addInfo');
        if (addInfo) {
          setTransactionCode(addInfo);
        }
      } else {
        setError(data.error || 'Có lỗi xảy ra khi gọi API chốt lớp');
      }
    } catch (err) {
      setError('Không thể kết nối đến Backend');
    } finally {
      setLoading(false);
    }
  };

  // Polling logic
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      if (!transactionCode || paymentStatus !== 'PENDING') return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/payment/status/${transactionCode}`);
        const data = await response.json();
        
        if (data.status === 'SUCCESS' || data.status === 'CONFIRMED') {
          setPaymentStatus('SUCCESS');
          clearInterval(intervalId); // Stop polling when success
        }
      } catch (err) {
        console.error("Lỗi khi polling:", err);
      }
    };

    if (paymentStatus === 'PENDING' && transactionCode) {
      // Polling mỗi 3 giây
      intervalId = setInterval(checkStatus, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [transactionCode, paymentStatus]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Trang Test Thanh Toán
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Mô phỏng luồng Phụ huynh chốt lớp và quét mã QR
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {paymentStatus === 'IDLE' && (
          <div className="mt-8 space-y-6">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="font-semibold text-indigo-900">Thông tin Lớp học:</h3>
              <ul className="mt-2 text-sm text-indigo-700 space-y-1">
                <li>• Tên lớp: Lớp Toán Hình Học 12</li>
                <li>• Gia sư: Nguyễn Thu Hà</li>
                <li>• Học phí: 2.000.000đ</li>
              </ul>
            </div>
            
            <button
              onClick={handleConfirmHire}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận thuê & Thanh toán'}
            </button>
          </div>
        )}

        {paymentStatus === 'PENDING' && qrUrl && (
          <div className="mt-8 flex flex-col items-center space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 text-center">
              Vui lòng quét mã QR để thanh toán
            </h3>
            
            <div className="p-4 bg-white border-2 border-indigo-100 rounded-xl shadow-inner">
              <img src={qrUrl} alt="Mã QR Thanh Toán" className="w-64 h-64 object-contain" />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Mã giao dịch:</p>
              <p className="text-lg font-mono font-bold text-indigo-600 tracking-wider bg-indigo-50 px-4 py-1 rounded mt-1">
                {transactionCode}
              </p>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Hệ thống đang chờ nhận tiền...</span>
            </div>

            <div className="text-xs text-gray-400 text-center px-4">
              Mẹo: Dùng Postman gọi API Webhook với mã giao dịch bên trên để mô phỏng tiền vào tài khoản.
            </div>
          </div>
        )}

        {paymentStatus === 'SUCCESS' && (
          <div className="mt-8 flex flex-col items-center space-y-6 text-center animate-bounce-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Thanh toán thành công!
              </h3>
              <p className="mt-2 text-gray-600">
                Cảm ơn bạn đã xác nhận lớp học. Gia sư sẽ sớm liên hệ với bạn.
              </p>
            </div>
            
            <button
              onClick={() => {
                setPaymentStatus('IDLE');
                setQrUrl(null);
                setTransactionCode(null);
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium text-sm underline"
            >
              Quay lại màn hình chính
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPayment;
