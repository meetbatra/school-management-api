#!/bin/bash

BASE_URL="http://localhost:3000"

run_test() {
  local num=$1
  local desc=$2
  local method=$3
  local endpoint=$4
  local data=$5
  
  echo "--- Test $num: $desc ---"
  
  if [ "$method" == "GET" ]; then
    res=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL$endpoint")
  else
    res=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
  fi
  
  status=$(echo "$res" | grep "HTTP_STATUS" | cut -d':' -f2)
  body=$(echo "$res" | grep -v "HTTP_STATUS")
  
  echo "HTTP Status: $status"
  echo "Response Body: $body"
  echo ""
}

run_test 1 "GET /" "GET" "/" ""
run_test 2 "POST /addSchool with valid data" "POST" "/addSchool" '{"name": "Delhi Public School", "address": "Mathura Road, New Delhi", "latitude": 28.5494, "longitude": 77.2001}'
run_test 3 "POST /addSchool with another valid school" "POST" "/addSchool" '{"name": "Ryan International School", "address": "Sector 40, Gurgaon", "latitude": 28.4089, "longitude": 77.0423}'
run_test 4 "POST /addSchool with another valid school" "POST" "/addSchool" '{"name": "St. Xavier'\''s School", "address": "Park Street, Kolkata", "latitude": 22.5514, "longitude": 88.3519}'
run_test 5 "POST /addSchool with missing name" "POST" "/addSchool" '{"address": "Some Address", "latitude": 28.5, "longitude": 77.2}'
run_test 6 "POST /addSchool with empty name after trim" "POST" "/addSchool" '{"name": "   ", "address": "Some Address", "latitude": 28.5, "longitude": 77.2}'
run_test 7 "POST /addSchool with invalid latitude (out of range)" "POST" "/addSchool" '{"name": "Test School", "address": "Test Address", "latitude": 200, "longitude": 77.2}'
run_test 8 "POST /addSchool with invalid longitude (out of range)" "POST" "/addSchool" '{"name": "Test School", "address": "Test Address", "latitude": 28.5, "longitude": 300}'
run_test 9 "POST /addSchool with latitude as non-numeric string" "POST" "/addSchool" '{"name": "Test School", "address": "Test Address", "latitude": "abc", "longitude": 77.2}'
run_test 10 "POST /addSchool with completely empty body" "POST" "/addSchool" '{}'
run_test 11 "POST /addSchool with missing address" "POST" "/addSchool" '{"name": "Test School", "latitude": 28.5, "longitude": 77.2}'

run_test 12 "GET /listSchools?latitude=28.6139&longitude=77.2090" "GET" "/listSchools?latitude=28.6139&longitude=77.2090" ""
run_test 13 "GET /listSchools?latitude=22.5726&longitude=88.3639" "GET" "/listSchools?latitude=22.5726&longitude=88.3639" ""

run_test 14 "GET /listSchools with missing latitude" "GET" "/listSchools?longitude=77.2090" ""
run_test 15 "GET /listSchools with missing both params" "GET" "/listSchools" ""
run_test 16 "GET /listSchools with invalid latitude" "GET" "/listSchools?latitude=abc&longitude=77.2090" ""
run_test 17 "GET /listSchools with out of range latitude" "GET" "/listSchools?latitude=999&longitude=77.2090" ""

run_test 18 "GET /unknownroute" "GET" "/unknownroute" ""
run_test 19 "POST /unknownroute" "POST" "/unknownroute" ""
