# Workspaces API

## Overview

Workspaces are the primary organizational units in the application, containing tasks, notes, and team collaborations.

## Endpoints

### Create Workspace

**POST** `/api/workspaces/`

Create a new workspace.

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project workspace for team collaboration"
}
```

### Get Workspaces

**GET** `/api/workspaces/`

Get all workspaces for the authenticated user.

### Get Workspace Data

**GET** `/api/workspaces/data`

Get detailed workspace data including members and content.

### Get Workspace by Team

**GET** `/api/workspaces/:team_id/team`

Get workspace associated with a specific team.

### Add Member

**POST** `/api/workspaces/:id/members`

Add a user to the workspace.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "role": "member"
}
```

### Get Workspace

**GET** `/api/workspaces/:id`

Get details of a specific workspace.

### Update Workspace

**PUT** `/api/workspaces/:id`

Update workspace information.

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

### Delete Workspace

**DELETE** `/api/workspaces/:id`

Delete a workspace.

### Get Team IDs

**GET** `/api/workspaces/teams/id/fetch`

Get team IDs associated with workspaces.

## Permissions

- **Create**: Authenticated users
- **Read**: Workspace members only
- **Update/Delete**: Workspace owner only
- **Add Members**: Workspace owner/admin