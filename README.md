# Hexagonal Architecture

Ứng dụng quản lý sách và người dùng (mượn/trả sách), xây dựng theo **Hexagonal Architecture** (Ports & Adapters).

## Kiến trúc Hexagonal trong dự án

- **Domain:** Chứa các **entities** (Book, User) và **ports** (Interface).
  - **Book entity:** Chứa logic xử lý một cuốn sách (cụ thể đã tồn tại).
  - **User entity** Chứa logic của một người dùng khi hành động (Cụ thể đã tồn tại).
  - **Driving ports:** Interface use case (vd: `IAddBookUseCase`, `IBorrowBookUseCase`).
  - **Driven ports:** Interface truy cập và lưu data (vd: `IBookRepository`, `IUserRepository`).

- **Application:** Các **use case** (AddBook, AddUser, BorrowBook, ReturnBook) gọi driven ports, không phụ thuộc vào HTTP hay database cụ thể.

- **Infrastructure:** Các **adapters** implement ports.
  - **Driving adapters:** Controllers gọi use case.
  - **Driven adapters:** Repository In-Memory hoặc MongoDB implement `IBookRepository` / `IUserRepository`.

Luồng hoạt động theo dependency: **HTTP -> Controller -> Driving Port -> Use Case -> Driven Port -> Repository**. Domain và use case không biết Express hay MongoDB; có thể đổi DB hoặc thêm API khác mà không sửa lõi.

## Cấu trúc và quy trình của Hexagonal Architecture

Hexagonal Architecture: là kiến trúc để tách biệt business logic với bên ngoài, để code nghiệp vụ không bị trộn lẫn với code truy vấn.

### Kiến trúc

1. **Entities**
  - Là trái tim của HA.
  - Đại diện cho Business Logic và đặt luật cho application.
  - Đám bảo đóng gói và có thể điều hành mà không phụ thuộc vào data.

2. **Port**: Nơi giao tiếp, để  inside và outside không vi phạm quy tắc lẫn nhau.
  - Inbound Port (Driving): Những gì core cho bên ngoài sử dụng. chịu trách nhiệm nhận input và kích hoạt xử lý logic.
  - Outbound Port (Driven): Những gì core cần, yêu cầu từ bên ngoài để hoạt động.

3. **Adapter**: Phần implement thực tế của Port. Có trách nhiệm translate data bên ngoài như (http, db query,...) thành một cái gì đó mà core hiểu được và ngược lại.
  - Inbound Adapter (Driving): Đứng trước Driving Port, nhận dữ liệu thô thiển từ bên ngoài và trích xuất đúng thứ mà core mong đợi.
  - Outbound Adtapter (Driven): Đứng sau Driven Port, Core đưa cho Adapter một domain entity. Adapter phải dịch entiry ra.

4. **Application service (Interractor/Use cases)**
  - Nhận các yêu cầu từ inbound port, gọi các entity để xử lý logic, cuối cùng gọi Outbound Port để lưu.
  - Đặc điểm: không chứa logic cốt lõi, chỉ điều phối.
  Luồng: **Nhận data từ port -> Gọi entity để xử lý logic -> Gọi repo để lưu kết quả**

5. **Repositories**: Dạng của Outbound Adapter, tập trung hoàn toàn vào việc lưu dữ liệu
  - Che dấu sự phức tạp của việc truy vấn data khỏi core, core chỉ thấy interface (Port) đơn giản như saveBook chứ không cần phải biết làm thế nào.

6. **Transport layer**: Lớp xử lý giao tiếp giữa bên ngoài và trong ứng dụng
  - Tiếp nhận thông tin vào chuyển đến Adapter.

7. **External System**: Ứng dụng cần giao tiếp nhưng không sở hữu, connect thông qua Outbound Adapter.

### Giải đáp thắc mắc

1. Mục đích cốt lõi
  - Tách biệt giữa inside và outside.

2. Trong mô hình hexa, chiều của sự phụ thuộc đi từ đâu?
  - Chiều phụ thuộc luôn hướng vào Core. Trong kiến trúc truyền thống, Core phụ thuộc vào DB, nhưng tại đây thì ngược lại, Core định nghĩa interface và DB phải tuân thủ nó. Để bảo vệ Business Logic khỏi sự thay đổi của công nghệ ngoài.

3. Tại sao không được import các thư viện như Express vào domain?
  - Core chỉ chứa code để quản lý quy tắc bên trong một entity, vì vậy nó không được bị ảnh hưởng bất cứ gì ở bên ngoài

4. Ta dùng interface đại điện cho Port, thì port đóng vai trò "ra lệnh" hay thực thi.
  - Port là một contract, nó không ra lệnh cũng không thực thi, nó áp đặt luật. IPort áp đặt cách bên ngoài gọi vào, OPort áp đặt cách Core gọi ra.

5. Giả sử tôi muốn đổi từ việc gửi data ra MongoDB sang Postgre. Tôi sẽ phải sửa code ở những layer nào?
  - Chỉ cần tạo một implementation mới ở Outbound Adapter. Do interaction chỉ phụ thuộc vào port, vì vậy chỉ cần thay đổi phần cấu hình Dependency Injection ở lớp ngoài cùng (index.ts) để bơm Adapter mới vào. Không dòng code logic nào bị ảnh hưởng.

6. Nếu một ngày bạn xóa sạch thư mục **infrastructure**, phần code còn lại trong src có còn "có nghĩa" về mặt nghiệp vụ không? Tại sao?
  - Vẫn còn nguyên giá trị vì công Infra chỉ là lớp ngoài cùng, không ảnh hưởng gì đến business logic (Hệ thống quản lý thư viện bị xóa infra cốt lõi vẫn thế chứ không phải hệ thống ngân hàng). Nghiệp vụ là bất biến, công nghệ là tạm thời.

7. Tại sao entity book không có **Add Book** mà lại ở use-case.
  - Entity: Đại diện cho một thực tể cụ thể đã tồn tại. Nhiệm vụ là quản lý quy tắc của thực thể  đó.
  - Use Case: Đại diện cho một quy trình nghiệp vụ.
  -> Việc **add book** chỉ là thêm thông tin của thực thể  vào bên trong DB vì vậy không để  ở trong entity book
## Cách chạy

```bash
# Cài đặt
npm install

# Chạy backend (dev)
npm run dev

# Chạy frontend (giao diện web)
npm run dev:frontend

# Seed dữ liệu (cần MongoDB)
npm run seed
```

Tạo file `.env` với `MONGO_URI` nếu dùng MongoDB. Nếu không thì dùng repository In-Memory.
