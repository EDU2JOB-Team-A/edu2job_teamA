# Edu2Job API & Frontend

**Edu2Job** is an AI-powered career guidance platform that bridges the gap between education and career success. This repository contains the source code for both the Django backend and React frontend.

## 🚀 Features Implemented

### 1. AI & Machine Learning Integration
- **Career Prediction Engine**: Sophisticated ML model (`backend/ml`) that analyzes user education, skills, and interests to predict suitable job roles with confidence scores.
- **Prediction History**: Users can track their career prediction trends over time.
- **N8N AI Agent**: Natural language database querying powered by n8n workflow integration.

### 2. Smart Resume Builder
- **Dynamic Resume Generation**: Create professional resumes automatically pulling from your profile data.
- **Customizable Templates**: Choose from multiple professional layouts.
- **Downloadable Formats**: Export resumes ensuring ATS compatibility.

### 3. Authentication & Security
- **JWT Authentication**: Secure login/registration with `djangorestframework-simplejwt`.
- **Google OAuth**: Seamless sign-in with Google.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `User` and `Admin`.
- **Secure Password Management**: Change password functionality with proper validation.

### 4. Comprehensive User Profile
- **Extended Profile Details**:
    - **Personal**: Profile picture, banner image, bio.
    - **Education**: Detailed academic history with CGPA.
    - **Professional**: Job history and experience.
    - **Skills & Certifications**: Dedicated sections to showcase expertise.
- **Dashboard**: Personalized insights and recommended roles.

### 5. Admin Capabilities
- **Admin Dashboard**: Manage users and system stats.
- **Data Visualization**: Charts and analytics for user demographics and system usage.
- **User Management**: Promote/demote users, delete accounts.

### 6. Technical Stack
- **Backend**: Django, Django REST Framework, MySQL (Cloud), Scikit-learn (ML), Pandas.
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion (Animations), Axios.
- **Integration**: n8n (Workflow Automation).

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
