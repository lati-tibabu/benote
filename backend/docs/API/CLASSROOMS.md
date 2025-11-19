# Classrooms API

## Overview

Classrooms provide virtual learning environments for teachers and students with course management.

## Endpoints

### Create Classroom

**POST** `/api/classrooms/`

Create a new classroom (teacher only).

**Request Body:**
```json
{
  "name": "Computer Science 101",
  "description": "Introduction to programming"
}
```

### Join Classroom

**POST** `/api/classrooms/:id/join`

Join a classroom as a student.

### Leave Classroom

**POST** `/api/classrooms/:id/leave`

Leave a classroom.

### Get Classrooms

**GET** `/api/classrooms/`

Get classrooms (teachers see their classrooms, students see enrolled ones).

### Get Classroom

**GET** `/api/classrooms/:id`

Get classroom details including courses and students.

### Update Classroom

**PUT** `/api/classrooms/:id`

Update classroom information (teacher only).

### Delete Classroom

**DELETE** `/api/classrooms/:id`

Delete a classroom (teacher only).

## Roles

- **Teacher**: Can create/manage classroom and courses
- **Student**: Can join classrooms and access materials

## Features

- **Course Management**: Organize learning content
- **Student Enrollment**: Manage class membership
- **Assignment Distribution**: Share assignments with students
- **Progress Tracking**: Monitor student progress

## Permissions

- **Create/Update/Delete**: Teachers only
- **Join/Leave**: Students only
- **Read**: Teachers (own classrooms) and enrolled students