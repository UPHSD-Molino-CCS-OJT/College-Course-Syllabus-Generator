# College Course Syllabus Generator

A full-stack web application for generating and managing college course syllabi. Built with Express.js backend, React frontend, MongoDB database, and following modern architecture patterns.

## 🚀 Features

- **Modular Architecture**: Vertical slice design with self-contained feature modules
- **User Management**: Complete CRUD operations with authentication-ready structure
- **Modern Frontend**: React 18 + Vite + Tailwind CSS 4
- **Secure Password Handling**: SHA256 hashing with crypto-js
- **Data Validation**: Joi schema validation integrated into model lifecycle
- **Rate Limiting**: Global protection against abuse (1000 req/min)
- **MongoDB Integration**: Mongoose ODM with auto-creation of database and collections
- **Docker Support**: Full containerization with Docker Compose
- **Environment-Aware**: Separate configurations for development and production
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Validation**: Joi
- **Security**: crypto-js for password hashing
- **Rate Limiting**: express-rate-limit
- **Development**: Nodemon for hot-reload

### Frontend
- **UI Library**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 4 (Vite plugin)
- **HTTP Client**: Axios
- **Linting**: ESLint

## 📁 Project Structure

```
College-Course-Syllabus-Generator/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API integration
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React entry point
│   ├── vite.config.js       # Vite + Tailwind config
│   └── package.json         # Frontend dependencies
├── src/                      # Backend application
│   ├── app.js               # Express app configuration
│   ├── server.js            # HTTP server & error handlers
│   ├── configs/
│   │   └── db-config.js     # MongoDB connection config
│   ├── modules/             # Feature modules (vertical slices)
│   │   └── users/
│   │       ├── index.js     # Route definitions
│   │       ├── controller.js # HTTP request handlers
│   │       ├── service.js   # Business logic
│   │       ├── model.js     # Mongoose schema
│   │       └── joiSchema.js # Validation schemas
│   └── utils/
│       ├── db.js           # Database connection
│       └── index.js        # Utility functions
├── .env                    # Environment variables (not committed)
├── .env.example           # Environment template
├── docker-compose.yaml    # Docker orchestration
├── Dockerfile            # Container definition
└── package.json          # Backend dependencies & scripts
```

## 📋 Prerequisites

- **Node.js** >= 14.x
- **MongoDB** >= 4.x (or use Docker)
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/College-Course-Syllabus-Generator.git
cd College-Course-Syllabus-Generator
```

### 2. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/college-syllabus-generator

# Alternative: MongoDB with authentication
# MONGODB_URI=mongodb://username:password@localhost:27017/database-name?authSource=admin
```

## 🚀 Running the Application

### Option 1: Local Development (Full Stack)

**Terminal 1 - Start Backend:**
```bash
# Start MongoDB (if not using Docker)
# Then start the backend server
npm run dev
```

Backend will run at `http://localhost:3000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will run at `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173` to use the application.

### Option 2: Backend Only

**Start MongoDB** (if not using Docker):
```bash
# Install and start MongoDB locally
# Or use MongoDB Atlas cloud service
```

**Start the application**:
```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000`

### Option 3: Docker Compose (Recommended)

Start both MongoDB and Node.js app:

```bash
docker-compose up
```

Stop the services:

```bash
docker-compose down
```

Remove volumes (clean start):

```bash
docker-compose down -v
```

**Note:** The frontend is not included in Docker Compose. Run it separately in development mode.

## 📡 API Endpoints

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/add-new-user` | Create a new user |
| GET | `/api/v1/users/` | Get all users (with pagination & filtering) |
| PATCH | `/api/v1/users/:id` | Update user by ID |

### Example Requests

**Create User:**
```bash
curl -X POST http://localhost:3000/api/v1/users/add-new-user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "gender": "Male"
  }'
```

**Get Users (with pagination):**
```bash
curl "http://localhost:3000/api/v1/users?page=1&limit=10&gender=Male"
```

**Update User:**
```bash
curl -X PATCH http://localhost:3000/api/v1/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com"
  }'
```

## 🔒 Response Format

All API responses follow this structure:

**Success:**
```json
{
  "status": "success",
  "message": "Optional message",
  "data": {
    "key": "value"
  }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Error description"
}
```

## 🏗️ Adding New Features

Follow the modular pattern:

1. Create module directory: `src/modules/<feature>/`
2. Add 5 core files:
   - `index.js` - Routes
   - `controller.js` - HTTP handlers
   - `service.js` - Business logic
   - `model.js` - Mongoose schema
   - `joiSchema.js` - Validation
3. Register routes in `src/app.js`:
   ```javascript
   app.use("/api/v1/<feature>", require("./modules/<feature>/index"));
   ```

## 🧪 Development Guidelines

- **Validation**: Defined in Mongoose pre-save/pre-update hooks
- **Password Hashing**: Automatic via model middleware
- **Pagination**: Use `page` and `limit` query parameters
- **MongoDB IDs**: Always use `_id` (not `id`)
- **Query Options**: Use `{ new: true, runValidators: true }` for updates

## 🐳 Docker Details

The `docker-compose.yaml` sets up:

- **MongoDB**: Latest image on port 27017
- **Node App**: Built from Dockerfile on port 3000
- **Health Checks**: Ensures MongoDB is ready before starting Node
- **Volumes**: Persistent data storage for MongoDB

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | Full MongoDB connection string | - |
| `MONGODB_USER` | MongoDB username (alternative) | `test` |
| `MONGODB_PASSWORD` | MongoDB password (alternative) | `test` |
| `MONGODB_HOST` | MongoDB host (alternative) | `localhost` |
| `MONGODB_PORT` | MongoDB port (alternative) | `27017` |
| `MONGODB_DATABASE` | Database name (alternative) | `test` |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Joi Validation](https://joi.dev/api/)

## 👥 Authors

- Your Name - Initial work

## 🐛 Known Issues

- Error responses not properly sent to clients (logged only)
- No authentication/authorization implemented yet
- Test suite not implemented

## 🗺️ Roadmap

- [ ] Implement authentication (JWT)
- [ ] Add authorization middleware
- [ ] Create comprehensive test suite
- [ ] Implement course syllabus generation
- [ ] Add file upload capabilities
- [ ] Create admin dashboard
- [ ] API documentation with Swagger

