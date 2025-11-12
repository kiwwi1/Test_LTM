#!/bin/bash

# Test script for BattleShip TCP Server
# Usage: ./test_server.sh

HOST="localhost"
PORT="8888"

echo "=================================="
echo "BattleShip Server Test Script"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo -n "Test 1: Checking if server is running on port $PORT... "
if nc -z $HOST $PORT 2>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Server is not running. Start it with: ./server"
    exit 1
fi

# Test 2: Send HEARTBEAT
echo -n "Test 2: Sending HEARTBEAT command... "
response=$(echo '{"cmd":"HEARTBEAT"}' | nc -w 1 $HOST $PORT)
if [[ $response == *"HEARTBEAT_ACK"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $response"
fi

# Test 3: Send REGISTER
echo -n "Test 3: Sending REGISTER command... "
response=$(echo '{"cmd":"REGISTER","payload":{"username":"test","password":"test123"}}' | nc -w 1 $HOST $PORT)
if [[ $response == *"REGISTER_RESPONSE"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $response"
fi

# Test 4: Send LOGIN
echo -n "Test 4: Sending LOGIN command... "
response=$(echo '{"cmd":"LOGIN","payload":{"username":"admin","password":"admin123"}}' | nc -w 1 $HOST $PORT)
if [[ $response == *"LOGIN_RESPONSE"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $response"
fi

# Test 5: Send MOVE
echo -n "Test 5: Sending MOVE command... "
response=$(echo '{"cmd":"MOVE","payload":{"coord":"A5"}}' | nc -w 1 $HOST $PORT)
if [[ $response == *"MOVE_RESULT"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $response"
fi

# Test 6: Send unknown command
echo -n "Test 6: Sending unknown command... "
response=$(echo '{"cmd":"UNKNOWN"}' | nc -w 1 $HOST $PORT)
if [[ $response == *"Unknown command"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $response"
fi

echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
echo -e "${GREEN}All tests completed!${NC}"
echo ""

