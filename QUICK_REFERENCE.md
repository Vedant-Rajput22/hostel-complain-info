# 🚀 Quick Reference Card

## Backend

### Error Handling
```javascript
import { NotFoundError, ValidationError } from '../utils/errors.js';
throw new NotFoundError('User');
```

### API Responses
```javascript
import { ApiResponse } from '../utils/response.js';
return ApiResponse.success(res, data, 'Success message');
return ApiResponse.created(res, data);
return ApiResponse.paginated(res, items, { page, limit, total });
```

### Logging
```javascript
import logger from '../utils/logger.js';
logger.info('Message', { data });
logger.error('Error', { error: err.message });
logger.warn('Warning');
```

### Validation
```javascript
import { validate, validateId } from '../middleware/validation.js';
router.post('/path', [body('field').notEmpty(), validate], handler);
router.get('/path/:id', validateId('id'), handler);
```

---

## Frontend

### Toast Notifications
```javascript
import { useToast } from '../contexts/ToastContext';
const toast = useToast();
toast.success('Success!');
toast.error('Error!');
toast.warning('Warning!');
toast.info('Info!');
```

### Async Operations
```javascript
import { useAsync } from '../hooks/useAsync';
const { data, isPending, error, execute } = useAsync(
  () => api.get('/data'),
  true, // immediate
  [] // dependencies
);
```

### Loading States
```javascript
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner';
<LoadingSpinner size="md" />
<SkeletonCard />
```

### Modal
```javascript
import Modal from '../components/Modal';
<Modal isOpen={open} onClose={() => setOpen(false)} title="Title">
  Content
</Modal>
```

### Search & Filter
```javascript
import SearchFilter from '../components/SearchFilter';
<SearchFilter onSearch={setSearch} placeholder="Search..." />
```

### Pagination
```javascript
import Pagination from '../components/Pagination';
<Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
```

### Status Badge
```javascript
import StatusBadge from '../components/StatusBadge';
<StatusBadge status="Pending" type="complaint" />
```

---

## CSS Classes

### Buttons
- `btn` - Primary button
- `btn-secondary` - Secondary button
- `btn-danger` - Danger button
- `btn-success` - Success button

### Inputs
- `input` - Standard input
- `input-error` - Error state

### Badges
- `badge-pending` - Yellow
- `badge-in-progress` - Blue
- `badge-resolved` - Green
- `badge-completed` - Green
- `badge-open` - Red

### Animations
- `animate-fade-in`
- `animate-slide-in`
- `animate-pulse-slow`
- `skeleton` - Loading skeleton

---

## Environment Variables

### Backend
```env
PORT=4000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=changeme
DB_NAME=hostel_portal
JWT_SECRET=your-secret
LOG_LEVEL=info
LOG_QUERIES=false
```

### Frontend
```env
VITE_API_URL=http://localhost:4000/api
```

---

## Common Commands

### Backend
```bash
npm run dev          # Start dev server
npm run start        # Start production
npm run seed         # Seed database
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
docker compose up -d db                    # Start database
docker compose exec db mysql -u root -p    # Access MySQL
docker compose logs db                     # View logs
```

---

## File Structure

```
backend/src/
  ├── config/db.js              # Database config
  ├── middleware/
  │   ├── auth.js               # Auth middleware
  │   └── validation.js         # Validation middleware
  ├── routes/                   # API routes
  ├── utils/
  │   ├── errors.js             # Error classes
  │   ├── response.js           # API responses
  │   └── logger.js             # Logging
  └── server.js                 # Main server

frontend/src/
  ├── components/               # Reusable components
  ├── contexts/                 # React contexts
  ├── hooks/                    # Custom hooks
  ├── lib/api.js               # API client
  ├── pages/                    # Page components
  └── main.jsx                  # Entry point
```

---

## Quick Tips

### Backend
- Always use `asyncHandler` for async routes
- Throw custom errors instead of sending responses
- Use `logger` instead of `console.log`
- Validate all inputs
- Use `ApiResponse` for consistency

### Frontend
- Always show loading states
- Use toast for user feedback
- Validate forms before submission
- Handle errors gracefully
- Use skeleton screens for better UX

---

**For detailed documentation, see:**
- `UPGRADE_SUMMARY.md` - Complete upgrade details
- `DEVELOPER_GUIDE.md` - Usage examples and patterns
- `IMPROVEMENTS.md` - All improvements summary
- `README.md` - General project information


