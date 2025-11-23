
#!/bin/bash

# -----------------------------
# Config
# -----------------------------
BASE_URL="http://localhost:8080/api"
COOKIE_FILE="cookies.txt"

# -----------------------------
# ADD USER DATABASE
# -----------------------------
echo "AUTH - Register Many Users"
value=0
while [ $value -le 50 ]
do
        
        curl -s -X POST "$BASE_URL/auth/register" -H "Content-Type: application/json" -d '{"name":"TestUser'$value'","email":"user'$value'@test.com","password":"123456"}'
        echo "Added testuser: $value"
        value=$((value + 1))
        
done

