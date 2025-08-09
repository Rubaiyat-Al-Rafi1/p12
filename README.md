# GreenLoop - Cloud-Based Recycling Platform

A comprehensive recycling management system built for Bangladesh, connecting users, recycling centers, and green riders through a modern web platform.

## 🚀 Features

### For Users (Consumers/Businesses/Facilities)
- **Account Management**: Register as Consumer, Business, or Recycling Facility
- **Pickup Scheduling**: Schedule waste pickups with preferred dates and times
- **Center Locator**: Find nearby recycling centers with real-time availability
- **Points System**: Earn GreenPoints for recycling activities
- **Activity Tracking**: Monitor your environmental impact and CO₂ savings
- **Dashboard**: Personalized dashboard based on user type

### For Moderators (System Administrators)
- **User Management**: View, monitor, and manage all registered users
- **Pickup Management**: Assign pickups to Green Riders and track status
- **Rider Management**: Manage the Green Riders fleet and availability
- **Analytics**: View system-wide statistics and performance metrics
- **Priority Management**: Set pickup priorities (Low, Medium, High, Urgent)

### For Green Riders
- **Assignment System**: Receive pickup assignments from moderators
- **Route Optimization**: Efficient pickup route management
- **Status Updates**: Update pickup status in real-time
- **Performance Tracking**: Monitor ratings and completed pickups

## 🔐 Login Instructions

### ⚠️ Important: Supabase Setup Required

**Before using the application, you need to connect to Supabase:**

1. **Click "Connect to Supabase"** button in the top right corner of the interface
2. **Set up your Supabase project** with the provided database schema
3. **Configure environment variables** in the `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Regular Users
1. Click "Get Started" or "Sign In" on the homepage
2. Choose your account type:
   - **Consumer**: For individuals/households
   - **Business**: For companies and organizations  
   - **Facility**: For recycling centers
3. Fill in your details and create an account
4. Access your personalized dashboard

### Moderator Access
1. Click "Moderator Access" in the footer
2. **First, create a moderator account in your Supabase database**, then use:
   - **Email**: Your moderator email
   - **Password**: `md1234`
3. Access the full moderator control panel

## 🎯 System Architecture

### User Flow
1. **Registration** → Choose user type and create profile
2. **Dashboard Access** → Personalized interface based on user type
3. **Pickup Scheduling** → Select center, date, time, and items
4. **Moderator Assignment** → Moderator assigns pickup to available rider
5. **Pickup Execution** → Rider completes pickup and updates status
6. **Points Reward** → User earns points for completed recycling

### Moderator Workflow
1. **Login** → Access moderator dashboard
2. **Monitor Pickups** → View all scheduled pickups with filters
3. **Assign Riders** → Match pickups with available Green Riders
4. **Track Progress** → Monitor pickup status and completion
5. **Manage Users** → View user profiles and activity history
6. **Fleet Management** → Add/manage Green Riders and availability

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Deployment**: Netlify Ready

## 🔧 Database Setup

The application now uses **real Supabase integration** instead of mock data. You need to:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the provided SQL migrations** to create the database schema
3. **Set up Row Level Security (RLS)** policies
4. **Configure authentication** settings
5. **Add environment variables** to your project

### Required Tables:
- `profiles` - User information and account details
- `recycling_centers` - Facility locations and capabilities  
- `pickups` - Scheduled pickup requests
- `green_riders` - Delivery/pickup personnel
- `moderators` - System administrator accounts
- `recycling_activities` - Activity tracking and points

## 📊 Database Schema

### Core Tables
- **profiles**: User information and account details
- **recycling_centers**: Facility locations and capabilities
- **pickups**: Scheduled pickup requests
- **green_riders**: Delivery/pickup personnel
- **pickup_assignments**: Rider-pickup assignments
- **recycling_activities**: Activity tracking and points
- **moderators**: System administrator accounts

### Key Features
- **Row Level Security (RLS)**: Secure data access
- **Real-time Updates**: Live status synchronization
- **Point System**: Automated reward calculation
- **Geographic Data**: Location-based center matching

## 🌟 Demo Features

### Live Demo Data
- Pre-populated recycling centers in Dhaka
- Sample user profiles and pickup history
- Mock Green Riders with different vehicle types
- Realistic pickup scenarios and status updates

### Test Scenarios
1. **User Journey**: Sign up → Schedule pickup → Track progress
2. **Moderator Flow**: Login → View pickups → Assign rider → Monitor completion
3. **Multi-user Types**: Test Consumer, Business, and Facility dashboards

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Connect to Supabase** using the "Connect to Supabase" button
4. **Set up your database** with the provided migrations
5. **Configure environment variables** in `.env` file
6. **Run development server**: `npm run dev`
7. **Access the application** at `http://localhost:5173`

## 🔧 Environment Setup

Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔑 Authentication Flow

### User Registration & Login:
1. **Real Supabase Auth** - Users register with email/password
2. **Profile Creation** - Automatic profile creation in `profiles` table
3. **Session Management** - Persistent login sessions
4. **Role-based Access** - Different dashboards for different user types

### Moderator Access:
1. **Database Authentication** - Moderators stored in `moderators` table
2. **Permission System** - Role-based permissions for different actions
3. **Secure Access** - Separate authentication flow from regular users

## 📱 Responsive Design

- **Mobile-First**: Optimized for Bangladesh's mobile-heavy usage
- **Progressive Web App**: Installable on mobile devices
- **Offline Support**: Basic functionality without internet
- **Touch-Friendly**: Large buttons and intuitive gestures

## 🌍 Bangladesh Context

- **Local Language Support**: Bengali/English interface
- **Currency**: Bangladeshi Taka (৳) integration
- **Geographic Focus**: Dhaka and major cities
- **Cultural Adaptation**: Local business practices and preferences

## 🔒 Security Features

- **Authentication**: Secure user login and session management
- **Row Level Security (RLS)**: Database-level security policies
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted sensitive information
- **Input Validation**: Comprehensive form validation
- **SQL Injection Prevention**: Parameterized queries
- **Real-time Security**: Supabase real-time subscriptions with security

## 📈 Future Enhancements

- **Mobile App**: Native iOS/Android applications
- **Payment Integration**: bKash/Nagad payment gateway
- **AI Optimization**: Smart route planning and demand prediction
- **IoT Integration**: Smart bin monitoring
- **Blockchain**: Transparent reward and carbon credit system

---

**GreenLoop** - Building a sustainable future for Bangladesh, one pickup at a time! 🌱♻️