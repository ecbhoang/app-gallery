## 🎯 Mục tiêu dự án

Tạo **trang web gallery hiển thị danh sách ứng dụng, link, form, v.v...** với giao diện và hiệu ứng tương tự **Launchpad của macOS**.
Trang này có thể tìm kiếm, mở nhanh app, hỗ trợ phân trang, và hoạt động tốt trên mọi thiết bị.

---

## 🧩 Công nghệ & Framework

* **Frontend:** HTML, TailwindCSS (ưu tiên giao diện “liquid glass / frosted glass” theo phong cách macOS Tahoe)
* **JS Framework:** Vanilla JS
* **Data Source:** JSON file (local hoặc fetch từ API endpoint)
* **Responsive:** Mobile / Tablet / Desktop

---

## 🪄 Chức năng chi tiết

### 1. Loading Screen

* Khi trang được mở, hiển thị màn hình loading (blur + icon xoay hoặc animation Apple style).
* Sau khi JSON data load xong, chuyển mượt sang giao diện Launchpad.

### 2. Giao diện chính (Launchpad layout)

* Hiển thị danh sách app dưới dạng **grid icon** (hình vuông bo tròn, có shadow nhẹ, và tên app bên dưới).
* Hỗ trợ background **gradient mờ (liquid glass)** với hiệu ứng blur, đổ bóng tinh tế.
* Khi hover icon: hiệu ứng phóng to nhẹ + highlight mờ phía sau.

### 3. Tìm kiếm & phím tắt

* Ô **Search** cố định ở phía trên (khi nhấn phím tắt `Cmd + K` / `Ctrl + K` sẽ focus vào thanh search).
* Khi gõ từ khóa, lọc app theo tên, tag hoặc mô tả.
* Hỗ trợ **mở nhanh** app (Enter khi app được chọn trong search).
* Hỗ trợ `Tab` để chuyển select giữa các app và Enter để vô app

### 4. Dữ liệu động từ JSON

* Lấy data từ `apps.json` có cấu trúc ví dụ:

```json
[
  {
    "id": "1",
    "name": "App Store",
    "icon": "https://example.com/icons/appstore.png",
    "url": "https://example.com/appstore",
    "tags": ["store", "download"]
  },
  {
    "id": "2",
    "name": "Calendar",
    "icon": "https://example.com/icons/calendar.png",
    "url": "https://example.com/calendar"
  }
]
```

* Cho phép update hoặc thêm app mới dễ dàng.

### 5. Phân trang & điều hướng

* Nếu số lượng app lớn (>24), tự động chia thành **nhiều trang** (slide).
* Có **animation trượt ngang** khi đổi trang (giống Launchpad).
* Dùng gesture hoặc phím mũi tên trái/phải để chuyển trang.

### 6. Trạng thái trống & fallback icon

* Hiển thị empty state với minh hoạ khi không tìm thấy ứng dụng phù hợp.
* Nếu icon app thiếu hoặc lỗi tải, dùng icon mặc định được cung cấp sẵn.
* Bánh xe chuột hoặc gesture trackpad có thể trượt giữa các trang ứng dụng.

### 7. Responsive

* Tự động điều chỉnh số cột / hàng theo thiết bị:

  * Desktop: 6–7 cột
  * Tablet: 4–5 cột
  * Mobile: 3–4 cột
* Giữ khoảng cách đều nhau, căn giữa nội dung.

---

## ✨ Gợi ý UI/UX

* Font: SF Pro hoặc Inter
* Icon: bo tròn, shadow nhẹ, gradient nền.
* Hiệu ứng hover: scale(1.05), background blur glow.
* Glassmorphism:

  ```css
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  ```
* Animation transition mượt: `transition-all duration-300 ease-in-out`

---

## 💾 Optional features

* Double-click mở app.
* Drag & drop sắp xếp icon và lưu thứ tự (nếu bổ sung thêm).

---

## ✅ Kết quả mong đợi
* Giao diện hoạt động giống Launchpad của macOS.
* Tương tác nhanh, đẹp, hỗ trợ tìm kiếm, phím tắt và phân trang mượt.
* Có thể mở rộng thêm tính năng hoặc đồng bộ layout qua API sau này.
