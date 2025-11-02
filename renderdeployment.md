# 🚀 RENDER.COM DEPLOYMENT GUIDE

Complete step-by-step guide to deploy ERP Sales API on Render.com (free tier) and integrate with OpenAI Agent Builder.

---

## 📋 PREREQUISITES

- [x] GitHub account
- [x] Render.com account (free)
- [x] OpenAI account with API access
- [x] ERP JWT token

---

## STEP 1: PREPARE CODE FOR DEPLOYMENT

### 1.1 Create Git Repository

```bash
cd rest-api-server

# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit - ERP Sales API"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/erp-sales-api.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Files

Ensure these files exist:

- ✅ `package.json`
- ✅ `src/server.js`
- ✅ `render.yaml`
- ✅ `Dockerfile`
- ✅ `.env.example`

---

## STEP 2: DEPLOY TO RENDER.COM

### 2.1 Create New Web Service

1. Go to https://render.com
2. Click **Dashboard** → **New +** → **Web Service**
3. Connect your GitHub repository
4. Select `erp-sales-api` repository

### 2.2 Configure Service

**Basic Settings:**

- **Name:** `erp-sales-api`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** Leave blank (or `.` if needed)

**Build & Deploy:**

- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Plan:**

- Select **Free** tier

### 2.3 Add Environment Variables

Click **Environment** → **Add Environment Variable**

Add these variables:

```
PORT=3000
NODE_ENV=production
DEFAULT_ERP_BASE_URL=https://gorealla.heptanesia.com
DEFAULT_ERP_TOKEN=your_actual_jwt_token_here
DEFAULT_USER_ID=your_actual_user_id_here
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=300
CACHE_ENABLED=false
MAX_RETRIES=3
RETRY_DELAY=1000
CORS_ORIGIN=*
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** Set `CACHE_ENABLED=false` for free tier (no Redis)

### 2.4 Deploy

1. Click **Create Web Service**
2. Wait 5-10 minutes for deployment
3. Check logs for "✅ ERP Sales API Server Started"

### 2.5 Get Your URL

After deployment, you'll get:

```
https://erp-sales-api-xxxx.onrender.com
```

**Save this URL!** You'll need it for OpenAI integration.

---

## STEP 3: TEST DEPLOYMENT

### 3.1 Test Health Endpoint

```bash
curl https://your-app.onrender.com/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T...",
  "uptime": 123.45,
  "redis": "disconnected"
}
```

### 3.2 Test OpenAPI Schema

```bash
curl https://your-app.onrender.com/openapi.json
```

Should return OpenAPI schema with all 10 tools.

### 3.3 Test a Tool

```bash
curl -X POST https://your-app.onrender.com/tools/get_events \
  -H "Content-Type: application/json" \
  -H "erptoken: YOUR_JWT_TOKEN" \
  -H "baseurl: https://gorealla.heptanesia.com" \
  -H "userid: YOUR_USER_ID" \
  -d '{"page": 0, "size": 5}'
```

---

## STEP 4: INTEGRATE WITH OPENAI AGENT BUILDER

### 4.1 Access OpenAI Platform

1. Go to https://platform.openai.com
2. Navigate to **Assistants** or **GPTs**
3. Create New Assistant/GPT

### 4.2 Add Actions

1. Click **Add Action**
2. Select **Import from URL**
3. Enter URL: `https://your-app.onrender.com/openapi.json`
4. Click **Import**

OpenAI will import all 10 tools automatically!

### 4.3 Configure Authentication

**Authentication Type:** API Key

**Header Name:** `x-api-key` (or custom if needed)

**Custom Headers:**

```json
{
  "erptoken": "Bearer YOUR_JWT_TOKEN",
  "baseurl": "https://gorealla.heptanesia.com",
  "userid": "YOUR_USER_ID"
}
```

### 4.4 Configure Agent Instructions

Add to your agent's system prompt:

```
You are an ERP Sales Assistant with access to lead management tools.

Available capabilities:
- Check if leads exist by mobile number
- Create new leads
- Manage events and teams
- Save messages from leads
- Generate conversation summaries

Always:
1. First check if a lead exists before creating
2. Save messages without generating AI responses (just acknowledge)
3. Generate summaries when requested by user

Use the appropriate tool based on user requests.
```

---

## STEP 5: TEST OPENAI INTEGRATION

### Test Conversations:

**Test 1: Check Lead**

```
User: Check if mobile +919876543210 exists in our system
Agent: [Calls check_lead_by_mobile tool]
Agent: I've checked the system. The mobile number +919876543210 does not exist...
```

