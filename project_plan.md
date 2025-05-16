# AssessHub Project Plan

## Directory Structure

```
AssessHub/
├── client/                 # Electron + React frontend
│   ├── public/             # Static assets
│   ├── src/                # React source code
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── i18n/           # Internationalization files
│   ├── electron/           # Electron-specific code
│   └── package.json        # Frontend dependencies
├── server/                 # Flask backend
│   ├── app/                # Flask application
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Database migrations
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Backend dependencies
├── docker/                 # Docker configuration
│   ├── client/             # Client Docker configuration
│   ├── server/             # Server Docker configuration
│   └── db/                 # Database Docker configuration
└── docker-compose.yml      # Docker Compose configuration
```

## Data Model

### Case
- id: Integer (Primary Key)
- name: String
- description: Text
- status: String
- created_at: DateTime
- updated_at: DateTime
- Relationships:
  - customers: One-to-Many with Customer
  - investigations: One-to-Many with Investigation

### Customer
- id: Integer (Primary Key)
- case_id: Integer (Foreign Key)
- name: String
- email: String
- phone: String
- address: Text
- created_at: DateTime
- updated_at: DateTime
- Relationships:
  - case: Many-to-One with Case

### Investigation
- id: Integer (Primary Key)
- case_id: Integer (Foreign Key)
- title: String
- description: Text
- status: String
- start_date: Date
- end_date: Date
- created_at: DateTime
- updated_at: DateTime
- Relationships:
  - case: Many-to-One with Case
  - targets: One-to-Many with Target

### Target
- id: Integer (Primary Key)
- investigation_id: Integer (Foreign Key)
- name: String
- type: String
- details: Text
- status: String
- created_at: DateTime
- updated_at: DateTime
- Relationships:
  - investigation: Many-to-One with Investigation

### User
- id: Integer (Primary Key)
- username: String
- password: String (hashed)
- email: String
- role: String (admin or general)
- created_at: DateTime
- updated_at: DateTime

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- GET /api/auth/user - Get current user info

### Cases
- GET /api/cases - List all cases (admin & general)
- GET /api/cases/:id - Get case details (admin & general)
- POST /api/cases - Create a new case (admin only)
- PUT /api/cases/:id - Update a case (admin only)
- DELETE /api/cases/:id - Delete a case (admin only)

### Customers
- GET /api/customers - List all customers (admin & general)
- GET /api/customers/:id - Get customer details (admin & general)
- POST /api/customers - Create a new customer (admin only)
- PUT /api/customers/:id - Update a customer (admin only)
- DELETE /api/customers/:id - Delete a customer (admin only)
- GET /api/cases/:id/customers - List customers for a case (admin & general)

### Investigations
- GET /api/investigations - List all investigations (admin & general)
- GET /api/investigations/:id - Get investigation details (admin & general)
- POST /api/investigations - Create a new investigation (admin only)
- PUT /api/investigations/:id - Update an investigation (admin only)
- DELETE /api/investigations/:id - Delete an investigation (admin only)
- GET /api/cases/:id/investigations - List investigations for a case (admin & general)

### Targets
- GET /api/targets - List all targets (admin & general)
- GET /api/targets/:id - Get target details (admin & general)
- POST /api/targets - Create a new target (admin only)
- PUT /api/targets/:id - Update a target (admin only)
- DELETE /api/targets/:id - Delete a target (admin only)
- GET /api/investigations/:id/targets - List targets for an investigation (admin & general)

### Advanced Search
- POST /api/search - Search across all entities with filters (admin & general)

## Frontend Pages

### Login Screen
- Username/email input
- Password input
- Login button
- Error messages in Japanese

### Dashboard Screen
- Summary counts for cases, customers, investigations, targets
- Recent activity
- Quick links to other screens

### Case List Screen
- Table of cases with sortable columns
- Search/filter functionality
- Create/edit/delete buttons (admin only)
- Pagination

### Customer List Screen
- Table of customers with sortable columns
- Search/filter functionality
- Create/edit/delete buttons (admin only)
- Pagination

### Advanced Search Screen
- Multiple entity selection
- Field-specific filters
- Combined search results
- Export functionality

## Japanese Language Support
- All UI text will be in Japanese
- Field names will use English where more intuitive
- Error messages and notifications in Japanese
- Date formats following Japanese conventions
