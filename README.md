# Personal Expense Tracker Backend

A production-ready backend service for tracking personal monthly expenses built with **Node.js, Express, TypeScript, and MongoDB**. This is a complete screening task implementation with enterprise-grade features.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Project Setup](#project-setup)
4. [Database Configuration](#database-configuration)
5. [API Documentation](#api-documentation)
6. [Project Architecture](#project-architecture)
7. [Features](#features)
8. [Assumptions Made](#assumptions-made)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This backend provides a complete REST API for managing users and their expenses. It includes:

- ✅ **User Management** - Create, read, update, delete users with unique email validation
- ✅ **Expense Tracking** - Add, categorize, and track personal expenses
- ✅ **Monthly Summaries** - Get expense breakdown by category and remaining budget
- ✅ **Pagination & Filtering** - Advanced querying with filters and pagination
- ✅ **Data Validation** - Multiple levels of validation (controller, model, schema)
- ✅ **Error Handling** - Enterprise-grade error management
- ✅ **Security** - Helmet, CORS, input validation, rate limiting
- ✅ **Mongoose Hooks** - Pre-save validation, cascade delete, auto-population
- ✅ **TypeScript** - Full type safety with strict mode

**Tech Stack:**
- Runtime: Node.js (v16+)
- Framework: Express.js
- Language: TypeScript
- Database: MongoDB (Atlas)
- ODM: Mongoose
- Validation: Joi
- Security: Helmet, CORS
- Logging: Morgan, Pino

---

## Quick Start

Get up and running in 5 minutes:

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env
# Edit .env with your MongoDB URI

# 3. Start development server
npm run dev

# 4. Test it works
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-02-03T10:30:00.000Z",
  "environment": "development"
}
```

✅ You're running! Proceed to [API Documentation](#api-documentation) to start using the API.

---

## Project Setup

### Prerequisites

- **Node.js** v16 or higher
- **npm** or yarn
- **MongoDB Atlas** account (free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- **Git** (optional, for cloning)

### Installation Steps

#### 1. Clone/Download Project

```bash
# Clone if using git
git clone <repository-url>
cd backend

# Or download and navigate to backend folder
cd Expense_Tracker/backend
```

#### 2. Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `typescript` - Type safety
- `joi` - Data validation
- `helmet` - Security headers
- `cors` - Cross-origin support
- `morgan` - Request logging
- `dotenv` - Environment variables
- And other utilities

#### 3. Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost
API_VERSION=v1
LOG_LEVEL=debug

# Database Configuration (See MongoDB Atlas section below)
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

**Important**: Never commit `.env` to git. It's in `.gitignore` for security.

#### 4. Start Development Server

```bash
npm run dev
```

You should see:
```
[INFO] Expense Tracker Backend Server started successfully
  Event: SERVER_STARTUP
  Environment: development
  Host: localhost:5000
  API Base: http://localhost:5000/api/v1
```

#### 5. Available npm Script to populate database with sample data
```
cd backend 
npx ts-node scripts/database_Populator.ts
```

## Database Configuration

### MongoDB Atlas Setup

MongoDB Atlas is a free cloud database service. Follow these steps:

#### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Start Free"
3. Create account with email
4. Verify email address

#### Step 2: Create a Cluster

1. Click "Create a Deployment"
2. Select "M0 Cluster" (Free tier - 512MB storage)
3. Choose your preferred region (closest to you)
4. Click "Create Cluster"
5. Wait 2-5 minutes for cluster to be ready

#### Step 3: Create Database User

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username: `dev_user`
5. Click "Auto Generate Secure Password"
6. Copy the password (you'll need it)
7. Click "Add User"

#### Step 4: Get Connection String

1. Click "Clusters" in left sidebar
2. Click "Connect" button on your cluster
3. Select "Drivers"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials

**Example connection string:**
```
mongodb+srv://dev_user:YOUR_PASSWORD@cluster0.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

#### Step 5: Configure .env

Paste your connection string in `.env`:

```env
MONGODB_URI=mongodb+srv://dev_user:YOUR_PASSWORD@cluster0.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

#### Step 6: Allow Network Access

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Confirm

#### Step 7: Test Connection

```bash
npm run dev
```

If you see "Server is healthy" in the logs, you're connected! ✅

---

## API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Response Format

All responses follow a consistent format:

**Success Response (200, 201):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "statusCode": 200
}
```

**Error Response (400, 404, 409, etc):**
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Detailed error information",
  "statusCode": 400
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  },
  "statusCode": 200
}
```

### User Endpoints

#### 1. Create User
Create a new user with email and monthly budget.

```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "monthlyBudget": 5000
}
```

**Request Validation:**
- `name`: String, 2-100 characters, required
- `email`: Valid email format, unique, required
- `monthlyBudget`: Number > 0, required

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "monthlyBudget": 5000,
    "createdAt": "2026-02-03T10:30:00.000Z",
    "updatedAt": "2026-02-03T10:30:00.000Z"
  },
  "statusCode": 201
}
```

**Error Cases:**
- Email already exists → 409 Conflict
- Invalid email format → 400 Bad Request
- Missing required fields → 400 Bad Request

---

#### 2. Get User by ID
Retrieve a specific user's details.

```http
GET /api/v1/users/userId
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "monthlyBudget": 5000,
    "createdAt": "2026-02-03T10:30:00.000Z",
    "updatedAt": "2026-02-03T10:30:00.000Z"
  },
  "statusCode": 200
}
```

**Error Cases:**
- User not found → 404 Not Found
- Invalid user ID format → 400 Bad Request

---

#### 3. Get All Users (Paginated)
Retrieve all users with pagination.

```http
GET /api/v1/users?page=1&limit=10
```

**Query Parameters:**
- `page`: Integer (default: 1, minimum: 1)
- `limit`: Integer (default: 10, maximum: 100)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "monthlyBudget": 5000,
      "createdAt": "2026-02-03T10:30:00.000Z",
      "updatedAt": "2026-02-03T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "monthlyBudget": 6000,
      "createdAt": "2026-02-03T10:31:00.000Z",
      "updatedAt": "2026-02-03T10:31:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  },
  "statusCode": 200
}
```

---

#### 4. Update User
Update specific fields of a user.

```http
PUT /api/v1/users/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "name": "John Updated",
  "monthlyBudget": 6000
}
```

**Request Validation:**
- All fields are optional
- Same validation rules apply as create
- Email must remain unique

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "john@example.com",
    "monthlyBudget": 6000,
    "createdAt": "2026-02-03T10:30:00.000Z",
    "updatedAt": "2026-02-03T10:35:00.000Z"
  },
  "statusCode": 200
}
```

