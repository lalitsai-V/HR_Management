# VisoVersa - Employee Management System

VisoVersa is a modern, modular, production-ready full-stack application built with React, Node.js, and Supabase.

## Features
- Role-based Access Control (Admin / User)
- Modern SaaS Dashboard UI with Data Visualization (Recharts)
- Dark Mode / Light Mode with LocalStorage Persistence
- Dynamic Smart Employee ID Generation
- CSV Data Export
- Comprehensive Activity Logging

## Installation Instructions

1. **Clone the repository or navigate to this folder**
   Ensure you have both `frontend` and `backend` directories.

2. **Configure Database (Supabase)**
   - Create a new project in [Supabase](https://supabase.com/).
   - Go to the SQL Editor and run the SQL provided in `backend/database.sql`.
   - Get your **Project URL** and **anon key** from Project Settings > API.

3. **Backend Setup**
   - Navigate to the `backend` folder:
     ```bash
     cd backend
     ```
   - Open `.env` and fill in your Supabase credentials:
     ```
     PORT=5000
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     JWT_SECRET=supersecretjwtkey_viso_versa
     ```
   - Install dependencies and start the dev server:
     ```bash
     npm install
     npm run dev
     ```

4. **Frontend Setup**
   - Open a **new terminal** and navigate to the `frontend` folder:
     ```bash
     cd frontend
     ```
   - Ensure the API URL is matching your backend (default is `http://localhost:5000/api` in `frontend/src/services/api.js`).
   - Install dependencies and start the Vite dev server:
     ```bash
     npm install
     npm run dev
     ```

5. **Usage**
   - Open the provided localhost link from Vite (e.g. `http://localhost:5173`).
   - Register a new account.
   - For demo purposes, you can manually change your user role to `'admin'` directly in the Supabase Table Editor if you want to test Admin features, or modify the Registration endpoint to assign admin automatically.
