#!/bin/bash

# -----------------------------
# Config
# -----------------------------
BASE_URL="http://localhost:8080/api"
RECC_URL="http://localhost:5001/api"
COOKIE_FILE="cookies.txt"

# -----------------------------
# Helper Functions
# -----------------------------
print_title() {
  echo
  echo "=============================="
  echo "$1"
  echo "=============================="
}

# -----------------------------
# AUTH API
# -----------------------------
print_title "AUTH - Login"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user0@test.com","password":"123456"}' \
  -c $COOKIE_FILE
echo

# -----------------------------
# RECC HEALTH CHECK
# -----------------------------
print_title "RECOMMENDATIONS - Health Check"
curl -s "$RECC_URL/health"
echo

# -----------------------------
# RECOMMENDATIONS API (via Express)
# -----------------------------
print_title "RECOMMENDATIONS - Get Recommendations for Logged-in User"
curl -s "$BASE_URL/recommendations/for-you?limit=10" -b $COOKIE_FILE
echo

print_title "RECOMMENDATIONS - Get Similar Users"
curl -s "$BASE_URL/recommendations/similar-users?limit=5" -b $COOKIE_FILE
echo

print_title "RECOMMENDATIONS - Check Service Health via Express"
curl -s "$BASE_URL/recommendations/health"
echo

# -----------------------------
# DIRECT PYTHON SERVICE CALLS (bypass Express)
# -----------------------------
print_title "RECOMMENDATIONS - Direct Call to Python Service for User 1"
curl -s "$RECC_URL/recommendations/1?limit=10"
echo

print_title "RECOMMENDATIONS - Direct Call for Similar Users (User 1)"
curl -s "$RECC_URL/similar-users/1?limit=5"
echo