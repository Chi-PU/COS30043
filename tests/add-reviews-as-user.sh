#!/bin/bash

# This script is used to register a user, log them in (to get the cookie),
# and then submit 50 randomized ratings to products 1 through 50.

# -----------------------------
# Config
# -----------------------------
BASE_URL="http://localhost:8080/api"
COOKIE_FILE="cookies.txt"
USER_EMAIL="chi@test.com"
USER_PASSWORD="123456"
USER_NAME="Chi"
NUM_RATINGS=20 # Number of random ratings to post

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
# Cleanup
# -----------------------------
rm -f $COOKIE_FILE
print_title "Cleanup: Removed old cookie file ($COOKIE_FILE)"

# -----------------------------
# AUTH API
# -----------------------------


print_title "AUTH - Login (Saving Cookie to $COOKIE_FILE)"
curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"'$USER_EMAIL'","password":"'$USER_PASSWORD'"}' \
    -c $COOKIE_FILE
echo

# Check if the cookie file was created
if [ ! -f "$COOKIE_FILE" ]; then
    echo "Error: Login failed or did not save cookie. Cannot proceed."
    exit 1
fi

# -----------------------------
# RATE API - Randomized Stress Test
# -----------------------------
print_title "RATE - Posting $NUM_RATINGS Random Ratings (Product ID 1-100)"

for i in $(seq 1 $NUM_RATINGS); do
    # Generate random product ID (between 1 and 100)
    PRODUCT_ID=$((RANDOM % 100 + 1))
    
    # Generate random rating (between 1 and 5)
    RATING=$((RANDOM % 5 + 1))

    echo "[$i/$NUM_RATINGS] Product $PRODUCT_ID, Rating: $RATING"

    # Send the rating request using the saved cookie
    # Endpoint: /api/products/:id/rate
    curl -s -X POST "$BASE_URL/products/$PRODUCT_ID/rate" \
      -H "Content-Type: application/json" \
      -d '{"rating":'$RATING'}' \
      -b $COOKIE_FILE
    echo
done

print_title "Finished posting $NUM_RATINGS randomized ratings."