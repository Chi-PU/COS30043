#!/bin/bash

# -----------------------------
# Config
# -----------------------------
BASE_URL="http://localhost:8080/api"
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
print_title "AUTH - Register"
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Chi","email":"chi@test.com","password":"123456"}'
echo

print_title "AUTH - Login"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"chi@test.com","password":"123456"}' \
  -c $COOKIE_FILE
echo

print_title "AUTH - Get Me"
curl -s "$BASE_URL/auth/me" -b $COOKIE_FILE
echo

print_title "AUTH - Logout"
curl -s -X POST "$BASE_URL/auth/logout" -b $COOKIE_FILE
echo

# -----------------------------
# PRODUCTS API
# -----------------------------
print_title "PRODUCTS - Get All"
curl -s "$BASE_URL/products"
echo

print_title "PRODUCTS - Get By ID (3)"
curl -s "$BASE_URL/products/3"
echo

print_title "PRODUCTS - Create"
curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":1500,"stock":5}' \
  -b $COOKIE_FILE
echo

print_title "PRODUCTS - Update (1)"
curl -s -X PUT "$BASE_URL/products/1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Laptop","price":1200}' \
  -b $COOKIE_FILE
echo

print_title "PRODUCTS - Delete (1)"
curl -s -X DELETE "$BASE_URL/products/1" -b $COOKIE_FILE
echo

# -----------------------------
# CART API
# -----------------------------
print_title "CART - Get Cart"
curl -s "$BASE_URL/cart" -b $COOKIE_FILE
echo

print_title "CART - Add To Cart"
curl -s -X POST "$BASE_URL/cart" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}' \
  -b $COOKIE_FILE
echo

print_title "CART - Remove From Cart (1)"
curl -s -X DELETE "$BASE_URL/cart/1" -b $COOKIE_FILE
echo

# -----------------------------
# ORDERS API
# -----------------------------
print_title "ORDERS - Create Order"
curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":1,"quantity":1}],"total":1500}' \
  -b $COOKIE_FILE
echo

print_title "ORDERS - Get Orders"
curl -s "$BASE_URL/orders" -b $COOKIE_FILE
echo

# -----------------------------
# NEWS API
# -----------------------------
print_title "NEWS - Get All"
curl -s "$BASE_URL/news"
echo

print_title "NEWS - Get News By ID (1)"
curl -s "$BASE_URL/news/1"
echo

echo
echo "All API tests completed!"
