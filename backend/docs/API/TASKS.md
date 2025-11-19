# Tasks API

## Overview

The Tasks API manages task creation, assignment, status tracking, and organization within workspaces.

## Endpoints

### Create Task

**POST** `/api/tasks/`

Create a new task.

**Request Body:**
```json
{
  "title": "Complete project proposal",
  "description": "Write and review project proposal document",
  "status": "todo",
  "priority": "high",
  "due_date": "2025-12-01",
  "assigned_to": "user-uuid",
  "workspace_id": "workspace-uuid"
}
```

### Get Tasks

**GET** `/api/tasks/`

Get all active tasks for the user.

### Get Tasks by Workspace

**GET** `/api/tasks/workspace/:id`

Get all tasks in a specific workspace.

### Get User's Tasks

**GET** `/api/tasks/user`

Get tasks assigned to the current user.

### Get Incomplete Tasks

**GET** `/api/tasks/notdone`

Get all incomplete tasks.

### Get Task by ID

**GET** `/api/tasks/:id`

Get details of a specific task.

### Get Archived Tasks

**GET** `/api/tasks/workspace/:workspace_id/archived`

Get archived tasks in a workspace.

### Update Task

**PUT** `/api/tasks/:id`

Update task information.

### Delete Task

**DELETE** `/api/tasks/:id`

Delete a task.

### Update Task Status

**PUT** `/api/tasks/:id/status`

Update task status.

**Request Body:**
```json
{
  "status": "done"
}
```

## Task Statuses

- `todo` - Not started
- `doing` - In progress
- `done` - Completed

## Priorities

- `low`
- `medium`
- `high`

## Permissions

- **Create**: Workspace members
- **Read**: Task assignee or workspace members
- **Update**: Task assignee or workspace owner
- **Delete**: Task creator or workspace owner