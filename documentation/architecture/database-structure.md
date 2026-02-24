# Database Structure

## Nested Brand Document Architecture

### Overview

We use a nested document structure where all brand-related data is stored within a single Firestore document. This approach significantly improves performance and ensures data consistency.

### Document Structure

```typescript
Brand {
  id: string
  name: string
  tagline: string
  mission: string
  products: Product[]
  certifiedProviders: CertifiedProvider[]
  beforeAfters: BeforeAfter[]
  trainingPrograms: TrainingProgram[]
  reviews: Review[]
  brainstormIdeas: BrainstormIdea[]
}
```

### Benefits

- **Fewer database reads**: 1 read instead of 6+ reads
- **Data consistency**: All brand data in one place
- **Atomic updates**: All changes happen in one document
- **User isolation**: Each user sees only their brand's data

### Implementation Details

#### Firestore Service Helper Methods

1. **`addToBrandArray()`**: Add item to a brand's array
   ```typescript
   await addToBrandArray(brandId, 'products', newProduct)
   ```

2. **`updateInBrandArray()`**: Update item in a brand's array
   ```typescript
   await updateInBrandArray(brandId, 'products', productId, updatedProduct)
   ```

3. **`removeFromBrandArray()`**: Remove item from a brand's array
   ```typescript
   await removeFromBrandArray(brandId, 'products', productId)
   ```

#### Data Access Patterns

- Admin tabs fetch from the user's brand document
- Products, Providers, BeforeAfter, Training, Reviews tabs all use `brand.arrayName`
- Overview tab counts array lengths from the brand document

#### Database Initialization

"Initialize Database" functionality:
- Creates one brand document with all nested data
- Associates the brand with melanie@glamlink.net user
- Populates sample data for all content types

### Migration from Collection-Based Structure

#### Old Structure (Multiple Collections):

```
brands/
  └── glamour_beauty_co (document)
products/
  └── prod_1 (document with brandId: "glamour_beauty_co")
certifiedProviders/
  └── prov_1 (document with brandId: "glamour_beauty_co")
```

#### New Structure (Single Brand Document):

```
brands/
  └── glamour_beauty_co (document)
      ├── name: "Glamour Beauty Co."
      ├── products: [{ id: "prod_1", name: "...", ... }]
      ├── certifiedProviders: [{ id: "prov_1", name: "...", ... }]
      ├── beforeAfters: [...]
      ├── trainingPrograms: [...]
      └── reviews: [...]
```

### Performance Considerations

- Single document read for all brand data
- Firestore document size limit: 1MB
- Array size considerations for large brands
- Future optimization: Subcollections for very large datasets