# CodePilot AI — AI-Powered Code Review & Debugging Assistant

CodePilot AI is a full-stack web application designed to help developers analyze source code, identify potential issues, understand errors, and improve code quality with AI-powered assistance.

## Features

- **AI Code Analysis:** Analyze submitted source code and receive structured feedback.
- **Code Explanation:** Help developers understand code and its logic.
- **File Analysis:** Upload supported source-code files for analysis.
- **Repository Analysis:** Analyze code from a repository.
- **GitHub Integration:** Integrate GitHub repositories into the analysis workflow.
- **Analysis History:** Access previously saved analysis results.
- **Interactive Dashboard:** Navigate analysis features through a React frontend.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Java
- Spring Boot
- Maven
- REST APIs

### AI Integration
- LM Studio, when configured and running

### Data Storage
- Document the database technology actually configured in your application.

## Project Structure

```text
CodePilotAI/
├── backend/
│   └── ai-code-reviewer/
│       ├── pom.xml
│       └── src/
│           ├── main/
│           │   ├── java/
│           │   └── resources/
│           └── test/
├── frontend/
│   └── ai-code-reviewer-frontend/
│       ├── package.json
│       ├── public/
│       └── src/
└── README.md
```

## Getting Started

### Prerequisites

- Git
- Node.js and npm
- Java Development Kit compatible with the backend
- Maven or the included Maven Wrapper
- Any required database and AI service

### 1. Clone the Repository

```bash
git clone https://github.com/toshniwalrajat/CodePilotAI-.git
cd CodePilotAI-
```

### 2. Start the Backend

Open a terminal:

```powershell
cd backend/ai-code-reviewer
.\mvnw.cmd spring-boot:run
```

Configure the required database credentials and AI service URL before starting the application.

### 3. Start the Frontend

Open a second terminal from the repository root:

```powershell
cd frontend/ai-code-reviewer-frontend
npm install
npm run dev
```

Open the local URL displayed by Vite.

Configure the frontend API base URL to point to the running backend.

## Running Tests

To run backend tests:

```powershell
cd backend/ai-code-reviewer
.\mvnw.cmd test
```

To create a production frontend build:

```powershell
cd frontend/ai-code-reviewer-frontend
npm run build
```

## Security

- Keep passwords, API keys, and access tokens out of source control.
- Store sensitive configuration in environment variables.
- Never commit `.env` files containing real credentials.
- Configure CORS and production settings appropriately before deployment.

## Future Improvements

- Deploy the frontend and backend.
- Improve unit and integration test coverage.
- Add comprehensive API documentation.
- Improve AI response validation and error handling.
- Strengthen production configuration and monitoring.

## Author

CodePilot AI is a full-stack AI project built to explore Java backend development, React, REST API integration, and AI-assisted software engineering.
