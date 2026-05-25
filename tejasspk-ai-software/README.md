# Tejaskp AI Software — Full-Stack Employee Portal

A modern, professional MERN stack application for employee management, attendance tracking, and admin control.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Lucide React, Chart.js, Axios
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB (via Mongoose)
- **Deployment**: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

## Features
- **JWT Authentication**: Secure login and registration with hashed passwords.
- **Role-Based Access**: Separate interfaces for Employees and Admins.
- **Attendance System**: Real-time Check-In/Check-Out with GPS location tracking.
- **Interactive Dashboard**: Data visualization for working hours and attendance statistics.
- **Admin Panel**: Complete employee management (CRUD) and leave request approvals.
- **Modern UI**: Dark-themed glassmorphic design with neon accents and mobile responsiveness.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (for production) or local MongoDB instance

## Installation

1. **Clone/Download** the repository.
2. **Backend Setup**:
   ```bash
   cd server
   # Fill in the .env file with your credentials (see .env.example)
   npm install
   ```
3. **Frontend Setup**:
   ```bash
   cd client
   npm install
   ```

## Running Locally

From the **root** directory:
1. Run `npm install` to install concurrently and server dependencies.
2. Run `npm run install-all` to install all dependencies for both root and client.
3. Run `npm run dev` to start both the backend and frontend simultaneously.

## Environment Variables (.env)
Create a `.env` file in the `server` folder with:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

## Deployment Guide

### Database (MongoDB Atlas)
1. Create a cluster at [mongodb.com](https://www.mongodb.com/).
2. Get the connection string and add it to your server `.env`.

### Backend (Render)
1. Push the `server` folder to GitHub.
2. Connect the repo to [Render](https://render.com/).
3. Set environment variables in Render settings.

### Frontend (Vercel)
1. Push the `client` folder to GitHub.
2. Connect the repo to [Vercel](https://vercel.com/).
3. Set `REACT_APP_API_URL` environment variable to your Render backend URL.

---
© 2026 Tejaskp AI Software.
