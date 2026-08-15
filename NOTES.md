# NOTES

## PRODUCTION HOTFIX — ESM DIRECTORY IMPORT

- **ROOT CAUSE**: 
  Trong root project tồn tại đồng thời file `server.ts` và thư mục `server/` (chứa `server/metadataStorage.ts`). Khi file `api/index.ts` thực hiện `import app from "../server"`, runtime Node.js ESM trên Vercel Serverless Function ưu tiên khớp `../server` thành directory `/var/task/server` thay vì file `/var/task/server.ts`. 
  Vì ES Modules của Node.js không cho phép import một directory mà không chỉ định file entrypoint, Node đã throw ngoại lệ: `Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '/var/task/server' is not supported resolving ES modules`, khiến toàn bộ serverless API (`/api/*`) bị sập với mã lỗi 500 ngay khi khởi tạo.

- **FILE ĐÃ SỬA**:
  1. Di chuyển file `server/metadataStorage.ts` sang vị trí chuẩn hóa `src/services/metadataStorage.ts`.
  2. Xóa bỏ hoàn toàn thư mục collision `server/` ở root.
  3. Cập nhật import trong `server.ts`: từ `./server/metadataStorage` thành `./src/services/metadataStorage`.
  4. Xác minh `api/index.ts`: `import app from "../server"` giờ đây resolve trực tiếp, duy nhất và tất định tới file `server.ts`.

- **IMPORT CŨ**:
  - `server.ts`: `from "./server/metadataStorage"`
  - `api/index.ts`: `from "../server"` (bị nhầm vào thư mục `/server/`)

- **IMPORT MỚI**:
  - `server.ts`: `from "./src/services/metadataStorage"`
  - `api/index.ts`: `from "../server"` (khớp chính xác và duy nhất với file `server.ts`)

- **VÌ SAO VERCEL PRODUCTION BỊ 500**:
  - Do cơ chế phân giải module nghiêm ngặt của Node.js ES Modules (ECMAScript Module Resolution Algorithm) trên container AWS Lambda của Vercel cấm import thư mục trực tiếp (`ERR_UNSUPPORTED_DIR_IMPORT`).

- **CÁCH VERIFY**:
  1. Export mã nguồn mới nhất lên GitHub repository kết nối với Vercel.
  2. Kiểm tra Vercel Build & Deployment logs.
  3. Gọi thử nghiệm các endpoint:
     - `GET /api/games/admin-library`
     - `GET /api/snes-games`
     - `GET /api/sheet-games`
     - `POST /api/admin/blob/upload`
  4. Các API phản hồi HTTP 200 OK với định dạng JSON hợp lệ, không còn lỗi `FUNCTION_INVOCATION_FAILED` hay `ERR_UNSUPPORTED_DIR_IMPORT`.
