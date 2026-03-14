# Beyond Classroom — Frontend

> Next.js frontend for the Beyond Classroom mathematics learning platform for Grade 5–12 students.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript (ES2022)
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **HTTP Client:** Axios

## Project Structure

```
client/
├── app/                        # Next.js App Router pages
│   ├── admin/                  # Super Admin Panel (20 modules)
│   │   ├── page.js             # Dashboard
│   │   ├── users/              # User management
│   │   ├── courses/            # Course management
│   │   ├── modules/            # Module management
│   │   ├── lessons/            # Lesson management
│   │   ├── quizzes/            # Quiz management
│   │   ├── analytics/          # Analytics & charts
│   │   ├── notifications/      # Notification center
│   │   ├── emails/             # Email management
│   │   ├── media/              # Media library
│   │   ├── orders/             # Order management
│   │   ├── progress/           # Progress tracking
│   │   ├── certificates/       # Certificate management
│   │   ├── badges/             # Badge management
│   │   ├── announcements/      # Announcements
│   │   ├── content/            # Content management
│   │   ├── tools/              # Tool management
│   │   ├── security/           # Security monitoring
│   │   ├── logs/               # Activity logs
│   │   └── settings/           # Platform settings
│   ├── auth/
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── courses/                # Course catalog
│   ├── learn/[courseId]/       # Learning interface
│   │   ├── lesson/[lessonId]/  # Lesson viewer
│   │   └── quiz/[quizId]/      # Quiz interface
│   ├── dashboard/              # Student dashboard
│   ├── profile/                # User profile
│   ├── tools/                  # Math tools (40+)
│   ├── blogs/                  # Blog section
│   ├── about/                  # About page
│   ├── contact/                # Contact page
│   └── cart/                   # Shopping cart
├── components/
│   ├── Navbar.js               # Role-based navigation
│   ├── Hero.js                 # Landing hero section
│   ├── CourseCard.js           # Course card component
│   ├── PaymentModal.js         # Razorpay payment modal
│   └── tools/                  # 40+ math tool components
│       ├── BasicCalculator.js
│       ├── QuadraticSolver.js
│       ├── GraphingCalculator.js
│       ├── MatrixCalculator.js
│       ├── StatisticsCalculator.js
│       └── ... (35+ more tools)
├── store/
│   ├── store.js                # Redux store
│   └── slices/
│       ├── authSlice.js        # Auth state (with localStorage persistence)
│       ├── cartSlice.js        # Cart state
│       ├── courseSlice.js      # Course state
│       └── notificationSlice.js
├── hooks/
│   └── useAdminAuth.js         # Admin auth guard hook
├── utils/
│   └── api.js                  # Axios instance with auth interceptor
├── .env.local
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Backend server running on port 5000

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/beyond-classroom-frontend.git
cd beyond-classroom-frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

### Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

App starts at `http://localhost:3000`

## Features

### Student Features
- Browse and purchase courses
- Interactive lesson viewer
- Practice problems with hints
- Timed quizzes with results
- Progress tracking dashboard
- 40+ math learning tools
- Certificate on completion

### Admin Features (Super Admin Panel)
- Complete user management
- Course/Module/Lesson/Quiz CRUD
- Real-time analytics with charts
- Notification & email campaigns
- Media library
- Order & payment management
- Progress tracking
- Certificate & badge management
- Security monitoring & IP blocking
- Activity logs
- Platform content management

### Math Tools (40+)
- Basic Calculator
- Quadratic Solver
- Graphing Calculator
- Matrix Calculator
- Statistics Calculator
- Trigonometry Calculator
- Derivative & Integral Calculator
- Fraction Visualizer
- Geometry Visualizer
- Step-by-Step Solver
- Practice Generator
- Daily Challenge
- And many more...

## Authentication

- JWT-based authentication
- Persistent login (localStorage)
- Role-based routing (admin/student)
- OTP email verification on registration

## License

Private — All rights reserved © Beyond Classroom
