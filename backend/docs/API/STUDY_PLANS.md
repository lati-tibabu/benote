# Study Plans API

⚠️ **Deprecated**: Study plans are part of the legacy education module being phased out in favor of a task-integrated planning model. The endpoints remain available while the `FEATURE_STUDY_PLANS` flag is enabled and will be removed after the compatibility window.

## Overview

Study Plans help users organize their learning with structured schedules and progress tracking.

## Endpoints

### Create Study Plan

**POST** `/api/studyPlans/`

Create a new study plan.

**Request Body:**
```json
{
  "title": "Mathematics Semester Plan",
  "description": "Complete mathematics curriculum",
  "start_date": "2025-01-01",
  "end_date": "2025-06-01",
  "subjects": ["Algebra", "Calculus", "Statistics"]
}
```

### Get Study Plans

**GET** `/api/studyPlans/`

Get all study plans for the user.

### Get Study Plan

**GET** `/api/studyPlans/:id`

Get details of a specific study plan.

### Update Study Plan

**PUT** `/api/studyPlans/:id`

Update study plan information.

### Delete Study Plan

**DELETE** `/api/studyPlans/:id`

Delete a study plan.

## Features

- **Progress Tracking**: Monitor completion status
- **Time Management**: Schedule study sessions
- **Subject Organization**: Group by subjects/topics
- **Goal Setting**: Set learning objectives

## Permissions

- **CRUD Operations**: Plan owner only
- **Read**: Owner only (private plans)