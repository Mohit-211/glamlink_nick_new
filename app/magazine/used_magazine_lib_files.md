# Magazine Library Files Used by App Pages

This document lists ALL files in `/lib/pages/magazine/` that are imported (directly or indirectly) by the 4 magazine app pages.

## Source App Pages

1. `/app/magazine/page.tsx`
2. `/app/magazine/MagazinePageWrapper.tsx`
3. `/app/magazine/[id]/page.tsx`
4. `/app/magazine/[id]/digital/page.tsx`

---

## Complete File List (79 files)

### Root Level (1 file)
- `/lib/pages/magazine/index.ts`

### Constants (1 file)
- `/lib/pages/magazine/constants/allowedEmails.ts`

### Server (1 file)
- `/lib/pages/magazine/server/magazineListingService.ts`

### Components - Root (7 files)
- `/lib/pages/magazine/components/index.ts`
- `/lib/pages/magazine/components/MagazineNewViewer.tsx`
- `/lib/pages/magazine/components/ThumbnailNavigation.tsx`
- `/lib/pages/magazine/components/ThumbnailItem.tsx`
- `/lib/pages/magazine/components/MagazineListingShare.tsx`
- `/lib/pages/magazine/components/MagazineShareButtons.tsx`
- `/lib/pages/magazine/components/MagazineCTA.tsx`

### Components - Magazine Subdirectory (7 files)
- `/lib/pages/magazine/components/magazine/MagazinePageView.tsx`
- `/lib/pages/magazine/components/magazine/MagazinePageContent.tsx`
- `/lib/pages/magazine/components/magazine/MagazineNavigation.tsx`
- `/lib/pages/magazine/components/magazine/TableOfContentsSection.tsx`
- `/lib/pages/magazine/components/magazine/FounderStory.tsx`
- `/lib/pages/magazine/components/magazine/SustainableBeauty.tsx`
- `/lib/pages/magazine/components/magazine/BeautyScience.tsx`

### Components - Sections (25 files)
- `/lib/pages/magazine/components/sections/index.ts`
- `/lib/pages/magazine/components/sections/RisingStar.tsx`
- `/lib/pages/magazine/components/sections/CoverProFeature.tsx`
- `/lib/pages/magazine/components/sections/WhatsNewGlamlink.tsx`
- `/lib/pages/magazine/components/sections/TopTreatment.tsx`
- `/lib/pages/magazine/components/sections/TopProductSpotlight.tsx`
- `/lib/pages/magazine/components/sections/MariesColumn.tsx`
- `/lib/pages/magazine/components/sections/MariesCorner.tsx`
- `/lib/pages/magazine/components/sections/CoinDrop.tsx`
- `/lib/pages/magazine/components/sections/GlamlinkStories.tsx`
- `/lib/pages/magazine/components/sections/SpotlightCity.tsx`
- `/lib/pages/magazine/components/sections/ProTips.tsx`
- `/lib/pages/magazine/components/sections/EventRoundUp.tsx`
- `/lib/pages/magazine/components/sections/WhatsHotWhatsOut.tsx`
- `/lib/pages/magazine/components/sections/QuoteWall.tsx`
- `/lib/pages/magazine/components/sections/MagazineClosing.tsx`
- `/lib/pages/magazine/components/sections/CustomSection.tsx`
- `/lib/pages/magazine/components/sections/BeautyLab.tsx`
- `/lib/pages/magazine/components/sections/UGCSpotlight.tsx`
- `/lib/pages/magazine/components/sections/BeautyBox.tsx`
- `/lib/pages/magazine/components/sections/GenZTrends.tsx`
- `/lib/pages/magazine/components/sections/AIBeautyAdvisor.tsx`
- `/lib/pages/magazine/components/sections/BeautyInvestment.tsx`
- `/lib/pages/magazine/components/sections/LiveCommerce.tsx`
- `/lib/pages/magazine/components/sections/MultiGenerational.tsx`

### Hooks (4 files)
- `/lib/pages/magazine/hooks/index.ts`
- `/lib/pages/magazine/hooks/usePageList.ts`
- `/lib/pages/magazine/hooks/usePageNavigation.ts`
- `/lib/pages/magazine/hooks/useThumbnailExtraction.ts`

### Utils (1 file)
- `/lib/pages/magazine/utils/sectionMapper.tsx`

### Types - Root (3 files)
- `/lib/pages/magazine/types/index.ts`
- `/lib/pages/magazine/types/linkAction.ts`
- `/lib/pages/magazine/types/collaboration.ts`

### Types - Magazine Core (3 files)
- `/lib/pages/magazine/types/magazine/index.ts`
- `/lib/pages/magazine/types/magazine/core.ts`
- `/lib/pages/magazine/types/magazine/sections.ts`

