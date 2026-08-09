# 🚀 TaskFlow — Full-Stack Task Management System

<p align="center">
  <strong>A modern, responsive and animated task management platform built for productivity.</strong>
</p>

<p align="center">
  Manage tasks • Track progress • Set deadlines • Receive email reminders
</p>

---



## 📌 About The Project

**TaskFlow** is a full-stack task management application designed to help users create, organize, track and complete tasks efficiently.

The application provides a clean and responsive interface with authentication, task management, filtering, searching, statistics, themes, notifications and automated deadline reminders.

This project was developed as part of a **Full Stack Developer Technical Assessment**.

The application focuses on:

- Clean and reusable components
- Responsive UI
- Smooth animations
- REST API architecture
- Authentication and authorization
- Task CRUD operations
- Deadline management
- Automated email notifications
- User notification preferences
- Production deployment

---

# ✨ Features

## 🔐 Authentication

- User registration
- User login
- Guest login
- JWT-based authentication
- Protected API routes
- Persistent authentication session
- User-specific task data

---

## 📋 Task Management

Users can:

- Create tasks
- Edit tasks
- Delete tasks
- Mark tasks as completed
- Change task status
- Set task priority
- Add descriptions
- Set due dates
- Enable/disable reminders

### Task Status

- 📝 To Do
- 🔄 In Progress
- ✅ Completed

### Priority Levels

- 🟢 Low
- 🟡 Medium
- 🔴 High

---

## 🔎 Search & Filtering

TaskFlow provides:

- Real-time task search
- Debounced search
- Status filtering
- Priority filtering
- Sorting
- Combined filters
- Responsive filtering controls

---

## 📊 Dashboard

The dashboard provides an overview of the user's workspace.

Statistics include:

- Total Tasks
- To Do
- In Progress
- Completed
- Upcoming Tasks
- Task progress

---

## ⏰ Smart Deadline Reminders

TaskFlow includes an automated background reminder system.

The backend periodically checks upcoming tasks and sends notifications based on the task deadline.

### Reminder Types

| Reminder | Description |
|---|---|
| 🔔 One Day Before | Notifies the user before the deadline |
| 📅 Due Today | Notifies the user when the task is due |
| ⚠️ Overdue | Notifies the user after the deadline |

The reminder scheduler runs every **10 minutes**.

```text
Task Created
     ↓
Due Date Stored
     ↓
Background Scheduler
     ↓
Every 10 Minutes
     ↓
Check Upcoming Tasks
     ↓
Reminder Condition Matched
     ↓
Email Notification
