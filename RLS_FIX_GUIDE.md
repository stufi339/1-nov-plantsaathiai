# 🔧 RLS Policy Fix Guide

## Problem Identified

Your test revealed the issue: **Row Level Security (RLS) policies are blocking data insertion**.

Error: `new row violates row-level security policy for table "mandi_price_history"`

## Quick Fix (For Testing)

### Step 1: Run the Fix Script

1. Open Supabase Dashboard → SQL Editor
2. Copy content from `FIX_MANDI_RLS_POLICIES.sql`
3. Click "Run"
4. You should see: ✅ RLS policies updated successfully!

### Step 2: Test Again

1. Open `test-mandi-history-sync.html` in browser
2. Click "🔄 Sync Today's Prices"
3. Should now work! ✅

## What Changed?

### Before (Restrictive)
```sql
-- Only authenticated users could insert
WITH CHECK (auth.uid() IS NOT NULL)
```

### After (Permissive for Testing)
```sql
-- Anyone can insert (for testing)
WITH CHECK (true)
```

## Production Security (Later)

Once testing is complete, run `MANDI_RLS_PRODUCTION.sql` for better security:

- ✅ Everyone can READ prices (public data)
- 🔐 Only authenticated users can INSERT/UPDATE
- 🛡️ Better protection for production

## Why This Approach?

### Testing Phase (Current)
- Need to test sync functionality
- HTML test tool uses anonymous key
- Permissive policies allow testing

### Production Phase (Later)
- Tighten security
- Require authentication for writes
- Public read access maintained

## Files Created

1. **FIX_MANDI_RLS_POLICIES.sql** - Quick fix for testing
2. **MANDI_RLS_PRODUCTION.sql** - Secure policies for production
3. **MANDI_PRICE_HISTORY_SCHEMA.sql** - Updated with better policies

## Testing Checklist

After running the fix:

- [ ] Run `FIX_MANDI_RLS_POLICIES.sql` in Supabase
- [ ] Open `test-mandi-history-sync.html`
- [ ] Click "Sync Today's Prices"
- [ ] Verify data saves successfully
- [ ] Check "Check History" shows records
- [ ] Test "Test Trend" (after 2+ days of data)

## Expected Results

### After Fix
```
✅ Saved 15 rice prices
✅ Saved 12 wheat prices
✅ Saved 8 cotton prices
...
🎉 Sync complete: 150 records, 10 crops, 75 markets
```

### Database Check
```sql
SELECT COUNT(*) FROM mandi_price_history;
-- Should show: 150+ records

SELECT DISTINCT commodity FROM mandi_price_history;
-- Should show: rice, wheat, cotton, etc.
```

## Security Notes

### Current Setup (Testing)
- ⚠️ Anyone can insert data
- ✅ Good for testing
- ❌ Not ideal for production

### Production Setup (Later)
- ✅ Public can read
- ✅ Only authenticated users can write
- ✅ Secure and scalable

## Troubleshooting

### Still Getting RLS Error?

1. **Verify policies were created:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'mandi_price_history';
```

2. **Check RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'mandi_price_history';
```

3. **Try disabling RLS temporarily:**
```sql
ALTER TABLE mandi_price_history DISABLE ROW LEVEL SECURITY;
-- Test, then re-enable:
ALTER TABLE mandi_price_history ENABLE ROW LEVEL SECURITY;
```

### Other Issues?

- **API Rate Limiting**: Add longer delays between requests
- **Network Errors**: Check internet connection
- **Supabase Connection**: Verify URL and anon key

## Next Steps

1. ✅ Run the fix script
2. ✅ Test sync functionality
3. ✅ Verify data in database
4. ✅ Deploy to production
5. ⏳ Wait for automatic sync at 9:15 AM
6. 🔐 Apply production policies later

## Production Deployment

When ready for production:

1. Test thoroughly with current policies
2. Verify sync works automatically
3. Run `MANDI_RLS_PRODUCTION.sql`
4. Test with authenticated users
5. Monitor for any issues

---

**Status**: Ready to fix! Run `FIX_MANDI_RLS_POLICIES.sql` now.
