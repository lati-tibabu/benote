# Services

## Overview

Services contain reusable business logic and external integrations, separating concerns from controllers.

## Email Service (`emailService.js`)

### Features
- Send password reset emails
- Send verification emails
- Template-based email sending

### Usage
```javascript
const emailService = require('./services/emailService');

await emailService.sendPasswordResetEmail(user.email, resetToken);
await emailService.sendVerificationEmail(user.email, verificationToken);
```

### Configuration
- SMTP server configuration via environment variables
- Email templates and subjects

## Notification Service (`notificationService.js`)

### Features
- Create in-app notifications
- Send real-time notifications via WebSocket
- Notification queuing and delivery

### Usage
```javascript
const notificationService = require('./services/notificationService');

await notificationService.createNotification({
  title: 'Task Due',
  message: 'Your task is due tomorrow',
  type: 'deadline',
  receiverId: userId
});
```

### Types
- `deadline` - Task/assignment deadlines
- `team` - Team activities
- `system` - System announcements

## Study Plan Service (`studyPlanApproachingService.js`)

### Features
- Monitor approaching study plan deadlines
- Send reminder notifications
- Progress tracking calculations

### Usage
```javascript
const studyPlanService = require('./services/studyPlanApproachingService');

await studyPlanService.checkApproachingDeadlines();
await studyPlanService.sendReminders();
```

## Task Deadline Service (`taskDeadlineService.js`)

### Features
- Monitor task deadlines
- Send deadline reminders
- Automatic deadline notifications

### Usage
```javascript
const taskDeadlineService = require('./services/taskDeadlineService');

await taskDeadlineService.checkUpcomingDeadlines();
await taskDeadlineService.sendDeadlineReminders();
```

## Supabase Client (`supabaseClient.js`)

### Features
- File upload to Supabase storage
- File deletion from storage
- Public URL generation

### Usage
```javascript
const supabaseClient = require('./services/supabaseClient');

const fileUrl = await supabaseClient.uploadFile(file, bucket);
await supabaseClient.deleteFile(fileUrl);
```

### Configuration
- Supabase URL and keys from environment variables
- Bucket and file permissions

## Service Architecture

### Separation of Concerns
- Controllers handle HTTP requests/responses
- Services contain business logic
- Models handle data persistence
- Utils contain helper functions

### Error Handling
- Services throw specific errors
- Controllers catch and format error responses
- Consistent error types across services

### Async/Await Pattern
- All service methods return Promises
- Proper error propagation
- Non-blocking operations

### Testing
- Services are unit testable
- Mock external dependencies
- Test business logic in isolation

## Cron Jobs Integration

Services are called by cron jobs for scheduled tasks:

- `notificationCron.js` calls notification and deadline services
- Automated background processing
- Configurable intervals

## External API Integrations

- **Supabase**: File storage and management
- **Google Gemini**: AI-powered features
- **Email Providers**: SMTP for notifications
- **OAuth Providers**: Google authentication

## Best Practices

- **Single Responsibility**: Each service has one primary function
- **Dependency Injection**: Services receive dependencies
- **Configuration**: Environment-based configuration
- **Logging**: Comprehensive error and activity logging
- **Validation**: Input validation at service level