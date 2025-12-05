# ArticleHub - MERN Stack Article Management System

A streamlined article management application built with the MERN stack featuring JWT authentication, role-based access control, and AI-powered summarization.

## 🛠️ Requirements Met

### 1. Authentication + Authorization
- ✅ **POST /auth/register** – Register a user (default role: user)
- ✅ **POST /auth/login** – Login to receive JWT
- ✅ **JWT Authentication Middleware**
- ✅ **Role-based Authorization** (admin/user)
- ✅ **Admin-only** article deletion
- ✅ **Optional user viewing** for admins

### 2. Article CRUD (Protected Routes)
Each article has: title, content, tags[], summary, createdBy
- ✅ **POST /articles** – Create article
- ✅ **GET /articles** – Get all articles
- ✅ **GET /articles/:id** – Get single article
- ✅ **PUT /articles/:id** – Edit (owner or admin)
- ✅ **DELETE /articles/:id** – Admin only

### 3. LLM Integration – Summarize Article
- ✅ **POST /articles/:id/summarize**
- ✅ **Swappable LLM providers**: OpenAI (GPT-3.5) or Gemini Pro
- ✅ **Abstracted service architecture**: `summarizeWithLLM(content, provider)`

### 4. Frontend – Vite.js Application
Pages include:
- ✅ **Login & Register** pages
- ✅ **Dashboard** (list articles with filters/search)
- ✅ **Article view** with content, tags, summary, and metadata
- ✅ **Add/Edit Article** pages  
- ✅ **Summarize button** with loading state
- ✅ **Role-aware UI** (hide delete for users)

## 🌟 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin/User only)
- **Protected routes** and middleware authorization
- **Password hashing** with bcrypt

### 📝 Article Management
- **Full CRUD operations** for articles
- **Markdown editor** support
- **Tag-based categorization**
- **Search and filtering**
- **Admin can delete any article**
- **Users can only edit their own articles**

### 🤖 AI-Powered Summarization
- **Dual LLM support**: OpenAI GPT-3.5 and Google Gemini Pro
- **Swappable AI providers** with abstracted service
- **Intelligent article summarization**
- **Rate limiting** for API protection

### 🎨 Modern UI/UX
- **Responsive design** with TailwindCSS
- **Clean, intuitive interface**
- **Role-aware UI** components
- **Loading states** and notifications

## 🛠️ Tech Stack

### Frontend
- **React 18** with modern hooks and context
- **Vite** for fast development and building
- **TailwindCSS** for responsive styling
- **React Router DOM** for client-side routing
- **Axios** for API communication
- **React Hook Form** for form management
- **React Markdown** for content rendering

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **express-rate-limit** for API protection
- **Helmet.js** for security headers

### AI Integration
- **OpenAI API** (GPT-3.5 Turbo)
- **Google Generative AI** (Gemini Pro)
- **Abstracted LLM service** for provider switching

### DevOps
- **Docker** and **Docker Compose**
- **Nginx** for production serving
- **MongoDB** containerized database
- **Health checks** and monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v7.0 or higher)
- Docker and Docker Compose (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ArticleHub
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   # Required
   JWT_SECRET=your-super-secure-jwt-secret
   
   # Optional AI providers
   OPENAI_API_KEY=your-openai-api-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Start with Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d
   
   # With MongoDB admin panel
   docker-compose --profile admin up -d
   
   # View logs
   docker-compose logs -f
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **MongoDB Admin**: http://localhost:8081 (if admin profile enabled)

### Option 2: Manual Setup

1. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   npm run dev
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

3. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or use local MongoDB installation
   mongod
   ```

## 🔑 Default Credentials

The application comes with pre-configured demo accounts:

### Admin Account
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Admin (can delete articles, manage users)

### User Account
- **Email**: user@example.com
- **Password**: user123
- **Role**: User (can create/edit own articles)

## 📖 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Article Endpoints

#### Get All Articles
```http
GET /api/articles?page=1&limit=10&search=query&tags=tag1,tag2&sort=-createdAt
```

#### Create Article
```http
POST /api/articles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My Article",
  "content": "Article content here...",
  "tags": ["technology", "programming"]
}
```

#### Get Single Article
```http
GET /api/articles/:id
```

#### Update Article
```http
PUT /api/articles/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Article Title",
  "content": "Updated content...",
  "tags": ["updated", "tags"]
}
```

#### Delete Article (Admin Only)
```http
DELETE /api/articles/:id
Authorization: Bearer <jwt_token>
```

#### Generate AI Summary
```http
POST /api/articles/:id/summarize
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "provider": "openai" // or "gemini"
}
```

### User Management (Admin Only)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <admin_jwt_token>
```

