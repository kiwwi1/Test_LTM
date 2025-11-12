# BattleShip TCP Server (C)

TCP Server được viết bằng C để xử lý game state với hiệu năng cao.

**Cross-platform**: Hỗ trợ cả Windows và Linux!

## Yêu cầu

### Windows
- GCC compiler (MinGW hoặc MSYS2)
- Winsock2 library (có sẵn trong Windows)

### Linux
- GCC compiler
- Build essentials

## Cài đặt GCC

### Trên Windows

**Option 1: MSYS2 (Recommended)**
```bash
# Tải từ: https://www.msys2.org/
# Sau khi cài, mở MSYS2 terminal:
pacman -S mingw-w64-x86_64-gcc
pacman -S make
```

**Option 2: MinGW-w64**
- Tải từ: https://www.mingw-w64.org/downloads/

### Trên Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install build-essential

# CentOS/RHEL
sudo yum groupinstall "Development Tools"

# Arch Linux
sudo pacman -S base-devel
```

## Biên dịch

### Dùng Makefile (Recommended - Auto-detect platform)

```bash
# Build
make

# Clean
make clean

# Build và chạy
make build-run
```

### Compile thủ công

**Windows:**
```bash
gcc -Wall -Wextra -O2 -std=c99 -o server.exe server.c -lws2_32
```

**Linux:**
```bash
gcc -Wall -Wextra -O2 -std=c99 -o server server.c
```

## Chạy Server

**Windows:**
```bash
.\server.exe

# Hoặc
make run
```

**Linux:**
```bash
./server

# Hoặc
make run
```

## Cài đặt System-wide (Linux only)

```bash
# Install
make install

# Chạy từ bất kỳ đâu
battleship-server

# Uninstall
make uninstall
```

## Giao thức

Server lắng nghe trên cổng **8888** và giao tiếp qua JSON messages:

### Tin nhắn từ Client

```json
{
  "cmd": "COMMAND_NAME",
  "payload": {
    // data
  }
}
```

### Các lệnh hỗ trợ

- `HEARTBEAT` - Keep-alive ping
- `PLACE_SHIP` - Đặt tàu
- `MOVE` - Tấn công
- `REGISTER` - Đăng ký (forwarded to NodeJS)
- `LOGIN` - Đăng nhập (forwarded to NodeJS)

### Phản hồi từ Server

```json
{
  "cmd": "RESPONSE_TYPE",
  "payload": {
    "result": "HIT" | "MISS",
    "coord": "x,y",
    "ship_sunk": "ship_name" | null
  }
}
```

## Kiến trúc

```
┌─────────────┐
│  C Server   │
│  (Port 8888)│
└──────┬──────┘
       │
       │ TCP/IP
       │
┌──────┴──────┐
│  NodeJS     │
│  Backend    │
└─────────────┘
```

Hiện tại, server C đóng vai trò **demonstration**. 
Logic game chính được xử lý bởi NodeJS backend để dễ tích hợp với React frontend.

## Notes

- Server hiện tại là single-threaded (demo purpose)
- Để production, nên sử dụng multi-threading hoặc async I/O
- JSON parsing đơn giản - nên dùng thư viện như `cJSON` trong production

