# 🔨 Build Guide - BattleShip TCP Server

Hướng dẫn compile và chạy C server trên các nền tảng khác nhau.

## 📋 Mục lục

- [Windows](#windows)
- [Linux](#linux)
- [macOS](#macos)
- [Docker](#docker)
- [Cross-compilation](#cross-compilation)

---

## 🪟 Windows

### Bước 1: Cài đặt Compiler

#### Option A: MSYS2 (Recommended)

1. **Download MSYS2**: https://www.msys2.org/
2. **Cài đặt** và mở MSYS2 terminal
3. **Update packages**:
   ```bash
   pacman -Syu
   ```
4. **Cài GCC và Make**:
   ```bash
   pacman -S mingw-w64-x86_64-gcc
   pacman -S make
   ```
5. **Thêm vào PATH**:
   - Thêm `C:\msys64\mingw64\bin` vào System PATH

#### Option B: MinGW-w64

1. Download từ: https://sourceforge.net/projects/mingw-w64/
2. Chạy installer
3. Thêm bin folder vào PATH

#### Option C: Visual Studio

1. Cài Visual Studio với C++ workload
2. Dùng Developer Command Prompt

### Bước 2: Build

```bash
cd E:\Code\LTM\BTL\server

# Dùng Makefile
make

# Hoặc compile thủ công
gcc -Wall -Wextra -O2 -std=c99 -o server.exe server.c -lws2_32
```

### Bước 3: Chạy

```bash
.\server.exe

# Hoặc
make run
```

### Kiểm tra

```bash
# Kiểm tra GCC
gcc --version

# Kiểm tra Make
make --version

# Test server
curl http://localhost:8888
# hoặc telnet localhost 8888
```

---

## 🐧 Linux

### Bước 1: Cài đặt Build Tools

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install build-essential
```

#### CentOS/RHEL/Fedora

```bash
# CentOS/RHEL
sudo yum groupinstall "Development Tools"

# Fedora
sudo dnf groupinstall "Development Tools"
```

#### Arch Linux

```bash
sudo pacman -S base-devel
```

### Bước 2: Build

```bash
cd /path/to/BTL/server

# Dùng Makefile
make

# Hoặc compile thủ công
gcc -Wall -Wextra -O2 -std=c99 -o server server.c
```

### Bước 3: Chạy

```bash
./server

# Hoặc
make run
```

### Bước 4: Install System-wide (Optional)

```bash
# Install
sudo make install

# Chạy từ bất kỳ đâu
battleship-server

# Uninstall
sudo make uninstall
```

### Chạy như Service (systemd)

Tạo file `/etc/systemd/system/battleship.service`:

```ini
[Unit]
Description=BattleShip TCP Server
After=network.target

[Service]
Type=simple
User=battleship
WorkingDirectory=/opt/battleship
ExecStart=/usr/local/bin/battleship-server
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Enable và start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable battleship
sudo systemctl start battleship
sudo systemctl status battleship
```

---

## 🍎 macOS

### Bước 1: Cài đặt Xcode Command Line Tools

```bash
xcode-select --install
```

### Bước 2: Build

```bash
cd /path/to/BTL/server

# Dùng Makefile
make

# Hoặc compile thủ công
gcc -Wall -Wextra -O2 -std=c99 -o server server.c
```

### Bước 3: Chạy

```bash
./server
```

---

## 🐳 Docker

### Dockerfile

Tạo `Dockerfile` trong thư mục server:

```dockerfile
FROM gcc:latest

WORKDIR /app

COPY server.c .

RUN gcc -Wall -Wextra -O2 -std=c99 -o server server.c

EXPOSE 8888

CMD ["./server"]
```

### Build và Run

```bash
# Build image
docker build -t battleship-server .

# Run container
docker run -d -p 8888:8888 --name battleship battleship-server

# View logs
docker logs -f battleship

# Stop
docker stop battleship

# Remove
docker rm battleship
```

### Docker Compose

Tạo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  battleship-server:
    build: ./server
    ports:
      - "8888:8888"
    restart: unless-stopped
    container_name: battleship-server
```

Chạy:

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## 🔄 Cross-compilation

### Compile cho Windows trên Linux

```bash
# Cài mingw-w64
sudo apt install mingw-w64

# Compile
x86_64-w64-mingw32-gcc -Wall -Wextra -O2 -std=c99 -o server.exe server.c -lws2_32
```

### Compile cho Linux trên Windows (WSL)

```bash
# Trong WSL Ubuntu
gcc -Wall -Wextra -O2 -std=c99 -o server server.c
```

---

## 🔍 Troubleshooting

### ❌ "gcc: command not found"

**Windows:**
- Kiểm tra GCC đã cài: `gcc --version`
- Thêm GCC vào PATH
- Restart terminal

**Linux:**
```bash
sudo apt install build-essential
```

### ❌ "winsock2.h: No such file or directory" (trên Linux)

**Nguyên nhân**: Code đang dùng Windows headers

**Giải pháp**: Code hiện tại đã cross-platform, compile lại:
```bash
make clean
make
```

### ❌ "undefined reference to WSAStartup"

**Nguyên nhân**: Thiếu library `-lws2_32`

**Giải pháp**:
```bash
gcc -o server.exe server.c -lws2_32
```

### ❌ "Address already in use" (Linux)

**Nguyên nhân**: Port 8888 đang được dùng

**Giải pháp**:
```bash
# Tìm process
sudo lsof -i :8888

# Kill process
sudo kill -9 <PID>

# Hoặc đổi PORT trong server.c
```

### ❌ "Permission denied" (Linux)

**Nguyên nhân**: Không có quyền bind port < 1024

**Giải pháp**:
```bash
# Chạy với sudo (không khuyến khích)
sudo ./server

# Hoặc dùng port > 1024 (recommended)
# Edit PORT trong server.c thành 8888
```

---

## ⚙️ Build Options

### Debug Build

```bash
# Thêm debug symbols
gcc -g -Wall -Wextra -o server server.c

# Dùng với GDB
gdb ./server
```

### Optimized Build

```bash
# Maximum optimization
gcc -O3 -Wall -Wextra -o server server.c

# Size optimization
gcc -Os -Wall -Wextra -o server server.c
```

### Static Build (portable)

```bash
# Linux
gcc -static -o server server.c

# Windows
gcc -static -o server.exe server.c -lws2_32
```

---

## 📊 Performance Testing

### Benchmark

```bash
# Test với ab (Apache Bench)
ab -n 1000 -c 10 http://localhost:8888/

# Test với wrk
wrk -t4 -c100 -d30s http://localhost:8888/
```

### Memory Check (Linux)

```bash
# Valgrind
valgrind --leak-check=full ./server

# Massif (heap profiler)
valgrind --tool=massif ./server
```

---

## 🚀 Production Deployment

### Best Practices

1. **Compile với optimizations**: `-O2` hoặc `-O3`
2. **Strip symbols**: `strip server` (giảm kích thước)
3. **Run as non-root user**
4. **Use systemd/supervisor** để auto-restart
5. **Setup logging**: Log ra file thay vì stdout
6. **Firewall rules**: Mở port 8888
7. **Rate limiting**: Giới hạn connections
8. **SSL/TLS**: Dùng reverse proxy (nginx)

### Example Production Build Script

```bash
#!/bin/bash

# Build with optimizations
gcc -O3 -Wall -Wextra -std=c99 -o server server.c

# Strip symbols
strip server

# Set permissions
chmod 755 server

# Create user
sudo useradd -r -s /bin/false battleship

# Copy to /opt
sudo mkdir -p /opt/battleship
sudo cp server /opt/battleship/
sudo chown -R battleship:battleship /opt/battleship

echo "Build complete! Install with: sudo make install"
```

---

## 📝 Notes

- Server mặc định chạy trên port **8888**
- Code đã cross-platform, tự động detect Windows/Linux
- Trên production nên chạy phía sau nginx/reverse proxy
- Nhớ config firewall để mở port

---

**Happy Building! 🎉**

