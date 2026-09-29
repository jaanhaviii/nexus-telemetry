\# Nexus Telemetry



Nexus Telemetry is a simulated enterprise monitoring and observability platform designed to demonstrate how modern systems can monitor server health, detect failures, analyze telemetry data, and provide AI-assisted insights.



The project combines a React frontend with a FastAPI backend and an AI-powered RAG pipeline to simulate monitoring across multiple enterprise resources and regions.



\## Overview



Nexus Telemetry provides a centralized dashboard for monitoring simulated enterprise infrastructure.



The platform can:



\- Monitor simulated server and resource health

\- Track CPU and memory utilization

\- Display critical alerts and system logs

\- Search and filter monitored resources

\- Simulate infrastructure failures and fault scenarios

\- Authenticate users using JWT

\- Upload PDF documents for knowledge retrieval

\- Retrieve relevant information using RAG

\- Generate AI-assisted responses using Google Gemini

\- Store telemetry, logs, users, documents, and AI queries in SQLite



> Note: The infrastructure shown in this project is simulated for development, learning, and demonstration purposes. It does not monitor real production infrastructure.



\## Key Features



\### 1. Enterprise Monitoring Dashboard



The dashboard provides a centralized view of simulated infrastructure health, including:



\- CPU utilization

\- Memory utilization

\- Resource status

\- Critical alerts

\- Recent logs

\- Region-based filtering

\- Server/resource search



\### 2. Multi-Region Resource Simulation



The project simulates enterprise resources across different regions:



\- Payroll Database — India

\- Customer Database — Singapore

\- Production API — Virginia

\- AWS Production Account — Mumbai

\- GitLab Repository — London



\### 3. Fault and Chaos Testing



Nexus Telemetry includes simulated failure scenarios that allow users to test how the monitoring system responds to abnormal resource behavior.



Examples include:



\- CPU spikes

\- High memory utilization

\- Resource failures

\- Critical status changes



\### 4. AI Assistant



The platform includes an AI Assistant powered by Google Gemini.



The assistant can analyze telemetry information and provide responses based on the available monitoring data.



\### 5. RAG Pipeline



The project includes a Retrieval-Augmented Generation (RAG) workflow.



The general flow is:



User Query

→ Telemetry / Document Retrieval

→ Relevant Context

→ Gemini

→ AI Response



PDF documents can be uploaded and processed for retrieval-based AI responses.



\### 6. Authentication



The backend uses JWT-based authentication for protected API access.



Passwords are hashed before being stored in the database.



\## System Architecture



```text

&#x20;                ┌─────────────────────┐

&#x20;                │      User           │

&#x20;                └──────────┬──────────┘

&#x20;                           │

&#x20;                           ▼

&#x20;                ┌─────────────────────┐

&#x20;                │ React + Vite        │

&#x20;                │ Monitoring Dashboard│

&#x20;                └──────────┬──────────┘

&#x20;                           │

&#x20;                           ▼

&#x20;                ┌─────────────────────┐

&#x20;                │ FastAPI Backend     │

&#x20;                └──────────┬──────────┘

&#x20;                           │

&#x20;             ┌─────────────┼─────────────┐

&#x20;             │             │             │

&#x20;             ▼             ▼             ▼

&#x20;         JWT Auth      Telemetry       SQLite

&#x20;             │          Simulator       DB

&#x20;             │             │

&#x20;             │             ▼

&#x20;             │        Logs / Metrics

&#x20;             │

&#x20;             ▼

&#x20;       ┌─────────────────────┐

&#x20;       │ RAG Retrieval       │

&#x20;       │ + Embeddings        │

&#x20;       └──────────┬──────────┘

&#x20;                  │

&#x20;                  ▼

&#x20;       ┌─────────────────────┐

&#x20;       │ Google Gemini       │

&#x20;       │ AI Analysis         │

&#x20;       └──────────┬──────────┘

&#x20;                  │

&#x20;                  ▼

&#x20;             AI Response