---

#### 5. Delete User
Delete a user and all associated expenses.

```http
DELETE /api/v1/users/507f1f77bcf86cd799439011
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "statusCode": 200
}
```

**Important**: Deleting a user automatically deletes all expenses associated with that user (cascade delete).

---

### Expense Endpoints

#### 1. Create Expense
Create a new expense for a user.

```http
POST /api/v1/expenses
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "title": "Lunch at restaurant",
  "amount": 25.50,
  "category": "Food",
  "date": "2026-02-03T12:00:00Z"
}
```

**Request Validation:**
- `userId`: Valid MongoDB ObjectId, user must exist, required
- `title`: String, 2-200 characters, required
- `amount`: Number > 0, required
- `category`: One of: Food, Travel, Shopping, Entertainment, Utilities, Healthcare, Education, Other
- `date`: ISO date string, cannot be in the future, required

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "monthlyBudget": 5000
    },
    "title": "Lunch at restaurant",
    "amount": 25.50,
    "category": "Food",
    "date": "2026-02-03T12:00:00.000Z",
    "createdAt": "2026-02-03T10:30:00.000Z",
    "updatedAt": "2026-02-03T10:30:00.000Z"
  },
  "statusCode": 201
}
```

**Error Cases:**
- User not found → 404 Not Found
- Invalid amount (0 or negative) → 400 Bad Request
- Future date → 400 Bad Request
- Invalid category → 400 Bad Request

---

#### 2. Get Expense by ID
Retrieve a specific expense with user details.

```http
GET /api/v1/expenses/507f1f77bcf86cd799439012
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "monthlyBudget": 5000
    },
    "title": "Lunch at restaurant",
    "amount": 25.50,
    "category": "Food",
    "date": "2026-02-03T12:00:00.000Z",
    "createdAt": "2026-02-03T10:30:00.000Z",
    "updatedAt": "2026-02-03T10:30:00.000Z"
  },
  "statusCode": 200
}
```

**Note:** User data is auto-populated (Mongoose pre-find hook).

---

#### 3. Update Expense
Update specific fields of an expense.

```http
PUT /api/v1/expenses/507f1f77bcf86cd799439012
Content-Type: application/json

{
  "amount": 30.00,
  "title": "Lunch updated"
}
```

**Request Validation:**
- All fields are optional
- Same validation rules apply as create

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": { /* updated expense with user */ },
  "statusCode": 200
}
```

---

#### 4. Delete Expense
Delete a specific expense.

```http
DELETE /api/v1/expenses/507f1f77bcf86cd799439012
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense deleted successfully",
  "statusCode": 200
}
```

---

### User Expense Query Endpoints

#### 1. Get User Expenses (Paginated & Filterable)
Retrieve all expenses for a user with filtering options.

```http
GET /api/v1/users/507f1f77bcf86cd799439011/expenses?page=1&limit=10&category=Food&startDate=2026-01-01&endDate=2026-02-28
```

