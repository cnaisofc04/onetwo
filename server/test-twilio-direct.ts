#!/usr/bin/env tsx
/**
 * Test Twilio API directly with Node.js (avoids shell encoding issues)
 */
import 'dotenv/config'

async function testTwilio() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const phone = process.env.TWILIO_PHONE_NUMBER

  console.log('\n╔════════════════════════════════════════════════════╗')
  console.log('║  🧪 TWILIO DIRECT API TEST (Node.js)              ║')
  console.log('╚════════════════════════════════════════════════════╝\n')

  console.log(`Account SID: ${sid?.substring(0, 10)}...`)
  console.log(`Auth Token: ${token?.substring(0, 10)}...`)
  console.log(`Phone: ${phone}\n`)

  if (!sid || !token || !phone) {
    console.log('❌ Missing credentials!')
    return
  }

  try {
    // Create auth header using Node.js Buffer
    const auth = Buffer.from(`${sid}:${token}`).toString('base64')
    console.log(`✅ Auth header created (base64 encoded)`)
    console.log(`   Length: ${auth.length} chars\n`)

    // Test 1: Get Account Info
    console.log('Test 1: GET Account Info')
    const res1 = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )

    console.log(`   Status: ${res1.status}`)
    const body1 = await res1.text()
    console.log(`   Response (first 200 chars): ${body1.substring(0, 200)}...\n`)

    if (res1.status === 200) {
      console.log('   ✅ SUCCESS! Account authenticated!\n')
      return true
    } else {
      console.log(`   ❌ Failed with status ${res1.status}\n`)
    }

    // Test 2: List Messages
    console.log('Test 2: GET Messages List')
    const res2 = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )

    console.log(`   Status: ${res2.status}`)
    const body2 = await res2.text()
    console.log(`   Response: ${body2.substring(0, 200)}...\n`)

    if (res2.status === 200) {
      console.log('   ✅ Messages endpoint works!\n')
      return true
    }

    // Test 3: Try to send SMS (POST)
    console.log('Test 3: POST Send SMS (test call)')
    const params = new URLSearchParams()
    params.append('From', phone)
    params.append('To', '+33123456789') // dummy number
    params.append('Body', 'Test')

    const res3 = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        timeout: 10000,
      }
    )

    console.log(`   Status: ${res3.status}`)
    const body3 = await res3.text()
    console.log(`   Response: ${body3.substring(0, 200)}...\n`)

    if (res3.status >= 200 && res3.status < 400) {
      console.log('   ✅ SMS endpoint works!\n')
      return true
    }

    return false
  } catch (error) {
    console.log(`❌ Error: ${error}`)
    return false
  }
}

testTwilio().then((success) => {
  if (success) {
    console.log('✅ ALL TESTS PASSED!\n')
    process.exit(0)
  } else {
    console.log('❌ TESTS FAILED\n')
    process.exit(1)
  }
})
