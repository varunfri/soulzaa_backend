# Postman Collection Setup Guide

## Overview

The updated Postman collection includes **50+ API endpoints** across all modules of the Soulzaa backend application:

- **Authentication** (4 endpoints)
- **Chat System** (13 endpoints)
- **Media Upload** (5 endpoints)
- **User Profile** (2 endpoints)
- **Coins** (4 endpoints)
- **Gifts** (7 endpoints)
- **Live Streaming** (7 endpoints)
- **Stream Tokens** (1 endpoint)
- **Location** (1 endpoint)
- **Languages** (1 endpoint)

---

## 📥 Installation

### Step 1: Import Collection

1. Open Postman
2. Click **Import** button (top-left)
3. Select **Upload Files**
4. Choose: `postman/collections/New Collection.postman_collection.json`
5. Click **Import**

### Step 2: Import Environment

1. Click the **Settings** icon (⚙️)
2. Go to **Environments**
3. Click **Import**
4. Select: `postman/environments/New_Environment.postman_environment.json`
5. Click **Import**

### Step 3: Select Environment

1. In the top-right corner, select environment dropdown
2. Choose **Soulzaa Development**
3. You should see variables loaded

---

## 🔑 Environment Variables Configuration

After importing, configure these variables in **Soulzaa Development** environment:

### Essential Variables

| Variable | Description | Example Value |
|----------|-------------|---|
| `base_url` | Backend server URL | `http://localhost:8000` |
| `id_token` | Firebase ID token for auth | Your Firebase token |
| `jwt_token` | JWT token from server | Your JWT token |
| `refresh_token` | Refresh token for re-authentication | Your refresh token |

### Entity ID Variables

| Variable | Description | Usage |
|----------|-------------|---|
| `chatId` | Chat ID for message operations | Replace in chat endpoints |
| `userId` | User ID for profile/history | Replace in user endpoints |
| `fileId` | File ID for media operations | Replace in media endpoints |
| `giftId` | Gift ID for admin operations | Replace in gift endpoints |
| `liveId` | Live stream ID for control | Replace in live endpoints |

---

## 🔐 Getting Authentication Tokens

### Option 1: Firebase ID Token

1. Use Firebase Authentication in your frontend
2. Call `auth.currentUser.getIdToken()`
3. Copy the token
4. Paste into `id_token` variable

### Option 2: JWT Token After Sign In

1. Call **Authentication → Sign In** endpoint first
2. Copy the JWT token from response
3. Paste into `jwt_token` variable
4. Use this for all protected endpoints

---

## 📚 API Endpoint Organization

### Authentication Folder

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/sign_up` | POST | Register new user |
| `/api/auth/sign_in` | POST | Sign in user |
| `/api/auth/check_user` | GET | Verify user exists |
| `/api/auth/refresh_token` | GET | Get new JWT token |

**Headers Required:**

- `Authorization: {{id_token}}` (for sign up/in/check)
- `Authorization: {{refresh_token}}` (for refresh)

---

### Chat System Folder

#### Chat Request Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chats/requests` | GET | Get pending requests |
| `/api/chats/or-create` | POST | Create or get chat |
| `/api/chats/:chatId/accept` | POST | Accept request |
| `/api/chats/:chatId/reject` | POST | Reject request |

**Headers Required:**

- `Authorization: Bearer {{jwt_token}}`

#### Chat Messages

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chats/active` | GET | Get active chats |
| `/api/chats/:chatId/messages` | GET | Get messages |
| `/api/chats/:chatId/search` | GET | Search messages |
| `/api/chats/user/:userId/history` | GET | Get chat history |

**Query Parameters:**

- `limit` - Number of items per page (default: 10-20)
- `page` - Page number (default: 1)
- `query` - Search term (for search endpoint)
- `includeArchived` - Include archived chats (true/false)

#### Chat Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chats/:chatId` | GET | Get chat details |
| `/api/chats/:chatId/block` | POST | Block user |
| `/api/chats/:chatId/unblock` | POST | Unblock user |
| `/api/chats/:chatId/archive` | POST | Archive chat |
| `/api/chats/:chatId` | DELETE | Delete chat |

---

### Media Upload Folder

| Endpoint | Method | Purpose | Body Type |
|----------|--------|---------|-----------|
| `/api/media/get-upload-token` | GET | Get upload auth token | - |
| `/api/media/upload-chat-media` | POST | Upload single file | form-data |
| `/api/media/bulk-upload` | POST | Upload multiple files | form-data |
| `/api/media/:fileId/metadata` | GET | Get file details | - |
| `/api/media/delete` | POST | Delete file | JSON |

**Form Data for Upload:**

```
file: [select file] (single upload)
files: [select files] (bulk upload, max 10)
```

**JSON Body for Delete:**

```json
{
  "fileId": "file_id_here"
}
```

---

### User Profile Folder

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/user/profile` | GET | Get current user profile |
| `/api/users/get_all_user_profiles` | GET | Get all user profiles |

---

### Coins Folder

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/coins/get_coins` | GET | Get coin balance |
| `/api/coins/purchase_coins` | POST | Purchase coins |
| `/api/coins/get_purchase_history` | GET | Get purchase history |
| `/api/coins/get_coins_transaction` | GET | Get transactions |

**Purchase JSON Body:**

```json
{
  "amount": 100,
  "coins": 1000
}
```

---

### Gifts Folder (Admin)

