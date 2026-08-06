# Vaccination Module

Version: 1.0

Status: Planned

---

# Overview

The Vaccination Module helps parents manage their baby's immunization schedule.

The system automatically generates a recommended vaccination timeline based on the baby's date of birth.

Parents can:

- View upcoming vaccinations
- Record completed vaccinations
- Track overdue vaccinations
- Receive reminders
- Export vaccination history

---

# Goals

- Never miss an important vaccine.
- Automatically calculate due dates.
- Maintain complete vaccination history.
- Support future schedule updates.

---

# Scope

Current Version

- Recommended vaccination schedule
- Vaccination timeline
- Vaccination records
- Reminder status

Future Version

- Push notifications
- Vaccine certificates
- Multiple vaccination schedules
- Country-specific schedules

---

# Vaccination Schedule

## Newborn (0 - 1 Month)

### Within 24 Hours After Birth

- Hepatitis B (Dose 0)

Recommended Age

0 days

---

### Within 1 Month

- BCG (Tuberculosis)

Recommended Age

1 month

---

# 2 - 4 Months

## 2 Months

Vaccines

- 6-in-1 Dose 1
- Pneumococcal Dose 1
- Rotavirus Dose 1
- Meningococcal B Dose 1
- Meningococcal ACYW Dose 1

---

## 3 Months

Vaccines

- 6-in-1 Dose 2
- Rotavirus Dose 2
- Pneumococcal Dose 2

---

## 4 Months

Vaccines

- 6-in-1 Dose 3
- Pneumococcal Dose 3
- Meningococcal B Dose 2
- Meningococcal ACYW Dose 2

---

# From 6 Months

## 6 Months

Vaccines

- Seasonal Influenza Dose 1
- Pneumococcal Dose 3
- Meningococcal ACYW Dose 3

---

## One Month After First Flu Shot

Vaccines

- Seasonal Influenza Dose 2

---

## From 6 Months

Optional

- Meningococcal BC

---

# 9 - 12 Months

## 9 Months

Vaccines

- MMR Dose 1
- Chickenpox Dose 1

---

## From 9 Months

Vaccines

- Japanese Encephalitis

---

## 12 Months

Vaccines

- Chickenpox Dose 2
- MMR Dose 2
- Pneumococcal Dose 4 (Booster)
- Meningococcal ACYW Dose 4

---

# Vaccination Dashboard

Display

Upcoming Vaccinations

Example

Today

Upcoming

• MMR Dose 1

Due

2026-10-15

Remaining

12 Days

---

Completed

✓ Hepatitis B

✓ BCG

✓ 6-in-1 Dose 1

---

Overdue

⚠ Rotavirus Dose 2

7 days overdue

---

# Vaccination Detail

Fields

- Vaccine
- Dose
- Recommended Date
- Actual Vaccination Date
- Status
- Hospital / Clinic
- Doctor
- Batch Number (Optional)
- Manufacturer (Optional)
- Notes

---

# Vaccination Status

Possible values

PENDING

UPCOMING

COMPLETED

OVERDUE

SKIPPED

OPTIONAL

---

# Vaccination Timeline

Display vaccinations ordered by recommended date.

Example

✓ Hepatitis B

2026-07-30

Completed

---

✓ BCG

2026-08-20

Completed

---

⚠ 6-in-1 Dose 1

Due Tomorrow

---

Upcoming

Pneumococcal Dose 1

2026-09-25

---

# Reminder

Notify parents

- 7 days before due date
- 3 days before due date
- On due date
- 7 days overdue

---

# Record Vaccination

Users can mark a vaccination as completed.

Fields

- Vaccination Date
- Hospital / Clinic
- Doctor
- Manufacturer
- Batch Number
- Notes

Attachments

- Vaccination Certificate
- Photos

---

# API

## Vaccination Schedule

GET /babies/{babyId}/vaccinations

Returns

- Upcoming
- Completed
- Overdue

---

## Vaccination Detail

GET /vaccinations/{id}

---

## Complete Vaccination

PATCH /vaccinations/{id}/complete

---

## Update Vaccination

PATCH /vaccinations/{id}

---

# Validation

- Vaccination date cannot be before baby's birth date.
- Vaccination cannot be marked completed twice.
- Optional vaccines are excluded from overdue calculations.
- Reminder is disabled after completion.

---

# Future Enhancements

- WHO vaccination schedules
- Vietnam Ministry of Health schedule
- CDC schedule
- Multiple schedule profiles
- Automatic schedule updates
- QR code for vaccination certificate
- PDF vaccination booklet
- Family reminder notifications
