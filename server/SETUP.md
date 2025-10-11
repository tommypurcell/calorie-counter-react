# Secure OpenAI Backend Setup Guide

This guide shows you how to set up secure, authenticated OpenAI API access with rate limiting (3 calls per day per user).

## 📋 Prerequisites

- Supabase project with authentication enabled
- OpenAI API key
- Node.js 18+ installed

## 🔧 Step 1: Database Setup

1. Open your Supabase SQL Editor
2. Run the SQL from `create_api_usage_table.sql`:

```sql
-- This creates the api_usage table and policies
-- Copy and paste the entire file contents into Supabase SQL Editor
```

3. Verify the table was created:
   - Go to Table Editor in Supabase
   - You should see `api_usage` table

## 🔑 Step 2: Environment Variables

### Backend (.env in /server directory)

Create `/server/.env` with:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Important:**
- Use the **SERVICE ROLE KEY** (not anon key) for backend
- Never commit `.env` to git
- Get service role key from Supabase → Project Settings → API

### Frontend (.env in root directory)

Your existing `.env` should have:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_EDAMAM_APPLICATION_ID=...
REACT_APP_EDAMAM_APPLICATION_KEY=...
```

## 🚀 Step 3: Start the Backend

```bash
cd server
npm install
node server.js
```

You should see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Calorie Counter Backend
🚀 http://localhost:5050
🔐 Supabase: ✓
🤖 OpenAI: ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🧪 Step 4: Test It

### Test 1: Health Check

```bash
curl http://localhost:5050/health
```

Should return: `{"status":"OK"}`

### Test 2: Unauthorized Request (should fail)

```bash
curl -X POST http://localhost:5050/api/gpt \
  -H "Content-Type: application/json" \
  -d '{"foodItem": "apple"}'
```

Should return: `{"error":"Missing authorization header"}` ✓

### Test 3: With Valid Token

1. Log in to your React app
2. Open browser DevTools → Console
3. Run: `(await supabase.auth.getSession()).data.session.access_token`
4. Copy the token
5. Test:

```bash
curl -X POST http://localhost:5050/api/gpt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"foodItem": "1 apple"}'
```

Should return OpenAI response! ✓

### Test 4: Rate Limit

Call the endpoint 4 times. The 4th call should return:

```json
{
  "error": "Daily limit reached",
  "message": "You've used all 3 AI estimates today. Try again tomorrow!"
}
```

## 📱 Step 5: Use in React App

1. Start React frontend: `npm start`
2. Log in to your account
3. Add a food item description (e.g., "2 eggs and toast")
4. Click "Estimate with AI (3/day)"
5. Watch the magic happen! ✨

## 🔒 Security Features

### ✅ What's Secure:

1. **Authentication Required**: Every request needs a valid Supabase JWT token
2. **Token Verification**: Backend verifies token with Supabase before processing
3. **Rate Limiting**: Each user limited to 3 AI calls per day (resets daily)
4. **No User-Supplied Keys**: OpenAI key stored securely on backend only
5. **User Isolation**: Users can't fake other users' IDs (verified by token)

### ✅ How It Works:

1. **Frontend**: Gets user session token from Supabase
2. **Frontend**: Sends request with `Authorization: Bearer <token>`
3. **Backend**: Verifies token with Supabase service role
4. **Backend**: Gets real user ID from token (can't be faked!)
5. **Backend**: Checks rate limit in database
6. **Backend**: Calls OpenAI if allowed
7. **Backend**: Increments usage counter

## 📊 Monitor Usage

Check user API usage in Supabase:

```sql
SELECT
  user_id,
  count,
  last_reset,
  updated_at
FROM api_usage
ORDER BY updated_at DESC;
```

## 🐛 Troubleshooting

### "Missing authorization header"
- Frontend isn't sending token
- Check: User is logged in
- Check: `supabase.auth.getSession()` returns valid session

### "Invalid or expired token"
- Token expired (refresh page to get new one)
- Wrong Supabase URL/keys in .env
- Service role key not set correctly

### "Daily limit reached" (but shouldn't be)
- Check `api_usage` table in Supabase
- Manually reset: `UPDATE api_usage SET count = 0 WHERE user_id = 'xxx'`
- Check server timezone vs database timezone

### Backend won't start
- Check all env vars are set
- Check `SUPABASE_SERVICE_ROLE_KEY` (not anon key!)
- Check port 5050 isn't already in use

## 🎉 Success!

You now have:
- ✅ Secure, authenticated API access
- ✅ Rate limiting (3 calls/day/user)
- ✅ No user-supplied API keys needed
- ✅ Protection against abuse
- ✅ Automatic daily reset

Users can safely estimate calories with AI without exposing your OpenAI key!
