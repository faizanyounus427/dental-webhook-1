# 🎙️ Sarah AI Voice Agent - Complete Integration Guide

## Connect Sarah to Your Dashboard

---

## 📋 WHAT YOU HAVE NOW

✅ Dental AI Dashboard running (http://localhost:3000)
✅ MongoDB database connected
✅ Webhook endpoint ready at `/webhook/:clinicName`
✅ Email notifications configured

---

## 🎯 WHAT WE'LL DO

1. Test webhook locally with sample calls
2. Configure Sarah in Retell AI
3. Set up webhook URL
4. Test live calls
5. Set up cold calling for packages

---

## PART 1: TEST LOCALLY (DO THIS NOW!)

### Step 1: Copy Test Files to Your Project

I've created 4 test files for you:
```
1. test-appointment-booking.json  - Incoming appointment call
2. test-cold-call.json           - Outbound package sales call
3. test-webhook.js               - Automated test script
4. dental-packages-config.json   - Package details for Sarah
```

**Copy these files to your project root:**
```
E:\dental-webhook\dental-webhook-1\
```

### Step 2: Run the Test

**Make sure your server is running:**
```bash
npm run dev
```

**In a NEW terminal, run the test:**
```bash
node test-webhook.js
```

**You should see:**
```
✅ Server is running!
🧪 Testing webhook for SmileCare-Dental-Clinic...
✅ SUCCESS! Webhook received appointment data
📊 Check your dashboard at: http://localhost:3000
```

### Step 3: Check Dashboard

**Open:** http://localhost:3000

**You should now see:**
- Total Appointments: 2
- Patient: John Doe (teeth cleaning)
- Patient: Jane Smith (package consultation)
- Call transcriptions
- Sentiment analysis
- Call durations

---

## PART 2: CONFIGURE SARAH IN RETELL AI

### Your Retell AI Setup

**Agent ID:** `aga...a2f` (prefix)
**LLM ID:** `llm...8a9` (prefix)
**Phone Number:** +1(260)261-2176 (Twilio)

### Step 1: Update Agent Configuration

**Go to:** https://app.retellai.com/agents

**Click on your Sarah agent**

**Update these settings:**

#### A. General Settings
```
Agent Name: Sarah - SmileCare Dental Receptionist
Voice: Choose female voice (e.g., "Rachel" or "Joanna")
Language: English (US)
```

#### B. Agent Instructions (System Prompt)

```
You are Sarah, a professional and friendly AI receptionist for SmileCare Dental Clinic.

INCOMING CALLS (Appointment Booking):
When patients call to book appointments, you should:
1. Greet them warmly: "Hello! Thank you for calling SmileCare Dental Clinic. This is Sarah, how can I help you today?"
2. Collect the following information:
   - Patient's full name
   - Phone number
   - Reason for visit
   - Preferred appointment date
   - Preferred appointment time
3. Confirm all details back to the patient
4. Thank them and let them know someone will call to confirm

OUTBOUND CALLS (Cold Calling for Packages):
When making cold calls about dental packages:
1. Introduce yourself: "Hello, this is Sarah from SmileCare Dental Clinic."
2. Ask if they have a moment to discuss dental care options
3. Qualify their needs: "When was your last dental checkup?"
4. Present appropriate package based on their needs:
   - Basic Care: $99/month - for individuals
   - Premium Care: $199/month - includes whitening
   - Family Care: $299/month - covers up to 4 members
5. Handle objections professionally
6. Offer to schedule a consultation
7. Thank them for their time

Always be polite, professional, and empathetic. If unsure about something, offer to have a human staff member call them back.
```

#### C. Custom Analysis Data (CRITICAL!)

**In Retell AI Agent settings → Advanced → Custom Analysis**

Enable these fields:
```json
{
  "custom_analysis_data": {
    "Patient Name": "string",
    "Phone Number": "string",
    "Reason For Visit": "string",
    "Appointment Date": "string",
    "Appointment Time": "string",
    "Package Interest": "string",
    "Call Type": "string"
  }
}
```

### Step 2: Set Webhook URL

**IMPORTANT:** This is where the bug happens (URL reverts to old ngrok)

#### Option A: Using Railway (Production)

**Your Railway URL:**
```
https://dental-webhook-1-production.up.railway.app
```

**Webhook endpoint:**
```
https://dental-webhook-1-production.up.railway.app/webhook/SmileCare-Dental-Clinic
```

**Set this in Retell AI:**
1. Go to Agent Settings → Webhooks
2. Add webhook URL: `https://dental-webhook-1-production.up.railway.app/webhook/SmileCare-Dental-Clinic`
3. Enable "Call Analyzed" event
4. Save

#### Option B: Using ngrok (Testing)

**If testing locally, use ngrok:**

1. Install ngrok: https://ngrok.com/download
2. Run in terminal:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Webhook URL: `https://abc123.ngrok.io/webhook/SmileCare-Dental-Clinic`

**KNOWN BUG FIX:**

The webhook URL reverts when you republish the agent in the UI.

**To fix permanently, use Retell REST API:**

```bash
curl -X PATCH https://api.retellai.com/v1/agents/{agent_id} \
  -H "Authorization: Bearer YOUR_RETELL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://dental-webhook-1-production.up.railway.app/webhook/SmileCare-Dental-Clinic"
  }'
```

Replace `{agent_id}` with your actual agent ID.

---

## PART 3: TEST WITH REAL CALLS

### Incoming Call Test

1. **Call your Twilio number:** +1(260)261-2176
2. **Sarah should answer:** "Hello! Thank you for calling SmileCare Dental Clinic..."
3. **Book an appointment:**
   - Say your name
   - Give phone number
   - Say reason (e.g., "teeth cleaning")
   - Give preferred date and time
4. **After call ends:**
   - Wait 10-30 seconds
   - Refresh dashboard
   - Appointment should appear!

### Check What Happens:

✅ **Call is answered by Sarah**
✅ **Sarah collects 5 pieces of info**
✅ **Call ends**
✅ **Retell AI sends webhook to your server**
✅ **Server processes data**
✅ **Appointment saved to MongoDB**
✅ **Email sent to clinic**
✅ **Dashboard updates with new appointment**

---

## PART 4: COLD CALLING SETUP

### Configure Outbound Calls in Retell AI

**For cold calling, you need:**

1. **Contact list** (phone numbers to call)
2. **Calling schedule**
3. **Package details** (we created this: dental-packages-config.json)
4. **Success criteria**

### Outbound Call Flow:

```
Sarah calls → Introduces clinic → Qualifies need → Presents package → Schedules consultation → Logs in dashboard
```

### Sample Code for Triggering Cold Calls:

```javascript
// trigger-cold-call.js
const fetch = require('node-fetch');

async function makeOutboundCall(phoneNumber, packageType) {
  const response = await fetch('https://api.retellai.com/v1/calls', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_id: 'your_agent_id',
      to_number: phoneNumber,
      from_number: '+12602612176',
      metadata: {
        call_type: 'outbound_cold_call',
        package_offered: packageType
      }
    })
  });
  
  const data = await response.json();
  console.log('Call initiated:', data);
}

// Example usage
makeOutboundCall('+19876543210', 'premium');
```

---

## PART 5: MONITORING & ANALYTICS

### Dashboard Shows:

✅ **All calls (inbound + outbound)**
✅ **Appointment status**
✅ **Sentiment analysis**
✅ **Call duration**
✅ **Transcriptions**
✅ **Success rate**

### Email Notifications:

**Every appointment triggers email to:**
```
CLINIC_EMAIL=clinic@example.com
```

**Update this in .env to your real email:**
```
CLINIC_EMAIL=your_actual_email@example.com
```

---

## 🎯 SUCCESS CHECKLIST

Before going live, verify:

- [ ] Test calls work locally (test-webhook.js passes)
- [ ] Dashboard shows appointments
- [ ] Sarah answers calls at +1(260)261-2176
- [ ] Webhook URL set in Retell AI
- [ ] Railway deployment is live
- [ ] Email notifications arrive
- [ ] MongoDB stores data correctly
- [ ] Sentiment analysis works
- [ ] Cold calling script tested

---

## 🆘 TROUBLESHOOTING

### Webhook not receiving data?

**Check:**
1. Webhook URL is correct in Retell AI
2. Railway app is running (not sleeping)
3. Agent has "Call Analyzed" event enabled
4. Custom analysis data fields are configured

**Test manually:**
```bash
curl -X POST http://localhost:3000/webhook/SmileCare-Dental-Clinic \
  -H "Content-Type: application/json" \
  -d @test-appointment-booking.json
```

### Dashboard not updating?

**Check:**
1. MongoDB connection is active
2. Browser refresh (Ctrl + F5)
3. Check browser console for errors (F12)
4. Verify clinic name matches in dropdown

### Sarah not collecting all fields?

**Check:**
1. Agent instructions include all 5 fields
2. Custom analysis data schema is correct
3. Agent is asking the right questions

---

## 📞 COLD CALLING BEST PRACTICES

### Legal Compliance:

⚠️ **IMPORTANT:** Follow TCPA regulations
- Get consent before calling
- Honor Do Not Call lists
- Call only during permitted hours (8am-9pm)
- Provide opt-out option

### Success Tips:

1. **Call at right times:** 10am-12pm, 4pm-6pm
2. **Personalize:** Use recipient's name
3. **Be brief:** 30-60 seconds intro
4. **Value first:** Lead with benefit
5. **Call to action:** Schedule consultation

---

## 🎊 YOU'RE READY!

Your Sarah AI Voice Agent is now:
✅ **Answering calls 24/7**
✅ **Booking appointments automatically**
✅ **Saving to dashboard**
✅ **Sending email notifications**
✅ **Ready for cold calling campaigns**

---

## 📊 NEXT STEPS

1. Test webhook locally ✓
2. Deploy to Railway ✓
3. Configure Retell AI webhook URL
4. Test with real call
5. Set up cold calling campaign
6. Monitor dashboard
7. Optimize based on results

Good luck! 🚀
