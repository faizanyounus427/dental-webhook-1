const fs = require('fs');
const path = require('path');

// Test webhook by sending JSON data
async function testWebhook(jsonFile, clinicName) {
  try {
    const testData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    
    console.log(`\n🧪 Testing webhook for ${clinicName}...`);
    console.log(`📄 Using test file: ${path.basename(jsonFile)}`);
    
    const response = await fetch(`http://localhost:3000/webhook/${clinicName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      console.log('✅ SUCCESS! Webhook received appointment data');
      console.log('📊 Check your dashboard at: http://localhost:3000');
      console.log(`\n📋 Appointment Details:`);
      console.log(`   Patient: ${testData.call.call_analysis.custom_analysis_data['Patient Name']}`);
      console.log(`   Phone: ${testData.call.call_analysis.custom_analysis_data['Phone Number']}`);
      console.log(`   Reason: ${testData.call.call_analysis.custom_analysis_data['Reason For Visit']}`);
      console.log(`   Date: ${testData.call.call_analysis.custom_analysis_data['Appointment Date']}`);
      console.log(`   Time: ${testData.call.call_analysis.custom_analysis_data['Appointment Time']}`);
    } else {
      console.log('❌ ERROR! Webhook failed');
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your server is running:');
    console.log('   npm run dev');
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Webhook Tests for Sarah AI Voice Agent\n');
  console.log('=' .repeat(60));
  
  // Test 1: Incoming appointment booking
  await testWebhook(
    path.join(__dirname, 'test-appointment-booking.json'),
    'SmileCare-Dental-Clinic'
  );
  
  console.log('\n' + '=' .repeat(60));
  
  // Wait 2 seconds between tests
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Cold call with package interest
  await testWebhook(
    path.join(__dirname, 'test-cold-call.json'),
    'SmileCare-Dental-Clinic'
  );
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n✨ All tests completed!');
  console.log('🌐 Open dashboard: http://localhost:3000');
  console.log('📊 You should see 2 new appointments!\n');
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      console.log('✅ Server is running!\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is NOT running!');
    console.log('💡 Start the server first:');
    console.log('   npm run dev\n');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
})();
