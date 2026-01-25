# College Course Syllabus Generator - AI Agent Instructions

## Architecture Overview

This is a modular Express.js REST API using Mongoose ODM with MongoDB. The project follows a **vertical slice architecture** where each feature module (`src/modules/*`) contains all its layers (routes, controller, service, model, validation).

**Key architectural decisions:**
- Each module is self-contained: `index.js` (routes), `controller.js` (HTTP layer), `service.js` (business logic), `model.js` (Mongoose schema + validation), `joiSchema.js` (validation rules)
- Database connection initializes at app startup via `require("./utils/db")` in [app.js](../src/app.js)
- Mongoose middleware (pre-save/pre-update hooks) handle password hashing and Joi validation (see [users/model.js](../src/modules/users/model.js))
- Global error handlers for uncaught exceptions in [server.js](../src/server.js)

## Module Pattern (Critical for New Features)

When adding new modules, follow the exact structure of [src/modules/users/](../src/modules/users/):

1. **index.js**: Define Express routes, import controller
   ```javascript
   router.post("/add-new-user", userController.addUser);
   ```

2. **controller.js**: HTTP handling only, delegate to service layer
   ```javascript
   const userData = req.body;
   const newUser = await userService.createUser(userData);
   res.status(200).json({ status: "success", data: { newUser } });
   ```

3. **service.js**: Business logic, query building (pagination, filtering)
   ```javascript
   const { page = 1, limit = 10 } = query;
   const skip = (page - 1) * limit;
   return User.find(filter).limit(limit).skip(skip).sort({ name: 1 });
   ```

4. **model.js**: Mongoose schema + middleware for validation/hashing
   - Use `pre('save')` hook for password hashing and validation via `validatePayload()`
   - Use `pre('findOneAndUpdate')` hook for update validation and password hashing
   - Static methods for utilities like `hashPassword()`, `verifyPassword()`
   - Instance methods like `getEmail()` for document-specific operations

5. **joiSchema.js**: Separate schemas for `create` and `update` operations

## Database & Environment

- Database config is environment-aware: [configs/db-config.js](../src/configs/db-config.js) reads `process.env.NODE_ENV`
- Use `.env` file for local development (not committed)
- Docker Compose sets up MongoDB + Node app: `docker-compose up` starts both services
- Connection auto-establishes on startup (no manual sync needed with MongoDB)

## Development Workflow

```bash
npm run dev          # Start with nodemon (auto-reload)
npm start           # Production start
docker-compose up   # Full stack (MongoDB + Node)
```

**Important:** Database credentials come from environment variables (`MONGODB_USER`, `MONGODB_PASSWORD`, `MONGODB_DATABASE`, `MONGODB_HOST`, `MONGODB_PORT`). Docker Compose injects these automatically.

## Conventions & Patterns

- **Response format:** Always use `{ status: "success", data: {...} }` or `{ status: "success", message: "...", data: {...} }`
- **Error handling:** Controllers log errors with `console.error()` but don't send responses (needs improvement)
- **Validation:** Happens in Mongoose hooks, not middleware. Validation errors are logged but not returned to client
- **Routing:** Register new modules in [app.js](../src/app.js): `app.use("/api/v1/<module>", require("./modules/<module>/index"))`
- **Rate limiting:** Global 1000 requests per 60 seconds applied to all routes
- **Document IDs:** MongoDB uses `_id` (not `id`) - always use `_id` in queries and filters

## Known Limitations & Technical Debt

- Error handling is incomplete: errors are logged but clients receive no error response
- No validation middleware - all validation happens in model hooks
- No authentication/authorization implemented
- `validatePayload()` only logs errors, doesn't throw or return them
- No test suite despite `npm test` script
- Project name in package.json is generic "modular-project-structure"

## Dependencies to Know

- **Mongoose**: ODM for MongoDB, handles schema validation and middleware hooks
- **Joi**: Schema validation integrated into model lifecycle
- **crypto-js**: Used for SHA256 password hashing (see `User.hashPassword()`)
- **express-rate-limit**: Applied globally, configured for 1000 req/min

## Adding New Features

1. Create module directory under `src/modules/<feature>/`
2. Copy structure from `users` module (5 files minimum)
3. Define Mongoose model with hooks for validation
4. Register route in [app.js](../src/app.js)
5. Follow pagination pattern from [users/service.js](../src/modules/users/service.js) for list operations
6. Use `{ new: true, runValidators: true }` in update operations for validation (see [controller.js](../src/modules/users/controller.js))
