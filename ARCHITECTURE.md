# Architecture Documentation

This document describes the technical architecture of the Personal Expense Tracker Backend.

## Overview

The application follows a **clean, layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│            Express Application                  │
├─────────────────────────────────────────────────┤
│              Routing Layer                      │
│  (userRoutes, expenseRoutes, userExpenseRoutes) │
├─────────────────────────────────────────────────┤
│            Controllers Layer                    │
│  (UserController, ExpenseController)            │
├─────────────────────────────────────────────────┤
│            Services Layer                       │
│  (UserService, ExpenseService)                  │
├─────────────────────────────────────────────────┤
│            Models Layer (Mongoose)              │
│  (User Schema, Expense Schema)                  │
├─────────────────────────────────────────────────┤
│           Database Layer (MongoDB)              │
│              MongoDB Atlas                      │
└─────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. Routing Layer

**Files**: `src/routes/`
- `userRoutes.ts` - Routes for user endpoints
- `expenseRoutes.ts` - Routes for expense endpoints
- `userExpenseRoutes.ts` - Nested routes for user expenses
- `index.ts` - Route configuration and mounting

**Responsibilities**:
- Define HTTP routes
- Map routes to controllers
- Handle route parameters

**Example**:
```typescript
userRoutes.post('/', UserController.createUser);
userRoutes.get('/:id', UserController.getUser);
```

### 2. Controllers Layer

**Files**: `src/controllers/`
- `userController.ts` - User request handlers
- `expenseController.ts` - Expense request handlers

**Responsibilities**:
- Handle HTTP requests/responses
- Validate input data
- Call appropriate services
- Format and send responses
- Handle errors from services

**Example**:
```typescript
static createUser = asyncHandler(async (req, res) => {
  const userData = validateData(req.body, userCreateSchema);
  const user = await UserService.createUser(userData);
  sendCreated(res, user, 'User created successfully');
});
```

### 3. Services Layer

**Files**: `src/services/`
- `userService.ts` - User business logic
- `expenseService.ts` - Expense business logic

**Responsibilities**:
- Implement business logic
- Query models
- Perform calculations
- Validate complex operations
- Throw meaningful errors

**Example**:
```typescript
static async getMonthlyExpenseSummary(userId: string) {
  const user = await User.findById(userId);
  // Complex aggregation and calculation logic
  return summary;
}
```

### 4. Models Layer

**Files**: `src/models/`
- `User.ts` - User schema with hooks and cascade delete
- `Expense.ts` - Expense schema with relationships and auto-population

**Responsibilities**:
- Define data structure
- Implement schema validation
- Create indexes for query performance
- Define Mongoose hooks for data consistency
- Implement instance methods

#### Mongoose Hooks in User Model

**Pre-save Hook** - Email Validation & Normalization
```typescript
userSchema.pre('save', async function (next) {
  // Normalize email: convert to lowercase and trim
  this.email = this.email.toLowerCase().trim();
  
  // Check for duplicate email (excluding current document)
  if (this.isModified('email')) {
    const existingUser = await User.findOne({
      email: this.email,
      _id: { $ne: this._id }
    });
    if (existingUser) {
      throw new Error('Email already in use');
    }
  }
  next();
});
```
**Purpose**: Ensure email uniqueness and consistent formatting before database persistence

**Pre-deleteOne Hook** - Cascade Delete
```typescript
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  // Delete all expenses associated with the user
  await mongoose.model('Expense').deleteMany({ userId: this._id });
  next();
});
```
**Purpose**: Maintain referential integrity by cascading deletes

**Post-save Hook** - Audit Logging
```typescript
userSchema.post('save', function () {
  if (this.isNew) {
    console.log(`[AUDIT] New user created: ${this._id} (${this.email})`);
  }
});
```
**Purpose**: Track user creation for compliance and debugging

#### Mongoose Hooks in Expense Model

