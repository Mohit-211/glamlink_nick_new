# Sections Collection Verification

## When "Create Issue" is clicked:

### 1. Issue Creation
- Issue document created in `magazine_issues` collection
- Has `sections: []` empty array (NOT embedded sections)
- Returns created issue with ID

### 2. Sections Creation (if template applied)
For each of the 7 template sections:
- POST to `/api/magazine/sections`
- Body structure:
```json
{
  "issueId": "2025-09-04",
  "sectionData": {
    "type": "custom-section",
    "title": "The Glam Drop",
    "subtitle": "Latest Updates & Features",
    "content": { ... },
    "order": 0
  }
}
```

### 3. Firebase Collections Result

#### `magazine_issues` collection:
```
Document: 2025-09-04
{
  id: "2025-09-04",
  title: "The Glamlink Edit",
  sections: [],  // EMPTY - sections are in separate collection
  ...
}
```

#### `sections` collection (AUTO-CREATED by Firebase):
```
Document 1: auto-generated-id-1
{
  issueId: "2025-09-04",  // Foreign key
  type: "custom-section",
  title: "The Glam Drop",
  order: 0,
  ...
}

Document 2: auto-generated-id-2
{
  issueId: "2025-09-04",  // Foreign key
  type: "custom-section", 
  title: "Cover Pro Feature",
  order: 1,
  ...
}

... 5 more documents (7 total)
```

## Key Changes Made:

1. **MagazineTemplateLibrary.tsx** - Shows "Starting Magazine Issue" template with 7 sections
2. **IssueEditForm.tsx** - Uses MagazineTemplateLibrary instead of generic templates
3. **MagazineEditorCollabWrapper.tsx** - API call wraps data in `sectionData` object
4. **magazineSectionService.ts** - Collection name changed from `magazine_sections` to `sections`

## To Verify:
1. Click "Create New Issue"
2. See "Starting Magazine Issue" template in Template tab
3. Click "Apply Template" 
4. Fill basic info and click "Create Issue"
5. Check Firebase Console:
   - `magazine_issues/2025-09-04` has empty `sections: []`
   - `sections` collection exists with 7 documents
   - Each section document has `issueId: "2025-09-04"`