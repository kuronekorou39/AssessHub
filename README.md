# AssessHub

AssessHub is a comprehensive system for managing case-related data with advanced search functionality.

## 🏗️ Overall Architecture

- Single repository containing both client and server
- Docker + docker-compose setup for local development
- Designed with future AWS deployment in mind (API Gateway + Cognito compatibility)

## ⚙️ Tech Stack

- **Client**: Electron + React (single-page application, smooth routing)
- **Server**: Flask (RESTful API)
- **Database**: PostgreSQL
- **Authentication**: JWT-based with admin and general user roles

## 🧩 Features

- **Login Screen** – authenticates users and loads UI based on role
- **Dashboard Screen** – shows summary counts (cases, customers, etc.)
- **Case List Screen** – shows a list of cases
- **Customer List Screen** – shows all customers
- **Advanced Search Screen** – allows cross-entity filtering

## 🧱 Data Model

- **Case**
  - has many Customers
  - has many Investigations

- **Investigation**
  - has many Targets

Each entity supports proper API endpoints (CRUD for admin users)

## 🌐 Language Support

The system is designed for Japanese-speaking users who are not fluent in English:
- All UI labels, buttons, columns, and messages are in Japanese
- Field names like id, name, email, etc. use English where more intuitive
- Japanese display is prioritized wherever possible
