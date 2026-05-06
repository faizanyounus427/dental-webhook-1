# 🦷 AI Dental Receptionist - Demo & Client Presentation Guide

## Quick Start for Demo

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file:
```
PORT=3000
MONGODB_URI=mongodb+srv://your_connection_string
RETELL_API_KEY=your_retell_api_key
RESEND_API_KEY=your_resend_api_key
CLINIC_EMAIL=clinic@example.com
```

### 3. Start the Server
```bash
npm run dev  # For development with auto-reload
# or
npm start   # For production
```

### 4. Access Dashboard
Open your browser: `http://localhost:3000`

---

## Demo Features to Showcase

### 📊 Dashboard Overview
- **Real-time Statistics**: Shows total appointments, completed, scheduled, cancelled
- **Visual Analytics**: Charts showing appointment distribution and sentiment analysis
- **Appointment Management**: Complete table with filtering and search
- **Responsive Design**: Works on desktop, tablet, and mobile

### 🎯 Key Talking Points for Clients

#### 1. **Automated Appointment Booking**
   - Patients call the AI receptionist
   - AI extracts appointment details automatically
   - No manual data entry needed
   - Reduces staff workload by 80%

#### 2. **Intelligent Call Analysis**
   - Sentiment analysis to gauge patient satisfaction
   - Automatic transcription of calls
   - Call duration tracking
   - Patient information extraction

#### 3. **Real-time Dashboard**
   - View all appointments in one place
   - Filter by date, status, or clinic
   - Drill-down into individual appointments
   - Edit appointment status and add notes

#### 4. **Multi-Clinic Support**
   - Manage multiple dental clinics from one dashboard
   - Each clinic has its own data
   - Clinic-specific analytics

#### 5. **Email Notifications**
   - Staff automatically notified of new bookings
   - Instant alerts via Resend
   - Direct links to dashboard

#### 6. **Data Security**
   - Encrypted database storage
   - Secure API endpoints
   - Patient data protection

---

## Demo Script for Clients

### Opening (2 minutes)
"Good afternoon! I'm excited to show you our AI Dental Receptionist solution. This system answers patient calls 24/7, books appointments automatically, and provides your staff with a complete dashboard to manage everything."

### Live Demo (10 minutes)

#### Step 1: Show the Dashboard
- Refresh the page to show live data
- Click on different clinics in the dropdown
- Highlight the key statistics

#### Step 2: Explore Appointment Data
- Show the appointments table with real bookings
- Click "View" to open appointment details
- Show how rich the data is (transcription, sentiment, duration)

#### Step 3: Filter & Search
- Filter by appointment status
- Filter by date range
- Show how staff can find specific appointments

#### Step 4: Update Appointments
- Click "View" on an appointment
- Change the status (scheduled → confirmed → completed)
- Add notes
- Show the "Save Changes" button

#### Step 5: Analytics
- Show the appointment status distribution chart
- Explain the sentiment analysis (positive/neutral/negative)
- Show how this helps identify issues

### Closing (3 minutes)
"With this system, you get:
- 24/7 appointment booking
- Zero manual data entry
- Complete call transcripts
- Patient sentiment tracking
- One unified dashboard
- Instant email notifications

Let's talk about implementation and pricing."

---

## Sample Data for Testing

### Insert Test Appointments (MongoDB)
```bash
db.appointments.insertMany([
  {
    callId: "call_001",
    clinicName: "Smile Dental Clinic",
    patientName: "John Smith",
    phoneNumber: "+1 (555) 123-4567",
    reasonForVisit: "Teeth Cleaning",
    appointmentDate: "2026-05-15",
    appointmentTime: "2:00 PM",
    status: "scheduled",
    callDuration: 5,
    sentiment: "positive",
    createdAt: new Date()
  },
  {
    callId: "call_002",
    clinicName: "Smile Dental Clinic",
    patientName: "Jane Doe",
    phoneNumber: "+1 (555) 987-6543",
    reasonForVisit: "Root Canal",
    appointmentDate: "2026-05-16",
    appointmentTime: "10:00 AM",
    status: "confirmed",
    callDuration: 8,
    sentiment: "neutral",
    createdAt: new Date()
  }
])
```

### Create Test Clinic
```bash
db.clinics.insertOne({
  clinicName: "Smile Dental Clinic",
  clinicEmail: "admin@smiledental.com",
  phoneNumber: "+1 (555) 000-0000",
  address: "123 Dental Lane",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  status: "active",
  createdAt: new Date()
})
```

---

## Deployment Options

### 1. **Heroku** (Free tier available)
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_uri
git push heroku main
```

### 2. **Railway.app**
```bash
npm install -g railway
railway link
railway up
```

### 3. **Vercel + MongoDB Atlas**
- Deploy backend to Railway or Render
- Use serverless functions for webhook
- Connect to MongoDB Atlas

### 4. **AWS Elastic Beanstalk**
- Standard Node.js deployment
- RDS for PostgreSQL
- CloudFront for CDN

---

## Client Pricing Tiers Suggestion

### 💰 Pricing Model

| Plan | Monthly Calls | Price | Features |
|------|--------------|-------|----------|
| **Starter** | 100 | $99 | 1 clinic, basic dashboard, email support |
| **Professional** | 500 | $249 | 3 clinics, advanced analytics, priority support |
| **Enterprise** | Unlimited | $499+ | Unlimited clinics, custom integrations, dedicated support |

---

## API Documentation for Clients

### Get Appointments
```bash
curl http://localhost:3000/api/appointments/clinic/Smile%20Dental%20Clinic
```

### Get Statistics
```bash
curl http://localhost:3000/api/appointments/stats/Smile%20Dental%20Clinic
```

### Update Appointment
```bash
curl -X PATCH http://localhost:3000/api/appointments/[ID]/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "notes": "Patient was happy"}'
```

---

## Troubleshooting for Demo

### Issue: Dashboard shows "Loading..."
**Solution**: Check MongoDB connection in console logs

### Issue: Emails not sending
**Solution**: Verify RESEND_API_KEY is correct

### Issue: Webhook not receiving data
**Solution**: Test with curl or Postman to debug payload

---

## Advanced Features Coming Soon

- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] SMS confirmations to patients
- [ ] Multi-language support
- [ ] AI chatbot for FAQ
- [ ] Insurance verification
- [ ] Prescription management
- [ ] Mobile app for staff
- [ ] Voice analysis for patient health indicators

---

## Contact & Support

For demo questions: demo@yourdomain.com
Technical support: support@yourdomain.com
Sales inquiries: sales@yourdomain.com
