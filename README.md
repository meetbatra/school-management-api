# School Management API

A Node.js + Express API for managing schools and listing them by distance from a user location.

## Tech Stack

- Node.js (CommonJS)
- Express 5
- MySQL (`mysql2/promise`)
- Zod validation
- dotenv

## Live API

- Base URL: `https://school-management-api-c210a7affd6b.herokuapp.com`
- Health check: `GET /`

## Features

- Add a school with validation
- List schools sorted by proximity to user coordinates (Haversine formula)
- Centralized error handling
- Consistent error response format

## Project Structure

```text
.
├── index.js
├── postman_collection.json
├── schema.sql
└── src
    ├── config
    │   └── db.js
    ├── controllers
    │   └── schoolController.js
    ├── middlewares
    │   ├── errorHandler.js
    │   ├── notFound.js
    │   └── validate.js
    ├── routes
    │   └── schoolRoutes.js
    ├── utils
    │   ├── AppError.js
    │   ├── asyncHandler.js
    │   └── haversine.js
    └── validations
        └── schoolValidation.js
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000
DB_HOST=school-management.cpkmu4umek2m.ap-south-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=Advance12.
DB_NAME=school-management
DB_PORT=3306
NODE_ENV=development
```

Notes:
- Use `NODE_ENV=production` in Heroku.
- The database name is `school-management`.

## Installation

```bash
npm install
```

Run locally:

```bash
npm run dev
```

## Database Setup

The API expects a `schools` table with this shape:

```sql
CREATE TABLE IF NOT EXISTS schools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_location ON schools (latitude, longitude);
```

## API Endpoints

### 1. Health

`GET /`

Response:

```json
{
  "success": true,
  "message": "School Management API is running"
}
```

### 2. Add School

`POST /addSchool`

Body:

```json
{
  "name": "Delhi Public School",
  "address": "Mathura Road, New Delhi",
  "latitude": 28.5494,
  "longitude": 77.2001
}
```

Success (`201`):

```json
{
  "success": true,
  "message": "School added successfully",
  "schoolId": 1
}
```

### 3. List Schools by Distance

`GET /listSchools?latitude=12.9716&longitude=77.5946`

Success (`200`):

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

## Validation Rules

### `POST /addSchool`

- `name`: required, trimmed, max 255 chars
- `address`: required, trimmed, max 255 chars
- `latitude`: number in `[-90, 90]`
- `longitude`: number in `[-180, 180]`

### `GET /listSchools`

- `latitude`: required number in `[-90, 90]`
- `longitude`: required number in `[-180, 180]`

## Error Handling

All errors are returned in a consistent format:

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

### Common Error Codes

- `ROUTE_NOT_FOUND` (`404`)
- `VALIDATION_ERROR` (`400`)
- `INVALID_JSON` (`400`)
- `DB_AUTH_ERROR` (`503`)
- `DB_NOT_FOUND` (`503`)
- `DB_CONNECTION_ERROR` (`503`)
- `INTERNAL_ERROR` (`500`)

### Debug Field Behavior

- In non-production (`NODE_ENV != production`), response may include a `debug` block.
- In production (`NODE_ENV=production`), `debug` is not returned.

## Postman

Import `postman_collection.json` to test all endpoints quickly.

## Deployment (Heroku)

The app is configured with a `Procfile`:

```text
web: node index.js
```

Required Heroku config vars:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `NODE_ENV=production`

## Quick Smoke Tests

```bash
curl http://127.0.0.1:3000/
curl "http://127.0.0.1:3000/listSchools?latitude=12.9716&longitude=77.5946"
curl -X POST http://127.0.0.1:3000/addSchool \
  -H "Content-Type: application/json" \
  -d '{"name":"Test School","address":"Test Address","latitude":12.9716,"longitude":77.5946}'
```

## License

ISC
