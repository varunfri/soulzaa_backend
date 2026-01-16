#!/bin/bash

# Production-Ready Chat System - API Testing Guide
# This file contains cURL examples for testing all endpoints

# Variables
BASE_URL="http://localhost:8000"
TOKEN="your-jwt-token-here"
CHAT_ID="your-chat-id-here"
USER_ID="your-user-id-here"
RECIPIENT_ID="recipient-user-id-here"

echo "=========================================="
echo "Chat System API Testing Guide"
echo "=========================================="

# ==========================================
# CHAT MANAGEMENT ENDPOINTS
# ==========================================

echo ""
echo "1️⃣  Get Pending Chat Requests"
curl -X GET "$BASE_URL/api/chats/requests" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "2️⃣  Get Active Chats"
curl -X GET "$BASE_URL/api/chats/active?limit=50&page=1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "3️⃣  Get Chat Details"
curl -X GET "$BASE_URL/api/chats/$CHAT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "4️⃣  Create or Get Chat with User"
curl -X POST "$BASE_URL/api/chats/or-create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "'$RECIPIENT_ID'"
  }'

echo ""
echo ""
echo "5️⃣  Accept Chat Request"
curl -X POST "$BASE_URL/api/chats/$CHAT_ID/accept" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "6️⃣  Reject Chat Request"
curl -X POST "$BASE_URL/api/chats/$CHAT_ID/reject" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "7️⃣  Block User"
curl -X POST "$BASE_URL/api/chats/$CHAT_ID/block" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "8️⃣  Unblock User"
curl -X POST "$BASE_URL/api/chats/$CHAT_ID/unblock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "9️⃣  Archive Chat"
curl -X POST "$BASE_URL/api/chats/$CHAT_ID/archive" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "🔟 Get User Chat History"
curl -X GET "$BASE_URL/api/chats/user/$USER_ID/history?limit=50&page=1&includeArchived=false" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "❌ Delete Chat"
curl -X DELETE "$BASE_URL/api/chats/$CHAT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# ==========================================
# MESSAGE ENDPOINTS
# ==========================================

echo ""
echo ""
echo "=========================================="
echo "MESSAGE OPERATIONS"
echo "=========================================="

echo ""
echo "Get Chat Messages (with pagination)"
curl -X GET "$BASE_URL/api/chats/$CHAT_ID/messages?limit=50&page=1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "Search Messages"
curl -X GET "$BASE_URL/api/chats/$CHAT_ID/search?q=hello&limit=20&page=1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# ==========================================
# MEDIA UPLOAD ENDPOINTS
# ==========================================

echo ""
echo ""
echo "=========================================="
echo "MEDIA UPLOAD"
echo "=========================================="

echo ""
echo "Upload Single Media File"
# Example with local file
curl -X POST "$BASE_URL/api/media/upload-chat-media" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "chatId=$CHAT_ID"

echo ""
echo ""
echo "Bulk Upload Multiple Files"
curl -X POST "$BASE_URL/api/media/bulk-upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.jpg" \
  -F "files=@/path/to/file3.mp4" \
  -F "chatId=$CHAT_ID"

echo ""
echo ""
echo "Get Upload Token (for client-side upload)"
curl -X GET "$BASE_URL/api/media/get-upload-token" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "Get Media Metadata"
FILE_ID="your-imagekit-file-id-here"
curl -X GET "$BASE_URL/api/media/$FILE_ID/metadata" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "Delete Media File"
curl -X POST "$BASE_URL/api/media/delete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "'$FILE_ID'"
  }'

# ==========================================
# TESTING WITH SAVED RESPONSES
# ==========================================

echo ""
echo ""
echo "=========================================="
echo "SAVING RESPONSES TO FILE"
echo "=========================================="

echo ""
echo "Saving active chats to file..."
curl -s -X GET "$BASE_URL/api/chats/active?limit=50&page=1" \
  -H "Authorization: Bearer $TOKEN" \
  > active_chats_response.json

echo "✅ Response saved to active_chats_response.json"

echo ""
echo "Saving chat messages to file..."
curl -s -X GET "$BASE_URL/api/chats/$CHAT_ID/messages?limit=50&page=1" \
  -H "Authorization: Bearer $TOKEN" \
  > chat_messages_response.json

echo "✅ Response saved to chat_messages_response.json"

# ==========================================
# ADVANCED TESTING
# ==========================================

echo ""
echo ""
echo "=========================================="
echo "ADVANCED TESTING EXAMPLES"
echo "=========================================="

echo ""
echo "Testing with custom headers and verbose output"
curl -v -X GET "$BASE_URL/api/chats/active?limit=10&page=1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo ""
echo "Testing with request time measurement"
curl -w "@curl-format.txt" -o /dev/null -s \
  -X GET "$BASE_URL/api/chats/active" \
  -H "Authorization: Bearer $TOKEN"

# ==========================================
# POSTMAN COLLECTION IMPORT
# ==========================================

echo ""
echo ""
echo "=========================================="
echo "POSTMAN COLLECTION"
echo "=========================================="
echo ""
echo "To import the API collection in Postman:"
echo "1. Open Postman"
echo "2. Click 'Import'"
echo "3. Paste this JSON:"
echo ""

cat << 'EOF'
{
  "info": {
    "name": "Chat System API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Chat Management",
      "item": [
        {
          "name": "Get Active Chats",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/chats/active?limit=50&page=1",
              "host": ["{{base_url}}"],
              "path": ["api", "chats", "active"],
              "query": [
                {"key": "limit", "value": "50"},
                {"key": "page", "value": "1"}
              ]
            }
          }
        }
      ]
    }
  ]
}
EOF

echo ""
echo "=========================================="
echo "✅ Testing Complete!"
echo "=========================================="
echo ""
echo "Notes:"
echo "- Replace TOKEN with your actual JWT token"
echo "- Replace CHAT_ID with actual chat ID"
echo "- Replace USER_ID with actual user ID"
echo "- Replace file paths with actual file locations"
echo "- Use -v flag for verbose output"
echo "- Use -i flag to include response headers"
echo ""
