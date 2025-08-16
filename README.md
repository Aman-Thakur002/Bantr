# Bantr - WhatsApp-like Chat Application

A modern, real-time chat application built with React, Node.js, and MongoDB.

## 🚀 Features

### Authentication
- ✅ User registration with email/phone
- ✅ Login with email or phone
- ✅ JWT-based authentication with refresh tokens
- ✅ Password reset via email (Brevo integration)
- ✅ Session management

### Chat Features
- 💬 Real-time messaging with Socket.IO
- 👥 Group conversations
- 📎 File attachments (images, documents)
- 😊 Message reactions
- 📱 Read receipts
- 🔍 Message search

### Additional Features
- 🎮 Tic-Tac-Toe game integration
- 🤖 AI chat integration (OpenAI, Gemini, etc.)
- 📞 Voice/Video calls
- 🌙 Dark/Light theme
- 📱 Responsive design

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Brevo** - Email service
- **Multer** - File uploads

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Zustand** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time updates

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB
- Brevo API key (for emails)

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd bantr

# Start development servers
./start-dev.sh
```

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=8080
MONGO_URI=mongodb://localhost:27017/bantr
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
BREVO_API_KEY=your-brevo-api-key
DEFAULT_FROM_EMAIL=noreply@bantr.com
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_SOCKET_URL=http://localhost:8080
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/password/forgot` - Request password reset
- `POST /api/v1/auth/password/reset` - Reset password
- `POST /api/v1/auth/password/change` - Change password

### User Endpoints
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/search` - Search users
- `GET /api/v1/users/contacts` - Get user contacts

### Chat Endpoints
- `GET /api/v1/conversations` - Get conversations
- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/messages` - Get messages
- `POST /api/v1/messages` - Send message

### Game Endpoints
- `POST /api/v1/games/tictactoe` - Create Tic-Tac-Toe game
- `POST /api/v1/games/tictactoe/:id/join` - Join game
- `POST /api/v1/games/tictactoe/:id/move` - Make move

## 🔐 Security Features

- **JWT Authentication** with access/refresh token rotation
- **Password Hashing** with bcrypt
- **Rate Limiting** on auth endpoints
- **Input Validation** with Joi
- **CORS Protection**
- **Helmet Security Headers**
- **Email Verification** for password resets

## 🧪 Testing

```bash
# Test API endpoints
cd backend
node test-api.js

# Run backend tests
npm test

# Run frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your preferred platform (Heroku, AWS, etc.)
3. Ensure MongoDB connection is configured

### Frontend Deployment
1. Update `VITE_API_BASE_URL` to production backend URL
2. Build the application: `npm run build`
3. Deploy to static hosting (Vercel, Netlify, etc.)

## 📱 Usage

1. **Register/Login**: Create account or login with email/phone
2. **Start Chatting**: Create conversations and send messages
3. **Play Games**: Start Tic-Tac-Toe games in conversations
4. **AI Chat**: Use AI features for enhanced conversations
5. **Customize**: Switch themes and update profile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@bantr.com or create an issue in the repository.