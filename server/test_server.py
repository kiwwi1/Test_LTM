#!/usr/bin/env python3
"""
Test script for BattleShip TCP Server
Cross-platform: Works on Windows and Linux
Usage: python test_server.py
"""

import socket
import json
import time
import sys

HOST = 'localhost'
PORT = 8888
TIMEOUT = 2

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    RESET = '\033[0m'
    
    @staticmethod
    def green(text):
        return f"{Colors.GREEN}{text}{Colors.RESET}"
    
    @staticmethod
    def red(text):
        return f"{Colors.RED}{text}{Colors.RESET}"
    
    @staticmethod
    def yellow(text):
        return f"{Colors.YELLOW}{text}{Colors.RESET}"

def send_command(cmd_dict):
    """Send a command to the server and return response"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(TIMEOUT)
        sock.connect((HOST, PORT))
        
        # Send command
        message = json.dumps(cmd_dict)
        sock.sendall(message.encode())
        
        # Receive response
        response = sock.recv(4096).decode()
        sock.close()
        
        return response
    except socket.timeout:
        return "TIMEOUT"
    except ConnectionRefusedError:
        return "CONNECTION_REFUSED"
    except Exception as e:
        return f"ERROR: {str(e)}"

def test_server_running():
    """Test 1: Check if server is running"""
    print("Test 1: Checking if server is running... ", end='')
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((HOST, PORT))
        sock.close()
        
        if result == 0:
            print(Colors.green("✓ PASS"))
            return True
        else:
            print(Colors.red("✗ FAIL"))
            print("Server is not running. Start it with: ./server")
            return False
    except Exception as e:
        print(Colors.red(f"✗ FAIL: {e}"))
        return False

def test_heartbeat():
    """Test 2: Send HEARTBEAT command"""
    print("Test 2: Sending HEARTBEAT command... ", end='')
    response = send_command({"cmd": "HEARTBEAT"})
    
    if "HEARTBEAT_ACK" in response:
        print(Colors.green("✓ PASS"))
        return True
    else:
        print(Colors.red("✗ FAIL"))
        print(f"Response: {response}")
        return False

def test_register():
    """Test 3: Send REGISTER command"""
    print("Test 3: Sending REGISTER command... ", end='')
    response = send_command({
        "cmd": "REGISTER",
        "payload": {
            "username": "test",
            "password": "test123"
        }
    })
    
    if "REGISTER_RESPONSE" in response:
        print(Colors.green("✓ PASS"))
        return True
    else:
        print(Colors.red("✗ FAIL"))
        print(f"Response: {response}")
        return False

def test_login():
    """Test 4: Send LOGIN command"""
    print("Test 4: Sending LOGIN command... ", end='')
    response = send_command({
        "cmd": "LOGIN",
        "payload": {
            "username": "admin",
            "password": "admin123"
        }
    })
    
    if "LOGIN_RESPONSE" in response:
        print(Colors.green("✓ PASS"))
        return True
    else:
        print(Colors.red("✗ FAIL"))
        print(f"Response: {response}")
        return False

def test_move():
    """Test 5: Send MOVE command"""
    print("Test 5: Sending MOVE command... ", end='')
    response = send_command({
        "cmd": "MOVE",
        "payload": {
            "coord": "A5"
        }
    })
    
    if "MOVE_RESULT" in response:
        print(Colors.green("✓ PASS"))
        return True
    else:
        print(Colors.red("✗ FAIL"))
        print(f"Response: {response}")
        return False

def test_unknown_command():
    """Test 6: Send unknown command"""
    print("Test 6: Sending unknown command... ", end='')
    response = send_command({"cmd": "UNKNOWN"})
    
    if "Unknown command" in response:
        print(Colors.green("✓ PASS"))
        return True
    else:
        print(Colors.red("✗ FAIL"))
        print(f"Response: {response}")
        return False

def test_welcome_message():
    """Test 7: Check welcome message"""
    print("Test 7: Checking welcome message... ", end='')
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(TIMEOUT)
        sock.connect((HOST, PORT))
        
        # Receive welcome message
        welcome = sock.recv(4096).decode()
        sock.close()
        
        if "Connected to BattleShip TCP Server" in welcome:
            print(Colors.green("✓ PASS"))
            return True
        else:
            print(Colors.red("✗ FAIL"))
            print(f"Welcome: {welcome}")
            return False
    except Exception as e:
        print(Colors.red(f"✗ FAIL: {e}"))
        return False

def main():
    print("=" * 50)
    print("BattleShip Server Test Script (Python)")
    print("=" * 50)
    print()
    
    tests = [
        test_server_running,
        test_heartbeat,
        test_register,
        test_login,
        test_move,
        test_unknown_command,
        test_welcome_message
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        if test():
            passed += 1
        else:
            failed += 1
        time.sleep(0.1)  # Small delay between tests
    
    print()
    print("=" * 50)
    print("Test Summary")
    print("=" * 50)
    print(f"Total: {len(tests)} tests")
    print(Colors.green(f"Passed: {passed}"))
    if failed > 0:
        print(Colors.red(f"Failed: {failed}"))
    print()
    
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()

