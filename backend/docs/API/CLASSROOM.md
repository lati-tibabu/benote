# Classroom API

⚠️ **Deprecated**: Classroom functionality is part of the legacy education module and will be phased out. Access to these endpoints is controlled by the `FEATURE_CLASSROOM` environment flag and will eventually be removed.

## Overview

Classrooms provided a collaborative space for teacher/student interactions, assignments, submissions, and materials. During the productivity pivot, all data should be migrated to general workspace/project constructs and endpoints retired.

## Endpoints

- **GET** `/api/classrooms` - list classrooms (requires feature flag)
- **POST** `/api/classrooms` - create a new classroom
- **GET** `/api/classrooms/:id` - retrieve classroom details
- **PUT** `/api/classrooms/:id` - update classroom info
- **DELETE** `/api/classrooms/:id` - delete a classroom
- **POST** `/api/classrooms/:id/join` - join as student
- **POST** `/api/classrooms/:id/leave` - leave classroom

(Additional endpoints for assignments, submissions, materials exist and are documented separately.)

## Migration Guidance

- Convert classroom records to workspace/team entities.
- Assignments should become task deliverables with comments or attachments.
- Materials migrate to generic resource attachments within workspaces or projects.

## Permissions

- `teacher_id`/`students` relationships are used for access control.
- Replace with workspace/team roles for generalized collaboration.
