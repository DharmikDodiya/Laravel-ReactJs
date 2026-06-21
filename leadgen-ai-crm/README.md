# Smart CRM with AI Lead Scoring

A modern Customer Relationship Management (CRM) application built to track contacts and automatically assess lead quality using Artificial Intelligence. Built with Laravel, React, Inertia.js, and an LLM API.

## 🚀 Features

- **Contact Management**: Create, view, and manage leads in a clean React interface.
- **Activity Logging**: Track emails opened, pages visited, calls logged, and more.
- **AI Lead Scoring**: Automatically evaluate a contact's activity history through an LLM to generate a score (0-100) and rationale.
- **Visual Indicators**: Color-coded badges for easy visual identification of lead quality (Green: Hot, Amber: Warm, Red: Cold).
- **PostgreSQL Database**: Robust data storage for contacts and their respective activity logs.

## 🛠️ Tech Stack

- **Backend**: Laravel 11/12
- **Frontend**: React 18, Tailwind CSS
- **Full-Stack Bridging**: Inertia.js
- **Database**: PostgreSQL
- **AI Integration**: External LLM API (Gemini/Anthropic/OpenAI via Laravel HTTP Client)

## 📦 Installation

1. **Clone the repository and install dependencies:**
   ```bash
   composer install
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure Database & LLM Provider in `.env`:**
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=your_db_name
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password

   # LLM API configuration
   GEMINI_API_KEY="your-api-key"
   ```

4. **Run Migrations and Seeders:**
   ```bash
   php artisan migrate --seed
   ```

5. **Start the Development Servers:**
   Terminal 1 (Backend):
   ```bash
   php artisan serve
   ```
   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

## 🧠 How the AI Scoring Works

When a lead's profile is requested, their activity history is compiled and sent to the LLM via a dedicated Laravel service class. The LLM evaluates the engagement data and returns:
1. **Score (0-100)** indicating how likely the lead is to convert.
2. **Rationale** explaining *why* the score was given based on their history.

This is strictly an AI-driven process with no fallback logic, ensuring transparent, reliable, and intelligent scoring metrics.

## 📜 License

This project is open-source software licensed under the MIT license.
