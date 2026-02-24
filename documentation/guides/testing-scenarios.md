# Testing Scenarios

## 1. New User Flow

**Steps:**
- Sign up → Auto-redirect to profile
- Get Started page shows by default
- Can access Brand Setup Wizard
- Upload requirements.txt or fill manually
- Generate content with progress tracking

**Verification Points:**
- [ ] Brand created automatically on signup
- [ ] User redirected to /profile after signup
- [ ] Brand ID stored in user profile
- [ ] Questionnaire data saved to user
- [ ] Generated content appears in brand

**Test Data:**
- Email: test_new_user@example.com
- Password: TestPassword123!
- Upload: sample-requirements.txt

## 2. Profile Management Flow

**Steps:**
- Login → Navigate to /profile
- Access brand management via sidebar
- Create/edit/delete products, providers, etc.
- Use date pickers for scheduling
- Test delete functionality on providers
- Test create/delete on reviews (testing mode)

**Verification Points:**
- [ ] Sidebar navigation works correctly
- [ ] CRUD operations update Firestore
- [ ] Date pickers store YYYY-MM-DD format
- [ ] Delete confirmations appear
- [ ] Testing mode warnings show for reviews

**Key Areas:**
- Products: Full CRUD with AI generation
- Providers: Edit and delete functionality
- Training: Date picker integration
- Reviews: Testing mode indicators
- Brainstorm: AI idea generation

## 3. Super Admin Flow

**Steps:**
- Login as admin@glamlink.com
- Auto-redirect from /profile to /admin
- Only Settings tab visible
- Can initialize database
- Cannot access profile pages

**Verification Points:**
- [ ] Email recognized as super admin
- [ ] Redirect to /admin works
- [ ] Only Settings tab appears
- [ ] Initialize database button functional
- [ ] Profile routes return 404

## 4. Public Browsing

**Steps:**
- Visit `/brand` without login
- See all brands
- Click to view individual brands
- Cannot access admin or profile panels

**Verification Points:**
- [ ] Brand listing loads without auth
- [ ] Individual brand pages accessible
- [ ] Admin/profile routes redirect to login
- [ ] All public content visible
- [ ] No edit capabilities shown

## 5. Questionnaire Testing

**Steps:**
- Upload sample requirements.txt
- Verify all fields populate correctly
- Test "use existing data" toggle
- Monitor generation progress dialog
- Verify content appears in brand

**File Format Test:**
```
BRAND_NAME: Test Beauty Brand
BRAND_TAGLINE: Beauty Redefined
BRAND_MISSION: Empowering beauty professionals
# ... rest of fields
```

**Verification Points:**
- [ ] File parser handles all fields
- [ ] Validation errors display clearly
- [ ] Toggle switches between data sources
- [ ] Progress dialog shows steps
- [ ] Generated content matches input

## 6. AI Generation Testing

**With API Key:**
- Test each content type generation
- Verify context-aware content
- Check variety in results
- Confirm proper formatting

**Without API Key:**
- Verify fallback to mock data
- Check mock data quality
- Ensure no errors shown
- Test all content types

**Content Types:**
- [ ] Products with ingredients
- [ ] Providers with certifications
- [ ] Training programs
- [ ] Customer reviews
- [ ] Before/after transformations
- [ ] Brainstorm ideas

## 7. Content Settings Testing

**Admin Access:**
- Login with authorized email
- Access /content-settings
- Toggle page visibility
- Save and verify changes

**Verification:**
- [ ] Only authorized users can access
- [ ] Toggle changes take effect immediately
- [ ] Hidden pages return 404
- [ ] Export/import functionality works

## 8. Mobile Responsiveness

**Test Devices:**
- iPhone 12/13/14
- Samsung Galaxy S21
- iPad Pro
- Desktop (various sizes)

**Key Areas:**
- [ ] Navigation menu becomes hamburger
- [ ] Forms are touch-friendly
- [ ] Images scale properly
- [ ] Modals fit screen
- [ ] Tables become scrollable

## 9. Performance Testing

**Metrics to Check:**
- Page load time < 3s
- Time to interactive < 5s
- Lighthouse score > 90
- No layout shifts

**Tools:**
- Chrome DevTools
- Lighthouse
- WebPageTest
- Network throttling

## 10. Error Handling

**Test Scenarios:**
- Network offline
- Invalid form data
- API failures
- Missing images
- Firestore limits

**Expected Behavior:**
- [ ] Graceful error messages
- [ ] Fallback content shown
- [ ] No white screens
- [ ] User can recover
- [ ] Errors logged properly

## 11. Authentication Edge Cases

**Scenarios:**
- Session expiry
- Multiple tabs
- Password reset
- OAuth failures
- Cookie disabled

**Verification:**
- [ ] Auto-logout after expiry
- [ ] Sync across tabs
- [ ] Reset flow works
- [ ] OAuth fallback to email
- [ ] Clear error messages

## 12. Data Integrity

**Test Operations:**
- Concurrent edits
- Large data sets
- Special characters
- Long text inputs
- Image uploads

**Checks:**
- [ ] No data corruption
- [ ] Proper validation
- [ ] Character encoding
- [ ] Size limits enforced
- [ ] Image optimization