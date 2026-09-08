# Transactions API

A TypeScript and Express REST API for user authentication, account management, and ledger-backed financial transactions. The API uses MongoDB for persistence, JWTs for authentication, and Nodemailer for transactional email.

## Features

- User registration, login, and logout
- Password hashing and JWT authentication
- HTTP-only authentication cookies with Bearer-token support
- Account creation and account balance lookup
- Transaction creation with idempotency-key protection
- System-user endpoint for adding initial funds
- MongoDB transactions for ledger updates
- Welcome email delivery through SMTP

## Tech Stack

- Node.js
- TypeScript
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens
- Nodemailer

## Requirements

- Node.js 18 or newer
- A running MongoDB instance or MongoDB Atlas database
- An SMTP account if registration emails should be sent

## Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/transactions
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-password
```

`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS` are used by Nodemailer when a welcome email is sent after registration. Keep `.env` out of source control.

## Running the API

Start the development server with automatic reload:

```bash
npm run server
```

Start the server normally:

```bash
npm start
```

Build the TypeScript project:

```bash
npm run build
```

The server listens on `http://localhost:3000` after a successful MongoDB connection.

## Authentication

Successful registration and login set an HTTP-only cookie named `token`. Authenticated requests may use that cookie or send the token explicitly:

```http
Authorization: Bearer <token>
```

Logout blacklists the current token and clears the cookie.

## API Reference

Base URL: `http://localhost:3000`

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | Create a user and set an auth cookie |
| `POST` | `/api/auth/login` | No | Authenticate a user and set an auth cookie |
| `POST` | `/api/auth/logout` | Optional | Blacklist the current token and clear the cookie |

Registration body:

```json
{
	"firstName": "Ada",
	"lastName": "Lovelace",
	"middleName": "",
	"emailId": "ada@example.com",
	"password": "StrongPass1!"
}
```

The password must be at least eight characters and contain uppercase, lowercase, numeric, and symbol characters. `middleName` is optional.

Login body:

```json
{
	"emailId": "ada@example.com",
	"password": "StrongPass1!"
}
```

### Accounts

All account endpoints require authentication.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/accounts` | Create an account for the authenticated user |
| `GET` | `/api/accounts` | List the authenticated user's accounts |
| `GET` | `/api/accounts/balance/:accountId` | Get an account's available balance |

Creating an account does not require a request body:

```bash
curl -X POST http://localhost:3000/api/accounts \
	-H "Authorization: Bearer <token>"
```

### Transactions

`POST /api/transactions` requires an authenticated user. Every request must include a unique `idempotencyKey`; reusing a key returns the existing transaction rather than creating another one.

```json
{
	"fromAccount": "<source-account-id>",
	"toAccount": "<destination-account-id>",
	"amount": 1000,
	"idempotencyKey": "transfer-2026-0001"
}
```

```bash
curl -X POST http://localhost:3000/api/transactions \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <token>" \
	-d '{
		"fromAccount": "<source-account-id>",
		"toAccount": "<destination-account-id>",
		"amount": 1000,
		"idempotencyKey": "transfer-2026-0001"
	}'
```

The system-user endpoint creates an initial-funds transaction and requires a JWT belonging to a user with `systemUser: true`:

```http
POST /api/transactions/system/initial-funds
Authorization: Bearer <system-user-token>
Content-Type: application/json
```

```json
{
	"toAccount": "<destination-account-id>",
	"amount": 5000,
	"idempotencyKey": "initial-funds-2026-0001"
}
```

## Project Structure

```text
server.ts                 Application entry point
src/app.ts                Express app and route registration
src/configs/              MongoDB and email configuration
src/controllers/          HTTP request handlers
src/middleware/           User and system-user authentication
src/models/               Mongoose models
src/routes/               API route definitions
src/services/             Email and transaction business logic
src/utils/                Validation and shared constants
src/types/                TypeScript type declarations
```

## Error Handling

Responses use JSON and generally include a `status`, `message`, or `error` field. Common status codes include:

- `201 Created` for successful registration, account creation, and transaction creation
- `200 OK` for successful reads, login, and logout
- `400 Bad Request` for invalid input or credentials
- `401 Unauthorized` when authentication is missing or invalid
- `403 Forbidden` for blacklisted tokens or non-system users using the system endpoint
- `404 Not Found` when a requested account does not exist
- `500 Internal Server Error` for unexpected server or database errors

## Security Notes

- Use a long, unpredictable `JWT_SECRET` in every environment.
- Use HTTPS in production so the secure auth cookie is protected in transit.
- Never commit `.env` files or SMTP credentials.
- Use a fresh idempotency key for each intended transaction.

## License

This project is currently marked as `ISC` in `package.json`.