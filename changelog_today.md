# Tổng kết Công việc Hôm nay (StudyHub)

Dưới đây là tóm tắt toàn bộ các tính năng, bản vá lỗi và nâng cấp đã được thực hiện cho dự án StudyHub trong phiên làm việc hôm nay. Tài liệu này có thể dùng làm Changelog hoặc báo cáo tiến độ đồ án.

## 1. Dữ liệu giả lập (Seeder) cho Không gian lớp học
- **Vấn đề:** Màn hình Class Workspace (Không gian lớp học) bị trống dữ liệu, không thể quay video demo.
- **Giải pháp:** Viết một script Seeder tạm thời ở Backend để bơm dữ liệu giả (Mock data) bao gồm "Lộ trình học" (Syllabus) và "Tài liệu học tập" (Study Material) vào lớp Hóa Học 10.
- **Kết quả:** Giao diện hiển thị đầy đủ thông tin, có tài liệu PDF và bài tập tham khảo, phục vụ tốt cho việc thuyết trình và làm báo cáo (Outcome 2). (Script đã được dọn dẹp sau khi chạy xong để giữ code sạch).

## 2. Fix lỗi Crash API Thanh toán (Admin Payout)
- **Vấn đề:** Lỗi kết nối (500 Internal Server Error) khi Admin truy cập danh sách lớp học chờ giải ngân. Nguyên nhân do lỗi Infinite Recursion (Đệ quy vô hạn) và Lazy Initialization Exception khi Serialize entity `ClassSession` chứa các quan hệ 2 chiều.
- **Giải pháp:** Can thiệp vào `AdminPaymentController.java`, chuyển đổi dữ liệu trả về từ dạng Entity thô (`List<ClassSession>`) sang `List<Map<String, Object>>` chỉ lấy những trường cần thiết.
- **Kết quả:** API `/completed-classes` tải mượt mà, Admin Portal hiển thị danh sách lớp thành công.

## 3. Nâng cấp Form Đăng ký Lớp học (ClassDetail.tsx)
- **Vấn đề:** Trường "Học sinh lớp" bắt nhập text thủ công dễ gây rác dữ liệu, và cảnh báo bắt buộc nhập (required) mặc định của trình duyệt trông thiếu chuyên nghiệp.
- **Giải pháp:** 
  - Chuyển "Học sinh lớp" thành Dropdown (`<select>`) được phân nhóm rõ ràng (Tiểu học, THCS, THPT).
  - Tích hợp Validation nội bộ bằng React State: Hiển thị dòng chữ cảnh báo màu đỏ tinh tế ngay dưới các ô input (Tên học sinh, Lớp) nếu bỏ trống.

## 4. Giải đáp Business Logic (Tiền cọc)
- Làm rõ công thức tính tiền hệ thống: Mặc định Lớp học có 10 ca x 200.000đ = 2.000.000đ tổng học phí. Tiền cọc (Deposit) bắt buộc là 25% (tương đương 500.000đ).

## 5. Tích hợp AI Chatbot (Gemini)
Đây là tính năng "ăn tiền" nhất được thêm vào trong hôm nay:
- **Frontend (`ChatWidget.tsx`):** Xây dựng một nút Chat nổi ở góc phải dưới màn hình với UI/UX mượt mà, hiệu ứng Hover, và khung Chat chuyên nghiệp. Có hiệu ứng "Đang trả lời...".
- **Backend (`ChatbotController`, `ChatbotService`):** Mở API endpoint `/api/v1/chatbot/ask` kết nối trực tiếp với API của Google Gemini. Đã fix lỗi chuyển đổi từ model cũ sang model hiện đại nhất là `gemini-flash-latest`.
- **System Prompt (Bộ não AI):** Đã nhúng toàn bộ luật nghiệp vụ (Business Logic) của StudyHub vào não Bot, bao gồm quy trình tìm gia sư, công thức tính tiền, quy định cọc 25% (Escrow), thanh toán cuối khóa 75%, và Hotline 1900 8198. Bot trả lời cực kỳ khôn khéo và không bịa đặt thông tin.

## 6. Tài liệu Phòng thủ (Defense Preparation)
- Đã tổng hợp các trường hợp rủi ro (Unhappy Cases) liên quan đến cả AI Chatbot (Hết Quota, Prompt Injection, Hallucination) và Luồng nghiệp vụ StudyHub (Bùng tiền cọc, Quỵt tiền đợt cuối, Giao dịch chui qua Zalo) kèm theo cách xử lý trên hệ thống để giúp bạn đối đáp mượt mà trước hội đồng chấm thi.
