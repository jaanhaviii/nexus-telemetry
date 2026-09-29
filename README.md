

# Nexus Telemetry

### AI-Assisted Enterprise Monitoring and Observability Platform

Nexus Telemetry is a full-stack enterprise monitoring and observability platform built to simulate how organizations can monitor distributed infrastructure, detect abnormal resource behavior, investigate system events, and use AI to analyze telemetry data.

The platform combines a React-based monitoring dashboard, a FastAPI backend, JWT authentication, simulated infrastructure telemetry, SQLite persistence, document-based RAG, and Google Gemini to provide an interactive monitoring and AI-assisted analysis experience.

> **Important:** Nexus Telemetry is a simulation and learning project. The servers, cloud resources, and infrastructure displayed in the dashboard are simulated and are not connected to real production infrastructure.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Project Objectives](#project-objectives)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Application Workflow](#application-workflow)
- [AI and RAG Pipeline](#ai-and-rag-pipeline)
- [Monitoring and Telemetry](#monitoring-and-telemetry)
- [Fault and Chaos Simulation](#fault-and-chaos-simulation)
- [Authentication and Security](#authentication-and-security)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [API Overview](#api-overview)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Example AI Queries](#example-ai-queries)
- [Screenshots](#screenshots)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Learning Outcomes](#learning-outcomes)
- [Author](#author)

---

## Overview

Modern enterprise applications often operate across multiple servers, databases, cloud environments, repositories, and geographical regions.

Monitoring such environments involves collecting telemetry such as:

- CPU utilization
- Memory utilization
- Resource health
- Application status
- System logs
- Alerts
- Failure events

Nexus Telemetry provides a simulated environment where these concepts can be explored through a centralized dashboard.

The system allows users to:

- Monitor simulated enterprise resources
- View real-time-style telemetry
- Search and filter resources
- Investigate critical alerts
- Inspect system logs
- Simulate infrastructure failures
- Upload PDF documentation
- Retrieve relevant information from documents
- Ask an AI assistant questions about the monitored environment

The goal is to demonstrate how **monitoring, backend APIs, authentication, telemetry, retrieval systems, and generative AI** can be combined into a single enterprise-oriented application.

---

# Problem Statement

Enterprise infrastructure can generate large amounts of operational data.

When multiple resources are involved, manually investigating:

- Which server is experiencing problems
- Why a resource is generating alerts
- Whether CPU or memory usage is abnormal
- What events happened before a failure
- Which documentation is relevant to an incident

can become time-consuming.

Nexus Telemetry addresses this concept by creating a centralized monitoring interface where simulated telemetry and system information can be analyzed through both traditional dashboards and an AI-assisted interface.

---

# Project Objectives

The primary objectives of Nexus Telemetry are:

1. Build a centralized enterprise monitoring dashboard.
2. Simulate infrastructure resources across multiple regions.
3. Generate and visualize telemetry information.
4. Detect abnormal CPU and memory utilization.
5. Display critical alerts and system logs.
6. Provide fault and chaos testing capabilities.
7. Implement JWT-based authentication.
8. Store application data using SQLite.
9. Implement document retrieval using RAG.
10. Integrate Google Gemini for AI-assisted analysis.
11. Provide a practical demonstration of full-stack development and AI integration.

---

# Key Features

## 1. Enterprise Monitoring Dashboard

The main dashboard provides a centralized view of simulated infrastructure.

It displays:

- Resource health
- CPU utilization
- Memory utilization
- Critical alerts
- Recent system logs
- Resource status
- Region information
- Search results
- Last updated information

The dashboard is designed to provide a single place for investigating infrastructure health.

---

## 2. Multi-Region Infrastructure Simulation

Nexus Telemetry simulates enterprise resources distributed across different geographical regions.

Example resources include:

| Resource | Type | Region |
|---|---|---|
| Payroll Database | Database | India |
| Customer Database | Database | Singapore |
| Production API | API Service | Virginia |
| AWS Production Account | Cloud Account | Mumbai |
| GitLab Repository | Repository | London |

These resources are simulated and are not connected to actual AWS, GitLab, or production infrastructure.

---

## 3. Resource Search and Filtering

Users can search for monitored resources and filter them by region.

This allows the dashboard to handle a larger number of simulated resources without requiring users to manually inspect every server.

---

## 4. CPU and Memory Monitoring

The telemetry simulator generates resource utilization values such as:

- CPU percentage
- Memory percentage
- Resource status
- Failure state

The dashboard visualizes these values to make abnormal resource behavior easier to identify.

For example:

```text
CPU Usage
    |
100 |                         *
 90 |                    *
 80 |               *
 70 |          *
 60 |     *
 50 |  *
    +------------------------------
       Time
````

A sudden increase in utilization can result in a critical or warning condition depending on the configured thresholds.

---

## 5. Critical Alert Detection

The platform identifies abnormal resource conditions and displays them as alerts.

Examples include:

* High CPU utilization
* High memory utilization
* Resource failure
* Warning-level conditions
* Critical resource conditions

This provides an incident-monitoring style experience.

---

## 6. System Logs

The application maintains simulated system events and logs.

Logs can be used to understand:

* What happened
* Which resource generated the event
* The severity of the event
* When the event occurred

This provides additional context when investigating alerts.

---

# Fault and Chaos Simulation

Nexus Telemetry includes a fault-testing mechanism to simulate abnormal infrastructure behavior.

Instead of waiting for a real production failure, users can intentionally trigger simulated failures.

This makes it possible to test how the monitoring interface reacts to different conditions.

Example flow:

```text
Normal Resource
       |
       ▼
Fault Triggered
       |
       ▼
Telemetry Changes
       |
       ▼
Alert Generated
       |
       ▼
Dashboard Updated
       |
       ▼
User Investigates
```

Possible simulated conditions include:

* CPU spikes
* Memory spikes
* Resource failures
* Critical status changes

This approach is useful for demonstrating monitoring and incident-response concepts in a safe environment.

---

# System Architecture

```text
                         USER
                           |
                           ▼
              ┌──────────────────────┐
              │ React + Vite Frontend │
              │ Monitoring Dashboard  │
              └──────────┬───────────┘
                         |
                         | REST API
                         ▼
              ┌──────────────────────┐
              │   FastAPI Backend    │
              └──────────┬───────────┘
                         |
          ┌──────────────┼───────────────┐
          |              |               |
          ▼              ▼               ▼
    JWT Authentication  Telemetry      SQLite
                         Simulator      Database
                           |
                           ▼
                    Logs & Metrics
                           |
                           ▼
                  ┌─────────────────┐
                  │ RAG Pipeline    │
                  │ Document Search │
                  └────────┬────────┘
                           |
                           ▼
                  ┌─────────────────┐
                  │ Google Gemini   │
                  │ AI Analysis     │
                  └────────┬────────┘
                           |
                           ▼
                      AI Response
```

---

# Application Workflow

The overall application workflow can be represented as:

```text
User
 |
 ▼
Login
 |
 ▼
JWT Authentication
 |
 ▼
Monitoring Dashboard
 |
 ├── View Resources
 |
 ├── Search Resources
 |
 ├── Filter by Region
 |
 ├── View Telemetry
 |
 ├── View Alerts
 |
 ├── View Logs
 |
 └── Trigger Fault Testing
          |
          ▼
     Simulated Event
          |
          ▼
      Updated Telemetry
```

For AI analysis:

```text
User Question
      |
      ▼
FastAPI /chat Endpoint
      |
      ▼
Retrieve Relevant Context
      |
      ├── Telemetry Data
      |
      └── Uploaded Documents
      |
      ▼
Construct AI Prompt
      |
      ▼
Google Gemini
      |
      ▼
AI Generated Response
      |
      ▼
React AI Assistant
```

---

# AI and RAG Pipeline

One of the main components of Nexus Telemetry is its AI-assisted analysis workflow.

The system combines telemetry information with document retrieval to provide contextual responses.

## What is RAG?

RAG stands for **Retrieval-Augmented Generation**.

Instead of asking a generative AI model to answer a question only from its internal knowledge, the application first retrieves relevant information from available data.

The retrieved information is then provided as context to the AI model.

### Nexus Telemetry RAG Flow

```text
PDF Document
     |
     ▼
Document Processing
     |
     ▼
Text Extraction
     |
     ▼
Text Chunks
     |
     ▼
Embeddings
     |
     ▼
Stored Document Representation
     |
     ▼
User Query
     |
     ▼
Similarity Retrieval
     |
     ▼
Relevant Context
     |
     ▼
Google Gemini
     |
     ▼
Context-Aware Response
```

This allows the AI assistant to use project-specific information rather than relying only on general model knowledge.

---

# AI Assistant

The AI Assistant provides an interface for asking questions about the simulated monitoring environment.

Example questions include:

```text
What is the current status of all monitored servers?

Which server requires the most immediate attention?

Why is the Production API generating an alert?

Which resources currently have high CPU utilization?

What happened before the latest critical event?

Summarize the current infrastructure health.
```

The assistant can combine available telemetry and retrieved document information to generate an analytical response.

---

# Monitoring and Telemetry

The telemetry simulator continuously produces simulated resource information.

A monitored resource can contain information such as:

```text
Resource
├── Name
├── Type
├── Region
├── CPU Utilization
├── Memory Utilization
├── Status
└── Failure State
```

The backend uses this information to generate dashboard data and alerts.

The frontend then presents the information through monitoring cards, charts, alerts, and logs.

---

# Authentication and Security

Nexus Telemetry uses JWT-based authentication.

The authentication flow is:

```text
User Login
     |
     ▼
Username + Password
     |
     ▼
FastAPI Authentication
     |
     ▼
Password Verification
     |
     ▼
JWT Token Generated
     |
     ▼
Authenticated API Requests
```

Passwords are hashed before being stored.

Sensitive configuration values are stored through environment variables rather than being hard-coded into the source code.

Examples include:

* Gemini API key
* JWT secret key
* Administrator password

The `.gitignore` file prevents sensitive files such as `.env` and local database files from being committed to the repository.

---

# Technology Stack

## Frontend

| Technology   | Purpose                         |
| ------------ | ------------------------------- |
| React        | User interface                  |
| Vite         | Frontend development/build tool |
| Tailwind CSS | UI styling                      |
| JavaScript   | Frontend logic                  |

## Backend

| Technology | Purpose             |
| ---------- | ------------------- |
| Python     | Backend programming |
| FastAPI    | REST API framework  |
| SQLAlchemy | Database ORM        |
| SQLite     | Local database      |
| JWT        | Authentication      |

## AI and RAG

| Technology     | Purpose                 |
| -------------- | ----------------------- |
| Google Gemini  | Generative AI           |
| Embeddings     | Semantic representation |
| RAG            | Context retrieval       |
| PDF Processing | Document ingestion      |

## Development

| Tool       | Purpose                  |
| ---------- | ------------------------ |
| Git        | Version control          |
| GitHub     | Source code hosting      |
| VS Code    | Development environment  |
| PowerShell | Command-line development |

---

# Project Structure

```text
nexus-telemetry/
│
├── backend/
│   ├── app/
│   │   └── main.py
│   │
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── tailwind.config.js
```

The backend contains the API, authentication, telemetry simulation, database operations, document processing, and AI integration.

The frontend contains the monitoring dashboard and user interface.

---

# Database Design

Nexus Telemetry uses SQLite for local persistence.

The backend maintains data related to:

* Users
* Monitored servers/resources
* Logs
* AI queries
* Uploaded documents

A simplified relationship can be represented as:

```text
Users
  |
  └── Authentication

Servers
  |
  └── Telemetry / Resource Status

Logs
  |
  └── Monitoring Events

Documents
  |
  └── RAG Retrieval

AI Queries
  |
  └── AI Assistant History
```

---

# API Overview

The FastAPI backend exposes endpoints for different application operations.

Examples include:

| Endpoint      | Purpose                      |
| ------------- | ---------------------------- |
| `/auth/login` | Authenticate users           |
| `/servers`    | Retrieve monitored resources |
| `/logs`       | Retrieve system logs         |
| `/upload-doc` | Upload PDF documents         |
| `/chat`       | Process AI assistant queries |

The API acts as the communication layer between the React frontend and the backend services.

---

# Installation

## Prerequisites

Install the following before running the project:

* Python 3.11+
* Node.js
* npm
* Git
* Google Gemini API key

---

## 1. Clone the Repository

```bash
git clone https://github.com/jaanhaviii/nexus-telemetry.git
```

Navigate into the project:

```bash
cd nexus-telemetry
```

---

# Backend Setup

Navigate to the backend:

```powershell
cd backend
```

Create a virtual environment:

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required Python packages:

```powershell
pip install -r requirements.txt
```

Navigate to the application directory:

```powershell
cd app
```

Start FastAPI:

```powershell
uvicorn main:app --reload
```

The backend will start on the local FastAPI development server.

---

# Frontend Setup

Open another terminal.

Navigate to the project:

```powershell
cd nexus-telemetry
```

Install frontend dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

Vite will display the local development URL in the terminal.

Open that URL in a browser.

---

# Environment Variables

Create a `.env` file inside the backend directory:

```text
backend/.env
```

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
ADMIN_PASSWORD=your_admin_password
```

### Important

Never commit `.env` to GitHub.

Never expose:

* API keys
* JWT secrets
* Passwords
* Database credentials

The repository's `.gitignore` is configured to prevent sensitive local files from being uploaded.

---

# Example AI Queries

After logging into the application, users can ask questions such as:

### Infrastructure Status

```text
What is the current status of all monitored servers?
```

### Incident Analysis

```text
Which server requires the most immediate attention?
```

### Resource Analysis

```text
Which resources currently have high CPU utilization?
```

### Alert Investigation

```text
Why is the Production API generating a critical alert?
```

### Summary

```text
Give me a summary of the current infrastructure health.
```

---

# Screenshots

Screenshots of the application can be added here.

Example:

```markdown
![Nexus Telemetry Dashboard](docs/dashboard.png)
```

Recommended screenshots:

1. Login page
2. Main monitoring dashboard
3. CPU and memory telemetry
4. Critical alerts
5. Fault testing interface
6. AI Assistant
7. RAG/PDF upload workflow

---

# Limitations

Nexus Telemetry is currently a simulation and demonstration project.

The current implementation does not directly monitor real production infrastructure.

The following components are simulated:

* Servers
* CPU metrics
* Memory metrics
* Resource failures
* Logs
* Alerts
* Multi-region infrastructure

The project is intended to demonstrate the architecture and concepts behind enterprise monitoring rather than replace production monitoring platforms.

---

# Future Improvements

Future versions could include:

## Real Infrastructure Integration

* AWS CloudWatch
* AWS EC2 monitoring
* AWS S3 telemetry
* Kubernetes metrics
* Docker container monitoring

## Advanced Observability

* Prometheus integration
* Grafana dashboards
* Distributed tracing
* Advanced log correlation
* Real-time WebSocket telemetry

## AI Improvements

* Better incident summarization
* Automated root-cause analysis
* Historical incident comparison
* Alert correlation
* Anomaly detection
* AI-generated incident reports

## Deployment

* Docker containerization
* CI/CD pipeline
* Cloud deployment
* Production database
* HTTPS configuration
* Cloud-based vector database

---

# Learning Outcomes

This project provided practical experience with:

* Full-stack web development
* React application development
* REST API development
* FastAPI
* JWT authentication
* SQLAlchemy
* SQLite
* Telemetry simulation
* Monitoring dashboards
* Fault and chaos testing
* Retrieval-Augmented Generation
* Embeddings
* PDF document processing
* Google Gemini integration
* Environment-based configuration
* Git and GitHub

---

# Project Highlights

### Full-Stack Architecture

The project connects a modern React frontend with a Python FastAPI backend through REST APIs.

### AI Integration

Google Gemini is integrated into the monitoring workflow to provide AI-assisted analysis.

### RAG

The application demonstrates how retrieved project-specific information can be supplied as context to a generative AI model.

### Monitoring Simulation

The system simulates enterprise infrastructure and generates telemetry, alerts, logs, and failure scenarios.

### Security

Authentication and sensitive configuration are handled using JWT, password hashing, and environment variables.

---

# Disclaimer

Nexus Telemetry is an educational and demonstration project.

All infrastructure resources and telemetry displayed by the application are simulated unless explicitly stated otherwise.

No real production systems are monitored or modified by this application.

---

# Author

**Janhavi Srivastava**

GitHub: [@jaanhaviii](https://github.com/jaanhaviii)

---

## License

This project is intended primarily for educational, demonstration, and portfolio purposes.

````

### Step 2 — Save it

In Notepad:

**Ctrl + S → close Notepad.**

Then check:

```powershell
git status
````

You should see:

```text
modified: README.md
```

### Step 3 — Update GitHub

Because your repository is already connected to GitHub, run:

```powershell
git add README.md
git commit -m "Improve project documentation"
git push
```

After this, refresh your GitHub repository and the new README will appear.

**One thing I would do after this:** add your actual dashboard screenshots to a `docs` folder and put them into the README. That will make the repository much more recruiter-friendly than having a text-only README.