**Pre-save Hook** - Data Validation
```typescript
expenseSchema.pre('save', async function (next) {
  // Validate referenced user exists
  const user = await User.findById(this.userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Business rule: expense date cannot be in future
  if (this.date > new Date()) {
    throw new Error('Expense date cannot be in the future');
  }
  
  // Validate amount is positive
  if (this.amount <= 0) {
    throw new Error('Expense amount must be greater than 0');
  }
  
  next();
});
```
**Purpose**: Enforce business rules and maintain referential integrity at the database layer

**Pre-find Hook** - Auto-population
```typescript
expenseSchema.pre(/^find/, function (next) {
  // Auto-populate user data with every query
  if (!this.getOptions().populate) {
    this.populate('userId', 'name email monthlyBudget');
  }
  next();
});
```
**Purpose**: Always return complete expense data with user details, reducing N+1 queries

**Post-save Hook** - Audit Logging
```typescript
expenseSchema.post('save', function () {
  if (this.isNew) {
    console.log(
      `[AUDIT] New expense: ${this._id} | Amount: ${this.amount} | Category: ${this.category}`
    );
  }
});
```
**Purpose**: Create audit trail for expense tracking and debugging

### 5. Database Layer

**Files**: `src/config/database.ts`

**Responsibilities**:
- MongoDB connection management
- Connection pooling
- Error handling
- Graceful shutdown

### 6. Middleware & Cross-Cutting Concerns

**Files**: `src/middleware/`
- `errorHandler.ts` - Global error handling
- `logger.ts` - Request logging
- `security.ts` - Security headers and CORS

**Responsibilities**:
- Request/response transformation
- Logging and monitoring
- Security enforcement
- Error handling

## Data Flow

### Create User Flow (with Hooks)

```
HTTP Request (POST /users)
    ↓
userRoutes → UserController.createUser()
    ├─ validateData(req.body, userCreateSchema)
    ├─ UserService.createUser(userData)
    │   ├─ User.findOne({ email }) [check for duplicates]
    │   ├─ new User(userData)
    │   └─ user.save()
    │       └─ TRIGGERS: pre('save') hook
    │           ├─ Normalize email
    │           ├─ Check uniqueness
    │           └─ Validate before DB write
    │       └─ TRIGGERS: post('save') hook
    │           └─ Audit log: user created
    └─ sendCreated(res, user, 201)
    ↓
HTTP Response (201 Created)
```

### Create Expense Flow (with Hooks)

```
HTTP Request (POST /expenses)
    ↓
expenseRoutes → ExpenseController.createExpense()
    ├─ validateData(req.body, expenseCreateSchema)
    ├─ ExpenseService.createExpense(expenseData)
    │   ├─ User.findById(userId) [verify user exists]
    │   ├─ new Expense(expenseData)
    │   └─ expense.save()
    │       └─ TRIGGERS: pre('save') hook
    │           ├─ Validate user exists
    │           ├─ Check date not in future
    │           ├─ Validate amount > 0
    │           └─ Normalize category
    │       └─ TRIGGERS: post('save') hook
    │           └─ Audit log: expense created
    │   └─ expense.populate('userId')
    │       └─ TRIGGERS: pre(/^find/) hook
    │           └─ Auto-populate user details
    └─ sendCreated(res, expense, 201)
    ↓
HTTP Response (201 Created with populated data)
```

### Delete User Flow (with Cascade)

```
HTTP Request (DELETE /users/:id)
    ↓
userRoutes → UserController.deleteUser()
    ├─ ExpenseService.deleteUserExpenses(userId)
    ├─ UserService.deleteUser(userId)
    │   └─ User.findByIdAndDelete(userId)
    │       └─ TRIGGERS: pre('deleteOne') hook
    │           └─ Expense.deleteMany({ userId })
    │               └─ Cascade deletes all user's expenses
    └─ sendSuccess(res, null)
    ↓
HTTP Response (200 OK)
```

### Get Monthly Summary Flow

