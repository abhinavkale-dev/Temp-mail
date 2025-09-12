# Temp-Mail

A temporary email service with a modern UI that allows users to create disposable email addresses and receive emails without registration.

![Temp-Mail Screenshot](./frontend/public/temp-mail-image.png)

## Project Structure

The project consists of two main parts:

### Frontend

- Built with Next.js 15
- Uses React with TypeScript
- Styled with Tailwind CSS
- Fully responsive design for mobile, tablet, and desktop
- Located in the `/frontend` directory

### Backend

- Node.js with Express
- TypeScript
- SMTP server for receiving emails
- PostgreSQL database with Prisma ORM
- Robust error handling and recovery
- Located in the `/backend` directory

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- pnpm (recommended) or npm

### Backend Setup

1. Navigate to the backend directory:

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

4. Run database migrations:

```bash
pnpm prisma migrate dev
```

5. Start the backend server:

```bash
# Development mode
pnpm dev

# Production mode
pnpm build
pnpm start
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env` file in the frontend directory with the following content:

```
NEXT_PUBLIC_API_BASE=
```

4. Start the frontend development server:

```bash
# Development mode
pnpm dev

# Production mode
pnpm build
pnpm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Backend Architecture

The backend is built with Node.js and Express, providing both an API server and an SMTP server for receiving emails.

### Key Components

- **API Server**: Handles HTTP requests for creating mailboxes and retrieving messages
- **SMTP Server**: Receives incoming emails and stores them in the database
- **Database**: PostgreSQL with Prisma ORM for data storage and retrieval
- **Auto-Creation**: Automatically creates mailboxes when needed for resilience
- **Cleanup Service**: Automatically removes expired emails after 24 hours
- **Health Check**: Endpoint to verify backend server status

### API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/mailboxes/custom` - Create a custom mailbox
- `POST /api/mailboxes/:address/messages` - Get messages for a mailbox
- `GET /api/messages/:id` - Get a specific message

### Database Schema

The database uses Prisma ORM with the following main models:

- `Mailbox`: Represents a temporary email address
- `Message`: Stores received emails with their content and metadata

## Frontend Architecture

The frontend is built with Next.js 15 and React, providing a responsive and modern user interface.

### Key Components

- **Home Page**: Allows users to create custom email addresses
- **Mailbox Page**: Displays received emails with auto-refresh functionality
- **Message Detail Page**: Shows the full content of an email with HTML support

### Technologies Used

- **Next.js**: React framework with App Router
- **React**: UI library for building components
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Sonner**: Toast notifications

### State Management

- React hooks for local state management
- Smart polling with exponential backoff for API requests
- Cache-busting for fresh data
- Error resilience with graceful degradation

### Responsive Design

- Mobile-first approach with adaptive layouts
- Optimized viewing experience on all device sizes
- Touch-friendly interface elements
- Responsive typography and spacing

## Development

### Running Tests

```bash
# Backend tests
cd backend
pnpm test

# Frontend tests
cd frontend
pnpm test
```

### Building for Production

```bash
# Build backend
cd backend
pnpm build

# Build frontend
cd frontend
pnpm build
```

## Deployment

### Backend Deployment

The backend can be deployed to any Node.js hosting service:

1. Set up the environment variables as described above
2. Build the project: `pnpm build`
3. Start the server: `pnpm start`

### Frontend Deployment

The frontend can be deployed to Vercel or any static hosting service:

1. Set up the environment variables as described above
2. Build the project: `pnpm build`
3. Deploy the `.next` folder

## Recent Improvements

### Backend Enhancements

- Removed rate limiting for improved user experience
- Added robust error handling and auto-recovery mechanisms
- Implemented automatic mailbox creation for resilience
- Enhanced database connection error handling
- Improved logging for better debugging and monitoring

### Frontend Enhancements

- Implemented fully responsive design for all screen sizes
- Enhanced error handling with graceful degradation
- Added cache-busting for reliable data fetching
- Improved UI with consistent button sizing and styling
- Optimized email content display for mobile devices
- Fixed scrolling issues for long email content
- Enhanced visual feedback during loading states