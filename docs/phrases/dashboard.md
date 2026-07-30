# Dashboard Module (MVP)

## Today's Summary

### 1. Total Milk Intake

Description

Display the total amount of milk consumed from bottle feeding today.

Includes

- Formula
- Expressed Breast Milk

Calculation

Sum of consumedVolume (ml)

Card

🍼 Bottle Milk

620 ml

---

### 2. Total Breastfeeding Duration

Description

Display the total breastfeeding duration today.

Calculation

Sum of all breastfeeding sessions.

Display

- Left Breast Total Duration
- Right Breast Total Duration
- Total Duration

Example

🧑‍🍼 Breastfeeding

Left
58 mins

Right
62 mins

Total
120 mins

If only one side is recorded during a session, the other side is treated as 0 minutes.

---

### 3. Total Diaper Changes

Description

Display the total diaper changes today.

Includes

- Pee
- Poop
- Pee + Poop

Expected Range

6–8 times/day

Status

| Count | Status   |
| ----- | -------- |
| < 6   | Warning  |
| 6 - 8 | Normal   |
| 9     | Warning  |
| >=10  | Critical |

---

### 4. Pee Count

Count diaper events that contain pee.

---

### 5. Poop Count

Count diaper events that contain poop.
