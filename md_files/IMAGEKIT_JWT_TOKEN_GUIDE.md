# 🔐 ImageKit JWT Token Implementation Guide

## Overview

Implemented **secure client-side file uploads** using JWT token generation, as per ImageKit's official V2 Upload API documentation.

**Reference:** <https://imagekit.io/docs/api-reference/upload-file/upload-file-v2#how-to-implement-secure-client-side-file-upload>

---

## What's New

### Implementation Changed

The endpoint now uses **proper JWT token signing** instead of SDK authentication parameters:

```javascript
// ✅ NEW APPROACH - JWT Signing (Secure)
import jwt from "jsonwebtoken";

const uploadPayload = {
    useUniqueFileName: true,
    tags: ["chat", "media"],
    folder: "/uploads/chat",
};

const iat = Math.floor(Date.now() / 1000);      // Issued at (Unix timestamp)
const exp = iat + 3600;                          // Expires in 1 hour

const jwtPayload = { ...uploadPayload, iat, exp };

const token = jwt.sign(jwtPayload, process.env.Image_Kit_Private_Key_Owner, {
    algorithm: "HS256",
    header: {
        alg: "HS256",
        typ: "JWT",
        kid: process.env.Image_Kit_Public_Key_Owner,
    },
});
```

### Why This Change?

| Aspect | Old Approach | New Approach |
|--------|--------------|--------------|
| Method | `imagekit.auth.getAuthenticationParameters()` | `jwt.sign()` with private key |
| Security | SDK dependency | Standard JWT (RFC 7519) |
| Token Control | Limited customization | Full control over payload |
| Verification | SDK-dependent | Industry standard HMAC-SHA256 |
| Expiration | SDK default | Customizable (1 hour set) |
| Standards | ImageKit specific | OpenID Connect compatible |

---

## JWT Token Structure

### How JWT Works (3 Parts)

A JWT token looks like: `header.payload.signature`

Example decoded:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InB1Ymxpa19rZXkifQ.
eyJ1c2VVbmlxdWVGaWxlTmFtZSI6dHJ1ZSwidGFncyI6WyJjaGF0IiwibWVkaWEiXSwiZm9sZGVyIjoiL3VwbG9hZHMvY2hhdCIsImlhdCI6MTcwNjAwMDAwMCwiZXhwIjoxNzA2MDAzNjAwfQ.
signature_here
```

### Part 1: Header

```json
{
  "alg": "HS256",           // HMAC SHA256 signing algorithm
  "typ": "JWT",            // Token type
  "kid": "public_key"      // Key ID (ImageKit public key)
}
```

### Part 2: Payload

```json
{
  "useUniqueFileName": true,    // Upload settings
  "tags": ["chat", "media"],
  "folder": "/uploads/chat",
  "iat": 1706000000,            // Issued At timestamp
  "exp": 1706003600             // Expiration timestamp (iat + 3600 = 1 hour)
}
```

### Part 3: Signature

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  PRIVATE_KEY
)
```

ImageKit verifies:

- ✅ Signature matches (token not tampered with)
- ✅ Expiration is valid (current time < exp)
- ✅ Payload parameters match upload request

---

## API Response Format

### Endpoint

```http
GET /api/media/get-upload-token
Authorization: Bearer {{jwt_auth_token}}
```

### Success Response (200)

```json
{
  "status": 200,
  "success": true,
  "message": "Upload token generated successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InB1Ymxpa19rZXkifQ...",
    "expire": 1706003600,                                    // Unix timestamp when token expires
    "publicKey": "your_imagekit_public_key",
    "urlEndpoint": "https://ik.imagekit.io/your_account_id",
    "uploadUrl": "https://upload.imagekit.io/api/v2/files/upload"
  }
}
```

### Error Response (401/500)

```json
{
  "status": 401,
  "success": false,
  "message": "Unauthorized" or specific error message
}
```

---

## Client-Side Implementation Examples

### Plain JavaScript (Vanilla)

```javascript
// 1️⃣ Get upload token from backend
async function getUploadToken() {
    const response = await fetch('/api/media/get-upload-token', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });
    
    if (!response.ok) throw new Error('Failed to get upload token');
    return response.json();
}

// 2️⃣ Upload file directly to ImageKit
async function uploadFileToImageKit(file) {
    const tokenData = await getUploadToken();
    const { token, publicKey, uploadUrl } = tokenData.data;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('token', token);
    formData.append('publicKey', publicKey);
    formData.append('useUniqueFileName', 'true');
    formData.append('tags', 'chat,media');
    formData.append('folder', '/uploads/chat');
    
    const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
    });
    
    if (!uploadResponse.ok) throw new Error('ImageKit upload failed');
    return uploadResponse.json();
}

// 3️⃣ Use in your app
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    try {
        const result = await uploadFileToImageKit(file);
        console.log('✅ Uploaded:', result.url);
        // Display result.url in your UI
    } catch (error) {
        console.error('❌ Upload failed:', error);
    }
});
```

