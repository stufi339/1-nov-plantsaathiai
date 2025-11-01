# Admin Panel - Quick Start Guide 🛠️

## Accessing the Admin Panel

Navigate to: `http://localhost:8080/admin`

## Dashboard Overview

### Sidebar Navigation
- **Products** - View and manage all products
- **Add Product** - Create new products
- **Analytics** - View marketplace statistics
- **Settings** - Configure marketplace settings

## Managing Products

### Viewing Products
1. Click "Products" in the sidebar
2. See all products in a table format with:
   - Product image and name
   - Category badge
   - Price and package size
   - Manufacturer
   - Status badges (Eco-Friendly, Made in India)
   - Action buttons (View, Edit, Delete)

### Searching Products
- Use the search bar to find products by name
- Filter by category using the dropdown

### Adding a New Product

1. Click "Add Product" button or sidebar link
2. Fill in the form:

#### Basic Information
```
Product ID: fert_urea_001
Product Name (English): Urea 46-0-0 Fertilizer (50kg)
Product Name (Hindi): यूरिया 46-0-0 उर्वरक (50 किग्रा)
Product Name (Bengali): ইউরিয়া 46-0-0 সার (50 কেজি)
Category: fertilizer
Subcategory: nitrogen
```

#### Pricing & Amazon
```
Price (₹): 1250
Amazon ASIN: B08XYZ1234
Package Sizes: 50kg, 25kg, 10kg (add multiple)
```

#### Product Image
```
Image URL: https://images.unsplash.com/photo-...
(Preview will show below)
```

#### Product Details
```
Manufacturer: IFFCO
Application Rate: 100-150 kg/hectare for rice
Effectiveness (1-5): 4.5
Sustainability (1-5): 3
☑ Eco-Friendly Product
☑ Made in India
Safety Precautions:
  - Wear protective gloves
  - Avoid contact with skin
  - Store in cool, dry place
```

3. Click "Create Product"

### Editing a Product
1. Click the edit icon (pencil) next to any product
2. Modify the fields as needed
3. Click "Update Product"

### Deleting a Product
1. Click the delete icon (trash) next to any product
2. Confirm the deletion in the popup
3. Product will be removed from the list

## Analytics Dashboard

View key metrics:
- **Total Products**: Number of products in catalog
- **Active Users**: Current active users
- **Monthly Sales**: Revenue for the month
- **Popular Categories**: Breakdown by category

## Settings

Configure marketplace settings:
- **Amazon Affiliate Tag**: Your affiliate ID
- **Smart Recommendations**: Toggle AI recommendations
- **Eco-Friendly Badges**: Show/hide eco badges
- **Voice Guidance**: Enable/disable voice features

## Product Form Fields Reference

### Required Fields (*)
- Product ID
- Product Name (English)
- Amazon ASIN
- Price
- Category

### Optional Fields
- Product Name (Hindi)
- Product Name (Bengali)
- Subcategory
- Package Sizes (can add multiple)
- Image URL
- Manufacturer
- Application Rate
- Effectiveness Rating
- Sustainability Rating
- Eco-Friendly checkbox
- Made in India checkbox
- Safety Precautions (can add multiple)

## Tips for Best Results

### Product IDs
Use a consistent naming convention:
- `fert_urea_001` - Fertilizer
- `fung_mancozeb_001` - Fungicide
- `pest_cypermethrin_001` - Pesticide
- `equip_sprayer_001` - Equipment

### Amazon ASINs
Find the ASIN in the Amazon product URL:
```
https://www.amazon.in/dp/B08XYZ1234/
                        ^^^^^^^^^^
                        This is the ASIN
```

### Product Images
Use high-quality images from:
- Unsplash: `https://images.unsplash.com/photo-...`
- Amazon product images
- Manufacturer websites

### Pricing
- Enter price in Indian Rupees (₹)
- Don't include currency symbol
- Example: 1250 (not ₹1,250)

### Ratings
- Effectiveness: How well the product works (1-5)
- Sustainability: Environmental impact (1-5)
- Higher is better

### Package Sizes
Add multiple sizes if available:
- 50kg
- 25kg
- 10kg
- 5kg
- 1kg

### Safety Precautions
Add multiple precautions:
- Wear protective gloves
- Avoid contact with skin
- Store in cool, dry place
- Keep away from children
- Use in well-ventilated area

## Common Tasks

### Bulk Adding Products
Currently, products must be added one at a time. For bulk operations:
1. Add products to `src/lib/marketplace/productCatalog.ts`
2. Follow the existing format
3. Products will appear in the admin panel

### Updating Product Catalog
To make changes permanent:
1. Edit products in the admin panel
2. Copy the product data from console logs
3. Update `productCatalog.ts` file
4. Restart the application

### Viewing Products on Marketplace
1. Click the eye icon next to any product
2. Opens product detail page in new tab
3. See how customers will view the product

## Troubleshooting

### Product Not Showing
- Check if all required fields are filled
- Verify the product ID is unique
- Ensure category is valid

### Image Not Loading
- Verify the image URL is correct
- Check if the image is publicly accessible
- Try a different image URL

### Changes Not Persisting
- Currently, changes are in-memory only
- To persist changes, update `productCatalog.ts`
- In production, connect to a backend API

## Next Steps

After adding products:
1. View them in the marketplace
2. Test the product detail pages
3. Verify Amazon affiliate links work
4. Check mobile responsiveness
5. Monitor analytics

## Support

For issues or questions:
- Check the console for error messages
- Verify all required fields are filled
- Ensure data types are correct (numbers for prices, etc.)
- Review the product catalog format

---

**Happy Product Managing! 🎉**