```
HTTP Request (GET /users/:userId/summary)
    ↓
userExpenseRoutes → ExpenseController.getExpenseSummary()
    ├─ ExpenseService.getMonthlyExpenseSummary(userId)
    │   ├─ User.findById() [validate user]
    │   ├─ Expense.aggregate() [group by category]
    │   │   └─ Match: current month expenses
    │   │   └─ Group by category
    │   ├─ Calculate totals & remaining budget
    │   └─ Return summary object
    └─ sendSuccess(res, summary)
    ↓
HTTP Response (200 OK)
```

## TypeScript Architecture

### Type System

**Files**: `src/types/index.ts`

```typescript
// Domain types
export interface IUser { ... }
export interface IExpense { ... }
export interface IExpenseSummary { ... }

// API types
export interface ApiResponse<T> { ... }
export interface PaginatedResponse<T> { ... }

// Document types
export interface IUserDocument extends IUser, Document { }
export interface IExpenseDocument extends IExpense, Document { }
```

**Benefits**:
- Type safety throughout application
- IntelliSense in IDE
- Compile-time error checking
- Self-documenting code

## Error Handling Architecture

### Error Hierarchy

```
Error (JavaScript)
    ↓
AppError (Custom base error with statusCode)
    ├─ ValidationError (400)
    ├─ NotFoundError (404)
    ├─ ConflictError (409)
    ├─ UnauthorizedError (401)
    └─ ForbiddenError (403)
```

### Error Flow

```
Service Layer
    ↓
Throws AppError or MongoDB Error
    ↓
asyncHandler catches error
    ↓
Passes to Global Error Handler Middleware
    ↓
errorHandler transforms to API response
    ↓
Sends HTTP response with appropriate status code
```

## Validation Architecture

### Three-Level Validation

**1. Route Level** - Basic type checking
```typescript
app.post('/users', UserController.createUser);
```

**2. Controller Level** - Joi schema validation
```typescript
const userData = validateData(req.body, userCreateSchema);
```

**3. Model Level** - MongoDB/Mongoose validation
```typescript
userSchema.pre('save', async function(next) {
  // Custom validation
});
```

### Benefits
- Early error detection
- Clear error messages
- Type-safe data
- Consistent validation

## Database Design

### Entity Relationship Diagram

```
┌─────────────────────────┐
│         User            │
├─────────────────────────┤
│ _id (ObjectId)          │
│ name (String)           │
│ email (String) [unique] │
│ monthlyBudget (Number)  │
│ createdAt (Date)        │
│ updatedAt (Date)        │
└─────────────────────────┘
        │
        │ 1 : Many
        │
┌─────────────────────────┐
│       Expense           │
├─────────────────────────┤
│ _id (ObjectId)          │
│ userId (ObjectId) [ref] │
│ title (String)          │
│ amount (Number)         │
│ category (String)       │
│ date (Date)             │
│ createdAt (Date)        │
│ updatedAt (Date)        │
└─────────────────────────┘
```

### Indexes

```typescript
// User Collection
- { email: 1 } [UNIQUE]

// Expense Collection
- { userId: 1, date: -1 }
- { userId: 1, category: 1 }
- { createdAt: -1 }
```

**Benefits**:
- Fast user lookups by email
- Efficient expense queries
- Date sorting optimization
- Category-based filtering

## Middleware Stack Order

```
1. JSON Parser
   ↓
2. Request Logger (Morgan)
   ↓
3. Response Time Tracker
   ↓
4. Security Middleware (Helmet, CORS)
   ↓
5. Routes Handler
   ↓
6. 404 Handler
   ↓
7. Global Error Handler
```

**Important**: Error handler MUST be last

## API Response Format

### Standard Response

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

### Benefits
- Consistent across all endpoints
- Predictable client integration
- Clear error messages
- Metadata for pagination

## Performance Considerations

### 1. Database Optimization

**Indexing**
- User lookups: indexed on email
- Expense queries: indexed on userId, category
- Sorting: indexed on date

**Aggregation Pipeline**
- Server-side calculation in MongoDB
- Reduces data transfer
- Faster processing

