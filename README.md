# 🎓 Beyond Classroom - Elite Mathematics Learning Platform

<div align="center">

![Mathematics Platform](https://img.shields.io/badge/Mathematics-Learning%20Platform-D4AF37?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-D4AF37?style=for-the-badge)

**A premium, full-stack EdTech platform for mathematics education from Grade 5 to Grade 12**

[Features](#-features) • [Demo](#-live-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [Tools](#-calculator-tools)

</div>

---

## 🌟 Overview

Beyond Classroom is a comprehensive, production-ready EdTech solution designed to revolutionize mathematics education. Built with modern technologies and featuring a premium charcoal black & light golden theme, this platform provides an immersive learning experience for students from Grade 5 to Grade 12.

### 🎯 Key Highlights

- **25+ Structured Courses** covering all mathematics topics
- **26 Professional Calculator Tools** for instant problem-solving
- **AI-Powered Learning Paths** with adaptive content
- **Real-time Progress Tracking** and analytics
- **Email OTP Authentication** for secure access
- **Responsive Design** optimized for all devices
- **Premium Dark Theme** with golden accents

---

## ✨ Features

### 🎓 Learning Management
- Comprehensive Course Catalog with 25+ courses
- Grade-wise organization (Grade 5-12, JEE, Board Exams)
- Module-based content with structured lessons
- Real-time progress tracking
- Interactive quizzes and assessments
- Practice problems with solutions
- Certificate generation

### 👤 User Management
- Email OTP authentication system
- Personalized user dashboards
- Course enrollment and purchase
- Shopping cart functionality
- Real-time notifications
- Profile management

### 🧮 Calculator Tools (26 Advanced Tools)

#### Basic & Scientific
- **Basic Calculator** - Standard arithmetic operations
- **Exponent Calculator** - Power and exponential calculations
- **Root Calculator** - Square root, cube root, nth root
- **Logarithm Calculator** - Natural and common logarithms
- **Trigonometry Calculator** - Sin, cos, tan, and inverse functions

#### Algebra & Equations
- **Quadratic Solver** - Solve quadratic equations with steps
- **Linear Equation Solver** - System of linear equations
- **Matrix Calculator** - Matrix operations (add, multiply, determinant)
- **Complex Number Calculator** - Complex arithmetic operations
- **Fraction Calculator** - Fraction operations and simplification

#### Calculus
- **Derivative Calculator** - Find derivatives with step-by-step solutions
- **Integral Calculator** - Definite and indefinite integrals
- **Limit Calculator** - Calculate limits at any point
- **Graphing Calculator** - Plot functions and visualize graphs

#### Statistics & Probability
- **Statistics Calculator** - Mean, median, mode, standard deviation
- **Probability Calculator** - Calculate probabilities
- **Permutation & Combination** - nPr and nCr calculations

#### Number Theory
- **Prime Checker** - Check if a number is prime
- **Factorial Calculator** - Calculate factorials
- **LCM & GCD Calculator** - Least common multiple and greatest common divisor

#### Geometry
- **Area Calculator** - Calculate areas of various shapes
- **Volume Calculator** - Calculate volumes of 3D shapes

#### Advanced Tools
- **Vector Calculator** - Vector operations and calculations
- **Sequence Calculator** - Arithmetic and geometric sequences
- **Ratio Calculator** - Ratio and proportion calculations
- **Percentage Calculator** - Percentage calculations

### 🔐 Admin Panel
- User management dashboard
- Course creation and management
- Content moderation
- Analytics and reporting
- System settings control
- Activity logs

### 🎨 Design & UX
- Premium dark theme (Charcoal #0A0A0A + Golden #D4AF37)
- Smooth animations with Framer Motion
- Fully responsive mobile-first design
- Glass-morphism effects
- Fast performance with Next.js 14

---
## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4
- **State Management**: Redux Toolkit
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Math Rendering**: Math.js
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Email OTP
- **Email Service**: Nodemailer (Gmail SMTP)
- **Validation**: Express Validator
- **Security**: bcryptjs, CORS

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Gmail account for email service

### Step 1: Clone Repository

```bash
git clone https://github.com/mistry371/beyondclassroom.git
cd beyondclassroom
```

### Step 2: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Step 3: Environment Configuration

#### Backend (.env)
Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Beyond Classroom <your_email@gmail.com>
OTP_EXPIRY=10
OTP_LENGTH=6
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 4: Start Development Servers

```bash
# Terminal 1 - Backend
cd server
node server-simple.js

# Terminal 2 - Frontend
cd client
npm run dev
```

### Step 5: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:3000/admin

---

## 📁 Project Structure

```
beyondclassroom/
├── client/                      # Next.js Frontend
│   ├── app/                     # App Router Pages
│   │   ├── admin/              # Admin dashboard
│   │   ├── auth/               # Login/Register
│   │   ├── courses/            # Course pages
│   │   ├── dashboard/          # User dashboard
│   │   ├── learn/              # Learning interface
│   │   ├── tools/              # Calculator tools
│   │   └── page.js             # Homepage
│   ├── components/             # React Components
│   │   ├── tools/              # 26 Calculator components
│   │   ├── Navbar.js
│   │   ├── Hero.js
│   │   └── ...
│   ├── store/                  # Redux Store
│   │   ├── slices/
│   │   └── store.js
│   └── utils/                  # Utilities
│
├── server/                      # Express Backend
│   ├── controllers/            # Route controllers
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── middleware/             # Auth & validation
│   ├── services/               # Business logic
│   └── server-simple.js        # Entry point
│
└── README.md                   # This file
```

---

## 🎯 Pages Overview

### Public Pages
- **Home** (`/`) - Landing page with hero section
- **About** (`/about`) - Platform information
- **Courses** (`/courses`) - Course catalog
- **Tools** (`/tools`) - 26 calculator tools
- **Blogs** (`/blogs`) - Educational blog
- **Contact** (`/contact`) - Contact form
- **Career** (`/career`) - Career opportunities

### Authentication
- **Login** (`/auth/login`) - User login with OTP
- **Register** (`/auth/register`) - User registration

### User Dashboard
- **Dashboard** (`/dashboard`) - User overview
- **Profile** (`/profile`) - Profile management
- **Cart** (`/cart`) - Shopping cart
- **Learn** (`/learn/[courseId]`) - Course learning
- **Notifications** (`/notifications`) - User notifications

### Admin Panel
- **Admin Dashboard** (`/admin`) - Overview
- **Course Management** (`/admin/courses`) - Manage courses
- **User Management** (`/admin/users`) - Manage users
- **Settings** (`/admin/settings`) - Platform settings

---
## 🔌 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          # Register new user
POST   /api/auth/verify-otp        # Verify OTP
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
GET    /api/auth/me                # Get current user
```

### Course Endpoints
```
GET    /api/courses                # Get all courses
GET    /api/courses/:id            # Get course by ID
POST   /api/courses                # Create course (Admin)
PUT    /api/courses/:id            # Update course (Admin)
DELETE /api/courses/:id            # Delete course (Admin)
```

### User Endpoints
```
GET    /api/profile                # Get user profile
PUT    /api/profile                # Update profile
GET    /api/progress/course/:id   # Get course progress
POST   /api/progress               # Update progress
```

### Cart & Orders
```
GET    /api/cart                   # Get user cart
POST   /api/cart                   # Add to cart
DELETE /api/cart/:id               # Remove from cart
POST   /api/orders                 # Create order
GET    /api/orders                 # Get user orders
```

---

## 🌐 Deployment

### Deploy Frontend to Netlify

1. Push code to GitHub (already done!)
2. Visit [Netlify](https://app.netlify.com/start)
3. Click "Import from Git" → Select GitHub
4. Choose `beyondclassroom` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: `client`
6. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
7. Click "Deploy site"

Your site will be live in 2-3 minutes!

### Deploy Backend to Railway/Render

1. Create account on [Railway](https://railway.app) or [Render](https://render.com)
2. Create new project from GitHub
3. Select `beyondclassroom` repository
4. Set root directory to `server`
5. Add environment variables from `.env`
6. Deploy!

---

## 🎨 Theme Customization

Colors are defined in `client/tailwind.config.js`:

```javascript
colors: {
  primary: '#D4AF37',    // Light Golden
  secondary: '#FFD700',  // Bright Gold
  accent: '#C5A572',     // Muted Gold
  dark: {
    DEFAULT: '#0A0A0A',  // Charcoal Black
    100: '#1A1A1A',
    200: '#2A2A2A',
    300: '#3A3A3A',
  }
}
```

---
## 📸 Screenshots

### Homepage
Beautiful landing page with hero section, stats, and featured courses

### Calculator Tools
26 professional calculator tools for all mathematical needs

### Course Learning
Interactive learning interface with modules, lessons, and quizzes

### Admin Dashboard
Comprehensive admin panel for managing users, courses, and content

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Jenish Mistry**

- GitHub: [@mistry371](https://github.com/mistry371)
- Email: mistryjenish1003@gmail.com

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the database solution
- All open-source contributors

---

## 📞 Support

For support, email mistryjenish1003@gmail.com or open an issue on GitHub.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] AI-powered personalized learning paths
- [ ] Live video classes integration
- [ ] Peer-to-peer discussion forums
- [ ] Gamification with badges and leaderboards
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Offline mode support
- [ ] Voice-based learning assistant

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Jenish Mistry](https://github.com/mistry371)

</div>
