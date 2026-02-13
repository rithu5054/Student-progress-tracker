# 🔄 Student Learning Progress Tracker - Workflow Documentation

---

## 📋 Table of Contents
1. [Application Startup Workflow](#application-startup-workflow)
2. [Authentication Flow](#authentication-flow)
3. [Student Workflow](#student-workflow)
4. [Staff Workflow](#staff-workflow)
5. [Data Flow Architecture](#data-flow-architecture)
6. [API Request-Response Cycle](#api-request-response-cycle)
7. [Gamification System Workflow](#gamification-system-workflow)

---

## 🚀 Application Startup Workflow

### **1. Initial Setup**
```
Developer
  │
  ├─→ Install Dependencies (npm install)
  │     ├─→ Backend dependencies (Express, Mongoose, JWT, etc.)
  │     └─→ Frontend dependencies (React, Vite, Tailwind, etc.)
  │
  ├─→ Configure Environment (.env file)
  │     ├─→ MongoDB URI
  │     ├─→ JWT Secret
  │     └─→ Port number
  │
  └─→ Seed Database (node seed.js)
        ├─→ Create Users (Staff & Students)
        ├─→ Create Subjects
        ├─→ Create Topics (with sequential order)
        ├─→ Create Study Materials
        └─→ Create Initial Progress Records
```

### **2. Application Launch**
```
Terminal 1: Backend Server
  │
  └─→ npm run dev (port 5000)
        ├─→ Load environment variables
        ├─→ Connect to MongoDB
        ├─→ Start Express server
        └─→ Listen for API requests

Terminal 2: Frontend Development Server
  │
  └─→ npm run dev (port 5173)
        ├─→ Start Vite dev server
        ├─→ Compile React components
        ├─→ Apply Tailwind CSS
        └─→ Open browser at localhost:5173
```

---

## 🔐 Authentication Flow

### **Registration Process**
```
User (Frontend)
  │
  ├─→ Fill Registration Form
  │     ├─→ Name
  │     ├─→ Username
  │     ├─→ Password
  │     └─→ Role (Student/Staff)
  │
  └─→ Submit Form
        │
        ├─→ POST /api/auth/register
        │
        └─→ Backend (authController.js)
              ├─→ Validate input
              ├─→ Check if username exists
              ├─→ Hash password (bcryptjs)
              ├─→ Create user in MongoDB
              ├─→ Generate JWT token
              └─→ Return token + user data
                    │
                    └─→ Frontend stores token in:
                          ├─→ localStorage
                          └─→ AuthContext
                                │
                                └─→ Redirect to Dashboard
                                      ├─→ Student → StudentDashboard
                                      └─→ Staff → StaffDashboard
```

### **Login Process**
```
User (Frontend)
  │
  ├─→ Enter Credentials
  │     ├─→ Username
  │     └─→ Password
  │
  └─→ Submit Login
        │
        ├─→ POST /api/auth/login
        │
        └─→ Backend (authController.js)
              ├─→ Find user by username
              ├─→ Compare password with hash
              ├─→ Generate JWT token
              └─→ Return token + user data
                    │
                    └─→ Frontend
                          ├─→ Store token
                          ├─→ Update AuthContext
                          └─→ Redirect based on role
```

### **Protected Route Access**
```
User makes request to protected endpoint
  │
  └─→ Request includes: Authorization: Bearer <token>
        │
        └─→ Backend Middleware (authMiddleware.js)
              ├─→ Extract token from header
              ├─→ Verify token with JWT_SECRET
              ├─→ Decode user ID from token
              ├─→ Fetch user from database
              ├─→ Attach user to request (req.user)
              └─→ Allow or deny access
                    ├─→ ✅ Valid → Proceed to controller
                    └─→ ❌ Invalid → Return 401 Unauthorized
```

---

## 🎓 Student Workflow

### **Dashboard Overview**
```
Student Logs In
  │
  └─→ StudentDashboard.jsx
        │
        ├─→ Fetch Dashboard Stats (GET /api/progress/stats)
        │     │
        │     └─→ Backend calculates:
        │           ├─→ Current streak
        │           ├─→ Badges earned
        │           ├─→ Academic health score
        │           └─→ Weak areas (topics < 40% or Low confidence)
        │
        ├─→ Fetch Enrolled Subjects (GET /api/subjects)
        │     └─→ Returns list of subjects student is enrolled in
        │
        └─→ Display Dashboard
              ├─→ Top Section: Streak, Health, Badges
              ├─→ Middle: Weak Areas Alert (if any)
              └─→ Bottom: Subject Cards
```

### **Subject Roadmap View**
```
Student Clicks on Subject Card
  │
  └─→ Trigger fetchSubjectDetails(subjectId)
        │
        ├─→ GET /api/topics/subject/:subjectId
        │     └─→ Returns all topics sorted by order
        │
        ├─→ GET /api/progress/student/:subjectId
        │     └─→ Returns student's progress for each topic
        │           ├─→ completionPercentage
        │           ├─→ confidenceLevel
        │           ├─→ isUnlocked (true/false)
        │           └─→ assessmentScore (if taken)
        │
        └─→ GET /api/materials/subject/:subjectId
              └─→ Returns all study materials for the subject
                    │
                    └─→ Display Roadmap
                          ├─→ Topics as sequential levels
                          ├─→ Locked topics show 🔒
                          ├─→ Unlocked topics show progress %
                          └─→ Completed topics show ✅
```

### **Topic Interaction**
```
Student Clicks Unlocked Topic
  │
  └─→ Show Topic Detail View
        │
        ├─→ Display Progress Update Form
        │     ├─→ Completion % (slider)
        │     └─→ Confidence Level (dropdown)
        │
        ├─→ Display Study Materials
        │     ├─→ PDFs (download links)
        │     └─→ External links
        │
        └─→ Save Progress Button
              │
              └─→ POST /api/progress
                    ├─→ topicId
                    ├─→ completionPercentage
                    └─→ confidenceLevel
                          │
                          └─→ Backend (progressController.js)
                                │
                                ├─→ Update streak (if new day)
                                │     ├─→ Check last activity date
                                │     ├─→ Increment or reset streak
                                │     └─→ Update lastActivity
                                │
                                ├─→ Update/Create Progress record
                                │
                                ├─→ Check Unlock Conditions
                                │     └─→ If completion >= 70% AND confidence = High:
                                │           ├─→ Find next topic by order
                                │           └─→ Set isUnlocked = true
                                │
                                ├─→ Check Badge Conditions
                                │     └─→ If completion >= 80% AND confidence = High:
                                │           └─→ Award "Topic Master" badge
                                │
                                └─→ Return response
                                      ├─→ Updated progress
                                      ├─→ Streak count
                                      ├─→ Badges array
                                      ├─→ newBadge (if just earned)
                                      └─→ unlockedNext (true/false)
                                            │
                                            └─→ Frontend shows notifications
                                                  ├─→ "🎉 New Badge Earned!"
                                                  └─→ "🔓 Next Topic Unlocked!"
```

---

## 👨‍🏫 Staff Workflow

### **Dashboard Overview**
```
Staff Logs In
  │
  └─→ StaffDashboard.jsx
        │
        ├─→ Fetch Subjects (GET /api/subjects)
        │     └─→ Returns subjects created by this staff member
        │
        └─→ Select Subject from Dropdown
              │
              └─→ Fetch Dashboard Data
                    ├─→ GET /api/topics/:subjectId
                    │     └─→ All topics for subject
                    │
                    └─→ GET /api/progress/staff/:subjectId
                          └─→ Progress data for all enrolled students
                                ├─→ Student name
                                ├─→ Average coverage %
                                └─→ Individual topic progress
```

### **Tab Navigation**
```
Staff Dashboard Tabs:
  │
  ├─→ Overview Tab
  │     ├─→ Total Students
  │     ├─→ Total Topics
  │     ├─→ Average Progress
  │     └─→ At-Risk Students (< 40% progress)
  │
  ├─→ Topics Tab (TopicManager.jsx)
  │     ├─→ View all topics
  │     ├─→ Add new topic
  │     │     └─→ POST /api/topics
  │     │           ├─→ name
  │     │           └─→ subjectId
  │     └─→ Delete topic
  │           └─→ DELETE /api/topics/:id
  │
  ├─→ Materials Tab (MaterialManager.jsx)
  │     ├─→ View materials by topic
  │     ├─→ Add new material
  │     │     └─→ POST /api/materials
  │     │           ├─→ topicId
  │     │           ├─→ title
  │     │           ├─→ type (pdf/link)
  │     │           └─→ url
  │     └─→ Delete material
  │           └─→ DELETE /api/materials/:id
  │
  └─→ Students Tab (StudentProgress.jsx)
        ├─→ View enrolled students
        ├─→ Enroll new student
        │     └─→ POST /api/subjects/:subjectId/enroll
        │           └─→ username (case-insensitive search)
        └─→ View individual student progress
```

### **Create New Subject**
```
Staff Clicks "Create New Subject"
  │
  └─→ Open Modal
        │
        ├─→ Enter Subject Details
        │     ├─→ Name
        │     └─→ Code
        │
        └─→ Submit Form
              │
              └─→ POST /api/subjects
                    ├─→ name
                    ├─→ code
                    └─→ staffId (from JWT token)
                          │
                          └─→ Backend creates subject
                                └─→ Return new subject data
                                      │
                                      └─→ Frontend adds to list
                                            └─→ Auto-select new subject
```

---

## 🗄️ Data Flow Architecture

### **Complete Request-Response Flow**
```
FRONTEND (React)
  │
  ├─→ User Action (Click, Submit, etc.)
  │
  └─→ Component Handler Function
        │
        └─→ Axios HTTP Request
              │
              ├─→ Headers: { Authorization: Bearer <token> }
              ├─→ Method: GET/POST/PUT/DELETE
              └─→ URL: http://localhost:5000/api/...
                    │
                    ▼
              NETWORK LAYER
                    │
                    ▼
              BACKEND (Express)
                    │
                    ├─→ Route (e.g., /api/progress)
                    │     └─→ routes/progressRoutes.js
                    │
                    ├─→ Middleware
                    │     ├─→ protect (verify JWT)
                    │     └─→ authorize (check role)
                    │
                    └─→ Controller
                          └─→ controllers/progressController.js
                                │
                                ├─→ Business Logic
                                │     ├─→ Validate input
                                │     ├─→ Process data
                                │     └─→ Apply gamification rules
                                │
                                └─→ Database Query
                                      │
                                      ▼
                              MONGODB
                                      │
                                      ├─→ Find documents
                                      ├─→ Update documents
                                      ├─→ Create documents
                                      └─→ Delete documents
                                            │
                                            └─→ Return data
                                                  │
                                                  ▼
                                            CONTROLLER
                                                  │
                                                  └─→ Format response
                                                        └─→ res.json(data)
                                                              │
                                                              ▼
                                                        NETWORK LAYER
                                                              │
                                                              ▼
                                                        FRONTEND
                                                              │
                                                              ├─→ Update React State
                                                              ├─→ Re-render Components
                                                              └─→ Show updated UI
```

---

## 🎮 Gamification System Workflow

### **Streak Tracking**
```
Student Updates Progress
  │
  └─→ Backend checks:
        │
        ├─→ Get user.lastActivity (Date)
        ├─→ Get current date
        │
        └─→ Compare dates:
              │
              ├─→ Same Day?
              │     └─→ No change to streak
              │
              ├─→ Consecutive Day (yesterday)?
              │     └─→ Increment streak by 1
              │
              └─→ Gap in dates?
                    └─→ Reset streak to 1
                          │
                          └─→ Save user.streak and user.lastActivity
```

### **Roadmap Unlocking (Candy Crush Style)**
```
Student Completes Update
  │
  └─→ Backend checks if unlock conditions met:
        │
        ├─→ completionPercentage >= 70%?
        └─→ confidenceLevel === "High"?
              │
              └─→ YES (both true)
                    │
                    ├─→ Find current topic's order
                    ├─→ Find next topic (order + 1)
                    │
                    └─→ Check next topic's unlock status
                          │
                          ├─→ Already unlocked?
                          │     └─→ Do nothing
                          │
                          └─→ Still locked?
                                └─→ Set isUnlocked = true
                                      └─→ Return unlockedNext: true
```

### **Badge System**
```
Progress Update
  │
  └─→ Check badge conditions:
        │
        ├─→ Topic Master:
        │     └─→ completion >= 80% AND confidence = High
        │           └─→ Add "Topic Master" to user.badges[]
        │
        ├─→ Subject Achiever:
        │     └─→ Overall subject progress >= 75%
        │           └─→ Add "Subject Achiever" to user.badges[]
        │
        └─→ Academic Star:
              └─→ Academic health >= 80%
                    └─→ Add "Academic Star" to user.badges[]
                          │
                          └─→ Return newBadge: "badge name"
```

### **Academic Health Calculation**
```
GET /api/progress/stats
  │
  └─→ For each enrolled subject:
        │
        ├─→ Get all topics in subject
        ├─→ Get student's progress for each topic
        ├─→ Calculate average completion %
        │
        └─→ Calculate overall average across all subjects
              │
              ├─→ >= 70% → 🟢 Healthy Learner
              ├─→ >= 40% → 🟡 Moderate
              └─→ < 40%  → 🔴 Needs Improvement
```

### **Weak Area Identification**
```
Dashboard Stats API
  │
  └─→ Query Progress collection:
        │
        └─→ Find records where:
              ├─→ completionPercentage < 40%
              └─→ OR confidenceLevel = "Low"
                    │
                    └─→ Return array of:
                          ├─→ Topic name
                          └─→ Reason (Low Coverage / Low Confidence)
```

---

## 🔄 Complete User Journey Examples

### **Example 1: New Student First Login**
```
1. Student registers → Creates account
2. Login with credentials → Receives JWT token
3. Dashboard loads → Shows:
   - Streak: 0 days
   - Health: 0%
   - Badges: None
   - Subjects: Enrolled subjects
4. Clicks subject → Sees roadmap:
   - Topic 1: ✅ Unlocked (order: 0)
   - Topic 2-5: 🔒 Locked
5. Clicks Topic 1 → Opens details
6. Updates progress:
   - Completion: 80%
   - Confidence: High
7. Saves → Backend:
   - ✅ Awards "Topic Master" badge
   - ✅ Unlocks Topic 2
   - ✅ Sets streak to 1
8. Returns to dashboard → Sees notification:
   - "🎉 New Badge: Topic Master!"
   - "🔓 Next Topic Unlocked!"
```

### **Example 2: Staff Creates Course Content**
```
1. Staff logs in → Dashboard loads
2. Clicks "Create New Subject"
3. Enters: "Machine Learning" (ML101)
4. Submits → Subject created
5. Switches to Topics tab
6. Adds topics:
   - "Introduction to ML" (order: 0)
   - "Supervised Learning" (order: 1)
   - "Neural Networks" (order: 2)
7. Switches to Materials tab
8. Uploads materials:
   - PDF: "ML Lecture Notes.pdf"
   - Link: "Coursera ML Course"
9. Switches to Students tab
10. Enrolls students:
    - Searches "alex" → Enrolls
    - Searches "riya" → Enrolls
11. Views progress → Monitors student performance
```

---

## 📊 Database Schema Relationships

```
┌─────────────┐
│    User     │
├─────────────┤
│ _id         │◄────┐
│ username    │     │
│ role        │     │
│ badges[]    │     │
│ streak      │     │
└─────────────┘     │
                    │
┌─────────────┐     │
│   Subject   │     │
├─────────────┤     │
│ _id         │     │
│ staffId     │─────┘
│ students[]  │─────┐
└─────────────┘     │
       │            │
       │            │
       ▼            │
┌─────────────┐     │
│    Topic    │     │
├─────────────┤     │
│ _id         │◄──┐ │
│ subjectId   │   │ │
│ order       │   │ │
└─────────────┘   │ │
       │          │ │
       │          │ │
       ▼          │ │
┌─────────────┐   │ │
│  Material   │   │ │
├─────────────┤   │ │
│ topicId     │───┘ │
│ title       │     │
│ url         │     │
└─────────────┘     │
                    │
┌─────────────┐     │
│  Progress   │     │
├─────────────┤     │
│ studentId   │─────┘
│ topicId     │─────┐
│ completion  │     │
│ confidence  │     │
│ isUnlocked  │     │
└─────────────┘     │
                    │
                    └───────┐
                            │
                    (Relationship)
```

---

## 🎯 Summary

This application follows a **clean, modular architecture** with:

- ✅ **Clear separation of concerns** (Frontend/Backend)
- ✅ **RESTful API design**
- ✅ **JWT-based authentication**
- ✅ **Real-time gamification logic**
- ✅ **Role-based access control**
- ✅ **Responsive React UI**

Every user action triggers a **well-defined workflow** that ensures data consistency, security, and an engaging user experience! 🚀
