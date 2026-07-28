Implement Authentication Module.

Requirements

Features

- Register
- Login
- Logout
- Refresh Token
- Current User
- Forgot Password (placeholder)

Database

User
RefreshToken

Security

- JWT Access Token
- JWT Refresh Token
- Password Hashing (bcrypt)
- Email uniqueness

Architecture

Use

Domain
Application
Infrastructure
Presentation

Use Repository Pattern.

DTO Validation.

Swagger documentation.

REST APIs

POST /auth/register

POST /auth/login

POST /auth/refresh

POST /auth/logout

GET /auth/me

Return unified response.

Generate sequence diagram before implementation.

Write tests whenever possible.
