# Employee Management System — REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 🔐 Authentication & Token Header

All protected routes require an `Authorization` Bearer token header:

```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## 1. Authentication Endpoints

### 1.1 Login User
Authenticate credentials and receive an Access Token & HttpOnly Refresh Cookie.

- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public

**Request Body**:
```json
{
  "email": "superadmin@company.com",
  "password": "superadmin123"
}
```

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66b51000a123456789abcdef",
    "employeeId": "EMP-1001",
    "name": "Super Admin",
    "email": "superadmin@company.com",
    "role": "super_admin",
    "department": "Executive",
    "position": "Chief Technology Officer",
    "status": "active"
  }
}
```

---

### 1.2 Logout User
Clear the HttpOnly refresh token cookie and invalidate token in MongoDB.

- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Access**: Private (Bearer Token)

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### 1.3 Refresh Access Token
Issue a new short-lived Access Token using the valid HttpOnly refresh cookie.

- **Method**: `POST`
- **Path**: `/api/auth/refresh`
- **Access**: Public (HttpOnly Cookie)

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66b51000a123456789abcdef",
    "name": "Super Admin",
    "role": "super_admin"
  }
}
```

---

### 1.4 Get Currently Logged-in User
Fetch current authenticated user profile.

- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Access**: Private (Bearer Token)

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "user": {
    "id": "66b51000a123456789abcdef",
    "employeeId": "EMP-1001",
    "name": "Super Admin",
    "email": "superadmin@company.com",
    "role": "super_admin",
    "department": "Executive",
    "phone": "+1 (555) 019-2831",
    "status": "active"
  }
}
```

---

## 👥 2. Employee Management Endpoints

### 2.1 Get All Employees (With Search, Filter, Sort & Pagination)
Fetch staff list with support for multi-criteria parameters.

- **Method**: `GET`
- **Path**: `/api/employees`
- **Access**: Private (`super_admin`, `hr_manager`)

**Query Parameters**:
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | string | `""` | Search by Name, Email, Employee ID, Designation |
| `department` | string | `""` | Filter by department (`Engineering`, `Human Resources`, etc.) |
| `role` | string | `""` | Filter by role (`super_admin`, `hr_manager`, `employee`) |
| `status` | string | `""` | Filter by status (`active`, `inactive`) |
| `sortBy` | string | `"createdAt"` | Sort field (`joiningDate`, `name`, `salary`, `createdAt`) |
| `sortOrder` | string | `"desc"` | Sort direction (`asc`, `desc`) |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Records per page |
| `showDeleted` | boolean | `false` | Set `true` to view soft-deleted records (Super Admin) |

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "results": 10,
  "pagination": {
    "totalResults": 25,
    "totalPages": 3,
    "currentPage": 1,
    "pageLimit": 10
  },
  "employees": [
    {
      "id": "66b51000a123456789abcdef",
      "employeeId": "EMP-1001",
      "name": "Super Admin",
      "email": "superadmin@company.com",
      "phone": "+1 (555) 019-2831",
      "department": "Executive",
      "designation": "Chief Technology Officer",
      "salary": 150000,
      "joiningDate": "2023-01-15T00:00:00.000Z",
      "status": "active",
      "role": "super_admin",
      "manager": null,
      "profileImage": "https://images.unsplash.com/photo-..."
    }
  ]
}
```

---

### 2.2 Create New Employee
Create a new employee profile with field validation.

- **Method**: `POST`
- **Path**: `/api/employees`
- **Access**: Private (`super_admin`, `hr_manager`)

**Request Body**:
```json
{
  "employeeId": "EMP-1004",
  "name": "Alex Johnson",
  "email": "alex.johnson@company.com",
  "password": "password123",
  "phone": "+1 (555) 018-4455",
  "department": "Engineering",
  "designation": "Senior Full Stack Engineer",
  "salary": 105000,
  "joiningDate": "2024-03-01",
  "status": "active",
  "role": "employee",
  "manager": "66b51000a123456789abcdef"
}
```

**Success Response (`201 Created`)**:
```json
{
  "status": "success",
  "message": "Employee created successfully",
  "employee": {
    "id": "66b52000b987654321fedcba",
    "employeeId": "EMP-1004",
    "name": "Alex Johnson",
    "email": "alex.johnson@company.com",
    "role": "employee"
  }
}
```

---

### 2.3 Get Employee Details by ID
Fetch single employee profile.

- **Method**: `GET`
- **Path**: `/api/employees/:id`
- **Access**: Private (`super_admin`, `hr_manager`, or Self)

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "employee": {
    "id": "66b52000b987654321fedcba",
    "employeeId": "EMP-1004",
    "name": "Alex Johnson",
    "email": "alex.johnson@company.com",
    "department": "Engineering",
    "designation": "Senior Full Stack Engineer",
    "manager": {
      "id": "66b51000a123456789abcdef",
      "name": "Super Admin",
      "email": "superadmin@company.com"
    }
  }
}
```

---

### 2.4 Update Employee Record
Update employee record attributes. Standard employees can only update personal contact info (`phone`, `address`, `profileImage`).

