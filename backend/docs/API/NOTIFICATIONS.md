# Notifications API

## Overview

Notifications keep users informed about important events, deadlines, and team activities.

## Endpoints

### Create Notification

**POST** `/api/notifications/`

Create a new notification (system/admin use).

**Request Body:**
```json
{
  "title": "Assignment Due Soon",
  "message": "Your assignment is due in 24 hours",
  "type": "deadline",
  "receiver_id": "user-uuid"
}
```

### Get Notifications

**GET** `/api/notifications/`

Get user's notifications with pagination.

### Get Unread Count

**GET** `/api/notifications/unread-count`

Get count of unread notifications.

**Response:**
```json
{
  "count": 5
}
```

### Get Notification

**GET** `/api/notifications/:id`

Get specific notification details.

### Update Notification

**PUT** `/api/notifications/:id`

Update notification (mark as read, etc.).

**Request Body:**
```json
{
  "is_read": true
}
```

### Delete Notification

**DELETE** `/api/notifications/:id`

Delete a notification.

## Notification Types

- `deadline` - Task/assignment deadlines
- `team` - Team activity notifications
- `system` - System announcements
- `mention` - User mentions
- `invitation` - Team/classroom invitations

## Features

- **Real-time Delivery**: Instant notifications via WebSocket
- **Browser Notifications**: Native desktop alerts
- **Email Notifications**: Optional email delivery
- **Categorization**: Different types for easy filtering
- **Read Status**: Track read/unread state

## Automatic Triggers

Notifications are automatically created for:

- Task assignments
- Deadline reminders
- Team invitations
- Assignment submissions
- Classroom activities
- System maintenance

## Permissions

- **Create**: System/admin only
- **Read/Update/Delete**: Notification owner only