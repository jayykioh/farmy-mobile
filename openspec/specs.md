# Tài liệu Đặc tả Chức năng (Specs) - Farmy Mobile

Tài liệu này đặc tả toàn bộ các tính năng đã được triển khai trong ứng dụng di động **Farmy Mobile**, bao gồm luồng hoạt động, cấu trúc màn hình, các API kết nối và các thư viện hỗ trợ.

---

## 1. Xác thực & Đăng nhập (Authentication)

### 1.1 Đăng nhập thường & Đăng ký
*   **Màn hình:** `app/(auth)/welcome.tsx`, `app/(auth)/login.tsx`, `app/(auth)/register.tsx`
*   **Mô tả:** Cho phép người dùng đăng ký tài khoản mới và đăng nhập bằng Email / Mật khẩu.
*   **Luồng hoạt động:**
    1.  Người dùng nhập thông tin và nhấn Đăng nhập/Đăng ký.
    2.  Gọi API tương ứng (`/auth/login` hoặc `/auth/register`).
    3.  Lưu `accessToken` vào `AsyncStorage`.
    4.  Cập nhật trạng thái trong `authStore` (Zustand) và chuyển hướng tới `/(tabs)/home`.
*   **API kết nối:**
    *   `POST /auth/register` (Đăng ký tài khoản)
    *   `POST /auth/login` (Đăng nhập tài khoản)
    *   `GET /auth/me` (Lấy thông tin tài khoản hiện tại)

### 1.2 Đăng nhập bằng Google (Google OAuth)
*   **Màn hình:** `app/(auth)/login.tsx`
*   **Mô tả:** Đăng nhập bằng tài khoản Google thông qua cửa sổ trình duyệt bảo mật in-app (WebBrowser) và tự động đồng bộ trở lại ứng dụng.
*   **Luồng hoạt động:**
    1.  Ứng dụng gọi `Linking.createURL('oauth-callback')` để lấy link callback động (ví dụ: `exp://...` cho Expo Go hoặc `farmy://...` cho Standalone).
    2.  Mở trình duyệt in-app hướng tới: `/auth/google?state=<Mã_Hóa_Callback_URL>`.
    3.  Người dùng chọn tài khoản Google trên trình duyệt.
    4.  Backend xử lý xác thực, đính kèm Token và chuyển hướng trình duyệt về Callback URL động tương ứng.
    5.  Hệ điều hành nhận diện và tự động đóng trình duyệt, đưa Token trở lại app di động.
    6.  App gọi API `/auth/me` lấy thông tin và chuyển hướng vào trang chủ.
*   **Thư viện sử dụng:** `expo-web-browser`, `expo-linking`

---

## 2. Trang chủ & Thú cưng (Home & Mascot Pet)

*   **Màn hình:** `app/(tabs)/home.tsx`
*   **Mô tả:** Màn hình chính hiển thị tổng quan thông tin thời tiết, trạng thái nông trại, các phím tắt nhanh và hiển thị thú cưng Mascot (Bé Thóc).
*   **Chức năng chính:**
    *   **Mascot Interaction:** Hiển thị Bé Thóc kèm theo trang bị (nón, kính, áo) đang mặc, hiển thị thanh cấp độ (Level) và điểm kinh nghiệm (XP) hiện tại của thú cưng.
    *   **Quick Actions:** Các phím tắt nhanh đến màn hình Nhật ký, Quét bệnh, Lịch nhắc nhở và Cửa hàng.
    *   **Weather Info:** Hiển thị dự báo thời tiết cơ bản phục vụ canh tác.
*   **API kết nối:**
    *   `GET /pets/status` (Lấy trạng thái cấp độ, XP và trang phục hiện tại của thú cưng)

---

## 3. Nhật ký Vụ mùa (Crop Diary)

### 3.1 Danh sách Nhật ký
*   **Màn hình:** `app/(tabs)/diary.tsx`
*   **Mô tả:** Danh sách các vụ mùa đang diễn ra hoặc đã lưu trữ. Cho phép lọc theo trạng thái Hoạt động / Lưu trữ.
*   **API kết nối:**
    *   `GET /diaries` (Lấy danh sách nhật ký vụ mùa)

### 3.2 Bắt đầu vụ mùa mới (Create Diary)
*   **Màn hình:** `app/diary/create.tsx`
*   **Mô tả:** Khởi tạo một nhật ký canh tác cho một mảnh vườn cụ thể.
*   **Form nhập liệu:** Chọn Mảnh vườn (Plot), nhập Tên cây trồng (Crop Type) và Ngày bắt đầu vụ mùa.
*   **API kết nối:**
    *   `POST /diaries` (Tạo mới nhật ký vụ mùa)
    *   `GET /plots` (Lấy danh sách mảnh vườn để chọn)

