# ERP Sales REST API Server

REST API Server for OpenAI Agent Builder integration with ERP Sales System.

## 🚀 Features

- ✅ 10 REST API endpoints (3 agents)
- ✅ Redis caching for GET requests
- ✅ Auto-retry with exponential backoff
- ✅ OpenAPI schema for OpenAI
- ✅ Rate limiting & security
- ✅ Render.com ready (free tier)
- ✅ Health check endpoint
- ✅ CORS enabled

---

## 📦 Installation

```bash
cd rest-api-server
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

---

## ⚙️ Configuration

Edit `.env`:

```env
PORT=3000
DEFAULT_ERP_BASE_URL=https://gorealla.heptanesia.com
DEFAULT_ERP_TOKEN=your_jwt_token
DEFAULT_USER_ID=your_user_id
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🔧 Available Endpoints

### Health Check

```
GET /health
```

### OpenAPI Schema

```
GET /openapi.json
```

### Tools List

```
GET /tools/list
```

### Tool Execution

```
POST /tools/{toolName}
Headers: erptoken, baseurl, userid
Body: { ...params }
```

---

## 🤖 OpenAI Agent Builder Integration

### Step 1: Deploy to Render.com

1. Push code to GitHub
2. Connect to Render.com
3. Deploy as Web Service
4. Get your URL: `https://your-app.onrender.com`

### Step 2: Add to OpenAI Agent Builder

1. Go to OpenAI Platform → Agent Builder
2. Add Action → Import from URL
3. URL: `https://your-app.onrender.com/openapi.json`
4. Authentication: API Key
5. Add Custom Headers:
   ```json
   {
     "erptoken": "Bearer YOUR_JWT_TOKEN",
     "baseurl": "https://gorealla.heptanesia.com",
     "userid": "YOUR_USER_ID"
   }
   ```

### Step 3: Test Tools

Ask your agent:

- "Check if mobile +919876543210 exists"
- "Create a lead with mobile +919876543210"
- "Save a message for eventLead xyz"

---

## 📋 Available Tools

### 🔵 Agent 1: Lead Validation (6 tools)

1. `check_lead_by_mobile`
2. `create_lead`
3. `get_events`
4. `create_event`
5. `add_team_to_event`
6. `create_event_lead`

### 🟢 Agent 2: Message Collection (1 tool)

7. `save_simple_message`

### 🟡 Agent 3: Summary Generation (3 tools)

8. `generate_summary`
9. `save_summary`
10. `get_conversation_history`

---

## 🌐 Render.com Deployment

### Option 1: Using render.yaml

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# In Render.com dashboard:
# 1. New Web Service
# 2. Connect GitHub repo
# 3. Render auto-detects render.yaml
# 4. Add environment variables
# 5. Deploy
```

### Option 2: Manual Setup

1. Create New Web Service
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Add Environment Variables (from .env.example)
5. Deploy

---

## 🧪 Testing

### Test Locally

```bash
# Start server
npm start

# Test health check
curl http://localhost:3000/health

# Test tool
curl -X POST http://localhost:3000/tools/check_lead_by_mobile \
  -H "Content-Type: application/json" \
  -H "erptoken: YOUR_TOKEN" \
  -H "baseurl: https://gorealla.heptanesia.com" \
  -H "userid: YOUR_USER_ID" \
  -d '{"mobile": "+919876543210"}'
```

### Test on Render

```bash
curl https://your-app.onrender.com/health
curl https://your-app.onrender.com/openapi.json
```

---

## 🔒 Security

- Helmet.js for security headers
- Rate limiting (100 req/15min)
- CORS configured
- Input validation
- Error handling

---

## 📊 Monitoring

### Check Server Status

```bash
curl https://your-app.onrender.com/health
```

### View Logs (Render.com)

- Dashboard → Your Service → Logs

### Redis Status

```bash
# Health check includes Redis status
curl https://your-app.onrender.com/health
# Response includes: "redis": "connected"
```

---

## 🐛 Troubleshooting

### Issue: Redis not working on Render free tier

**Solution:** Redis is optional. Server works without it (caching disabled).

### Issue: OpenAI can't connect

- Check Render URL is public
- Verify `/openapi.json` loads
- Check environment variables set
- Test `/health` endpoint

### Issue: 429 Rate Limit

- Increase `RATE_LIMIT_MAX_REQUESTS`
- Or wait 15 minutes

---

## 📁 Project Structure

```
rest-api-server/
├── package.json
├── .env.example
├── render.yaml
├── Dockerfile
├── src/
│   ├── server.js
│   ├── config/
│   │   └── openapi.js
│   ├── tools/
│   │   └── handler.js
│   └── utils/
│       ├── redis.js
│       └── apiClient.js
```

---

## 🎯 Quick Start Checklist

- [ ] Install dependencies: `npm install`
- [ ] Configure `.env` file
- [ ] Test locally: `npm start`
- [ ] Push to GitHub
- [ ] Deploy to Render.com
- [ ] Get public URL
- [ ] Add to OpenAI Agent Builder
- [ ] Test with OpenAI

---

## 📞 Support

For issues:

1. Check Render logs
2. Test `/health` endpoint
3. Verify environment variables
4. Test tools with curl

---

## 📄 License

MIT
# sales_mcp
