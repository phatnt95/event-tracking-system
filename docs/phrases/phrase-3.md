Implement Baby Management.

Each authenticated user owns one or more babies.

Entity

Baby

Fields

- id
- ownerId
- name
- nickname
- gender
- birthday
- birthWeight
- birthHeight
- note
- archived
- createdAt
- updatedAt

Features

- Create Baby
- Update Baby
- Archive Baby
- Get Baby
- List Babies

Validation

Users cannot access babies owned by other users.

Generate

- Entity
- Prisma schema
- Repository
- Services
- Controllers
- DTOs
- Swagger

Frontend

Pages

/babies

/babies/new

/babies/[id]

Focus on reusable UI components.
