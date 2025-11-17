# Testing

## Overview

The application uses Jest for unit and integration testing with a focus on API endpoints and business logic.

## Test Framework

### Jest Configuration
- Test environment: Node.js
- Test files: `**/*.test.js` or `**/__tests__/**/*.js`
- Coverage reporting enabled

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Test Structure

```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # API endpoint integration tests
├── models/         # Model validation tests
├── middleware/     # Middleware functionality tests
└── utils/          # Utility function tests
```

## Writing Tests

### Unit Test Example
```javascript
const { add } = require('../utils/math');

describe('Math Utils', () => {
  test('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

### API Integration Test Example
```javascript
const request = require('supertest');
const app = require('../app');

describe('GET /api/users', () => {
  test('returns user list', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## Test Categories

### Unit Tests
- Test individual functions and modules
- Mock external dependencies
- Fast execution, isolated testing

### Integration Tests
- Test API endpoints end-to-end
- Test database interactions
- Test middleware chains

### Model Tests
- Validate model associations
- Test data validation rules
- Test model methods

### Middleware Tests
- Test authentication middleware
- Test rate limiting
- Test error handling

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Test Coverage

Target coverage metrics:
- Statements: > 80%
- Branches: > 75%
- Functions: > 85%
- Lines: > 80%

## Mocking

### Database Mocking
```javascript
jest.mock('../models', () => ({
  User: {
    findAll: jest.fn(),
    create: jest.fn()
  }
}));
```

### External API Mocking
```javascript
jest.mock('axios');
axios.get.mockResolvedValue({ data: mockResponse });
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

- **Descriptive test names** that explain what is being tested
- **Arrange-Act-Assert** pattern for test structure
- **Mock external dependencies** to isolate units
- **Test edge cases** and error conditions
- **Keep tests fast** and reliable
- **Use test data factories** for consistent test data

## Test Data Management

- Use factories for creating test data
- Clean up test data between tests
- Use transactions for database tests
- Avoid test data pollution

## Performance Testing

- Load testing with Artillery
- API response time monitoring
- Database query performance
- Memory usage monitoring