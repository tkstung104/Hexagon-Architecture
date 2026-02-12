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

Luồng hoạt động theo dependency: **HTTP → Controller → Driving Port → Use Case → Driven Port → Repository**. Domain và use case không biết Express hay MongoDB; có thể đổi DB hoặc thêm API khác mà không sửa lõi.

## Kiến trúc Hexagonal trong dự án – component và code

Phần này ánh xạ từng **khái niệm** Hexagonal với **code hiện tại** trong repo.

### 1. Entity (thực thể nghiệp vụ)

**Khái niệm:** Trái tim của Hexagonal. Đại diện cho một đối tượng nghiệp vụ cụ thể đã tồn tại, chứa quy tắc và logic của chính nó, không phụ thuộc HTTP hay database.

**Trong code:**
- `src/domain/entities/Book.ts` — entity Sách: `borrow()`, `returnBook()`, quy tắc “đã mượn thì không mượn lại”.
- `src/domain/entities/User.ts` — entity Người dùng: `addBorrowedBook()`, `removeBorrowedBook()`, `getBorrowedBooksCount()`.

### 2. Inbound Port / Driving Port (cổng vào – use case)

**Khái niệm:** Contract mà bên ngoài dùng để “gọi vào” ứng dụng. Định nghĩa **cách** core nhận lệnh (vd: mượn sách, thêm sách), không phụ thuộc HTTP hay CLI.

**Trong code:** Các interface trong `src/domain/ports/driving/`:
- `IAddBookUseCase`, `IAddUserUseCase`, `IBorrowBookUseCase`, `IReturnBookUseCase` — mỗi cái khai báo một `execute(...)` với tham số domain (id, title, author, userId, bookId…).

### 3. Outbound Port / Driven Port (cổng ra – repository)

**Khái niệm:** Contract mà core cần để **lưu/đọc dữ liệu**. Core chỉ biết “lưu sách”, “tìm sách theo id”; không biết MongoDB hay in-memory.

**Trong code:** Các interface trong `src/domain/ports/driven/`:
- `IBookRepository`: `save(book: Book)`, `findById(id: string)`.
- `IUserRepository`: `save(user: User)`, `findById(id: string)`.

Đây là **outbound port**: core gọi chúng khi cần persist/load; implementation nằm ở infrastructure.

### 4. Inbound Adapter / Driving Adapter (adapter nhận dữ liệu từ ngoài)

**Khái niệm:** Nhận dữ liệu “thô” từ bên ngoài (HTTP, CLI, message queue…), chuyển thành tham số mà **Inbound Port** (use case) mong đợi, gọi use case, rồi chuyển kết quả/lỗi trở lại cho client.

**Trong code:** `src/infrastructure/adapters/driving/`:
- `BookController.ts` — nhận `Request`/`Response` (Express), lấy `userId`, `bookId` từ `req.body`/`req.params`, gọi `borrowBookUseCase.execute(userId, bookId)`, trả JSON qua `res`.
- `UserController.ts` — tương tự cho User (thêm user, v.v.).

Đây là **inbound adapter**: nhận HTTP → gọi driving port (use case interface) → trả response.

### 5. Outbound Adapter / Repository implementation (adapter ra ngoài – lưu/đọc data)

**Khái niệm:** Implement **Outbound Port** (IBookRepository, IUserRepository). Nhận domain entity từ core, “dịch” sang công nghệ bên ngoài (MongoDB, PostgreSQL, in-memory…) và ngược lại (doc/row → entity).

**Trong code:** `src/infrastructure/adapters/driven/`:
- `MongoBookRepository.ts` — implement `IBookRepository`: `save(book)` ghi Mongoose, `findById(id)` đọc DB rồi map document → `Book`.
- `MongoUserRepository.ts` — tương tự cho User.
- `InMemoryBookRepository.ts`, `InMemoryUserRepository.ts` — cùng port, implement bằng Map trong RAM.

Đây vừa là **outbound port implementation**, vừa là **repository** (outbound adapter chuyên lưu/đọc).

### 6. Application service / Use case (ứng dụng – điều phối)

**Khái niệm:** Nhận lệnh qua Inbound Port, gọi entity để xử lý logic, gọi Outbound Port để lưu/đọc. Không chứa chi tiết HTTP hay DB, chỉ điều phối.

**Trong code:** `src/application/use-cases/`:
- `BorrowBook.ts` — implement `IBorrowBookUseCase`: lấy user/book qua `userRepo.findById`, `bookRepo.findById`; gọi `book.borrow()`, `user.addBorrowedBook(bookId)`; lưu qua `bookRepo.save(book)`, `userRepo.save(user)`.
- `AddBook.ts`, `AddUser.ts`, `ReturnBook.ts` — cùng mẫu: port (driven) → entity → port (driven).

### 7. Transport / Composition root (lớp gắn kết)

**Khái niệm:** Nơi gắn HTTP (routes) với Inbound Adapter và khởi tạo toàn bộ (repositories, use cases, controllers). Dependency Injection thường nằm đây.

**Trong code:** `src/index.ts`:
- Tạo repository (Mongo hoặc InMemory) theo `MONGO_URI`.
- Tạo use case (BorrowBook, ReturnBook, AddBook, AddUser) inject repo.
- Tạo `BookController`, `UserController` inject use case + repo (cho getById).
- `app.post("/books/borrow", ...)`, `app.get("/books/:id", ...)` — Express là **transport**; mỗi route gọi method tương ứng trên controller (inbound adapter).

### Tóm tắt ánh xạ

| Thành phần Hexagonal | Trong dự án (code) |
|----------------------|--------------------|
| Entity | `src/domain/entities/Book.ts`, `User.ts` |
| Inbound Port (driving) | `src/domain/ports/driving/I*UseCase.ts` |
| Outbound Port (driven) | `src/domain/ports/driven/IBookRepository.ts`, `IUserRepository.ts` |
| Inbound Adapter | `src/infrastructure/adapters/driving/BookController.ts`, `UserController.ts` |
| Outbound Adapter / Repository | `MongoBookRepository`, `MongoUserRepository`, `InMemoryBookRepository`, `InMemoryUserRepository` |
| Use case | `src/application/use-cases/BorrowBook.ts`, `AddBook.ts`, … |
| Transport / Composition | `src/index.ts` (Express routes + DI) |

## Cấu trúc và quy trình của Hexagonal Architecture

Hexagonal Architecture: là kiến trúc để tách biệt business logic với bên ngoài, để code nghiệp vụ không bị trộn lẫn với code truy vấn.

### Các khái niệm (tóm tắt)

1. **Entities** — Trái tim của HA; đại diện Business Logic và quy tắc; không phụ thuộc data bên ngoài.
2. **Port** — Contract giao tiếp: Inbound (core cho bên ngoài gọi vào), Outbound (core cần bên ngoài cung cấp).
3. **Adapter** — Implement Port: Inbound Adapter nhận dữ liệu thô (HTTP…) chuyển thành lệnh cho core; Outbound Adapter dịch entity ↔ DB/API.
4. **Use case** — Nhận lệnh qua Inbound Port, gọi entity + Outbound Port; chỉ điều phối.
5. **Repository** — Dạng Outbound Adapter, chuyên lưu/đọc; core chỉ thấy Port (save, findById).
6. **Transport** — Lớp nhận kết nối bên ngoài (HTTP, CLI) và chuyển đến Inbound Adapter; thường kèm DI.
7. **External System** — Hệ thống bên ngoài (DB, API) kết nối qua Outbound Adapter.

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
