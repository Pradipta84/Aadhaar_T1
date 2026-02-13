# Aadhaar Details Management System

A Next.js 16.0.3 application for managing Aadhaar card details with PostgreSQL database integration.

## Features

- ✅ Search Aadhaar details by Aadhaar number
- ✅ Add new Aadhaar details
- ✅ Update existing Aadhaar details
- ✅ Display all Aadhaar information (name, DOB, gender, address, phone, email)
- ✅ PostgreSQL database integration
- ✅ Modern, responsive UI
- ✅ Form validation

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager

## Step-by-Step Setup Guide

### Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required dependencies including Next.js, React, PostgreSQL client, and TypeScript.

### Step 2: Set Up PostgreSQL Database

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from [PostgreSQL Official Site](https://www.postgresql.org/download/windows/)
   - Mac: `brew install postgresql` or download from official site
   - Linux: `sudo apt-get install postgresql` (Ubuntu/Debian)

2. **Start PostgreSQL Service**
   - Windows: PostgreSQL service should start automatically, or start it from Services
   - Mac/Linux: `sudo service postgresql start` or `brew services start postgresql`

3. **Create Database**
   Open PostgreSQL command line (psql) or pgAdmin and run:

   ```sql
   CREATE DATABASE aadhaar_db;
   ```

   Or using command line:
   ```bash
   createdb aadhaar_db
   ```

4. **Note Your PostgreSQL Credentials**
   - Default username: `postgres`
   - Default password: (the one you set during installation)
   - Default port: `5432`
   - Default host: `localhost`

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` file and update with your PostgreSQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=aadhaar_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   ```

   Replace `your_postgres_password` with your actual PostgreSQL password.

### Step 4: Initialize Database Schema

1. **Start the development server** (in one terminal):
   ```bash
   npm run dev
   ```

2. **Initialize the database** (in another terminal or browser):
   - Open your browser and navigate to: `http://localhost:3000/api/init-db`
   - Or use curl: `curl http://localhost:3000/api/init-db`
   
   This will create the `aadhaar_details` table with all necessary columns and indexes.

### Step 5: Run the Application

The development server should already be running from Step 4. If not, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage Guide

### Searching for Aadhaar Details

1. Enter a 12-digit Aadhaar number in the "Search Aadhaar" section
2. Click the "Search" button
3. If found, the details will be displayed and the form will be populated
4. If not found, you'll see an error message

### Adding New Aadhaar Details

1. Fill in the form with Aadhaar details:
   - **Aadhaar Number** (required): 12-digit number
   - **Full Name** (required)
   - **Date of Birth**: Optional
   - **Gender**: Optional (Male/Female/Other)
   - **Phone Number**: Optional
   - **Email**: Optional
   - **Address**: Optional

2. Click "Save Details" button
3. The details will be saved to PostgreSQL database
4. Success message will be displayed

### Updating Existing Aadhaar Details

1. Search for the Aadhaar number first
2. The form will be populated with existing data
3. Modify the fields you want to update
4. Click "Save Details"
5. The record will be updated in the database

## Project Structure

```
Aadhaar_Details_T1/
├── app/
│   ├── api/
│   │   ├── aadhaar/
│   │   │   └── route.ts          # API routes for Aadhaar operations
│   │   └── init-db/
│   │       └── route.ts          # Database initialization endpoint
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page component
├── lib/
│   └── db.ts                      # Database connection and queries
├── types/
│   └── aadhaar.ts                 # TypeScript type definitions
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## Database Schema

The `aadhaar_details` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-incrementing ID |
| aadhaar_number | VARCHAR(12) UNIQUE | 12-digit Aadhaar number (unique) |
| name | VARCHAR(255) | Full name |
| date_of_birth | DATE | Date of birth |
| gender | VARCHAR(10) | Gender (Male/Female/Other) |
| address | TEXT | Full address |
| phone_number | VARCHAR(15) | Phone number |
| email | VARCHAR(255) | Email address |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## API Endpoints

### GET `/api/aadhaar?aadhaar_number=123456789012`
Fetch Aadhaar details by number.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "aadhaar_number": "123456789012",
    "name": "John Doe",
    ...
  }
}
```

### GET `/api/aadhaar`
Fetch all Aadhaar details.

### POST `/api/aadhaar`
Save or update Aadhaar details.

**Request Body:**
```json
{
  "aadhaar_number": "123456789012",
  "name": "John Doe",
  "date_of_birth": "1990-01-01",
  "gender": "Male",
  "address": "123 Main St",
  "phone_number": "9876543210",
  "email": "john@example.com"
}
```

### GET `/api/init-db`
Initialize database schema (creates tables and indexes).

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   services.msc (look for PostgreSQL service)
   
   # Mac/Linux
   sudo service postgresql status
   ```

2. **Verify credentials in `.env` file**

3. **Test connection manually:**
   ```bash
   psql -U postgres -d aadhaar_db
   ```

### Port Already in Use

If port 3000 is already in use:
```bash
# Kill the process or use a different port
PORT=3001 npm run dev
```

### Module Not Found Errors

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Production Build

To create a production build:

```bash
npm run build
npm start
```

## Security Notes

⚠️ **Important:** This is a demo application. For production use:

1. Add proper authentication and authorization
2. Implement rate limiting
3. Add input sanitization and validation
4. Use environment variables for sensitive data
5. Implement proper error handling
6. Add HTTPS
7. Consider using an ORM like Prisma or TypeORM
8. Add database migrations
9. Implement proper logging

## License

This project is for educational purposes.

## Support

For issues or questions, please check:
- Next.js Documentation: https://nextjs.org/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/

---

**Happy Coding! 🚀**