**Query Parameters:**
- `page`: Integer (default: 1, minimum: 1)
- `limit`: Integer (default: 10, maximum: 100)
- `category`: String (optional) - Filter by category
- `startDate`: ISO date string (optional) - Filter from this date
- `endDate`: ISO date string (optional) - Filter until this date

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User expenses retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "monthlyBudget": 5000
      },
      "title": "Lunch",
      "amount": 25.50,
      "category": "Food",
      "date": "2026-02-03T12:00:00.000Z",
      "createdAt": "2026-02-03T10:30:00.000Z",
      "updatedAt": "2026-02-03T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": { /* user data */ },
      "title": "Dinner",
      "amount": 45.00,
      "category": "Food",
      "date": "2026-02-02T18:00:00.000Z",
      "createdAt": "2026-02-02T16:30:00.000Z",
      "updatedAt": "2026-02-02T16:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  },
  "statusCode": 200
}
```

---

#### 2. Get Monthly Expense Summary
Get summary of current month's expenses with category breakdown.

```http
GET /api/v1/users/507f1f77bcf86cd799439011/summary
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Expense summary retrieved successfully",
  "data": {
    "totalExpenses": 150.75,
    "remainingBudget": 4849.25,
    "expenseCount": 6,
    "monthlyBudget": 5000,
    "expensesByCategory": {
      "Food": 85.50,
      "Travel": 65.25
    }
  },
  "statusCode": 200
}
```

**Note:** Summary is calculated for the current calendar month only.

---

### Health Check Endpoint

#### Server Health
Check if server is running and healthy.

```http
GET /api/v1/health
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-02-03T10:30:00.000Z",
  "environment": "development",
  "statusCode": 200
}
```

---

## Project Architecture

### Directory Structure

```
backend/src/
├── config/
│   ├── database.ts         # MongoDB connection setup
│   └── env.ts              # Environment variables + validation
├── controllers/
│   ├── userController.ts   # User request handlers
│   └── expenseController.ts # Expense request handlers
├── middleware/
│   ├── errorHandler.ts     # Global error handling
│   ├── logger.ts           # Request logging & response time
│   ├── security.ts         # Helmet + CORS middleware
│   └── ratelimiter.ts      # Rate limiting
├── models/
│   ├── User.ts             # User schema with hooks
│   │                        # - Pre-save: email validation
│   │                        # - Pre-deleteOne: cascade delete
│   │                        # - Post-save: audit logging
│   └── Expense.ts          # Expense schema with hooks
│                            # - Pre-save: validation
│                            # - Pre-find: auto-populate
│                            # - Post-save: audit logging
├── routes/
│   ├── index.ts            # Route mounting
│   ├── userRoutes.ts       # User endpoints
│   ├── expenseRoutes.ts    # Expense endpoints
│   └── userExpenseRoutes.ts # Nested expense routes
├── services/
│   ├── userService.ts      # User business logic
│   └── expenseService.ts   # Expense business logic
├── types/
│   └── index.ts            # TypeScript interfaces
├── utils/
│   ├── errors.ts           # Custom error classes
│   ├── response.ts         # Response formatters
│   ├── validators.ts       # Joi validation schemas
│   ├── pagination.ts       # Pagination helpers
│   └── logger.ts           # Logging utility
└── index.ts                # Server entry point
```

### Data Flow

**User Creation:**
```
HTTP Request
  ↓
Route → Controller → Service → Model
  ↓
Model pre-save hook (validation)
  ↓
Database save
  ↓
Model post-save hook (logging)
  ↓
Response formatted
  ↓
