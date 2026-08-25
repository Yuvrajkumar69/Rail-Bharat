# 🚆 Rail Bharat

<p align="center">
  A full-stack railway reservation platform built with Java, Spring Boot, MySQL and JavaScript.
</p>

<p align="center">
  <a href="https://rail-bharat.vercel.app">🌐 Live Demo</a> •
  <a href="https://github.com/Yuvrajkumar69/Rail-Bharat">💻 GitHub Repository</a>
</p>

---

## 📌 Overview

**Rail Bharat** is a full-stack railway reservation web application designed to provide a realistic train booking experience.

The platform allows users to search trains, create accounts, log in securely, book tickets, make test payments, view PNR details, cancel bookings and receive email notifications.

The project demonstrates complete full-stack development using a **Spring Boot REST API**, **MySQL database**, modern frontend UI, authentication, payment integration and cloud deployment.

---

## ✨ Features

- 🔍 Train search by station name and station code
- 🚉 Multiple stations, trains and realistic schedules
- 👤 User registration and login
- 🔐 JWT-based authentication
- 🎟️ Railway ticket booking
- ❌ Ticket cancellation
- 🔎 PNR lookup
- 💳 Razorpay Test Mode payment integration
- 📧 Email notifications
- 💺 Seat availability and fare calculation
- 🔄 Dynamic train search results
- 📱 Responsive frontend
- 🌐 Production deployment

---

## 🛠️ Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Hibernate
- REST APIs
- Spring Security / JWT
- Maven

### Database
- MySQL

### Frontend
- HTML5
- CSS3
- JavaScript

### Payment & Communication
- Razorpay Test Mode
- Gmail SMTP

### Deployment
- Railway
- Vercel

---

## 🏗️ Project Architecture

```text
                    ┌──────────────────────┐
                    │      Vercel          │
                    │   Frontend (TrainUI) │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │      Railway         │
                    │ Spring Boot Backend  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Railway MySQL      │
                    │      Database         │
                    └──────────────────────┘

## 📂 Project Structure

```text
Rail-Bharat/
│
├── Train/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/genie/Train/
│   │       │       ├── booking/
│   │       │       ├── config/
│   │       │       ├── controller/
│   │       │       ├── entity/
│   │       │       ├── payment/
│   │       │       ├── repo/
│   │       │       ├── security/
│   │       │       ├── service/
│   │       │       └── user/
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── pom.xml
│   └── mvnw
│
├── TrainUI/
│   ├── images/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── bookings.html
│   ├── forgot-password.html
│   ├── reset-password.html
│   ├── script.js
│   ├── auth.js
│   ├── register.js
│   ├── bookings.js
│   └── styles.css
│
├── .gitignore
└── README.md