### Types - Magazine Fields (6 files)
- `/lib/pages/magazine/types/magazine/fields/index.ts`
- `/lib/pages/magazine/types/magazine/fields/image.ts`
- `/lib/pages/magazine/types/magazine/fields/linkAction.ts`
- `/lib/pages/magazine/types/magazine/fields/background.ts`
- `/lib/pages/magazine/types/magazine/fields/typography.ts`
- `/lib/pages/magazine/types/magazine/fields/position.ts`

### Types - Magazine Sections (27 files)
- `/lib/pages/magazine/types/magazine/sections/index.ts`
- `/lib/pages/magazine/types/magazine/sections/featured-story.ts`
- `/lib/pages/magazine/types/magazine/sections/product-showcase.ts`
- `/lib/pages/magazine/types/magazine/sections/provider-spotlight.ts`
- `/lib/pages/magazine/types/magazine/sections/trend-report.ts`
- `/lib/pages/magazine/types/magazine/sections/beauty-tips.ts`
- `/lib/pages/magazine/types/magazine/sections/transformation.ts`
- `/lib/pages/magazine/types/magazine/sections/catalog-section.ts`
- `/lib/pages/magazine/types/magazine/sections/founder-story.ts`
- `/lib/pages/magazine/types/magazine/sections/table-of-contents.ts`
- `/lib/pages/magazine/types/magazine/sections/cover-pro-feature.ts`
- `/lib/pages/magazine/types/magazine/sections/whats-new-glamlink.ts`
- `/lib/pages/magazine/types/magazine/sections/top-treatment.ts`
- `/lib/pages/magazine/types/magazine/sections/top-product-spotlight.ts`
- `/lib/pages/magazine/types/magazine/sections/maries-column.ts`
- `/lib/pages/magazine/types/magazine/sections/maries-corner.ts`
- `/lib/pages/magazine/types/magazine/sections/coin-drop.ts`
- `/lib/pages/magazine/types/magazine/sections/glamlink-stories.ts`
- `/lib/pages/magazine/types/magazine/sections/spotlight-city.ts`
- `/lib/pages/magazine/types/magazine/sections/pro-tips.ts`
- `/lib/pages/magazine/types/magazine/sections/event-roundup.ts`
- `/lib/pages/magazine/types/magazine/sections/whats-hot-whats-out.ts`
- `/lib/pages/magazine/types/magazine/sections/quote-wall.ts`
- `/lib/pages/magazine/types/magazine/sections/rising-star.ts`
- `/lib/pages/magazine/types/magazine/sections/magazine-closing.ts`
- `/lib/pages/magazine/types/magazine/sections/custom-section.ts`
- `/lib/pages/magazine/types/magazine/sections/entities.ts`

---

## Summary Statistics

- **Total Files: 80**
- Constants: 1
- Server: 1
- Components: 39 (7 root + 7 magazine + 25 sections)
- Hooks: 4
- Utils: 1
- Types: 39 (3 root + 3 magazine core + 6 fields + 27 sections)

---

## Key Import Chains

### 1. MagazineNewViewer Chain
```
app/magazine/[id]/page.tsx
  └─> MagazineNewViewer (from /lib/pages/magazine)
      ├─> usePageList, usePageNavigation (hooks)
      ├─> ThumbnailNavigation
      ├─> MagazinePageView
      │   └─> MagazinePageContent
      │       ├─> All 25 section components
      │       └─> sectionMapper utility
      ├─> MagazineNavigation
      └─> MagazineCTA
```

### 2. MagazineListingShare Chain
```
app/magazine/MagazinePageWrapper.tsx
  └─> MagazineListingShare
      └─> MagazineShareButtons
```

### 3. Server Service Chain
```
app/magazine/page.tsx
  └─> magazineListingService (server/magazineListingService.ts)
```

### 4. Type System Chain
```
Multiple app pages
  └─> /lib/pages/magazine/types
      ├─> magazine/core.ts (MagazineIssue, MagazineIssueCard, etc.)
      ├─> magazine/sections.ts (all section types)
      ├─> magazine/fields/* (ImageObject, LinkAction, Background, Typography)
      ├─> linkAction.ts
      └─> collaboration.ts
```

---

## Notes

- All files listed here are **actively used** in the magazine viewing experience
- The type system is comprehensive with 39 type definition files
- Section components (25 total) are dynamically loaded via sectionMapper
- The hook system provides URL parameter navigation and thumbnail extraction
- **No files from `/lib/pages/magazine/components/editor/` are used by these app pages**
- **No files from `/lib/pages/magazine/components/content/` are directly used** (content components are only used in the admin editor, not public pages)
