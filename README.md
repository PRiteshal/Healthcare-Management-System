# 🏥 MedCore – Healthcare Management System
### MERN Stack | JWT Auth | Role-Based Access | Full CRUD

---

## 📁 Project Structure

```
healthcare/
├── server/               ← Node.js + Express + MongoDB
│   ├── models/
│   │   ├── User.js       ← Auth (admin/doctor/patient)
│   │   ├── Patient.js    ← Patient records
│   │   ├── Appointment.js
│   │   └── Doctor.js
│   ├── routes/
│   │   ├── auth.js       ← /api/auth
│   │   ├── patients.js   ← /api/patients
│   │   ├── appointments.js
│   │   ├── doctors.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js       ← JWT verify + role check
│   ├── .env.example
│   └── server.js
│
└── client/               ← React.js frontend
    └── src/
        ├── context/
        │   └── AuthContext.jsx   ← JWT state management
        ├── utils/
        │   └── api.js            ← Axios + interceptors
        ├── components/
        │   ├── Layout.jsx        ← Sidebar + topbar
        │   └── PrivateRoute.jsx  ← Route guards
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx
            ├── PatientsPage.jsx
            ├── AppointmentsPage.jsx
            └── DoctorsPage.jsx
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

---

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your MongoDB URI and a secret key
npm run dev
# Server starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd client
npm install
npm start
# App opens on http://localhost:3000
```

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Private | Get current user |
| PUT | /api/auth/change-password | Private | Change password |

### Patients
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/patients | Admin, Doctor | List all (with search/filter) |
| GET | /api/patients/:id | Admin, Doctor | Get single patient |
| POST | /api/patients | Admin, Doctor | Create patient |
| PUT | /api/patients/:id | Admin, Doctor | Update patient |
| DELETE | /api/patients/:id | Admin only | Delete patient |

### Appointments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/appointments | Admin, Doctor | List (filter by date/status) |
| GET | /api/appointments/today | Admin, Doctor | Today's schedule |
| POST | /api/appointments | All roles | Book appointment |
| PUT | /api/appointments/:id | Admin, Doctor | Update |
| DELETE | /api/appointments/:id | Admin only | Cancel |

### Doctors
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/doctors | All logged-in | List doctors |
| POST | /api/doctors | Admin only | Add doctor |
| PUT | /api/doctors/:id | Admin only | Update |
| DELETE | /api/doctors/:id | Admin only | Remove |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/dashboard/stats | Admin, Doctor | Live stats |

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access — manage patients, doctors, appointments, users |
| **Doctor** | View/manage patients and appointments |
| **Patient** | Book appointments, view own records |

---

## ✅ Features Implemented

- [x] JWT-based login with token stored in localStorage
- [x] Role-based protected routes (React + Express)
- [x] Patient CRUD with auto-generated IDs (P001, P002...)
- [x] Appointment booking with doctor/patient linking
- [x] Doctor management with availability status
- [x] Live dashboard stats from MongoDB aggregation
- [x] Search and filter on patient/appointment lists
- [x] Password hashing with bcryptjs
- [x] Token auto-attach via Axios interceptors
- [x] Auto-redirect to login on token expiry

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| State Management | Context API + useState |
| HTTP Client | Axios (with JWT interceptors) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Styling | Inline CSS (dark theme, no dependencies) |
