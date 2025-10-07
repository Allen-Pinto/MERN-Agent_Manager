Absolutely! Here's a **complete and professional `README.md`** for your MERN Machine Test project, covering setup, execution, and project details:

```markdown
# MERN Agent Manager

## **Project Overview**

This is a MERN stack application for managing agents and distributing leads. The application includes the following features:

1. **Admin User Login** – Authenticate using JWT.
2. **Agent Management** – Add, update, delete, and list agents.
3. **CSV Upload & Lead Distribution** – Upload leads in CSV/XLSX format, validate them, and distribute tasks equally among agents.

---

## **Tech Stack**

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **File Upload & Parsing:** `multer`, `csv-parser`, `xlsx`
- **Styling:** Tailwind CSS / any preferred styling library

---

## **Features**

### 1. User Login
- Login with email and password.
- Uses JWT for authentication.
- Redirects to dashboard on successful login.
- Displays error messages on failure.

### 2. Agent Management
- Add new agents with name, email, mobile, and password.
- Update and delete existing agents.
- View a list of all agents.

### 3. Upload CSV & Distribute Leads
- Upload CSV/XLS/XLSX files.
- Validates file type and format.
- Distributes leads equally among 5 agents.
- Saves distributed leads to MongoDB.
- Displays assigned leads for each agent.

---

## **Folder Structure**

### Backend
```

backend/
├─ config/
│  └─ db.js           # MongoDB connection
├─ controllers/
│  ├─ authController.js
│  ├─ agentController.js
│  └─ leadController.js
├─ models/
│  ├─ User.js
│  ├─ Agent.js
│  └─ Lead.js
├─ routes/
│  ├─ authRoutes.js
│  ├─ agentRoutes.js
│  └─ leadRoutes.js
├─ middleware/
│  ├─ authMiddleware.js
│  └─ errorMiddleware.js
├─ uploads/           # CSV uploads
├─ server.js
└─ package.json

```

### Frontend
```

frontend/
├─ src/
│  ├─ api/
│  │  └─ api.js       # Axios API calls
│  ├─ components/
│  │  ├─ LoginForm.jsx
│  │  ├─ Dashboard.jsx
│  │  ├─ AgentForm.jsx
│  │  └─ UploadCSV.jsx
│  ├─ utils/
│  │  └─ auth.js      # JWT token handling
│  ├─ App.jsx
│  └─ index.js
└─ package.json

````

---

## **Setup Instructions**

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
````

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
PORT=5002
```

Start the backend:

```bash
npm run dev
```

Backend will run on `http://localhost:5002`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000`.

---

## **Usage**

1. Open the frontend in your browser.
2. Login using your admin credentials.
3. Add agents via the Agent Management page.
4. Upload a CSV/XLS/XLSX file containing leads.
5. Check the dashboard to see distributed leads per agent.

---

## **API Endpoints**

### Auth

* `POST /api/auth/register` – Register new user
* `POST /api/auth/login` – Login user

### Agents

* `POST /api/agents` – Create agent
* `GET /api/agents` – List agents
* `PUT /api/agents/:id` – Update agent
* `DELETE /api/agents/:id` – Delete agent

### Leads

* `POST /api/leads/upload` – Upload CSV/XLSX and distribute leads
* `GET /api/leads` – Get all leads
* `GET /api/leads/agent/:agentId` – Get leads for a specific agent

---

## **Validation & Error Handling**

* Backend validates all inputs (email, password, file type, CSV headers).
* Frontend shows error messages for login/register failures.
* Invalid routes return a 404 JSON response.

---

## **Demo Video**

A working demonstration of the application is available here:
[Google Drive Demo Link](https://drive.google.com/file/d/18gwWiYXG7eoPwpviw4jhT7qpxlG36p9Q/view?usp=sharing)

---

## **Notes**

* Ensure MongoDB is running and the connection string is correct in `.env`.
* Ensure CORS is configured properly in `server.js` to allow frontend requests.

---

## **Author**

* **Name:** Allen Pinto
* **Role:** MERN Stack Developer

---

## **License**

MIT License

```
