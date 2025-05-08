# Node.js REST API with MongoDB

A simple REST API built with Node.js and MongoDB using TypeScript. This application implements a basic user management system with posts and comments without using Express.js or Mongoose.

## Features

- RESTful API architecture
- MongoDB integration with native driver
- TypeScript implementation
- Data loading from JSONPlaceholder API
- Proper error handling with appropriate status codes
- Cascade deletion for related resources

## Project Structure

```
node_assignment/
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts            # Main entry point
│   ├── types.ts             # TypeScript interfaces
│   ├── db/
│   │   └── connection.ts    # MongoDB connection
│   └── controllers/
│       ├── dataController.ts    # Data loading controller
│       └── userController.ts    # User management controller
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- TypeScript

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make sure MongoDB is running on your machine:

   ```bash
   # Check if MongoDB is running
   mongod --version

   # Start MongoDB if needed
   brew services start mongodb-community   # macOS
   sudo systemctl start mongod             # Linux
   ```

## Running the Application

Start the server:

```bash
npm start
```

The server will be running at http://localhost:3000

## API Endpoints

### Load Initial Data

```
GET /load
```

- Loads 10 users with their posts and comments from JSONPlaceholder API
- Stores them in the MongoDB database
- Returns an empty response with 200 status code on success

### Create User

```
PUT /users
```

- Creates a new user in the database
- Request body must contain user data (see example below)
- Returns the created user with 201 status code and Location header
- Returns 409 if user already exists, 400 if required fields are missing

Example request body:

```json
{
  "id": 11,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "address": {
    "street": "Example St",
    "suite": "Apt 100",
    "city": "Sampleville",
    "zipcode": "12345",
    "geo": {
      "lat": "0",
      "lng": "0"
    }
  },
  "phone": "555-1234",
  "website": "example.com",
  "company": {
    "name": "Example Co",
    "catchPhrase": "Just an example",
    "bs": "testing"
  }
}
```

### Get User by ID

```
GET /users/:userId
```

- Retrieves a specific user with their posts and comments
- Returns user data with 200 status code
- Returns 404 if user not found, 400 if invalid ID format

### Delete User by ID

```
DELETE /users/:userId
```

- Deletes a specific user and their related posts and comments
- Returns success message with 200 status code
- Returns 404 if user not found, 400 if invalid ID format

### Delete All Users

```
DELETE /users
```

- Deletes all users and their related posts and comments
- Returns success message with 200 status code

## Testing the API

You can test the API using curl or any API testing tool like Postman:

### Using curl

```bash
# Load initial data
curl -X GET http://localhost:3000/load

# Get a user with ID 1
curl -X GET http://localhost:3000/users/1

# Create a new user
curl -X PUT -H "Content-Type: application/json" -d '{
  "id": 11,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "address": {
    "street": "Example St",
    "suite": "Apt 100",
    "city": "Sampleville",
    "zipcode": "12345",
    "geo": {
      "lat": "0",
      "lng": "0"
    }
  },
  "phone": "555-1234",
  "website": "example.com",
  "company": {
    "name": "Example Co",
    "catchPhrase": "Just an example",
    "bs": "testing"
  }
}' http://localhost:3000/users

# Delete a user
curl -X DELETE http://localhost:3000/users/1

# Delete all users
curl -X DELETE http://localhost:3000/users
```

### Using a Browser

For GET requests, you can simply navigate to the endpoint in your browser:

- http://localhost:3000/load
- http://localhost:3000/users/1

## Technologies Used

- Node.js
- TypeScript
- MongoDB
- Native HTTP module (no Express)
- MongoDB driver (no Mongoose)
