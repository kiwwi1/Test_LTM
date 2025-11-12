# Makefile for BattleShip TCP Server (Cross-platform: Linux & Windows)

CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c99
SRC = server.c

# Platform detection
ifeq ($(OS),Windows_NT)
    # Windows
    TARGET = server.exe
    LIBS = -lws2_32
    RM = del /Q
    RUN = .\$(TARGET)
else
    # Linux
    TARGET = server
    LIBS = 
    RM = rm -f
    RUN = ./$(TARGET)
endif

# Build target
all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC) $(LIBS)
	@echo Build complete: $(TARGET)

# Clean build files
clean:
ifeq ($(OS),Windows_NT)
	$(RM) $(TARGET) 2>nul || echo Nothing to clean
else
	$(RM) $(TARGET)
endif

# Run server
run: $(TARGET)
	$(RUN)

# Build and run
build-run: all run

# Install (Linux only)
install: $(TARGET)
ifeq ($(OS),Windows_NT)
	@echo Install not supported on Windows
else
	sudo cp $(TARGET) /usr/local/bin/battleship-server
	@echo Installed to /usr/local/bin/battleship-server
endif

# Uninstall (Linux only)
uninstall:
ifeq ($(OS),Windows_NT)
	@echo Uninstall not supported on Windows
else
	sudo rm -f /usr/local/bin/battleship-server
	@echo Uninstalled from /usr/local/bin
endif

.PHONY: all clean run build-run install uninstall

