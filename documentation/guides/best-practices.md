# Best Practices

## State Management

- Use Redux for global auth state
- Component state for UI interactions
- Firestore for persistent data
- No prop drilling - use hooks

Example:
```typescript
// Good - Using Redux hooks
const user = useAppSelector(state => state.auth.user);

// Bad - Prop drilling
<Component user={user}>
  <ChildComponent user={user}>
    <GrandchildComponent user={user} />
  </ChildComponent>
</Component>
```

## AI Integration

- Always provide context (brand name, tagline, mission)
- Include specific structure in prompts
- Implement mock data fallbacks
- Handle API errors gracefully

Example prompt structure:
```typescript
const prompt = `
  Generate a product for ${brand.name}.
  Brand tagline: ${brand.tagline}
  Brand mission: ${brand.mission}
  
  Return JSON with this structure:
  { name, description, price, category, ingredients }
`;
```

## Performance

- Use nested documents to minimize reads
- Implement loading states everywhere
- Lazy load images with Next.js Image
- Cache AI responses when possible

Performance checklist:
- [ ] Single Firestore read for brand data
- [ ] Loading skeletons for async content
- [ ] Image optimization with next/image
- [ ] Debounced search inputs
- [ ] Memoized expensive computations

## Security

- Role-based access control
- Data isolation by brand
- Input validation on all forms
- Sanitize AI-generated content

Security patterns:
```typescript
// Always check user permissions
if (!currentUser || currentUser.uid !== brand.userId) {
  throw new Error("Unauthorized");
}

// Validate and sanitize input
const sanitizedInput = DOMPurify.sanitize(userInput);

// Use Firestore security rules
// users/{userId}/brands/{brandId}
```

## Component Patterns

- Single props pattern for all components
- Centralized types in config.ts files
- Consistent error handling
- Loading states for async operations

Component structure:
```typescript
interface ComponentProps {
  // All props in one interface
}

export default function Component({ ...props }: ComponentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Component logic
}
```

## Date Handling

- Store as YYYY-MM-DD strings
- Format consistently for display
- Use native date inputs
- Handle timezones appropriately

```typescript
// Storage format
const storedDate = "2024-02-15";

// Display format
const displayDate = formatDate(storedDate); // "Feb 15, 2024"

// Input format
<input type="date" value={storedDate} />
```

## File Organization

```
/lib/
  /admin/           # Admin-specific code
  /auth/            # Authentication logic
  /components/      # Shared components
  /config/          # Configuration files
  /pages/           # Page-specific modules
  /services/        # Service layers
  /utils/           # Utility functions
```

## API Design

- RESTful endpoints
- Consistent response format
- Proper HTTP status codes
- Clear error messages

Response format:
```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: "Clear error message"
}
```

## Testing Approach

- Test user flows end-to-end
- Verify AI fallbacks work
- Check responsive design
- Validate accessibility

Testing checklist:
- [ ] New user can sign up and create brand
- [ ] AI generation works without API key
- [ ] Mobile layout is functional
- [ ] Keyboard navigation works

## Code Quality

- TypeScript strict mode
- ESLint configuration
- Consistent formatting
- Meaningful variable names

Code standards:
```typescript
// Good
const userBrand = await getUserBrand(userId);

// Bad
const ub = await gub(uid);
```

## Documentation

- Keep CLAUDE.md updated
- Document new features
- Include usage examples
- Explain complex logic

Documentation template:
```typescript
/**
 * Generates AI content for the brand
 * @param brand - The brand object with context
 * @param type - Type of content to generate
 * @param count - Number of items to generate
 * @returns Array of generated items
 */
async function generateContent(
  brand: Brand, 
  type: ContentType, 
  count: number
): Promise<GeneratedItem[]> {
  // Implementation
}
```