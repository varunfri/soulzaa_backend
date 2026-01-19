# Gift Image Upload with ImageKit Integration

## Overview
Updated the `add_gift` endpoint to support image uploads using ImageKit. When adding a gift, you now provide a banner/image file which will be automatically uploaded to ImageKit, and the returned URL will be stored in the database.

## Changes Made

### 1. Controller (`admin_gifts_controller.js`)
**Import Added:**
```javascript
import { imagekit } from "../utils/image_kit_config.js";
```

**Updated `add_gift` Function:**
- Removed `gift_icon_url` from request body (now comes from file upload)
- Added file validation check
- Integrated ImageKit upload with error handling
- ImageKit uploads to `/gifts` folder with timestamp
- Automatically names files as: `gift_{timestamp}_{originalname}`
- Returns uploaded URL from ImageKit in response
- Added transaction rollback if upload fails

**Response Structure:**
```json
{
  "status": 201,
  "message": "Gift added successfully",
  "data": {
    "gift_id": 1,
    "gift_name": "Rose Bundle",
    "gift_icon_url": "https://ik.imagekit.io/...",
    "coin_cost": 10
  }
}
```

### 2. Routes (`admin_gifts_route.js`)
**Changes:**
- Added `multer` import
- Configured multer for memory storage with 10MB file size limit
- Updated `/add_gift` route to use `upload.single('gift_banner')` middleware

**Route Definition:**
```javascript
router.post('/add_gift', authorize, authority('ADMIN'), upload.single('gift_banner'), add_gift);
```

## How to Use

### Using Postman
1. **Method:** POST
2. **Endpoint:** `/add_gift`
3. **Headers:** 
   - `Authorization: Bearer {jwt_token}`
4. **Form Data:**
   - `gift_name` (text) - Name of the gift
   - `coin_cost` (number) - Cost in coins
   - `gift_banner` (file) - Image/banner file for the gift
5. **Response:** 201 with gift details including ImageKit URL

### Using cURL
```bash
curl -X POST http://localhost:3000/add_gift \
  -H "Authorization: Bearer {jwt_token}" \
  -F "gift_name=Rose Bundle" \
  -F "coin_cost=10" \
  -F "gift_banner=@/path/to/image.png"
```

### Using JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('gift_name', 'Rose Bundle');
formData.append('coin_cost', 10);
formData.append('gift_banner', fileInput.files[0]);

fetch('/add_gift', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
}).then(res => res.json())
  .then(data => console.log(data));
```

## Features

✅ **Automatic Upload to ImageKit**
- Files uploaded to `/gifts` folder
- Unique naming to prevent conflicts
- Tagged with "gift_banner" for organization

✅ **Transaction Safety**
- Image upload happens before database insertion
- Rolls back database transaction if upload fails
- Ensures consistency

✅ **Error Handling**
- Missing file validation
- ImageKit upload errors with detailed messages
- Database operation errors

✅ **File Size Limit**
- Maximum 10MB per file
- Configurable in route file

## ImageKit Configuration
Ensure your `.env` file has:
```
Image_Kit_Public_Key_Owner={your_public_key}
Image_Kit_Private_Key_Owner={your_private_key}
Image_Kit_URL={your_endpoint_url}
```

## Error Responses

**Missing File:**
```json
{
  "status": 400,
  "message": "Gift banner/image is required"
}
```

**ImageKit Upload Failed:**
```json
{
  "status": 400,
  "message": "Failed to upload image to ImageKit",
  "error": "ImageKit error details"
}
```

**Missing Required Fields:**
```json
{
  "status": 400,
  "message": "Gift name and coin cost are required"
}
```

## Database
The `gifts` table stores:
- `gift_id` - Primary key
- `gift_name` - Gift name
- `gift_icon_url` - **ImageKit URL** (automatically populated)
- `coin_cost` - Cost in coins
- `is_active` - Active status
- `is_animated` - Animation flag
- `created_at` - Timestamp

## Supported File Types
ImageKit automatically handles:
- PNG
- JPEG/JPG
- WebP
- GIF
- SVG
- And many more image formats

## Notes
- The file parameter name must be `gift_banner` (as configured in multer middleware)
- ImageKit handles image optimization and delivery
- URLs are CDN-enabled for fast delivery
- Images are stored with metadata tags for organization
