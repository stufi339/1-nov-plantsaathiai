# 📦 How to Add Products to Marketplace

## ✅ **EASY - No Code Changes Required!**

You can now add **unlimited products** to the marketplace by simply editing a JSON file. No programming knowledge needed!

---

## 🎯 **Quick Start: Add a Product in 3 Steps**

### **Step 1: Open the Product Catalog File**

Navigate to: `src/lib/marketplace/productCatalog.ts`

### **Step 2: Copy This Template**

```typescript
{
  product_id: 'YOUR_UNIQUE_ID',  // Example: 'fert_npk_001'
  product_name: {
    en: 'Product Name in English',
    hi: 'उत्पाद का नाम हिंदी में',
    bn: 'বাংলায় পণ্যের নাম',
  },
  category: 'fertilizer',  // Options: fertilizer, fungicide, pesticide, equipment, seed_treatment
  subcategory: 'nitrogen',  // Example: nitrogen, phosphorus, potassium, etc.
  addresses_conditions: {},  // Leave empty for general products
  amazon_asin: 'B08XYZ1234',  // Get from Amazon product page
  amazon_affiliate_tag: 'plantsaathi-21',  // Your affiliate tag
  base_price: 1250,  // Price in Indian Rupees
  package_sizes: ['50kg'],  // Available sizes
  manufacturer: 'IFFCO',  // Manufacturer name
  is_local: true,  // true if Indian manufacturer
  is_eco_friendly: false,  // true if eco-friendly
  sustainability_rating: 3,  // 1-5 scale
  image_url: 'https://images.unsplash.com/photo-xxx',  // Product image URL
  application_rate: '100-150 kg/hectare',  // Usage instructions
  safety_precautions: ['Wear gloves', 'Avoid inhalation'],  // Safety tips
  effectiveness_rating: 4.5,  // 1-5 scale
  regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],  // State codes
},
```

### **Step 3: Paste at the End of the Array**

Add your product entry before the closing `];` in the file.

### **Done!** 🎉

The product will automatically appear in the marketplace!

---

## 📋 **Field Explanations**

### **Required Fields**

| Field | Description | Example |
|-------|-------------|---------|
| `product_id` | Unique identifier (no spaces) | `'fert_urea_002'` |
| `product_name.en` | English name | `'Urea Fertilizer'` |
| `product_name.hi` | Hindi name | `'यूरिया उर्वरक'` |
| `category` | Product type | `'fertilizer'` |
| `amazon_asin` | Amazon product code | `'B08XYZ1234'` |
| `base_price` | Price in ₹ | `1250` |
| `image_url` | Product image | `'https://...'` |

### **Category Options**

- `fertilizer` - All types of fertilizers
- `fungicide` - Disease control products
- `pesticide` - Insect control products
- `equipment` - Tools and machinery
- `seed_treatment` - Seed coating products

### **Regional Availability Codes**

- `PB` - Punjab
- `HR` - Haryana
- `UP` - Uttar Pradesh
- `MH` - Maharashtra
- `KA` - Karnataka
- `TN` - Tamil Nadu
- `WB` - West Bengal
- `IN` - All India

---

## 🔍 **How to Get Amazon ASIN**

1. Go to the product page on Amazon India
2. Look at the URL: `amazon.in/dp/B08XYZ1234`
3. The ASIN is the code after `/dp/`: `B08XYZ1234`

---

## 🎨 **How to Get Product Images**

### **Option 1: Use Amazon Images**
- Right-click on product image on Amazon
- Copy image address
- Use that URL

### **Option 2: Use Unsplash (Free)**
- Go to unsplash.com
- Search for product type
- Copy image URL
- Example: `https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400`

### **Option 3: Upload Your Own**
- Upload to your CDN/hosting
- Use the hosted URL

---

## 💡 **Real Example**

```typescript
{
  product_id: 'fert_npk_complex_001',
  product_name: {
    en: 'NPK 19-19-19 Water Soluble Fertilizer (1kg)',
    hi: 'एनपीके 19-19-19 पानी में घुलनशील उर्वरक (1 किग्रा)',
    bn: 'এনপিকে 19-19-19 জল দ্রবণীয় সার (1 কেজি)',
  },
  category: 'fertilizer',
  subcategory: 'complex',
  addresses_conditions: {},
  amazon_asin: 'B07XYZABC1',
  amazon_affiliate_tag: 'plantsaathi-21',
  base_price: 450,
  package_sizes: ['1kg', '5kg'],
  manufacturer: 'Multiplex',
  is_local: true,
  is_eco_friendly: true,
  sustainability_rating: 4,
  image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
  application_rate: '2-3 grams per liter of water',
  safety_precautions: ['Wear gloves', 'Store in cool place', 'Keep away from children'],
  effectiveness_rating: 4.7,
  regional_availability: ['PB', 'HR', 'UP', 'MH', 'KA', 'TN', 'WB', 'IN'],
},
```