### React Example

```jsx
import { useState } from 'react';

function MediaUploader() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [error, setError] = useState(null);
    
    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        
        try {
            // Get token
            const tokenRes = await fetch('/api/media/get-upload-token', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const tokenData = await tokenRes.json();
            
            // Upload file
            const formData = new FormData();
            formData.append('file', file);
            formData.append('token', tokenData.data.token);
            formData.append('publicKey', tokenData.data.publicKey);
            formData.append('fileName', file.name);
            formData.append('useUniqueFileName', 'true');
            
            const uploadRes = await fetch(tokenData.data.uploadUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await uploadRes.json();
            setUploadedUrl(result.url);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
        
        setLoading(false);
    };
    
    return (
        <div style={{ padding: '20px' }}>
            <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files[0])}
            />
            <button onClick={handleUpload} disabled={!file || loading}>
                {loading ? '⏳ Uploading...' : '📤 Upload'}
            </button>
            
            {error && <p style={{ color: 'red' }}>❌ {error}</p>}
            
            {uploadedUrl && (
                <div>
                    <p>✅ Uploaded successfully!</p>
                    {file.type.startsWith('image/') ? (
                        <img src={uploadedUrl} style={{ maxWidth: '300px' }} />
                    ) : (
                        <video src={uploadedUrl} style={{ maxWidth: '300px' }} controls />
                    )}
                </div>
            )}
        </div>
    );
}

export default MediaUploader;
```

### Vue 3 Composition API

```vue
<template>
  <div class="uploader">
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      accept="image/*,video/*"
    />
    
    <button @click="uploadFile" :disabled="!selectedFile || uploading">
      {{ uploading ? '⏳ Uploading...' : '📤 Upload' }}
    </button>
    
    <p v-if="error" style="color: red">❌ {{ error }}</p>
    
    <div v-if="uploadedUrl">
      <p>✅ Uploaded successfully!</p>
      <img v-if="fileType === 'image'" :src="uploadedUrl" />
      <video v-if="fileType === 'video'" :src="uploadedUrl" controls />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const selectedFile = ref(null);
const uploading = ref(false);
const uploadedUrl = ref(null);
const fileType = ref(null);
const error = ref(null);

const handleFileSelect = (event) => {
    selectedFile.value = event.target.files[0];
    fileType.value = selectedFile.value.type.startsWith('image/') ? 'image' : 'video';
};

const uploadFile = async () => {
    if (!selectedFile.value) return;
    
    uploading.value = true;
    error.value = null;
    
    try {
        // Get token
        const tokenRes = await fetch('/api/media/get-upload-token', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const tokenData = await tokenRes.json();
        
        // Upload
        const formData = new FormData();
        formData.append('file', selectedFile.value);
        formData.append('token', tokenData.data.token);
        formData.append('publicKey', tokenData.data.publicKey);
        formData.append('fileName', selectedFile.value.name);
        
        const uploadRes = await fetch(tokenData.data.uploadUrl, {
            method: 'POST',
            body: formData
        });
        
        const result = await uploadRes.json();
        uploadedUrl.value = result.url;
    } catch (err) {
        error.value = err.message;
    }
    
    uploading.value = false;
};
</script>
```

### Using Axios

```javascript
import axios from 'axios';

const uploadFile = async (file) => {
    try {
        // 1. Get token
        const { data: tokenData } = await axios.get('/api/media/get-upload-token', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        // 2. Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('token', tokenData.data.token);
        formData.append('publicKey', tokenData.data.publicKey);
        formData.append('fileName', file.name);
        formData.append('useUniqueFileName', 'true');
        
        // 3. Upload to ImageKit
        const { data: uploadResult } = await axios.post(
            tokenData.data.uploadUrl,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    console.log(`📊 Upload Progress: ${percentCompleted}%`);
                }
            }
        );
        
        return uploadResult;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};
```

---

## Testing with Postman

### Step 1: Get Upload Token

**Request:**

```http
GET {{base_url}}/api/media/get-upload-token
Authorization: Bearer {{jwt_token}}
```

