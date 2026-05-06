# Smart Expense Detector (DataWallet)

DataWallet is a modern, full-stack financial analysis platform designed to help users ingest, categorize, and analyze their expenses securely. The platform features robust data visualization, anomaly detection (leak detection), and budget management.

## 🏗️ Architecture & Technology Stack

This application is built using a modern decoupled architecture, separating the client-side presentation layer from the server-side API layer.

### 1. Frontend (Client-Side)
The frontend is a Single Page Application (SPA) built for high performance and dynamic user interactions.
* **Framework:** React 18
* **Build Tool:** Vite (for rapid development and optimized production builds)
* **Language:** TypeScript (for type safety and reducing runtime errors)
* **Styling:** Tailwind CSS (utility-first CSS framework for custom, responsive designs)
* **Routing:** React Router DOM (for seamless client-side navigation without page reloads)
* **Data Fetching:** Axios (configured with interceptors for automatic JWT token injection)
* **Data Visualization:** Recharts (composable charting library for React)
* **Icons:** Lucide React

### 2. Backend (Server-Side)
The backend is a RESTful API designed to handle authentication, data processing, and secure database transactions.
* **Runtime:** Node.js (v20+)
* **Framework:** Express.js 
* **Language:** TypeScript 
* **Authentication:** JSON Web Tokens (JWT) for stateless, secure user sessions.
* **Security:** Bcrypt (for secure password hashing and salting before storage).
* **Middleware:** CORS (Cross-Origin Resource Sharing) and custom Authentication Guards to protect private routes.
* **File Uploads:** Multer (for handling CSV data ingestion).

### 3. Database (Data Layer)
* **Database Engine:** SQLite (Lightweight, file-based relational database management system).
* **ORM (Object-Relational Mapper):** Prisma
  * Provides a type-safe database client.
  * Auto-generates TypeScript types based on the database schema.
  * Handles migrations and schema syncing (`dev.db`).

---

## 🚀 Deployment Infrastructure

The application is fully containerized and automatically deployed using **Render** via a unified `render.yaml` Blueprint configuration.

* **Frontend Hosting:** Render Static Site (served globally via CDN). The build command uses Vite to compile the TypeScript/React code into optimized static HTML/JS/CSS assets.
* **Backend Hosting:** Render Web Service (Node.js environment).
* **Proxy & Routing:** The frontend is configured to automatically route API requests to the deployed backend URL, with a fallback rewrite rule for React Router compatibility.
* **CI/CD:** Continuous Integration & Deployment is hooked to the `main` branch of the GitHub repository. Any pushed commits automatically trigger a new cloud build.

---

## 📂 Project Structure

```text
smart-expense-detector/
├── frontend/                # React/Vite Client Application
│   ├── src/                 
│   │   ├── components/      # Reusable UI components (Layout, Cards, Forms)
│   │   ├── contexts/        # React Context providers (AuthContext, ThemeContext)
│   │   ├── lib/             # Utilities and API client configuration
│   │   └── pages/           # Route-specific views (Dashboard, Login, Upload)
│   └── vite.config.ts       # Vite bundler configuration
│
├── backend/                 # Node.js/Express API Server
│   ├── src/                 
│   │   ├── controllers/     # Business logic for routes
│   │   ├── routes/          # Express route definitions
│   │   └── middleware/      # Express middleware (Auth guards)
│   ├── prisma/              
│   │   ├── schema.prisma    # Database schema and models
│   │   └── dev.db           # SQLite database file
│   └── tsconfig.json        # TypeScript compiler configuration
│
└── render.yaml              # Render Deployment Blueprint
```
