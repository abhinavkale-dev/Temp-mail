# Temp-Mail

A temporary email service with a modern UI that allows users to create disposable email addresses and receive emails without registration.

![Temp-Mail Screenshot](https://via.placeholder.com/800x400?text=Temp-Mail+Screenshot)

## Features

- ✨ Create custom email addresses instantly
- 📨 Receive real emails through SMTP server
- 🔄 Auto-refresh with smart polling (reduces frequency when stable)
- 🌙 Dark mode support
- 📱 Responsive design for mobile and desktop
- 🔒 Private and secure - emails auto-delete after 24 hours
- ⚡ Fast and lightweight interface

## Project Structure

The project consists of two main parts:

### Frontend

- Built with Next.js 15
- Uses React with TypeScript
- Styled with Tailwind CSS
- Located in the `/frontend` directory

### Backend

- Node.js with Express
- TypeScript
- SMTP server for receiving emails
- PostgreSQL database with Prisma ORM
- Located in the `/backend` directory

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/temp-mail.git
cd temp-mail
```

2. Set up the backend:

```bash
cd backend
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
pnpm prisma migrate dev

# Start the backend server
pnpm dev
```

3. Set up the frontend:

```bash
cd frontend
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env if needed

# Start the frontend development server
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## API Endpoints

### Backend API

- `POST /api/mailboxes/custom` - Create a custom mailbox
- `POST /api/mailboxes/:address/messages` - Get messages for a mailbox
- `GET /api/messages/:id` - Get a specific message

## Architecture

### Frontend

- App Router architecture with Next.js
- React components with TypeScript
- Tailwind CSS for styling
- Client-side state management with React hooks
- API integration with fetch

### Backend

- Express.js server
- SMTP server for receiving emails
- Prisma ORM for database operations
- Rate limiting middleware
- Scheduled cleanup service for expired emails

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

### Backend

The backend can be deployed to any Node.js hosting service:

```bash
cd backend
pnpm build
# Deploy the dist folder
```

### Frontend

The frontend can be deployed to Vercel or any static hosting service:

```bash
cd frontend
pnpm build
# Deploy the .next folder
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.