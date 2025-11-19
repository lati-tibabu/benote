# Assignments API

## Overview

Assignments enable teachers to create and distribute tasks to students within classrooms.

## Endpoints

### Create Assignment

**POST** `/api/assignments/`

Create a new assignment (teacher only).

**Request Body:**
```json
{
  "title": "Final Project",
  "description": "Build a web application",
  "due_date": "2025-12-15",
  "course_id": "course-uuid"
}
```

### Get Assignments

**GET** `/api/assignments/`

Get assignments for the user (teachers see created, students see assigned).

### Get Assignment

**GET** `/api/assignments/:id`

Get assignment details.

### Update Assignment

**PUT** `/api/assignments/:id`

Update assignment (teacher only).

### Delete Assignment

**DELETE** `/api/assignments/:id`

Delete assignment (teacher only).

### Get Classroom Assignments

**GET** `/api/assignments/classroom/all`

Get all assignments in user's classrooms.

## Features

- **Due Dates**: Set submission deadlines
- **Course Integration**: Link to specific courses
- **Submission Tracking**: Monitor student submissions
- **Grading**: Teachers can grade submissions

## Workflow

1. Teacher creates assignment for a course
2. Students receive assignment notification
3. Students submit work before due date
4. Teacher reviews and grades submissions
5. Students receive feedback

## Permissions

- **Create/Update/Delete**: Teachers only
- **Read**: Teachers (own assignments) and assigned students