**Response:**

```json
{
  "status": 200,
  "success": true,
  "message": "Upload token generated successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InB1Ymxpa19rZXkifQ...",
    "expire": 1706003600,
    "publicKey": "your_public_key",
    "urlEndpoint": "https://ik.imagekit.io/your_id",
    "uploadUrl": "https://upload.imagekit.io/api/v2/files/upload"
  }
}
```

### Step 2: Test Token JWT Format

Paste the token at <https://jwt.io> to verify:

- Header contains: `alg: HS256`, `typ: JWT`, `kid: your_public_key`
- Payload contains: `iat`, `exp`, `useUniqueFileName`, `tags`, `folder`
- Signature is valid (if you enter your private key)

### Step 3: Upload with Token

**Request:**

```http
POST https://upload.imagekit.io/api/v2/files/upload
```

**Body (form-data):**

```
file: [select your file]
token: [paste token from step 1]
publicKey: {{Image_Kit_Public_Key_Owner}}
fileName: test_image.jpg
useUniqueFileName: true
folder: /uploads/chat
```

**Expected Response (200):**

```json
{
  "fileId": "123abc...",
  "name": "test_image_xyz.jpg",
  "size": 12345,
  "filePath": "/uploads/chat/test_image_xyz.jpg",
  "url": "https://ik.imagekit.io/your_id/uploads/chat/test_image_xyz.jpg",
  "fileType": "image",
  "height": 1080,
  "width": 1920,
  "orientation": "landscape",
  "duration": null,
  "hasAlpha": false,
  "customMetadata": null,
  "isPrivateFile": false,
  "tags": ["chat", "media"],
  "customCoordinates": null,
  "extensionStatus": "supported"
}
```

---

## Security Implementation

### ✅ What Makes This Secure

| Security Feature | How It Works |
|------------------|--------------|
| **Private Key** | Never exposed to client - only used on server |
| **JWT Signature** | HMAC-SHA256 prevents token tampering |
| **Token Expiration** | 1-hour lifetime limits exposure window |
| **Parameter Binding** | Upload params are signed - can't be changed client-side |
| **Authentication Required** | Must have valid JWT bearer token to get upload token |
| **HTTPS Only** | All communication encrypted in transit |

### ⚠️ Important Security Rules

1. **NEVER** expose `Image_Kit_Private_Key_Owner` to frontend

   ```javascript
   // ❌ WRONG
   const privateKey = process.env.Image_Kit_Private_Key_Owner;  // ❌ Frontend
   
   // ✅ CORRECT
   const privateKey = process.env.Image_Kit_Private_Key_Owner;  // ✅ Backend only
   ```

2. **NEVER** share private keys in code repositories

   ```javascript
   // ❌ WRONG
   const privateKey = "kit_private_abc123...";  // ❌ Exposed in code
   
   // ✅ CORRECT
   const privateKey = process.env.Image_Kit_Private_Key_Owner;  // ✅ From .env
   ```

3. **ALWAYS** require authentication to get upload token

   ```javascript
   // ✅ Check user is logged in
   if (!req.user || !req.user.id) {
       return res.status(401).json({ message: "Unauthorized" });
   }
   ```

4. **Token is one-time use per request** - Always get fresh token for each upload

---

## Configuration

### Environment Variables

In your `.env` file:

```env
# ImageKit Configuration
Image_Kit_Public_Key_Owner=your_imagekit_public_key
Image_Kit_Private_Key_Owner=your_imagekit_private_key
Image_Kit_URL=https://ik.imagekit.io/your_account_id

# Node Environment
NODE_ENV=production
JWT_SECRET=your_jwt_secret_for_auth_tokens
```

### Default Upload Settings

These are applied automatically to all uploads:

```javascript
{
  useUniqueFileName: true,        // Prevents overwriting existing files
  tags: ["chat", "media"],        // For organizing uploads
  folder: "/uploads/chat",        // Directory structure on ImageKit
  isPrivateFile: false,           // Makes files publicly accessible
  iat: current_unix_timestamp,    // Issued at time
  exp: iat + 3600                 // Expiration (1 hour later)
}
```

To customize per upload, modify the `uploadPayload` object in `media_controller.js`:

```javascript
const uploadPayload = {
    useUniqueFileName: true,
    tags: ["chat", "media", "custom_tag"],  // Add more tags
    folder: "/uploads/chat",
    customMetadata: {                       // Add custom metadata
        userId: req.user.id,
        chatId: req.body.chatId,
        timestamp: new Date().toISOString()
    }
};
```

