# Personal Journal

A personal journal web application built with React (frontend) and PHP/MySQL (backend).

## Prerequisites

Before you begin, make sure you have the following installed on your computer:

- **XAMPP** (or MAMP for Mac) - [Download here](https://www.apachefriends.org/)
- **Node.js** - [Download here](https://nodejs.org/)
- A web browser (Chrome, Firefox, Safari, etc.)

## Installation Steps

### 1. Download and Extract

- Download the ZIP file from GitHub
- Extract the ZIP file
- You should see two folders: `personal_journal_frontend` and `personal_journal_backend`

### 2. Set Up the Backend (PHP & MySQL)

#### a. Move Backend Files
- Copy the `personal_journal_backend` folder
- Paste it into your XAMPP's `htdocs` folder:
  - **Windows**: `C:\xampp\htdocs\`
  - **Mac**: `/Applications/XAMPP/htdocs/`

#### b. Start XAMPP
- Open XAMPP Control Panel
- Start **Apache** and **MySQL**

#### c. Create Database
1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click "New" on the left sidebar
3. Create a new database called `personal_journal` (or any name you prefer)
4. Import your database:
   - Click on your new database name
   - Go to the "Import" tab
   - Click "Choose File" and select `personal_journal_backend/database/personal_journal.sql`
   - Click "Go" at the bottom
   - Wait for the success message

#### d. Configure Database Connection
1. Open `personal_journal_backend` folder
2. Find your database configuration file (usually `config.php` or `db.php`)
3. Update these settings with your database details:
   ```php
   $host = "localhost";
   $username = "root";
   $password = "";  // Usually empty for XAMPP
   $database = "your_database_name";  // The name you created in step c
   ```

### 3. Set Up the Frontend (React)

#### a. Open Terminal/Command Prompt
- **Mac**: Open Terminal
- **Windows**: Open Command Prompt or PowerShell

#### b. Navigate to Frontend Folder
```bash
cd path/to/personal_journal_frontend
```

For example:
- **Mac**: `cd /Applications/XAMPP/htdocs/personal_journal_frontend`
- **Windows**: `cd C:\xampp\htdocs\personal_journal_frontend`

#### c. Install Dependencies
```bash
npm install
```
This will take a few minutes. Wait for it to complete.

#### d. Configure API Connection (if needed)
- Check if there's a `.env` file or configuration file in the frontend folder
- Make sure the API URL points to your backend:
  ```
  REACT_APP_API_URL=http://localhost/personal_journal_backend
  ```

#### e. Start the Development Server
```bash
npm start
```

The application should automatically open in your browser at `http://localhost:3000`

## Usage

Once both servers are running:
- The **React frontend** runs on: `http://localhost:3000`
- The **PHP backend** runs on: `http://localhost/personal_journal_backend`

You can now use the personal journal application!
