# Hexagonal Architecture

> Tài liệu do **người viết**, có sự **hỗ trợ của AI** (Tạo sườn và viết cấu trúc dự án).

Ứng dụng quản lý sách và người dùng (mượn/trả sách), xây dựng theo **Hexagonal Architecture** (Ports & Adapters).

## Kiến trúc Hexagonal trong dự án
- **Domain / Core:** Các entity (Book, User) và các port (interface).
  - Entity: nằm ở `src/entities` – chỉ chứa logic nghiệp vụ (mượn/trả sách, ràng buộc số lượng…).
  - Driving port: interface use case (`IAddBookUseCase`, `IBorrowBookUseCase`…) ở `src/port/driving`.
  - Driven port: interface để core làm việc với bên ngoài (`IBookRepository`, `IUserRepository`, `IUnitOfWork`, `IUnitOfWorkFactory`) ở `src/port/driven`.

- **Application:** Các use case (`AddBook`, `AddUser`, `BorrowBook`, `ReturnBook`) ở `src/application`. Chúng gọi **Unit of Work** (qua `IUnitOfWork`) để vừa đọc/ghi qua repository, vừa đảm bảo transaction MongoDB, không đụng tới Express hay Mongoose.

- **Infrastructure:** Các adapter implement port.
  - Driving: Controller (ở đây là Express) gọi use case qua driving port.
  - Driven: In-Memory hoặc Mongo implementation cho repository và Unit of Work (`MongoBookRepository`, `MongoUserRepository`, `MongoUnitOfWork`, `InMemory*`).

Luồng hoạt động theo dependency: **HTTP → Controller → Driving Port (Use Case) → Use Case → Driven Port (UnitOfWork / Repository) → MongoDB / InMemory**. Domain và use case không biết Express hay MongoDB; có thể đổi DB hoặc thêm API khác mà không sửa lõi.

## Kiến trúc Hexagonal trong dự án – component và code

Phần này ánh xạ từng **khái niệm** Hexagonal với **code hiện tại** trong repo.

### 1. Entity (thực thể nghiệp vụ)
Là thành phần cốt lõi trong Hexagonal Architecture, tập trung logic cho nghiệp vụ và ràng buộc logic cho ứng dụng. Entities cần đảm bảo logic được xử lý độc lập, không phụ thuộc và ảnh hưởng vào công nghệ hay infra như database.
- `Book.ts`: borrow(), returnBook(), quy tắc “đã mượn thì không mượn lại”.
- `User.ts`: addBorrowedBook(), removeBorrowedBook(), getBorrowedBooksCount().

### 2. Inbound Port (driving)
Contract để bên ngoài gọi vào core (mượn sách, thêm sách…).
- Code: `src/port/driving/` – `IAddBookUseCase`, `IBorrowBookUseCase`, `IReturnBookUseCase`…, mỗi cái có `execute(...)`.

### 3. Outbound Port (driven)
Contract để core đọc/ghi data và quản lý transaction. Core chỉ biết “lưu sách”, “tìm sách theo id” và “bắt đầu/commit/rollback Unit of Work”.
- Code: `IBookRepository`, `IUserRepository`, `IUnitOfWork`, `IUnitOfWorkFactory` trong `src/port/driven/`.

### 4. Inbound Adapter (driving)
Nhận HTTP (req/res), lấy params, gọi use case, trả JSON.
- BookController, UserController trong `src/infrastructure/adapters/driving/`.

### 5. Outbound Adapter
Implement IBookRepository / IUserRepository: Mongo hoặc In-Memory (Map).
- MongoBookRepository, MongoUserRepository, InMemoryBookRepository, InMemoryUserRepository trong `src/infrastructure/adapters/driven/`.

### 6. Use case
Điều phối: nhận lệnh qua inbound port, gọi entity để xử lý logic sau đó gọi outbound port để lưu.
- BorrowBook, ReturnBook, AddBook, AddUser trong `src/application/use-cases/`.

### Các khái niệm (tóm tắt)

1. **Entities** — Đại diện Business Logic và quy tắc; không phụ thuộc vào công nghệ và infra bên ngoài.
2. **Port** — Contract giao tiếp: Inbound (core cho bên ngoài gọi vào), Outbound (core cần bên ngoài cung cấp).
3. **Adapter** — Implement Port: Inbound Adapter nhận dữ đầu vào (HTTP…) chuyển thành lệnh cho core; Outbound Adapter dịch entity sang DB/API.
4. **Use case** — Nhận lệnh qua Inbound Port, gọi entity và trả về cho Outbound Port; chỉ điều phối không chứa logic cốt lõi.
5. **Repository** — Dạng Outbound Adapter, chuyên lưu/đọc; core chỉ thấy Port (save, findById).
6. **Transport** — Lớp nhận kết nối bên ngoài (HTTP, CLI) và chuyển đến Inbound Adapter.
7. **External System** — Công nghệ bên ngoài (DB, API) kết nối qua Outbound Adapter.

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

## Unit test

Project dùng **Jest** để viết unit test. Hiện tại test chủ yếu hai chỗ: **entity** (ở folder domain) và **use case** (ở folder application). Entity thì test trực tiếp logic (mượn/trả sách, thêm/xóa sách đang mượn). Use case thì mock repo (IBookRepository, IUserRepository) rồi gọi execute, kiểm tra đã gọi save/findById đúng và xử lý lỗi (sách không tồn tại, user không tồn tại, sách đang được mượn). Không cần MongoDB, test nhanh.

- Test entity: `Book.test.ts`, `User.test.ts` 
- Test use case: `BorrowBook.test.ts`, `ReturnBook.test.ts` 

Chạy từng test test:

```bash
npx jest **link test**
```

## Cách chạy

```bash
# Cài đặt
npm install

# Chạy test
npm run test

# Chạy backend (dev)
npm run dev

# Chạy frontend (giao diện web)
npm run dev:frontend
```

Tạo file `.env` với `MONGO_URI` nếu dùng MongoDB. Nếu không thì dùng repository In-Memory.

## Cấu trúc thư mục

```
src/
├── application/
│   ├── AddBook.ts
│   ├── AddUser.ts
│   ├── BorrowBook.ts
│   ├── BorrowBook.test.ts
│   ├── ReturnBook.ts
│   └── ReturnBook.test.ts
├── entities/
│   ├── Book.ts
│   ├── Book.test.ts
│   ├── User.ts
│   └── User.test.ts
├── infrastructure/
│   └── adapters/
│       ├── driven/
│       │   ├── InMemoryBookRepository.ts
│       │   ├── InMemoryUnitOfWork.ts
│       │   ├── InMemoryUnitOfWorkFactory.ts
│       │   ├── InMemoryUserRepository.ts
│       │   ├── MongoBookRepository.ts
│       │   ├── MongoUnitOfWork.ts
│       │   ├── MongoUnitOfWorkFactory.ts
│       │   └── MongoUserRepository.ts
│       └── driving/
│           ├── BookController.ts
│           └── UserController.ts
├── port/
│   ├── driven/
│   │   ├── IBookRepository.ts
│   │   ├── IUnitOfWork.ts
│   │   ├── IUnitOfWorkFactory.ts
│   │   └── IUserRepository.ts
│   └── driving/
│       ├── IAddBookUseCase.ts
│       ├── IAddUserUseCase.ts
│       ├── IBorrowBookUseCase.ts
│       └── IReturnBookUseCase.ts
└── index.ts
```