---

## Troubleshooting

### Error: "token is invalid or expired"

**Cause:** Token has exceeded 1-hour validity  
**Solution:**

- Request a new token: `GET /api/media/get-upload-token`
- Each upload needs its own token
- Don't reuse tokens across multiple upload requests

```javascript
// ❌ WRONG - Reusing old token
const oldToken = getToken();
uploadFile(file1, oldToken);  // ✅ Works
uploadFile(file2, oldToken);  // ❌ Fails - token expired

// ✅ CORRECT - Fresh token each time
const token1 = getToken();
uploadFile(file1, token1);    // ✅ Works
const token2 = getToken();
uploadFile(file2, token2);    // ✅ Works
```

### Error: "Parameter mismatch"

**Cause:** Upload request parameters don't match JWT payload  
**Solution:** Ensure all parameters in token are included in upload request:

```javascript
// ✅ CORRECT - Include all JWT payload parameters
formData.append('file', file);
formData.append('token', token);
formData.append('publicKey', publicKey);
formData.append('fileName', file.name);
formData.append('useUniqueFileName', 'true');      // From token payload
formData.append('tags', 'chat,media');             // From token payload
formData.append('folder', '/uploads/chat');        // From token payload
```

### Error: "Invalid JWT signature"

**Cause:** Token was tampered with or wrong private key used  
**Solution:**

- Verify `Image_Kit_Private_Key_Owner` in `.env` is correct
- Check token was generated on server, not client
- Ensure no URL encoding happened to the token

### Error: "ENOENT: no such file or directory .env"

**Cause:** Missing `.env` file  
**Solution:**

```bash
# Create .env file in project root
touch .env

# Add required variables
echo "Image_Kit_Public_Key_Owner=your_key" >> .env
echo "Image_Kit_Private_Key_Owner=your_key" >> .env
echo "Image_Kit_URL=https://ik.imagekit.io/your_id" >> .env
```

### Upload works but no metadata returned

**Cause:** ImageKit processing delay or incomplete response  
**Solution:**

```javascript
// Poll for metadata
async function waitForMetadata(fileId, maxAttempts = 5) {
    for (let i = 0; i < maxAttempts; i++) {
        const file = await imagekit.files.details(fileId);
        if (file.height && file.width) return file;
        await new Promise(r => setTimeout(r, 1000));
    }
}
```

---

## File Structure

```
controller/
├── media_controller.js          # ✅ Updated with JWT implementation
│   ├── uploadChatMedia()        # Server-side single upload
│   ├── getUploadToken()         # ✅ JWT token generation
│   ├── deleteMediaFile()        # File deletion
│   ├── bulkUploadMedia()        # Multiple files
│   └── getMediaMetadata()       # File metadata
│
routes/
├── media_route.js               # Express routes
│   ├── GET /get-upload-token    # Request token
│   ├── POST /upload             # Server-side upload
│   └── DELETE /:fileId          # Delete file
│
utils/
├── image_kit_config.js          # ImageKit initialization
│
.env                             # Environment variables
```

---

## Summary Table

| Feature | Status | Details |
|---------|--------|---------|
| **JWT Implementation** | ✅ Complete | Using jwt.sign() with HS256 |
| **Token Expiration** | ✅ Configured | 3600 seconds (1 hour) |
| **Parameter Binding** | ✅ Enabled | Tags, folder, useUniqueFileName |
| **Security** | ✅ Production-Ready | Private key server-side only |
| **Client Examples** | ✅ Provided | Vanilla JS, React, Vue 3, Axios |
| **Error Handling** | ✅ Complete | Comprehensive error messages |
| **Testing** | ✅ Ready | Postman collection updated |
| **Documentation** | ✅ Complete | This guide + inline comments |

---

## References

### ImageKit Official Documentation

- [Upload API V2 Reference](https://imagekit.io/docs/api-reference/upload-file/upload-file-v2)
- [Secure Client-Side Upload](https://imagekit.io/docs/api-reference/upload-file/upload-file-v2#how-to-implement-secure-client-side-file-upload)
- [JWT Authentication Spec](https://tools.ietf.org/html/rfc7519)

### Related Files in This Project

- [Media Controller](./controller/media_controller.js)
- [Media Routes](./routes/media_route.js)
- [ImageKit Config](./utils/image_kit_config.js)
- [Postman Collection](./postman/collections/New%20Collection.postman_collection.json)

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** ✅ Production Ready