| Endpoint | Method | Purpose | Admin Only |
|----------|--------|---------|-----------|
| `/api/gifts/get_gifts` | GET | Get all gifts | No |
| `/api/gifts/add_gift` | POST | Add new gift | Yes |
| `/api/gifts/update_gift` | PUT | Update gift | Yes |
| `/api/gifts/enable_gift/:id` | PUT | Enable gift | Yes |
| `/api/gifts/disable_gift/:id` | PUT | Disable gift | Yes |
| `/api/gifts/delete_gift/:id` | DELETE | Delete gift | Yes |
| `/api/gifts/is_gift_animated/:id` | PUT | Toggle animated | Yes |

**Add Gift JSON Body:**

```json
{
  "name": "Rose",
  "price": 10,
  "image": "image_url"
}
```

---

### Live Streaming Folder

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/live_stream/get_audio_lives` | GET | Get audio lives |
| `/api/live_stream/get_video_lives` | GET | Get video lives |
| `/api/live_stream/start` | POST | Start new live |
| `/api/live_stream/go_live` | POST | Go live (broadcast) |
| `/api/live_stream/pause` | POST | Pause live |
| `/api/live_stream/resume` | POST | Resume live |
| `/api/live_stream/end` | POST | End live |

**Start Live JSON Body:**

```json
{
  "liveType": "audio"
}
```

**Other Live Operations JSON Body:**

```json
{
  "liveId": "live_id_here"
}
```

---

### Stream Token Folder

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/live_stream/get_stream_token` | GET | Get Agora token |

---

### Location Folder

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/location` | GET | Get location details |

**Headers Required:**

- `Authorization: {{id_token}}`

---

### Languages Folder

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/languages` | GET | Get all languages |

**No authentication required**

---

## 🧪 Testing Workflow

### 1. Authentication Flow

```
1. Sign In (POST /api/auth/sign_in)
   ↓
2. Copy JWT token from response
   ↓
3. Set {{jwt_token}} variable
   ↓
4. Use in other endpoints
```

### 2. Chat Operations Flow

```
1. Get Active Chats (GET /api/chats/active)
   ↓
2. Copy {{chatId}} from response
   ↓
3. Set {{chatId}} variable
   ↓
4. Get Chat Messages (GET /api/chats/:chatId/messages)
   ↓
5. Search Messages (GET /api/chats/:chatId/search)
```

### 3. Media Upload Flow

```
1. Get Upload Token (GET /api/media/get-upload-token)
   ↓
2. Upload Media (POST /api/media/upload-chat-media)
   ↓
3. Copy {{fileId}} from response
   ↓
4. Get Metadata (GET /api/media/:fileId/metadata)
```

---

## 💡 Tips & Tricks

### 1. Using Variable Substitution

Replace variables using `{{variableName}}` syntax:

```
URL: {{base_url}}/api/chats/{{chatId}}/messages
Headers: Authorization: Bearer {{jwt_token}}
```

### 2. Pre-request Scripts

Add scripts to automatically extract tokens from responses:

```javascript
// In "Tests" tab of sign_in request:
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("jwt_token", jsonData.token);
}
```

### 3. Bulk Testing

Use Postman's **Collection Runner**:

1. Click **Runner** button
2. Select collection and environment
3. Configure requests to run
4. Click **Run**

### 4. Debugging

Enable **Postman Console** (Ctrl+Alt+C / Cmd+Option+C):

- View request/response details
- Check variable values
- Debug scripts

---

## 🔒 Security Best Practices

1. **Never commit tokens** to git
2. **Use environment files** for different stages:
   - Development: `localhost:8000`
   - Staging: `staging-api.soulzaa.com`
   - Production: `api.soulzaa.com`
3. **Rotate tokens regularly**
4. **Use Postman Cloud** to sync securely
5. **Enable 2FA** on your Postman account

---

## ⚠️ Common Issues & Solutions

### Issue: "Authorization header not recognized"

**Solution:**

- Ensure header key is exactly `Authorization`
- Use `Bearer {{jwt_token}}` format
- Verify token is not expired

### Issue: "CORS error"

**Solution:**

- Check server is running on correct port
- Verify CORS middleware is enabled
- Check `base_url` variable is correct

### Issue: "Variable not found"

**Solution:**

- Verify environment is selected (top-right)
- Check variable spelling matches exactly
- Variables are case-sensitive

### Issue: "404 Not Found"

**Solution:**

- Verify endpoint path is correct
- Check API server is running
- Ensure all path parameters are set

---

## 📊 Collection Statistics

| Category | Count |
|----------|-------|
| Total Endpoints | 50+ |
| Authenticated | 45+ |
| Public | 5 |
| HTTP Methods | GET, POST, PUT, DELETE |
| Folders | 10 |

---

## 🚀 Next Steps

1. **Import Collection** - Follow installation steps above
2. **Configure Variables** - Set your tokens and IDs
3. **Test Authentication** - Run sign in endpoint first
4. **Explore Endpoints** - Test each folder systematically
5. **Use Collection Runner** - Batch test multiple endpoints
6. **Create Custom Workflows** - Build test scenarios

---

## 📞 Support

For issues with specific endpoints, refer to:

- [CHAT_SYSTEM_DOCUMENTATION.md](./CHAT_SYSTEM_DOCUMENTATION.md) - Chat API reference
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Integration examples
- [API logs] - Check server console for detailed errors

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready
