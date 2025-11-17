# Teams API

## Overview

Teams enable collaborative work within workspaces, with role-based permissions and membership management.

## Endpoints

### Create Team

**POST** `/api/teams/`

Create a new team within a workspace.

**Request Body:**
```json
{
  "name": "Development Team",
  "description": "Core development team",
  "workspace_id": "workspace-uuid"
}
```

### Get Teams

**GET** `/api/teams/`

Get all teams for the authenticated user.

### Add Member

**POST** `/api/teams/:team_id/members`

Add a user to the team.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "role": "member"
}
```

### Promote to Admin

**PUT** `/api/teams/:team_id/promote`

Promote a team member to admin.

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

### Demote Admin

**PUT** `/api/teams/:team_id/demote`

Demote a team admin to member.

### Remove Member

**DELETE** `/api/teams/:team_id/members/:user_id`

Remove a user from the team.

### Get Team

**GET** `/api/teams/:id`

Get team details and members.

### Update Team

**PUT** `/api/teams/:id`

Update team information.

### Delete Team

**DELETE** `/api/teams/:id`

Delete a team.

### Accept Invitation

**PUT** `/api/teams/:id/membership/invitation`

Accept team membership invitation.

### Remove Workspace

**PUT** `/api/teams/:id/workspace/remove`

Remove workspace association from team.

## Roles

- **Owner**: Full control, can delete team
- **Admin**: Can manage members and settings
- **Member**: Can participate in team activities

## Permissions

- **Create**: Workspace members
- **Manage Members**: Team admins/owners
- **Update/Delete**: Team owner only