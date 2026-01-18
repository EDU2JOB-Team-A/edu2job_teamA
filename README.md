# Edu2Job API & Frontend

**Edu2Job** is an AI-powered career guidance platform that bridges the gap between education and career success. This repository contains the source code for both the Django backend and React frontend.

## 🚀 Features Implemented

### 1. Authentication & Security
- **JWT Authentication**: Secure login and registration using `djangorestframework-simplejwt`.
- **Role-Based Access Control (RBAC)**: Distinct roles for `User` and `Admin`.
- **Protected Routes**: Frontend routes (`/dashboard`, `/profile`, `/admin`) are protected and accessible only to authorized users.

### 2. User Dashboard & Profile
- **Public Landing Page**: Professional "Industry Use" landing page with feature highlights.
- **User Dashboard**: Personalized dashboard showing user stats and recommended roles.
- **Profile Management**:
    - **Education**: Add, view, and delete educational qualifications.
    - **Job History**: Manage professional work experience.

### 3. Admin Panel
- **Dedicated Admin Dashboard**: Accessible only to users with `role='admin'`.
- **User Management**: Admins can view all registered users.
- **Role Management**: Admins can promote/demote users (User ↔ Admin) and delete accounts.

### 4. Technical Stack
- **Backend**: Django, Django REST Framework, MySQL (Cloud), Python.
- **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Axios.

---

## 🛠️ Setup Instructions

### Backend Setup
1.  Navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Create virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # Windows
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run migrations:
    ```bash
    python manage.py migrate
    ```
5.  Start server:
    ```bash
    python manage.py runserver
    ```

### Frontend Setup
1.  Navigate to `frontend/`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start development server:
    ```bash
    npm run dev
    ```

### Creating an Admin User
Run the included script to create an admin user:
```bash
cd backend
python create_admin.py
```
Default credentials:
- **Email**: `admin@gmail.com`
- **Password**: `admin123`

---

## 🤝 Collaboration Workflow (Team A)

We follow a strict **Feature Branch Workflow**.
Please read the detailed [Collaboration Guide](COLLABORATION.md) before contributing.

**Quick Summary:**
1.  **Pull Latest**: `git pull origin master`
2.  **Create Branch**: `git checkout -b feature/your-name`
3.  **Commit**: `git commit -m "feat: added login"`
4.  **Push**: `git push origin feature/your-name`
5.  **Pull Request**: Open a PR on GitHub for review.

---
&copy; 2026 Edu2Job Team A
