import toast from 'react-hot-toast';

export const toastConfirm = (message: string, onConfirm: () => void) => {
  toast((t) => (
    <div className="flex flex-col gap-4 w-full animate-fade-in">
      <span className="font-semibold text-gray-800 text-base">{message}</span>
      <div className="flex justify-end gap-3 mt-1">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary/90 transition-colors shadow-sm"
        >
          Đồng ý
        </button>
      </div>
    </div>
  ), { 
    duration: 10000,
    style: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '20px 24px',
      borderRadius: '24px',
      border: '1px solid rgba(229, 231, 235, 0.8)',
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
      minWidth: '320px'
    }
  });
};
