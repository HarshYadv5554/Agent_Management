# Task Management System

A full-stack application for managing tasks and agents.

## Features

- User authentication (Admin/Agent)
- Agent management (Add, Edit, Delete)
- CSV file upload for task distribution
- Task distribution among agents
- View assigned tasks per agent

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5002
   ```

4. Start the servers:
   ```bash
   # Start the server (from server directory)
   npm run dev

   # Start the client (from client directory)
   npm start
   ```

## CSV File Upload Requirements

### Supported File Types
- CSV files (.csv)
- Excel files (.xlsx, .xls) - Coming soon

### CSV File Format
The CSV file must contain the following columns:
- `firstName` (required) - The first name of the contact
- `phone` (required) - The phone number of the contact
- `notes` (optional) - Additional notes about the contact

### Example CSV Format
```csv
firstName,phone,notes
John Doe,+1234567890,Call in the morning
Jane Smith,+1987654321,Follow up required
Mike Johnson,+1122334455,Urgent call
```

### Important Notes
1. The column names must be exactly `firstName` and `phone` (case sensitive)
2. The first line must be the header row with these column names
3. The file must be saved with a `.csv` extension
4. Make sure there are no extra spaces in the column names
5. The file should be encoded in UTF-8

## Task Distribution

- Tasks are distributed evenly among available agents
- If the total number of tasks is not divisible by the number of agents, remaining tasks are distributed sequentially
- Each agent can view their assigned tasks in the dashboard

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user

### Agents
- GET /api/agents - Get all agents
- POST /api/agents - Create a new agent
- PUT /api/agents/:id - Update an agent
- DELETE /api/agents/:id - Delete an agent

### Lists
- POST /api/lists/upload - Upload CSV file and distribute tasks
- GET /api/lists/distribution - Get task distribution statistics

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - Formik
  - Yup
  - Axios

- Backend:
  - Node.js
  - Express
  - MongoDB
  - JWT
  - Multer
  - CSV Parser

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 