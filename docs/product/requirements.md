# Functional Requirements

Version: 0.1.0

---

# MVP Scope

The first milestone focuses on:

1. Authentication
2. Baby Management
3. Event Recording

Everything else is out of scope for MVP.

---

# Module 1 - Authentication

## Goal

Allow users to securely access the application.

### Features

- Register
- Login
- Logout
- Refresh Token
- Forgot Password
- Reset Password

### User Information

- Email
- Password
- Display Name

### Validation

- Email must be unique
- Password minimum 8 characters
- Password encrypted

---

# Module 2 - Baby Management

## Goal

Each user can manage one or more babies.

### Create Baby

Fields

- Name
- Nickname (Optional)
- Gender
- Birthday
- Birth Weight
- Birth Height
- Notes

### Edit Baby

User can edit all information.

### Archive Baby

Baby is hidden but not deleted.

---

# Module 3 - Event Tracking

Every activity is stored as an Event.

---

## Event Types

Current

- Feed
- Diaper

Future

- Sleep
- Medicine
- Growth
- Vaccine

---

# Feed Event

## Feed Type

- Breastfeeding
- Breast Milk Bottle
- Formula

---

## Breastfeeding

Fields

- Start Time
- End Time
- Left Duration
- Right Duration
- Notes

---

## Bottle Feeding

Fields

- Milk Type
- Brand
- Stage
- Prepared Volume
- Consumed Volume

---

Validation

- Consumed <= Prepared
- Time cannot be future

---

# Diaper Event

Types

- Pee
- Poop
- Both

---

## Poop

Fields

Color

- Yellow
- Brown
- Green
- Black
- White
- Red

Consistency

- Watery
- Soft
- Normal
- Hard
- Seed-like

Amount

- Small
- Medium
- Large

Flags

- Blood
- Mucus

Photo

Optional

Notes

Optional

---

## Pee

Fields

Amount

- Small
- Medium
- Large

Notes

---

# Timeline

Display all events ordered by Event Time.

Capabilities

- View
- Edit
- Delete

Sort

Newest First

---

# Non-functional Requirements

## Performance

API Response < 500ms

## Security

JWT Authentication

Password Hashing

HTTPS

## Database

PostgreSQL

## API

RESTful API

## Backend

NestJS

## Frontend

Next.js

## ORM

Prisma
