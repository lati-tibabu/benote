# Notes API

## Overview

The Notes API provides AI-powered note management with creation, editing, publishing, and search capabilities.

## Endpoints

### Create Note

**POST** `/api/notes/`

Create a new note with AI assistance.

**Request Body:**
```json
{
  "title": "Machine Learning Concepts",
  "content": "Notes on ML algorithms...",
  "workspace_id": "workspace-uuid"
}
```

### Get Notes

**GET** `/api/notes/:workspace_id`

Get all notes in a workspace.

### Get Note

**GET** `/api/notes/:workspace_id/:id`

Get a specific note by ID.

### Update Note

**PUT** `/api/notes/:id`

Update note content.

### Delete Note

**DELETE** `/api/notes/:id`

Delete a note.

### Get Public Note

**GET** `/api/notes/public/:id/note`

Get a publicly shared note.

### Get Public Notes

**GET** `/api/notes/public/notes/load`

Get all public notes.

### Publish Note

**PATCH** `/api/notes/:workspace_id/:id/publish`

Publish or unpublish a note.

**Request Body:**
```json
{
  "is_public": true
}
```

### Search Public Notes

**GET** `/api/notes/public/notes/search`

Search public notes by query.

**Query Parameters:**
- `q` - Search query
- `limit` - Number of results
- `offset` - Pagination offset

## AI Features

- **Smart Creation**: AI generates structured notes from input
- **Chat Enhancement**: Interactive AI chat for note improvement
- **Content Analysis**: AI-powered content suggestions

## Publishing

Notes can be published publicly for sharing:

- Public notes are accessible without authentication
- Searchable by title and content
- Maintains author attribution

## Permissions

- **Create/Update/Delete**: Note owner or workspace members
- **Read Private**: Workspace members
- **Read Public**: Anyone
- **Publish**: Note owner only