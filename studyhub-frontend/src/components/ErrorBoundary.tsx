import React from 'react';

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7f9ff] px-6">
          <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center border border-slate-100">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-red-500 text-[48px]">error</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">Oops! Có lỗi xảy ra</h1>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Trang này gặp sự cố không mong muốn. Vui lòng thử tải lại trang hoặc quay về trang chủ.
            </p>
            {this.state.error && (
              <details className="mb-6 text-left bg-slate-50 rounded-xl p-4 border border-slate-200">
                <summary className="text-xs font-semibold text-slate-400 cursor-pointer uppercase tracking-wider">
                  Chi tiết lỗi
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto whitespace-pre-wrap break-all">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/25"
              >
                Tải lại trang
              </button>
              <a
                href="/"
                className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
