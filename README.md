# 🏨 Reservation Manager — Frontend

> **React client built with Vite, Ant Design, and Redux Toolkit.**  
> 🔗 **Backend Repository:** [reservation-manager](https://github.com/esmatoksoy/reservation-manager)

---

## 📌 Overview

This repository provides the client interface for the Reservation Management System. It allows staff and administrators to handle customer bookings, manage guest records, and monitor room statuses through validated forms communicating with the Spring Boot REST API.

---

## 🛠 Tech Stack

* **Framework & Tooling:** React 18, Vite
* **UI Library:** Ant Design (AntD)
* **State Management:** Redux Toolkit
* **Routing:** React Router
* **Scaffolding & Quality:** Plop templates, ESLint

---

## ✨ Key Features

* **Booking Workflows:** Interactive reservation creation, room selection, and status tracking.
* **Dynamic Guest Forms:** Validated multi-guest management for individual and family assignments.
* **Centralized State:** Predictable API response caching and state handling via Redux Toolkit.
* **Component Generator:** Integrated Plop CLI for scaffolded UI development.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (LTS recommended)
* npm or yarn

### Installation & Run

1. Clone the repository:
   git clone https://github.com/esmatoksoy/reservation-manager-frontend.git
   cd reservation-manager-frontend

2. Install dependencies:
   npm install

3. Start the development server:
   npm run dev

4. Build for production:
   npm run build

---

## 📁 Project Structure

plop-templates/   # Scaffolding templates
public/           # Static assets
src/
  ├── components/ # Modular React & Ant Design components
  ├── pages/      # Route views
  ├── store/      # Redux Toolkit slices and configuration
  └── services/   # API client integration

---

## 🔗 Related Repositories

* **Backend API:** [esmatoksoy/reservation-manager](https://github.com/esmatoksoy/reservation-manager) — Spring Boot, PostgreSQL, Redis, RabbitMQ, Docker Compose.