#### Toggle User Status
```http
PUT /api/users/:id/toggle-status
Authorization: Bearer <admin_jwt_token>
```

#### Update User Role
```http
PUT /api/users/:id/role
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "role": "admin" // or "user"
}
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/article-management

# JWT
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d

# AI Providers (Optional)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
GEMINI_API_KEY=your-gemini-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LLM_RATE_LIMIT_WINDOW_MS=60000
LLM_RATE_LIMIT_MAX_REQUESTS=5
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### AI Provider Configuration

#### OpenAI Setup
1. Get API key from https://platform.openai.com/
2. Add to backend `.env`: `OPENAI_API_KEY=your-key-here`
3. Optional: Set model `OPENAI_MODEL=gpt-3.5-turbo`

#### Google Gemini Setup
1. Get API key from https://makersuite.google.com/
2. Add to backend `.env`: `GEMINI_API_KEY=your-key-here`

> **Note**: AI providers are optional. The app works without them, but summarization features won't be available.

## 🏗️ Project Structure

```
ArticleHub/
├── backend/                 # Node.js API server
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic services
│   ├── server.js           # Entry point
│   └── Dockerfile          # Backend container config
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main component
│   ├── public/             # Static assets
│   └── Dockerfile          # Frontend container config
├── scripts/                # Utility scripts
├── docker-compose.yml      # Multi-service config
├── .env.example           # Environment template
└── README.md              # This file
```

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** on API endpoints and AI services
- **Input Validation** with express-validator
- **Security Headers** via Helmet.js
- **CORS Configuration** for cross-origin requests
- **Role-based Authorization** middleware
- **SQL Injection Protection** through Mongoose ODM

## 🚢 Deployment

### Docker Production Deployment

1. **Build and deploy**
   ```bash
   # Build for production
   docker-compose -f docker-compose.yml up --build -d
   
   # Scale services if needed
   docker-compose up --scale backend=3 -d
   ```

2. **Environment setup**
   ```bash
   # Set production environment
   export NODE_ENV=production
   export JWT_SECRET=your-production-secret
   ```

### Manual Production Deployment

1. **Backend deployment**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

2. **Frontend deployment**
   ```bash
   cd frontend
   npm run build
   # Serve dist/ folder with nginx or any static server
   ```

### Cloud Deployment Options

- **Vercel/Netlify**: Frontend deployment
- **Railway/Render**: Full-stack deployment
- **AWS/DigitalOcean**: Container deployment
- **MongoDB Atlas**: Cloud database

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📈 Performance Optimizations

- **Database Indexing** for fast queries
- **Pagination** for large datasets
- **Caching** strategies implemented
- **Bundle Optimization** with Vite
- **Image Optimization** and lazy loading
- **Code Splitting** for smaller bundles

## 🔄 Development Workflow

1. **Start development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Make changes and test**
   ```bash
   # Backend changes auto-reload with nodemon
   # Frontend changes auto-reload with Vite HMR
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build for production**
   ```bash
   docker-compose build
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help:

1. Check the documentation above
2. Look at existing issues in the repository
3. Create a new issue with detailed information
4. Join our community discussions

## 🚀 Future Enhancements

- [ ] **Advanced Editor**: Rich text editor with more formatting options
- [ ] **Comments System**: User comments and discussions
- [ ] **Social Features**: Like, share, and bookmark articles
- [ ] **Email Notifications**: Notify users of new articles
- [ ] **Analytics Dashboard**: Detailed usage analytics
- [ ] **Export Features**: PDF export and backup options
- [ ] **Multi-language Support**: Internationalization
- [ ] **Real-time Collaboration**: Live editing features
- [ ] **Advanced Search**: Elasticsearch integration

---

**Built with ❤️ using the MERN stack and modern development practices.**