- **Method**: `PUT`
- **Path**: `/api/employees/:id`
- **Access**: Private (`super_admin`, `hr_manager`, or Self limited)

**Request Body**:
```json
{
  "designation": "Staff Engineer",
  "salary": 115000,
  "phone": "+1 (555) 999-8888"
}
```

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "message": "Employee updated successfully",
  "employee": {
    "id": "66b52000b987654321fedcba",
    "designation": "Staff Engineer",
    "salary": 115000
  }
}
```

---

### 2.5 Soft Delete Employee
Soft delete an employee record (`isDeleted = true`).

- **Method**: `DELETE`
- **Path**: `/api/employees/:id`
- **Access**: Private (`super_admin` Only)

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "message": "Employee soft-deleted successfully",
  "employeeId": "66b52000b987654321fedcba"
}
```

---

### 2.6 Restore Soft-Deleted Employee
Restore a soft-deleted employee record (`isDeleted = false`).

- **Method**: `PATCH`
- **Path**: `/api/employees/:id/restore`
- **Access**: Private (`super_admin` Only)

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "message": "Employee restored successfully"
}
```

---

## 🌳 3. Organizational Hierarchy Endpoints

### 3.1 Get Full Organizational Hierarchy Tree
Fetch recursive organizational reporting tree.

- **Method**: `GET`
- **Path**: `/api/organization/tree` (or `/api/hierarchy/tree`)
- **Access**: Private

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "tree": [
    {
      "id": "66b51000a123456789abcdef",
      "employeeId": "EMP-1001",
      "name": "Super Admin",
      "email": "superadmin@company.com",
      "role": "super_admin",
      "department": "Executive",
      "designation": "Chief Technology Officer",
      "directReportsCount": 2,
      "directReports": [
        {
          "id": "66b51002a123456789abcdef",
          "name": "HR Manager",
          "role": "hr_manager",
          "directReportsCount": 1,
          "directReports": []
        }
      ]
    }
  ]
}
```

---

### 3.2 Assign Reporting Manager (With Circular Prevention)
Assign reporting manager to employee.

- **Method**: `PATCH`
- **Path**: `/api/employees/:id/manager`
- **Access**: Private (`super_admin`, `hr_manager`)

**Request Body**:
```json
{
  "managerId": "66b51000a123456789abcdef"
}
```

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "message": "Reporting manager updated successfully",
  "employee": {
    "id": "66b52000b987654321fedcba",
    "name": "Alex Johnson",
    "manager": {
      "id": "66b51000a123456789abcdef",
      "name": "Super Admin"
    }
  }
}
```

**Error Response (`400 Bad Request`) — Circular reporting detected**:
```json
{
  "status": "error",
  "message": "Circular reporting detected! An employee cannot report to themselves or a subordinate in their management chain."
}
```

---

### 3.3 Get Employee Direct Reportees
Fetch all employees directly reporting to employee `:id`.

- **Method**: `GET`
- **Path**: `/api/employees/:id/reportees`
- **Access**: Private

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "results": 2,
  "reportees": [
    {
      "id": "66b52000b987654321fedcba",
      "name": "Alex Johnson",
      "role": "employee"
    }
  ]
}
```

---

## 📥 4. CSV Import & Export Endpoints

### 4.1 Export Active Employees CSV
Stream downloadable CSV file.

- **Method**: `GET`
- **Path**: `/api/employees/export/csv`
- **Access**: Private (`super_admin`, `hr_manager`)

**Header**: `Content-Type: text/csv`

---

### 4.2 Import Bulk Employees CSV JSON Payload
Bulk import parsed CSV rows.

- **Method**: `POST`
- **Path**: `/api/employees/import/csv`
- **Access**: Private (`super_admin`, `hr_manager`)

**Request Body**:
```json
{
  "rows": [
    {
      "name": "Sarah Connor",
      "email": "sarah.connor@company.com",
      "department": "Security",
      "designation": "Security Lead",
      "salary": 98000
    }
  ]
}
```

**Success Response (`200 OK`)**:
```json
{
  "status": "success",
  "message": "Bulk CSV import complete: 1 created, 0 skipped",
  "summary": {
    "createdCount": 1,
    "skippedCount": 0
  }
}
```

---

## 8. Notification System Endpoints

### 8.1 Get User Notifications
Fetch personalized notifications (task assignments, leave approvals, attendance alerts, performance reviews).

- **Method**: `GET`
- **Path**: `/api/notifications`
- **Access**: Private (Bearer Token)
- **Returns**: Unread notification count and list of notification records.

### 8.2 Mark Single Notification as Read
- **Method**: `PATCH`
- **Path**: `/api/notifications/:id/read`
- **Access**: Private (Bearer Token)

### 8.3 Mark All Notifications as Read
- **Method**: `PATCH`
- **Path**: `/api/notifications/read-all`
- **Access**: Private (Bearer Token)

### 8.4 Delete Notification
- **Method**: `DELETE`
- **Path**: `/api/notifications/:id`
- **Access**: Private (Bearer Token)