**Test 2: Create Lead**

```
User: Create a lead with mobile +919876543210, name John Doe, company ABC Corp
Agent: [Calls create_lead tool]
Agent: Lead created successfully! Lead ID: xyz-123...
```

**Test 3: Save Message**

```
User: Save a message "I am interested in pricing" for eventLead abc-456
Agent: [Calls save_simple_message tool]
Agent: Message saved successfully. Your response has been recorded.
```

---

## 🔧 RENDER.COM TIPS

### Free Tier Limitations

- **Sleep after 15min inactivity:** First request may be slow (cold start)
- **750 hours/month:** Shared across all free services
- **No Redis:** Use CACHE_ENABLED=false

### Keep Service Awake (Optional)

Use a service like UptimeRobot:

1. Add monitor: `https://your-app.onrender.com/health`
2. Check interval: 5 minutes
3. Prevents cold starts

### View Logs

1. Render Dashboard → Your Service
2. Click **Logs** tab
3. View real-time logs

### Redeploy

- **Auto:** Push to GitHub main branch
- **Manual:** Dashboard → **Manual Deploy** → Deploy latest commit

---

## 🐛 TROUBLESHOOTING

### Issue: Deployment Failed

**Check:**

1. Build logs in Render dashboard
2. Verify `package.json` has correct scripts
3. Check Node.js version compatibility

**Solution:**

```bash
# Test locally first
npm install
npm start
```

### Issue: 503 Service Unavailable

**Cause:** Service is sleeping (free tier)

**Solution:**

- Wait 30-60 seconds for cold start
- Use UptimeRobot to keep awake

### Issue: OpenAI Can't Connect

**Check:**

1. URL is public: `https://your-app.onrender.com/health`
2. OpenAPI schema loads: `/openapi.json`
3. CORS is enabled (should be `*`)

**Solution:**

```bash
# Test from different location
curl https://your-app.onrender.com/health
```

### Issue: Tools Not Working

**Check:**

1. Headers are being sent: `erptoken`, `baseurl`, `userid`
2. ERP API is accessible
3. JWT token is valid

**Debug:**

```bash
# Test tool directly
curl -X POST https://your-app.onrender.com/tools/get_events \
  -H "erptoken: YOUR_TOKEN" \
  -H "baseurl: https://gorealla.heptanesia.com" \
  -H "userid: YOUR_ID" \
  -d '{"page": 0}'
```

---

## 📊 MONITORING

### Health Check

```bash
# Check every 5 minutes
watch -n 300 curl https://your-app.onrender.com/health
```

### Logs

```bash
# View logs in Render dashboard
# Or use Render CLI
render logs -s erp-sales-api
```

### Metrics

Render dashboard shows:

- CPU usage
- Memory usage
- Request count
- Response times

---

## 🔄 UPDATES & MAINTENANCE

### Update Code

```bash
# Make changes locally
git add .
git commit -m "Update: description"
git push origin main

# Render auto-deploys on push
```

### Update Environment Variables

1. Render Dashboard → Your Service
2. Environment tab
3. Edit variable
4. Save (triggers redeploy)

### Rollback

1. Render Dashboard → Your Service
2. Events tab
3. Find previous deploy
4. Click **Rollback**

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables configured
- [ ] Service deployed successfully
- [ ] `/health` endpoint returns 200
- [ ] `/openapi.json` loads correctly
- [ ] Tool tested with curl
- [ ] OpenAI action added
- [ ] OpenAI authentication configured
- [ ] End-to-end test completed

---

## 🎉 SUCCESS!

Your ERP Sales API is now:

- ✅ Deployed on Render.com
- ✅ Integrated with OpenAI Agent Builder
- ✅ Ready to handle lead management
- ✅ Production-ready with retry & error handling

**Your URLs:**

- API: `https://your-app.onrender.com`
- Health: `https://your-app.onrender.com/health`
- OpenAPI: `https://your-app.onrender.com/openapi.json`

**Next Steps:**

1. Test all 10 tools via OpenAI
2. Monitor logs in Render dashboard
3. Set up UptimeRobot (optional)
4. Share agent with team

---

## 📞 SUPPORT

**Render Issues:**

- https://render.com/docs
- https://community.render.com

**OpenAI Issues:**

- https://platform.openai.com/docs
- https://community.openai.com

**API Issues:**

- Check Render logs
- Test with curl
- Verify ERP connectivity
