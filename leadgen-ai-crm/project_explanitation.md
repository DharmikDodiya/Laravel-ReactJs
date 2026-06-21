# Project Explanation: Smart CRM with AI Lead Scoring

## Overview
This project is a modern Customer Relationship Management (CRM) tool tailored to help sales and marketing teams prioritize their contacts. By integrating an Artificial Intelligence (LLM) model into the workflow, the application removes the guesswork from lead qualification by assigning an objective, AI-generated score (0–100) and rationale to each lead based solely on their activity history.

## The Problem
Traditional CRM lead scoring relies heavily on hard-coded heuristics (e.g., +10 points for opening an email, +5 points for visiting the pricing page). This approach is rigid, often inaccurate, and requires continuous manual tweaking by administrators.

## The Solution
This CRM offloads the qualification logic completely to an advanced Language Model (LLM). Instead of mathematical guesses, the system feeds the contact's historical engagements into the AI, which acts as a "virtual sales analyst." The AI reads the context of the user's activities and provides a holistic score and a human-readable justification.

## Technical Architecture

### 1. The Monolithic Core (Laravel)
We use Laravel as our backend framework because of its robust ecosystem and developer familiarity. Laravel handles:
- **Routing & Controllers**: Managing API endpoints and page deliveries.
- **Database Operations (PostgreSQL)**: Leveraging Eloquent ORM to interact with our contact lists and activity logs.
- **Service Classes**: Encapsulating the complex logic used to format prompts and communicate with the external LLM API via Laravel's HTTP Client.

### 2. The Frontend Layer (React + Tailwind CSS)
Instead of relying on standard Blade templates, the UI is built dynamically using **React** components. This provides a fast, modern, and snappy single-page application (SPA) experience. **Tailwind CSS** is used for responsive, aesthetically pleasing styling, such as dynamic color-coded badges for lead scores (Green for high, Amber for medium, Red for low).

### 3. The Bridge (Inertia.js)
**Inertia.js** is the glue that binds Laravel and React together. It allows us to build an SPA without the overhead of creating a standalone REST or GraphQL API. We can return React views directly from our Laravel controllers and pass server-side data directly as component props, heavily reducing development time and complexity.

### 4. The AI Engine (LLM API)
The core unique feature of the project. A dedicated service class (`LeadScoringService`) is responsible for compiling a contact's activity feed into a prompt. This is sent out to an LLM provider (e.g., Gemini, Anthropic, or OpenAI). The CRM enforces strict **AI-Only Lead Scoring** — if the AI fails or the API key is missing, the system will explicitly report an error rather than falling back to automated mathematical guesses. This ensures transparency and accuracy.

## Workflow Example
1. **Data Entry**: A new contact is added to the CRM.
2. **Activity Logging**: The contact receives a newsletter (Activity 1), clicks a link to the pricing page (Activity 2), and books a demo (Activity 3).
3. **Evaluation**: When a user views this contact's profile, the backend gathers these three activities.
4. **AI Processing**: The activities are bundled into a prompt and sent to the LLM.
5. **Result Display**: The React frontend displays the AI's response:
   - **Score**: `85/100`
   - **Badge**: 🟢 (Green)
   - **Rationale**: "The contact shows high intent by viewing the pricing page and officially booking a demo call."

## Development Strategy & Goals
The goal of this stack is to remain within the Laravel ecosystem (which handles the heavy lifting of backend routing, security, and DB management) while incrementally adopting React for the view layer. By doing this over 2 months, a developer can confidently master full-stack React integration within Laravel without overextending the learning curve, perfectly mirroring the enterprise architectures of major SaaS products like Salesforce Einstein or HubSpot AI.
