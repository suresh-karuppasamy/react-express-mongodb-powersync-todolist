# Simple User Management Backend

A simple Node.js, Express, and MongoDB backend API for user management with name and age fields.

## Features

- ✅ Create users (name and age)
- ✅ Read all users
- ✅ Read single user by ID
- ✅ Update user information
- ✅ Delete users
- ✅ Input validation
- ✅ CORS enabled for frontend communication
- ✅ Health check endpoint

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health
- `GET /api/health` - Health check

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todolist
NODE_ENV=development
```

3. Make sure MongoDB is running on your system

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## User Model

```javascript
{
  name: String (required),
  age: Number (required, 0-150),
  createdAt: Date,
  updatedAt: Date
}
```

## Example API Usage

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "age": 30}'
```

### Get All Users
```bash
curl http://localhost:5000/api/users
```

### Get User by ID
```bash
curl http://localhost:5000/api/users/USER_ID
```

### Update User
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "age": 25}'
```

### Delete User
```bash
curl -X DELETE http://localhost:5000/api/users/USER_ID
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

## Response Examples

### Create User Response
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "John Doe",
  "age": 30,
  "createdAt": "2023-07-21T10:30:00.000Z",
  "updatedAt": "2023-07-21T10:30:00.000Z"
}
```

### Get All Users Response
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "age": 30,
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T10:30:00.000Z"
  }
]
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Frontend Integration

This backend is ready to be consumed by any frontend framework:
- React
- Vue.js
- Angular
- Vanilla JavaScript
- Mobile apps

Just make HTTP requests to the API endpoints!