HTTP Response
```

---

## Features

### ✅ Core Functionality
- Complete CRUD for users and expenses
- MongoDB persistence with Mongoose ODM
- 12 API endpoints covering all operations
- Pagination support with customizable limits
- Advanced filtering (category, date range)

### ✅ Data Integrity
- Email uniqueness at database level
- User existence validation before expense creation
- Cascade delete (expenses deleted when user deleted)
- Auto-population of related data
- Type-safe TypeScript throughout

### ✅ Validation
- Request body validation with Joi
- Model-level validation with Mongoose
- Multiple validation layers (defense in depth)
- Clear, actionable error messages
- Type coercion safety

### ✅ Security
- Helmet middleware (security headers)
- CORS configuration
- Request size limiting (10MB)
- Input sanitization
- Rate limiting ready
- No sensitive data in logs

### ✅ Error Handling
- Custom error classes with HTTP codes
- Global error handler
- MongoDB error mapping
- Development vs production error details
- Consistent error response format

### ✅ Monitoring & Logging
- Morgan request logging
- Response time tracking
- Audit trail logging
- Pino structured logging
- Health check endpoint

### ✅ Developer Experience
- Hot-reload with ts-node
- TypeScript strict mode
- ESLint for code quality
- Prettier for formatting
- Comprehensive documentation

---

## Assumptions Made

### 1. MongoDB Atlas is Used
- **Assumption**: Backend expects MongoDB as the database (using MongoDB Atlas for cloud hosting)
- **Rationale**: MongoDB is specified in requirements; Atlas is free tier available
- **Alternative**: Can be self-hosted MongoDB, connection string would change

### 2. Authentication Not Required
- **Assumption**: No JWT/authentication implemented (endpoints are public)
- **Rationale**: Screening task focuses on CRUD operations and data modeling
- **Note**: Can be added later (authentication middleware ready-to-implement)

### 3. Development Environment Defaults
- **Assumption**: Server runs on `localhost:5000` by default
- **Rationale**: Standard port for Node.js development
- **Configurable**: Via `PORT` and `HOST` environment variables

### 4. Current Month for Summary
- **Assumption**: Monthly summary only includes current calendar month expenses
- **Rationale**: Most practical for budget tracking use case
- **Alternative**: Could add month/year parameters

### 5. Cascade Delete on User Removal
- **Assumption**: Deleting a user automatically deletes all their expenses
- **Rationale**: User-expense relationship is owner-owned, not just linked
- **Alternative**: Could prevent delete if expenses exist (foreign key constraint)

### 6. Auto-Population of User in Expenses
- **Assumption**: Every expense query returns complete user details
- **Rationale**: Avoids N+1 queries, provides richer API responses
- **Trade-off**: Slightly larger response payload

### 7. Email Case-Insensitive
- **Assumption**: Emails are normalized to lowercase for uniqueness check
- **Rationale**: Industry standard (RFC 5321)
- **Example**: `John@Example.com` and `john@example.com` treated as same email

### 8. Date Format is ISO 8601
- **Assumption**: All dates in requests must be ISO format strings
- **Rationale**: International standard, JSON compatible
- **Example**: `"2026-02-03T12:00:00Z"` or `"2026-02-03"`

### 9. Categories are Fixed Enum
- **Assumption**: Only 8 predefined expense categories allowed
- **Rationale**: Simplifies filtering and reporting
- **Categories**: Food, Travel, Shopping, Entertainment, Utilities, Healthcare, Education, Other

### 10. Positive Amounts Only
- **Assumption**: Expense amounts must be positive (> 0)
- **Rationale**: Expense tracker doesn't support negative expenses
- **Note**: Could be enhanced with income tracking

### 11. No Future Dates
- **Assumption**: Expenses cannot be dated in the future
- **Rationale**: Prevents speculative/planned expenses in tracker
- **Validation**: Checked at model pre-save hook level

### 12. HTTP Status Codes Follow REST Standards
- **Assumption**: Responses use standard HTTP codes (200, 201, 400, 404, 409)
- **Rationale**: RESTful API best practices
- **Mapping**:
  - 200: Success (GET, PUT, DELETE)
  - 201: Created (POST)
  - 400: Bad Request (validation errors)
  - 404: Not Found
  - 409: Conflict (duplicate email)

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: "ECONNREFUSED 127.0.0.1:5000"

**Solution:**
- Port 5000 already in use
- Change in `.env`: `PORT=5001`
- Or kill process: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)

### Issue: "MongooseError: Cannot connect to MongoDB"

**Solution:**
1. Check MongoDB URI in `.env`
2. Verify MongoDB Atlas network access (allow all IPs for dev)
3. Check internet connection
4. Test URI: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

### Issue: "Email already in use" error

**Solution:**
- This is expected if creating duplicate email
- Use unique email each time
- Or use a different database for testing

### Issue: "Invalid user ID" or "User not found"

**Solution:**
- When creating expense, use valid user `_id` from created user response
- Copy-paste the `_id` exactly
- Verify user exists: `GET /api/v1/users/{id}`

### Issue: TypeScript compilation errors

**Solution:**
```bash
npm run type-check  # See all TypeScript errors
npm run build       # Compile to JavaScript
```

### Issue: Port still in use after stopping

**Solution (Mac/Linux):**
```bash
lsof -ti:5000 | xargs kill -9
npm run dev
```

**Solution (Windows):**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
npm run dev
```

---

## Additional Resources

- **API Examples**: See [API_EXAMPLES.md](./API_EXAMPLES.md) for more examples
- **Quick Start**: See [QUICK_START.md](./QUICK_START.md) for setup steps
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- **Mongoose Hooks**: See [MONGOOSE_HOOKS_DOCUMENTATION.md](./MONGOOSE_HOOKS_DOCUMENTATION.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [API Documentation](#api-documentation)
3. Check existing documentation files
4. Review error messages in console logs

---

## License

ISC

---

**Ready to use!** 🚀

Start with: `npm install && npm run dev`

Test with: `curl http://localhost:5000/api/v1/health`

Create a user, add expenses, and track your spending!

