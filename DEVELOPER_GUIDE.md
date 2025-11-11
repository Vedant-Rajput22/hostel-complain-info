# Developer Guide - Hostel Portal

## 🎯 Quick Start for Developers

This guide will help you understand and use the new features and improvements in the Hostel Portal application.

---

## 📚 Table of Contents

1. [Backend Development](#backend-development)
2. [Frontend Development](#frontend-development)
3. [Common Patterns](#common-patterns)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Backend Development

### Error Handling

#### Using Custom Error Classes

```javascript
import { 
  NotFoundError, 
  ValidationError, 
  AuthenticationError,
  AuthorizationError 
} from '../utils/errors.js';

// In your route handler
router.get('/users/:id', async (req, res) => {
  const user = await findUserById(req.params.id);
  
  if (!user) {
    throw new NotFoundError('User'); // Automatically sends 404
  }
  
  res.json({ user });
});
```

#### Using Async Handler

```javascript
import { asyncHandler } from '../utils/errors.js';

// Wrap async routes - no need for try-catch!
router.post('/complaints', asyncHandler(async (req, res) => {
  const complaint = await createComplaint(req.body);
  return ApiResponse.created(res, { complaint });
}));
```

### API Responses

#### Standard Response Format

```javascript
import { ApiResponse } from '../utils/response.js';

// Success response
return ApiResponse.success(res, { users }, 'Users fetched successfully');

// Created response (201)
return ApiResponse.created(res, { user }, 'User created');

// No content (204)
return ApiResponse.noContent(res);

// Paginated response
return ApiResponse.paginated(res, items, {
  page: 1,
  limit: 10,
  total: 100
});
```

### Logging

```javascript
import logger from '../utils/logger.js';

// Different log levels
logger.info('User logged in', { userId: user.id, email: user.email });
logger.warn('Slow query detected', { duration: '2.5s', query: 'SELECT...' });
logger.error('Database connection failed', { error: err.message });
logger.debug('Request received', { path: req.path, method: req.method });
```

### Validation

```javascript
import { body, param, query } from 'express-validator';
import { validate, validateId } from '../middleware/validation.js';

router.post('/complaints',
  [
    body('title').trim().isLength({ min: 3, max: 200 }),
    body('category').isIn(['Mess', 'Lift', 'Room/Floor Appliances']),
    body('description').optional().trim(),
    validate // Add this middleware to handle validation errors
  ],
  async (req, res) => {
    // Your logic here
  }
);

// Validate ID parameters
router.get('/complaints/:id', 
  validateId('id'), // Automatically validates and converts to number
  async (req, res) => {
    const id = req.params.id; // Already validated and converted to number
  }
);
```

### Database Queries

```javascript
import { query, transaction } from '../config/db.js';

// Simple query
const users = await query('SELECT * FROM users WHERE role = ?', ['student']);

// Using transactions
await transaction(async (connection) => {
  await connection.query('INSERT INTO users ...', [data]);
  await connection.query('INSERT INTO logs ...', [logData]);
  // Automatically commits if successful, rolls back on error
});
```

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

// Custom rate limiter for specific routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many requests'
});

router.post('/expensive-operation', apiLimiter, handler);
```

---

## 🎨 Frontend Development

### Using Toast Notifications

```javascript
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const toast = useToast();
  
  const handleSubmit = async () => {
    try {
      await api.post('/data', formData);
      toast.success('Data saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save data');
    }
  };
  
  // Different toast types
  toast.info('Processing your request...');
  toast.warning('Please verify your email', 10000); // 10 second duration
}
```

### Using Async Hook

```javascript
import { useAsync } from '../hooks/useAsync';

function MyComponent() {
  // Fetch data immediately
  const { data, isPending, error, execute } = useAsync(
    () => api.get('/complaints'),
    true, // immediate execution
    [] // dependencies
  );
  
  // Manual execution
  const { execute: submitForm, isPending: isSubmitting } = useAsync(
    (formData) => api.post('/complaints', formData),
    false // don't execute immediately
  );
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitForm(formData);
      toast.success('Submitted!');
    } catch (err) {
      // Error already in state
    }
  };
  
  if (isPending) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render data */}</div>;
}
```

### Using Form Hook

```javascript
import { useAsyncForm } from '../hooks/useAsync';

