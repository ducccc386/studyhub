# Báo cáo Cập nhật: Tính năng Lịch sử Thanh toán

Tài liệu này tổng hợp lại toàn bộ các thay đổi code vừa được thực hiện để hoàn thiện luồng xem "Lịch sử thanh toán" và "Giao dịch" cho cả 3 đối tượng: **Gia sư (Tutor)**, **Phụ huynh (Parent)**, và **Quản trị viên (Admin)**.

---

## 1. Cập nhật cho Gia sư (Tutor)
**Vấn đề trước đây:** Giao diện `TutorBilling.tsx` (Công nợ & Thanh toán) yêu cầu dữ liệu dạng Hóa đơn (`InvoiceDTO`), nhưng API backend lại trả về đối tượng `ClassSession`.
**Giải pháp:**
- **[Sửa đổi]** `studyhub-backend/src/main/java/com/management/studyhub/controller/BillingController.java`
  - Cập nhật logic trong API `GET /api/v1/billing/tutor/{tutorProfileId}`.
  - Chuyển đổi dữ liệu từ `ClassSession` sang định dạng `Map<String, Object>` chuẩn với `InvoiceDTO` (bao gồm các trường: `month`, `platformFeeAmount`, `status`, `dueDate`, `qrCodeUrl`).

---

## 2. Tính năng mới cho Phụ huynh (Parent)
**Mục tiêu:** Cho phép Phụ huynh xem lại danh sách các giao dịch thanh toán tiền thuê gia sư của chính mình.
**Giải pháp:**
- **[Sửa đổi] Backend** `studyhub-backend/src/main/java/com/management/studyhub/repository/TransactionRepository.java`
  - Thêm hàm `findByClassSession_Parent_Id(Long parentId)` để truy vấn giao dịch theo ID Phụ huynh.
- **[Sửa đổi] Backend** `studyhub-backend/src/main/java/com/management/studyhub/service/PaymentService.java`
  - Thêm phương thức `getTransactionsByParent(Long parentId)`.
- **[Sửa đổi] Backend** `studyhub-backend/src/main/java/com/management/studyhub/controller/PaymentController.java`
  - Thêm API `GET /api/v1/payment/history/parent/{parentId}`.
- **[Tạo mới] Frontend** `studyhub-frontend/src/pages/ParentPortal/ParentTransactionHistory.tsx`
  - Tạo giao diện dạng bảng để hiển thị: Mã GD, Lớp học, Số tiền, Thời gian, Trạng thái.
- **[Sửa đổi] Frontend** `studyhub-frontend/src/components/Parent/SideNavBar.tsx`
  - Thêm nút menu điều hướng "Lịch sử giao dịch" vào nhóm "Tương tác".
- **[Sửa đổi] Frontend** `studyhub-frontend/src/routes/AppRouter.tsx`
  - Thêm route `/parent/transactions` cho trang Lịch sử giao dịch của Phụ huynh.

---

## 3. Tính năng mới cho Quản trị viên (Admin)
**Mục tiêu:** Admin cần một nơi để đối soát toàn bộ dòng tiền/giao dịch ra vào hệ thống.
**Giải pháp:**
- **[Sửa đổi] Backend** `studyhub-backend/src/main/java/com/management/studyhub/service/PaymentService.java`
  - Thêm phương thức `getAllTransactions()`.
- **[Sửa đổi] Backend** `studyhub-backend/src/main/java/com/management/studyhub/controller/PaymentController.java`
  - Thêm API `GET /api/v1/payment/admin/history`.
- **[Tạo mới] Frontend** `studyhub-frontend/src/pages/AdminPortal/AdminTransactionHistory.tsx`
  - Tạo giao diện bảng dữ liệu liệt kê tất cả các giao dịch toàn hệ thống.
- **[Sửa đổi] Frontend** `studyhub-frontend/src/components/Admin/AdminSideNavBar.tsx`
  - Thêm nút menu điều hướng "Lịch sử giao dịch" vào nhóm "Thống kê & Tài chính".
- **[Sửa đổi] Frontend** `studyhub-frontend/src/routes/AppRouter.tsx`
  - Thêm route `/admin/transactions` cho trang của Admin.

---

**Kết luận:**
Hệ thống hiện tại đã bao quát đầy đủ luồng đối soát và lịch sử thanh toán. 
- Gia sư theo dõi công nợ nền tảng qua thẻ `Hóa đơn`.
- Phụ huynh quản lý tiền đã chi trả qua `Lịch sử giao dịch`.
- Admin nắm bắt dòng tiền thông qua trang quản trị toàn hệ thống.