### 2. Query Optimization

**Population**
```typescript
// Auto-populate user data in expenses
expenseSchema.pre(/^find/, function() {
  this.populate('userId', 'name email monthlyBudget');
});
```

**Pagination**
- Limit result sets
- Skip large offsets efficiently
- Default limit: 10, max: 100

### 3. Caching Opportunities

Future enhancements:
- Cache monthly summaries (recalculate daily)
- Cache user by email (invalidate on update)
- Redis for session/temporary data

## Security Architecture

### Input Validation

```
Request Body
    ↓
Express JSON Parser
    ↓
Joi Schema Validation
    ↓
Mongoose Schema Validation
    ↓
Custom Pre-save Hooks
```

### Security Middleware

```typescript
1. Helmet - Security headers
2. CORS - Cross-origin protection
3. Size Limit - Payload size restriction
4. Type Options - Content type sniffing
5. Frame Options - Clickjacking protection
6. XSS Protection - Cross-site scripting
```

### Error Information Disclosure

- Development mode: Full error details
- Production mode: Generic error messages
- Never expose database structure
- Never expose internal code paths

## Scalability Architecture

### Horizontal Scaling
- Stateless design - can run multiple instances
- Database handles concurrency
- Load balancer distributes traffic

### Vertical Scaling
- Optimize queries with indexes
- Add database replicas for reads
- Implement caching layer

### Database Scaling
- MongoDB sharding support
- Connection pooling
- Read replicas

## Testing Architecture (Future)

```
Unit Tests
├─ Services (business logic)
├─ Utilities (helpers)
└─ Validators (schemas)

Integration Tests
├─ Routes (API endpoints)
├─ Controllers (with mocked services)
└─ Database (with test database)

E2E Tests
├─ Complete workflows
└─ Production-like environment
```

## Deployment Architecture

### Development
```
Node.js + ts-node
    ↓
Local Machine
    ↓
MongoDB Atlas (cloud)
```

### Production
```
Node.js (compiled from TypeScript)
    ↓
Container (Docker) or Serverless
    ↓
Load Balancer
    ↓
MongoDB Atlas Cluster with Replicas
```

## Code Organization Principles

1. **Single Responsibility**: Each file has one purpose
2. **DRY (Don't Repeat Yourself)**: Utilities for common operations
3. **SOLID Principles**: 
   - Single Responsibility
   - Open/Closed
   - Liskov Substitution
   - Interface Segregation
   - Dependency Inversion
4. **Clean Code**: Readable, maintainable, well-documented

## File Naming Conventions

```
Controllers:    userController.ts (camelCase)
Services:       userService.ts (camelCase)
Models:         User.ts (PascalCase)
Types:          index.ts (generic)
Utils:          validators.ts (camelCase, plural)
Middleware:     errorHandler.ts (camelCase)
Routes:         userRoutes.ts (camelCase)
```

## Dependencies Overview

| Package | Purpose | Version |
|---------|---------|---------|
| express | Web framework | ^4.18.2 |
| mongoose | MongoDB ODM | ^8.0.0 |
| dotenv | Environment config | ^16.3.1 |
| helmet | Security headers | ^7.1.0 |
| cors | Cross-origin | ^2.8.5 |
| joi | Validation | ^17.11.0 |
| morgan | Logging | ^1.10.0 |
| http-status-codes | HTTP codes | ^2.3.0 |

## Future Enhancements

1. **Authentication & Authorization**
   - JWT tokens
   - User roles
   - Protected endpoints

2. **Caching Layer**
   - Redis for frequently accessed data
   - Cache invalidation strategies

3. **Advanced Features**
   - Budget alerts
   - Recurring expenses
   - Multi-currency support
   - Export to CSV/PDF

4. **Monitoring & Analytics**
   - APM tools
   - Error tracking
   - Performance metrics
   - Usage analytics

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Load testing

---

This architecture provides a solid foundation for a scalable, maintainable backend service following industry best practices.
