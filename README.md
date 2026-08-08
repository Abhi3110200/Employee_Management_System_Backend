# Enterprise Employee Management System — Backend API

Node.js, Express, and TypeScript backend server providing JWT Authentication, Role-Based Access Control (RBAC), Organizational Hierarchy algorithms, and MongoDB Atlas persistence.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime**: Node.js v18+
- **Framework**: Express 5 (`express`)
- **Language**: TypeScript (`typescript`, `tsx`, `ts-node`)
- **Database**: MongoDB Atlas (`mongoose`)
- **Auth**: JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`), Cookies (`cookie-parser`)
- **Testing**: Node Native Test Runner (`node:test`, `node:assert`, `tsx --test`)

---

## ⚙️ Environment Variables Setup

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://abhijeetdrv_db_user:kvEX4tct38GwOaHu@cluster0.pvfp9ta.mongodb.net/employee_db?retryWrites=true&w=majority&appName=Cluster0
JWT_ACCESS_SECRET=super_secret_access_key_123456789_enterprise
JWT_REFRESH_SECRET=super_secret_refresh_key_987654321_enterprise
CLIENT_URL=http://localhost:3000
```

---

## 🚀 Available NPM Scripts

```bash
# Install dependencies
npm install

# Start development server with hot reload (nodemon + tsx)
npm run dev

# Seed database with test accounts
npm run seed

# Run unit tests
npm test

# Build TypeScript to production JavaScript in dist/
npm run build

# Start production server from dist/
npm start
```

---

## 📂 Architecture Directory Structure

```text
backend/
├── src/
│   ├── config/          # MongoDB Atlas database connection
│   ├── controllers/     # Express route handlers (Auth, Employees, Hierarchy)
│   ├── middleware/      # JWT Protect, Role Authorize, RBAC restrictions
│   ├── models/          # Mongoose schemas (User model with virtuals & soft delete)
│   ├── routes/          # Express Routers (auth.routes, employee.routes, hierarchy.routes)
│   ├── utils/           # Circular reporting detection & payload validation helpers
│   ├── __tests__/       # Node:test unit test suite
│   ├── app.ts           # Express app initializations & middleware
│   ├── seed.ts          # Seed database script
│   └── server.ts        # Server entrypoint
├── render.yaml          # Render production web service config
├── jest.config.json     # Jest config
└── tsconfig.json        # TypeScript compiler config
```

---

## 📚 REST API Documentation

For the full REST API endpoint specification, refer to [API_DOCUMENTATION.md](file:///e:/employee%20management%20system/backend/API_DOCUMENTATION.md).