### 3.3 Chi tiết Nhật ký & Lịch sử hoạt động (Diary Details)
*   **Màn hình:** `app/diary/[id].tsx`
*   **Mô tả:** Xem dòng thời gian (Timeline) các hoạt động đã thực hiện trên cây trồng (tưới nước, bón phân, làm cỏ, thu hoạch...).
*   **Chức năng chính:**
    *   **Thêm hoạt động mới (Add Log):** Chọn loại hoạt động, nhập ghi chú chi tiết và gửi lên hệ thống.
    *   **Hoàn thành vụ mùa (Archive/Complete):** Đánh dấu kết thúc vụ mùa hiện tại và lưu trữ nhật ký.
*   **API kết nối:**
    *   `GET /diaries/:id` (Lấy chi tiết nhật ký)
    *   `GET /diaries/:id/logs` (Lấy dòng thời gian hoạt động)
    *   `POST /diaries/:id/logs` (Thêm một hoạt động mới)
    *   `PATCH /diaries/:id/complete` (Đóng vụ mùa và lưu trữ)

---

## 4. Quét phát hiện bệnh cây trồng (AI Disease Scan)

*   **Màn hình:** `app/scan.tsx`
*   **Mô tả:** Chức năng AI hỗ trợ chẩn đoán hình ảnh để phát hiện sâu bệnh trên lá lúa hoặc các loại cây trồng khác.
*   **Luồng hoạt động:**
    1.  Người dùng cấp quyền truy cập Camera, thực hiện chụp ảnh trực tiếp hoặc chọn ảnh từ Thư viện (Photo Library).
    2.  Hệ thống gửi file ảnh lên máy chủ phân tích AI.
    3.  Hiển thị kết quả chẩn đoán bao gồm: Tên bệnh, Độ tin cậy (%), Triệu chứng phát hiện và các biện pháp điều trị đề xuất (Hóa học & Hữu cơ).
*   **API kết nối:**
    *   `POST /plant-scan/analyze` (Upload ảnh và nhận kết quả phân tích AI)
*   **Thư viện sử dụng:** `expo-camera`, `expo-image-picker`

---

## 5. Trợ lý AI (AI Chat Assistant)

*   **Màn hình:** `app/(tabs)/chat.tsx`
*   **Mô tả:** Kênh trò chuyện thời gian thực với trợ lý ảo nông nghiệp "Bé Thóc" dưới dạng truyền phát dữ liệu (Streaming SSE).
*   **Luồng hoạt động:**
    1.  Người dùng nhập câu hỏi (ví dụ: "Trồng lúa như thế nào?").
    2.  Hệ thống mở kết nối Server-Sent Events (SSE) tới API chat với tham số `message` và `client_message_id`.
    3.  Server truyền tải từng phần phản hồi (delta tokens) của AI về app.
    4.  Giao diện cập nhật chữ chạy thời gian thực (typing effect) cho bong bóng trò chuyện của Bot.
*   **API kết nối:**
    *   `GET /chat/stream/events` (Mở luồng kết nối sự kiện SSE để chat)
*   **Thư viện sử dụng:** `react-native-sse`

---

## 6. Cửa hàng Mascot (Mascot Shop)

*   **Màn hình:** `app/shop.tsx`
*   **Mô tả:** Nơi sử dụng điểm tích lũy hoặc XP để mua và trang bị phụ kiện cho Bé Thóc.
*   **Chức năng chính:**
    *   Hiển thị danh sách phụ kiện (Nón, Kính, Áo).
    *   Xem trước (Preview) trang bị trên Mascot.
    *   Mua và Trang bị trực tiếp (Equip/Unequip).
*   **API kết nối:**
    *   `GET /shop/items` (Lấy danh sách các vật phẩm)
    *   `POST /shop/purchase` (Mua vật phẩm)
    *   `POST /shop/equip` (Trang bị phụ kiện lên Mascot)

---

## 7. Nhắc nhở chăm sóc (Reminders)

*   **Màn hình:** `app/reminders.tsx`
*   **Mô tả:** Hiển thị danh sách các lịch hẹn nhắc nhở công việc cần làm trên nông trại (như tưới nước, bón phân, phun thuốc...).
*   **Chức năng chính:**
    *   Hiển thị danh sách công việc hôm nay và sắp tới.
    *   Đánh dấu hoàn thành trực tiếp trên giao diện để cập nhật trạng thái lịch nhắc nhở.
*   **API kết nối:**
    *   `GET /reminders` (Lấy danh sách nhắc nhở)
    *   `PATCH /reminders/:id/complete` (Hoàn thành nhắc nhở)

---

## 8. Hồ sơ & Cài đặt (Profile Settings)

*   **Màn hình:** `app/(tabs)/profile.tsx`, `app/profile/info.tsx`
*   **Mô tả:** Quản lý thông tin tài khoản cá nhân, xem các danh hiệu (Badges) đã đạt được và thực hiện Đăng xuất.
*   **Chức năng chính:**
    *   **Badge Shelf:** Hiển thị các huy hiệu thành tích của nông dân (Ví dụ: First Harvest, Water Saver...).
    *   **Thông tin cá nhân:** Trang hiển thị chi tiết tên, email, vai trò, ID nông trại và ID người dùng.
    *   **Đăng xuất:** Xóa dữ liệu phiên đăng nhập và token trong `AsyncStorage` để quay về màn hình Welcome.