---

## 🚀 **Advanced: Make Products "Smart Recommended"**

If you want a product to be recommended based on farm conditions, add a rule in `src/lib/marketplace/rules.json`:

```json
{
  "rule_id": "your_rule_id",
  "rule_name": "Description of when to recommend",
  "enabled": true,
  "conditions": {
    "npk_deficiency": {
      "nutrient": "nitrogen",
      "min_severity": "high"
    }
  },
  "product_mapping": {
    "product_id": "YOUR_PRODUCT_ID",
    "priority": "immediate",
    "urgency_base_score": 90,
    "confidence_multiplier": 1.0,
    "reason_template": "Why this product is recommended"
  }
}
```

---

## 📊 **Current System Capacity**

- ✅ **Current:** 20+ products
- ✅ **Supports:** 100+ products easily
- ✅ **Maximum:** ~500 products (JSON file limit)
- ✅ **Future:** Unlimited (when moved to database)

---

## 🎯 **Product Display Logic**

### **How Products Appear:**

1. **Recommended Section (Top)**
   - Shows products matched by rules
   - Based on farm data (NPK, disease, weather)
   - Sorted by urgency and confidence

2. **All Products Section (Below)**
   - Shows ALL products in catalog
   - Searchable and filterable
   - Sorted by category

### **Example:**

```
┌─────────────────────────────────────┐
│ ✨ RECOMMENDED FOR YOU              │
│ [Urea] - N deficiency detected      │
│ [Fungicide] - Disease risk high     │
└─────────────────────────────────────┘

─────── Browse All Products ───────

🔍 [Search: ___________]

┌─────────────────────────────────────┐
│ 🛒 ALL PRODUCTS (120 products)      │
│ [Product 1] [Product 2] [Product 3] │
│ [Product 4] [Product 5] [Product 6] │
│ ... and 114 more                    │
└─────────────────────────────────────┘
```

---

## ✅ **Checklist: Adding a New Product**

- [ ] Choose unique `product_id`
- [ ] Add English name
- [ ] Add Hindi name (use Google Translate if needed)
- [ ] Select correct category
- [ ] Get Amazon ASIN from product page
- [ ] Set price in Indian Rupees
- [ ] Find product image URL
- [ ] Add application instructions
- [ ] Set regional availability
- [ ] Save file
- [ ] Test in browser

---

## 🔧 **Troubleshooting**

### **Product Not Showing?**

1. Check JSON syntax (commas, brackets)
2. Ensure `product_id` is unique
3. Verify file is saved
4. Refresh browser (Ctrl+F5)

### **Image Not Loading?**

1. Check image URL is valid
2. Try opening URL in browser
3. Use HTTPS URLs only
4. Consider using Unsplash

### **Wrong Price Format?**

- Use numbers only: `1250` ✅
- Don't use: `"₹1,250"` ❌
- Don't use: `"1250"` ❌

---

## 🎓 **Tips for Success**

1. **Start Small:** Add 5-10 products first
2. **Test Each:** Verify each product appears correctly
3. **Use Templates:** Copy existing products and modify
4. **Consistent Naming:** Follow same pattern for IDs
5. **Quality Images:** Use clear, professional photos
6. **Accurate Prices:** Update regularly from Amazon
7. **Complete Info:** Fill all fields for best results

---

## 📞 **Need Help?**

If you're stuck:
1. Check existing products for examples
2. Verify JSON syntax online: jsonlint.com
3. Test one product at a time
4. Keep backups before major changes

---

## 🌟 **Future Enhancements**

Coming soon:
- ✨ Admin dashboard for adding products
- ✨ Bulk upload via CSV
- ✨ Automatic price updates from Amazon
- ✨ Product analytics and insights
- ✨ Inventory management

---

**You can now add unlimited products without touching any code!** 🎉

Just edit the JSON file, save, and your products will appear in the marketplace automatically.
