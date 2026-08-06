# Growth Module

Version: 1.0

Status: Planned

---

# Overview

The Growth Module allows parents to record and monitor the baby's physical growth over time.

Each measurement is stored as a Growth Event, preserving the complete measurement history.

The first version focuses on weight tracking.

Future versions will support:

- Height
- Head Circumference
- WHO Growth Charts
- Growth Trend Analysis

---

# Goals

- Record baby's weight over time.
- Preserve measurement history.
- Display current age automatically.
- Show latest weight on Dashboard.
- Prepare data for future growth charts.

---

# Scope (MVP)

Supported Measurements

- Weight

Future

- Height
- Head Circumference
- BMI
- WHO Percentile

---

# Growth Event

Every weight measurement is stored as an Event.

Event Type

GROWTH

---

# Weight Record

Fields

- Measurement Date
- Weight (kg)
- Notes

Optional

- Measured By
- Measurement Location

---

# Validation

- Weight must be greater than 0 kg.
- Measurement date cannot be before birth date.
- Measurement date cannot be in the future.
- Multiple measurements are allowed on the same day.

---

# Growth History

Display all recorded weight measurements.

Newest First

Example

| Date       | Age     | Weight  |
| ---------- | ------- | ------- |
| 2026-08-01 | 8 Weeks | 5.20 kg |
| 2026-07-24 | 7 Weeks | 4.95 kg |
| 2026-07-17 | 6 Weeks | 4.70 kg |

Users can

- View
- Edit
- Delete

---

# Dashboard

Display current growth summary.

## Current Weight

Display the latest recorded weight.

Example

⚖ Weight

5.20 kg

Last Updated

2 Days Ago

---

## Baby Age

Automatically calculate age based on baby's birthday.

Display

- Weeks
- Months (Future)

Example

👶 Age

8 Weeks

Calculation

Current Date - Birthday

---

## Weight Trend

Display comparison with previous measurement.

Example

+0.25 kg

Since Last Measurement

Future

Trend Arrow

↑ Increasing

↓

Decreasing

→ Stable

---

# API

## Latest Growth

GET /babies/{babyId}/growth/latest

Response

{
"weightKg": 5.2,
"measuredAt": "2026-08-01",
"ageWeeks": 8
}

---

## Growth History

GET /babies/{babyId}/growth

Response

[
{
"id": "...",
"weightKg": 5.2,
"measuredAt": "2026-08-01"
},
{
"id": "...",
"weightKg": 4.95,
"measuredAt": "2026-07-24"
}
]

---

## Create Growth Record

POST /growth

---

## Update Growth Record

PATCH /growth/{id}

---

## Delete Growth Record

DELETE /growth/{id}

---

# Dashboard API

GET /dashboard/summary?date=YYYY-MM-DD

Response

{
"feeding": {
"bottleMilkMl": 620,
"breastfeeding": {
"leftMinutes": 58,
"rightMinutes": 62,
"totalMinutes": 120
}
},
"diaper": {
"total": 7,
"pee": 6,
"poop": 3,
"status": "NORMAL"
},
"growth": {
"currentWeightKg": 5.20,
"lastMeasuredAt": "2026-08-01",
"ageWeeks": 8
}
}

---

# Dashboard UI

Today's Summary

🍼 Bottle Milk

620 ml

---

🤱 Breastfeeding

Left 58 mins

Right 62 mins

Total 120 mins

---

🩲 Diaper

7

✅ Normal

---

💧 Pee

6

---

💩 Poop

3

---

⚖ Weight

5.20 kg

Updated 2 Days Ago

---

👶 Age

8 Weeks

Automatically Calculated

---

# Future Enhancements

- WHO Weight-for-Age Chart
- Height Tracking
- Head Circumference Tracking
- Growth Percentile
- Growth Velocity
- Automatic Growth Alerts
- Export Growth Report
