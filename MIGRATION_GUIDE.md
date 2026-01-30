# Firestore Migration Guide

## 🚀 Quick Start

### Option 1: Use Migration Tool (Recommended)

1. **Open Migration Tool**
   ```
   http://localhost:8080/scripts/migration-tool.html
   ```

2. **Click "Start Migration"**
   - The tool will automatically upload all data
   - Progress bar shows real-time status
   - Console log shows detailed progress

3. **Wait for Completion**
   - Tools: ~31,000+ items
   - Guides: ~100+ items
   - Categories: Auto-extracted
   - Features: 10 feature flags
   - **Estimated time**: 5-10 minutes

### Option 2: Manual Script Execution

1. **Open Browser Console** on any page

2. **Load Migration Script**
   ```javascript
   const script = document.createElement('script');
   script.type = 'module';
   script.src = '/scripts/migrate-to-firestore.js';
   document.head.appendChild(script);
   ```

3. **Run Migration**
   ```javascript
   const migration = new FirestoreMigration();
   await migration.runMigration();
   ```

---

## 📊 What Gets Uploaded

### Tools Collection (`tools`)
- **Count**: 31,708 tools
- **Fields**: id, name, slug, description, category, pricing, url, tags, etc.
- **Indexed**: id, slug, category, pricing
- **Views/Favorites**: Initialized to 0

### Guides Collection (`guides`)
- **Count**: ~100+ guides
- **Fields**: id, title, slug, description, category, difficulty, content, etc.
- **Indexed**: id, slug, category, type

### Categories Collection (`categories`)
- **Auto-generated** from tools data
- **Fields**: id, name, toolCount
- **Unique categories** extracted

### Features Collection (`features`)
- **Count**: 10 feature flags
- **All enabled** by default
- **Toggleable** via Firestore

---

## 🔄 Migration Process

### Step 1: Tools Upload
- Uploads in batches of 500
- Progress: 0% → 40%
- Estimated: 3-5 minutes

### Step 2: Guides Upload
- Uploads in batches of 500
- Progress: 40% → 80%
- Estimated: 30 seconds

### Step 3: Categories Upload
- Single batch
- Progress: 80% → 95%
- Estimated: 5 seconds

### Step 4: Features Upload
- Single batch
- Progress: 95% → 100%
- Estimated: 2 seconds

---

## ✅ Verification

### Check Firestore Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `yt-tool-1c8fe`
3. Navigate to Firestore Database
4. Verify collections:
   - `tools` - Should have 31,708 documents
   - `guides` - Should have 100+ documents
   - `categories` - Should have 20+ documents
   - `features` - Should have 10 documents

### Test Dynamic Loading
1. Visit `http://localhost:8080/explore.html`
2. Open browser console
3. Look for: "Loaded X tools from Firestore"
4. Verify tools display correctly

### Test Chatbot
1. Click chat button
2. Ask: "Show me video editing tools"
3. Verify chatbot searches Firestore data
4. Check tool recommendations appear

---

## 🐛 Troubleshooting

### Error: "Permission denied"
**Solution**: Deploy Firestore rules first
```bash
firebase deploy --only firestore:rules
```

### Error: "Quota exceeded"
**Solution**: Wait a few minutes, Firestore has rate limits
- Free tier: 20,000 writes/day
- Migration uses ~32,000 writes
- May need to upgrade to Blaze plan

### Error: "Network error"
**Solution**: Check internet connection and Firebase project status

### Migration Stuck
**Solution**: Refresh page and restart migration
- Data is idempotent (safe to re-run)
- Existing documents will be overwritten

---

## 📈 After Migration

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Test All Pages
- ✅ Homepage - Trending tools load
- ✅ Explore - All tools load dynamically
- ✅ Guides - All guides load dynamically
- ✅ Chatbot - Searches Firestore data

### 3. Monitor Performance
- Check Firestore usage in console
- Monitor read/write counts
- Verify caching is working (5-min cache)

### 4. Optional: Remove JSON Files
Once verified working, you can remove:
- `data/tools.json` (backup first!)
- `data/guides.json` (backup first!)

---

## 🎯 Success Criteria

- [x] Migration script created
- [ ] All tools uploaded to Firestore
- [ ] All guides uploaded to Firestore
- [ ] Categories auto-generated
- [ ] Feature flags created
- [ ] Explore page loads from Firestore
- [ ] Guides page loads from Firestore
- [ ] Chatbot uses Firestore data
- [ ] Caching working correctly
- [ ] No console errors

---

## 📞 Next Steps

1. **Run Migration**: Use migration tool
2. **Verify Data**: Check Firestore console
3. **Test Pages**: Ensure dynamic loading works
4. **Deploy Rules**: `firebase deploy --only firestore:rules`
5. **Deploy Site**: `firebase deploy --only hosting`

**Estimated Total Time**: 10-15 minutes

---

**Status**: Ready to migrate! 🚀
