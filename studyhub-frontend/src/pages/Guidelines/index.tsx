const Guidelines = () => {
  return (
    <div className="max-w-[1000px] mx-auto p-6 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Hướng dẫn & Quy định Dịch vụ</h1>
      
      <div className="bg-surface-container-low p-6 rounded-xl mb-6 shadow-sm border border-outline-variant">
        <h2 className="text-2xl font-bold mb-4 text-primary">Quy trình Thanh toán & Học thử</h2>
        <p className="mb-4 text-on-surface-variant">StudyHub áp dụng quy trình thanh toán an toàn, bảo vệ quyền lợi của cả phụ huynh và gia sư.</p>
        
        <ol className="list-decimal pl-6 space-y-4 text-on-surface">
          <li>
            <strong>Giai đoạn Học thử:</strong> Phụ huynh được quyền học thử 2 buổi với gia sư.
          </li>
          <li>
            <strong>Quyết định:</strong> Sau học thử, nếu đồng ý học tiếp, phụ huynh thanh toán cọc <strong>25%</strong> tổng học phí để khóa học chính thức bắt đầu. Nếu không đồng ý, phụ huynh có thể hủy lớp.
          </li>
          <li>
            <strong>Tiến hành học:</strong> Gia sư tiến hành giảng dạy các buổi còn lại theo lộ trình.
          </li>
          <li>
            <strong>Thanh toán nốt (75%):</strong> Sau khi hoàn thành toàn bộ khóa học, gia sư ấn "Báo cáo xong". Phụ huynh thanh toán <strong>75%</strong> còn lại. Hệ thống sẽ giải ngân tiền vào ví gia sư.
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-blue-800 mb-2">Dành cho Phụ Huynh</h3>
          <ul className="list-disc pl-5 text-blue-900 space-y-2">
            <li>Học phí được StudyHub giữ an toàn trên hệ thống, không chuyển trực tiếp cho gia sư để tránh rủi ro.</li>
            <li>Miễn phí nền tảng (0%).</li>
            <li>Chỉ thanh toán 75% cuối cùng khi kết thúc khóa học.</li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-green-800 mb-2">Dành cho Gia Sư</h3>
          <ul className="list-disc pl-5 text-green-900 space-y-2">
            <li>Yên tâm giảng dạy: Chắc chắn nhận được lương vì hệ thống đã giữ tiền cọc của phụ huynh.</li>
            <li>Phí nền tảng: <strong>15%</strong> trên tổng doanh thu (sẽ trừ tự động khi giải ngân).</li>
            <li>Dạy thử: Nếu phụ huynh hủy lớp sau 2 buổi học thử, gia sư sẽ coi như dạy thử miễn phí.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Guidelines;