function MyForm() {
  const { handleSubmit, isSubmitting, error, success } = useAsyncForm(
    async (e) => {
      const formData = new FormData(e.target);
      await api.post('/complaints', formData);
    }
  );
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">Success!</div>}
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Using Modal

```javascript
import { useState } from 'react';
import Modal from '../components/Modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        size="md" // sm, md, lg, xl
      >
        <p>Are you sure you want to proceed?</p>
        <div className="flex gap-2 mt-4">
          <button className="btn" onClick={handleConfirm}>Yes</button>
          <button className="btn btn-secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}
```

### Loading States

```javascript
import LoadingSpinner, { SkeletonCard, SkeletonTable } from '../components/LoadingSpinner';

function MyComponent() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return (
      <div>
        <LoadingSpinner size="lg" />
        {/* OR */}
        <SkeletonCard />
        {/* OR */}
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }
  
  return <div>{/* Your content */}</div>;
}
```

### Search and Filters

```javascript
import SearchFilter, { FilterSelect, DateRangeFilter } from '../components/SearchFilter';

function MyComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  return (
    <div className="space-y-4">
      <SearchFilter 
        onSearch={setSearchTerm}
        placeholder="Search complaints..."
        debounceMs={300}
      />
      
      <FilterSelect
        label="Status"
        value={status}
        onChange={setStatus}
        options={[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'resolved', label: 'Resolved' }
        ]}
      />
      
      <DateRangeFilter
        startDate={dateRange.from}
        endDate={dateRange.to}
        onStartChange={(val) => setDateRange({ ...dateRange, from: val })}
        onEndChange={(val) => setDateRange({ ...dateRange, to: val })}
      />
    </div>
  );
}
```

### Pagination

```javascript
import Pagination from '../components/Pagination';

function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;
  
  return (
    <div>
      {/* Your content */}
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

### Status Badges

```javascript
import StatusBadge from '../components/StatusBadge';

function ComplaintItem({ complaint }) {
  return (
    <div>
      <h3>{complaint.title}</h3>
      <StatusBadge status={complaint.status} type="complaint" />
      {/* Types: 'complaint', 'cleaning', 'internet' */}
    </div>
  );
}
```

---

## 🔄 Common Patterns

### API Call with Loading and Error Handling

```javascript
function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/data');
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <SkeletonCard />;
  
  return <div>{/* Render data */}</div>;
}
```

### Form with Validation and Submission

```javascript
function MyForm() {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 200) newErrors.title = 'Title too long';
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await api.post('/data', formData);
      toast.success('Submitted successfully!');
      setFormData({ title: '', description: '' }); // Reset form
    } catch (error) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          className={`input ${errors.title ? 'input-error' : ''}`}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
      </div>
      
      <button className="btn" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

---

## ✅ Best Practices

### Backend

1. **Always use async handlers** for async routes
2. **Throw custom errors** instead of sending responses directly
3. **Use logger** instead of console.log
4. **Validate all inputs** using express-validator
5. **Use ApiResponse** for consistent responses
6. **Add rate limiting** to sensitive endpoints
7. **Log slow queries** for optimization
8. **Use transactions** for multi-step database operations

### Frontend

1. **Always show loading states** during async operations
2. **Use toast notifications** for user feedback
3. **Validate forms** before submission
4. **Handle errors gracefully** with error boundaries
5. **Use skeleton screens** for better perceived performance
6. **Debounce search inputs** to reduce API calls
7. **Show empty states** when no data is available
8. **Use status badges** for visual status indication

---

## 🐛 Troubleshooting

### Backend Issues

#### Port Already in Use
```bash
# Kill existing process
pkill -f "node.*server.js"

# Or use a different port
PORT=4001 npm run dev
```

#### Database Connection Failed
```bash
# Check if MySQL is running
docker compose ps

# Start database
docker compose up -d db

# Check logs
docker compose logs db
```

#### Slow Queries
```bash
# Enable query logging
echo "LOG_QUERIES=true" >> .env

# Check logs
tail -f logs/combined.log
```

### Frontend Issues

#### Toast Not Working
Make sure you've wrapped your app with `ToastProvider`:
```jsx
<ToastProvider>
  <App />
</ToastProvider>
```

#### Hooks Error
Make sure you're using hooks inside components, not outside.

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 Code Style

### Backend
- Use ES6+ features (import/export, async/await, arrow functions)
- Use camelCase for variables and functions
- Use PascalCase for classes
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Frontend
- Use functional components with hooks
- Use arrow functions for components
- Extract reusable logic into custom hooks
- Keep components small (< 200 lines)
- Use meaningful variable names

---

## 🚀 Performance Tips

### Backend
1. Use connection pooling (already configured)
2. Add indexes to frequently queried columns
3. Use pagination for large datasets
4. Cache frequently accessed data
5. Optimize slow queries

### Frontend
1. Use React.memo for expensive components
2. Debounce search and filter inputs
3. Lazy load routes and components
4. Optimize images before upload
5. Use skeleton screens instead of spinners

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Express Validator](https://express-validator.github.io/)

---

**Happy Coding! 🎉**


