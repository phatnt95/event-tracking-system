Design the Event Engine.

Every baby activity must be represented by an Event.

Future modules

Feed
Diaper
Sleep
Medicine
Growth
Vaccination

must all extend the Event concept.

Event Entity

- id
- babyId
- type
- occurredAt
- note
- createdBy
- createdAt
- updatedAt

Requirements

Design an extensible architecture.

Avoid nullable columns.

Avoid giant Event table.

Use extension tables.

Explain trade-offs.

Generate

Database ERD

Domain Model

Folder Structure

REST API

Event lifecycle

Audit strategy

Attachment strategy

Do NOT implement Feed or Diaper yet.

Only build the Event foundation.
