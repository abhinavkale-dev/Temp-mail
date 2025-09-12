# Temp-Mail Backend

The backend component of the Temp-Mail service, providing both an API server and an SMTP server for handling temporary email addresses.

## Directory Structure

```
backend/
├── dist/               # Compiled JavaScript files
├── prisma/             # Prisma schema and migrations
├── src/
│   ├── api/            # API routes and middleware
│   ├── lib/            # Utility functions and shared code
│   ├── services/       # Background services (cleanup, scheduler)
│   ├── smtp/           # SMTP server configuration
│   └── index.ts        # Main entry point
├── .env                # Environment variables (not in git)
├── .env.example        # Example environment variables
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Prerequisites

- Node.js (v18+)
- PostgreSQL database
- pnpm (recommended) or npm

## Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env` file in the backend directory with the following content:

```
# Database
DATABASE_URL=

# Frontend URL for CORS
FRONTEND_URL=
CORS_ORIGIN=

# Backend Configuration
API_PORT=3001
SMTP_PORT=25

# SMTP Configuration
SMTP_DOMAIN=

# Environment
NODE_ENV=production
```

4. Generate Prisma client:

```bash
pnpm prisma:generate
```

5. Run database migrations:

```bash
pnpm prisma:migrate
```

## Running the Application

### Development Mode

```bash
pnpm dev
```

This will start both the API server and SMTP server in development mode with hot reloading.

### Production Mode

```bash
pnpm build
pnpm start
```

## API Endpoints

### Mailboxes

- `POST /api/mailboxes/custom` - Create a custom mailbox
  - Request body: `{ "username": "example" }`
  - Response: `{ "address": "example@domain.com", "createdAt": "ISO date", "expiresAt": "ISO date" }`

### Messages

- `POST /api/mailboxes/:address/messages` - Get messages for a mailbox
  - Response: `{ "messages": [{ "id": "...", "subject": "...", "from": "...", "createdAt": "..." }] }`

- `GET /api/messages/:id` - Get a specific message
  - Response: `{ "id": "...", "subject": "...", "from": "...", "to": "...", "content": "...", "parsedData": { ... } }`

### Health Check

- `GET /api/health` - Check if the API is running
  - Response: `{ "ok": true }`

## Enhanced Error Handling

The backend implements several error handling strategies:

1. **Database Error Recovery**:
   - Graceful handling of database connection issues
   - Automatic retry mechanisms for transient errors
   - Fallback responses when database operations fail

2. **Auto-Creation of Resources**:
   - Mailboxes are automatically created if they don't exist
   - This prevents 404 errors when accessing new mailboxes

3. **Error Logging and Monitoring**:
   - Detailed error logging with context information
   - Structured logging for easier debugging
   - Tracking of error patterns and frequencies

4. **Graceful Degradation**:
   - Returns empty arrays instead of errors when possible
   - Maintains service availability during partial outages

## Services

### Cleanup Service

Automatically removes emails and mailboxes that are older than 24 hours to maintain system performance and privacy.

### SMTP Server

Listens for incoming emails on the configured port and stores them in the database, associating them with the appropriate mailbox.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| FRONTEND_URL | URL of the frontend application | - |
| CORS_ORIGIN | Allowed origin for CORS | - |
| API_PORT | Port for the API server | 3001 |
| SMTP_PORT | Port for the SMTP server | 25 |
| SMTP_DOMAIN | Domain for the SMTP server | - |
| NODE_ENV | Environment (development/production) | production |

## Scripts

- `pnpm dev` - Start the development server with hot reloading
- `pnpm build` - Build the TypeScript code
- `pnpm start` - Start the production server
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations

## Dependencies

- Express.js - Web framework
- smtp-server - SMTP server implementation
- Prisma - ORM for database operations
- mailparser - Email parsing
- node-cron - Scheduled tasks
- nanoid - ID generation
- cors - CORS middleware