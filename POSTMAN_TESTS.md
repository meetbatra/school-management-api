# Postman Test Cases and Expected Responses

This document defines Postman test scenarios and expected responses based on the current codebase behavior. These are specification expectations, not runtime test results.

## Base URL

- Local: `http://127.0.0.1:3000`
- Heroku: `https://school-management-api-c210a7affd6b.herokuapp.com`

## Standard Response Shapes

### Success

```json
{
  "success": true,
  "message": "..."
}
```

### Error

```json
{
  "success": false,
  "message": "...",
  "code": "..."
}
```

Note: `details` is present for validation errors. `debug` is present only when `NODE_ENV !== 'production'`.

## Test Cases

## 1. Health Check

### Request

- Method: `GET`
- URL: `/`

### Expected

- Status: `200`
- Body:

```json
{
  "success": true,
  "message": "School Management API is running"
}
```

## 2. Unknown Route

### Request

- Method: `GET`
- URL: `/unknown`

### Expected

- Status: `404`
- Body:

```json
{
  "success": false,
  "message": "Route not found: GET /unknown",
  "code": "ROUTE_NOT_FOUND"
}
```

## 3. Add School - Valid Payload

### Request

- Method: `POST`
- URL: `/addSchool`
- Body (JSON):

```json
{
  "name": "Delhi Public School",
  "address": "Mathura Road, New Delhi",
  "latitude": 28.5494,
  "longitude": 77.2001
}
```

### Expected

- Status: `201`
- Body:

```json
{
  "success": true,
  "message": "School added successfully",
  "schoolId": 1
}
```

Notes:
- `schoolId` is dynamic and increments with DB state.

## 4. Add School - Missing/Invalid Fields

### Request

- Method: `POST`
- URL: `/addSchool`
- Body (JSON):

```json
{
  "name": "",
  "address": "",
  "latitude": 200,
  "longitude": 190
}
```

### Expected

- Status: `400`
- Body:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "name", "message": "Name is required" },
    { "field": "address", "message": "Address is required" },
    { "field": "latitude", "message": "Latitude must be between -90 and 90" },
    { "field": "longitude", "message": "Longitude must be between -180 and 180" }
  ]
}
```

## 5. Add School - Invalid JSON Body

### Request

- Method: `POST`
- URL: `/addSchool`
- Body: malformed JSON (example: `{"name":"X"`)

### Expected

- Status: `400`
- Body:

```json
{
  "success": false,
  "message": "Invalid JSON body",
  "code": "INVALID_JSON"
}
```

## 6. List Schools - Valid Coordinates

### Request

- Method: `GET`
- URL: `/listSchools?latitude=12.9716&longitude=77.5946`

### Expected

- Status: `200`
- Body:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "School A",
      "address": "Address A",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "created_at": "2026-05-14T09:20:53.000Z",
      "distance_km": 0
    }
  ]
}
```

Notes:
- `count` and `data` content are dynamic.
- `data` is sorted ascending by `distance_km`.
- Each row contains computed `distance_km` (rounded to 2 decimals by code).

## 7. List Schools - No Data

### Request

- Method: `GET`
- URL: `/listSchools?latitude=12.9716&longitude=77.5946`
- Precondition: `schools` table has zero rows.

### Expected

- Status: `200`
- Body:

```json
{
  "success": true,
  "message": "No schools found",
  "data": []
}
```

## 8. List Schools - Missing Query Params

### Request

- Method: `GET`
- URL: `/listSchools`

### Expected

- Status: `400`
- Body:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "latitude", "message": "Invalid input: expected number, received NaN" },
    { "field": "longitude", "message": "Invalid input: expected number, received NaN" }
  ]
}
```

## 9. List Schools - Out-of-Range Coordinates

### Request

- Method: `GET`
- URL: `/listSchools?latitude=91&longitude=77`

### Expected

- Status: `400`
- Body:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "latitude", "message": "Latitude must be between -90 and 90" }
  ]
}
```

## 10. List Schools - Non-numeric Coordinates

### Request

- Method: `GET`
- URL: `/listSchools?latitude=abc&longitude=77`

### Expected

- Status: `400`
- Body:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "latitude", "message": "Invalid input: expected number, received NaN" }
  ]
}
```

## 11. Database Authentication Failure (Operational)

### Scenario

- DB credentials are invalid (`DB_USER`/`DB_PASSWORD` mismatch).

### Expected

- Status: `503`
- Body:

```json
{
  "success": false,
  "message": "Database authentication failed",
  "code": "DB_AUTH_ERROR"
}
```

## 12. Database Missing/Unavailable (Operational)

### Scenario

- Database does not exist or cannot be selected.

### Expected

- Status: `503`
- Body:

```json
{
  "success": false,
  "message": "Database is not available",
  "code": "DB_NOT_FOUND"
}
```

## 13. Database Network/Connection Failure (Operational)

### Scenario

- DB host unreachable or connection fails (`ENOTFOUND`, `ECONNREFUSED`, `ETIMEDOUT`, etc).

### Expected

- Status: `503`
- Body:

```json
{
  "success": false,
  "message": "Database connection failed",
  "code": "DB_CONNECTION_ERROR"
}
```

## 14. Unexpected Internal Error

### Scenario

- Any unhandled runtime/server exception not mapped above.

### Expected

- Status: `500`
- Body:

```json
{
  "success": false,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Postman Assertions (Suggested)

For each request, add tests such as:

```javascript
pm.test("Status code is expected", function () {
  pm.response.to.have.status(200);
});

pm.test("Has success boolean", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("success");
});
```

For error responses:

```javascript
pm.test("Error response has code", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(false);
  pm.expect(json).to.have.property("code");
});
```
