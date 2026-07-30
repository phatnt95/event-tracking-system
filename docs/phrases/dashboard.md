# Dashboard Module (MVP)

## Goal

Provide parents with a quick overview of today's baby activities.

The dashboard should summarize the most important daily metrics without requiring users to browse the timeline.

---

## Today's Summary

### 1. Total Milk Intake

Description

Display the total amount of milk consumed today.

Calculation

- Sum of all bottle feeding volumes (Expressed Breast Milk + Formula)
- Unit: ml

Example

```
🍼 Milk Intake

620 ml
```

---

### 2. Total Pee Count

Description

Display the number of pee events recorded today.

Calculation

Count all diaper events where:

- Pee
- Pee + Poop

Example

```
💧 Pee

6 Times
```

---

### 3. Total Poop Count

Description

Display the number of poop events recorded today.

Calculation

Count all diaper events where:

- Poop
- Pee + Poop

Example

```
💩 Poop

3 Times
```

---

## Time Range

Default

Today

Definition

00:00:00 - 23:59:59 (User Local Time)

---

## API

GET /dashboard/date=<today>

Response

{
"date": "2026-07-30",
"milkIntakeMl": 620,
"peeCount": 6,
"poopCount": 3
}
