# NOTES

## PRODUCTION HOTFIX — ESM MODULE RESOLUTION & DIRECTORY IMPORT

- **ROOT CAUSE**: 
  1. Trong root project từng tồn tại thư mục `server/` gây collision với `server.ts` (`ERR_UNSUPPORTED_DIR_IMPORT`).
  2. Khi chạy trong môi trường Node.js ESM thuần túy (`"type": "module"`), Node.js không tự động thử thêm đuôi file `.ts` / `.js` cho bare relative path `../server`. Khi `@vercel/node` biên dịch `api/index.ts`, lệnh `import app from "../server"` tìm kiếm `/var/task/server` (không có extension) dẫn đến `ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/server' imported from /var/task/api/index.js`.

- **FILE ĐÃ SỬA**:
  1. `api/index.ts`: Đổi `import app from "../server"` thành `import app from "../server.ts"` (tuân thủ `"allowImportingTsExtensions": true`).
  2. `server.ts`: Đổi `from "./src/services/metadataStorage"` thành `from "./src/services/metadataStorage.ts"`.
  3. Di chuyển vĩnh viễn `metadataStorage.ts` vào `src/services/` và xóa triệt để thư mục `server/`.

- **IMPORT CŨ**:
  - `api/index.ts`: `import app from "../server"`
  - `server.ts`: `from "./server/metadataStorage"`

- **IMPORT MỚI**:
  - `api/index.ts`: `import app from "../server.ts"`
  - `server.ts`: `from "./src/services/metadataStorage.ts"`

- **VÌ SAO VERCEL PRODUCTION BỊ 500**:
  - Node.js ESM cấm extensionless imports trên các file cục bộ (`ERR_MODULE_NOT_FOUND`). Bằng cách chỉ định rõ extension `.ts`, TypeScript compiler và Vercel bundler giải quyết chính xác vị trí file trên disk.

- **CÁCH VERIFY**:
  1. Export mã nguồn mới nhất lên GitHub repository kết nối với Vercel.
  2. Kiểm tra Vercel Build & Deployment logs.
  3. Gọi thử nghiệm các endpoint:
     - `GET /api/games/admin-library`
     - `GET /api/snes-games`
     - `GET /api/sheet-games`
     - `POST /api/admin/blob/upload`
  4. Các API phản hồi HTTP 200 OK với định dạng JSON hợp lệ, không còn lỗi `FUNCTION_INVOCATION_FAILED`, `ERR_UNSUPPORTED_DIR_IMPORT` hay `ERR_MODULE_NOT_FOUND`.
