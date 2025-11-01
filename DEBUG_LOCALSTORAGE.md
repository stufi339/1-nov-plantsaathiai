# 🔍 LocalStorage Debug Guide

## Check What's in LocalStorage

Open browser console (F12) and run:

```javascript
// Check if fields_list exists
console.log('fields_list:', localStorage.getItem('fields_list'));

// Check all localStorage keys
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, ':', localStorage.getItem(key));
}

// Count fields
const fieldsList = JSON.parse(localStorage.getItem('fields_list') || '[]');
console.log('Total fields:', fieldsList.length);
console.log('Fields:', fieldsList);
```

## Clear All Data (if needed)

```javascript
localStorage.clear();
console.log('LocalStorage cleared');
```

## Add Test Field

```javascript
const testField = {
  id: 'test123',
  name: 'Test Field',
  cropType: 'Rice',
  area: 2.5,
  sowingDate: '2024-01-01',
  createdAt: new Date().toISOString(),
  health: {
    ndvi: 0.75,
    status: 'healthy'
  }
};

// Save field data
localStorage.setItem('field_test123_data', JSON.stringify(testField));

// Add to fields list
const fieldsList = JSON.parse(localStorage.getItem('fields_list') || '[]');
fieldsList.push(testField);
localStorage.setItem('fields_list', JSON.stringify(fieldsList));

console.log('Test field added!');
```

## Why Fields Might Vanish

1. **Browser cleared cache** - User cleared browsing data
2. **Incognito mode** - Data doesn't persist
3. **Different browser** - localStorage is per-browser
4. **Code error** - Something is clearing localStorage
5. **Storage quota** - Browser ran out of space (unlikely)

## Solution: Add Persistence Check

We should add a backup mechanism or use IndexedDB for more reliable storage.
