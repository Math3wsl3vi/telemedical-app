#!/bin/bash

# M-Pesa Error 2001 - Diagnostic Script
# Run this to verify your setup and test the endpoints

echo "🔍 M-Pesa Configuration Diagnostic Script"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "Please create .env.local with M-Pesa credentials"
    exit 1
fi

echo "✅ .env.local found"
echo ""

# Extract values (without showing them)
MPESA_KEY=$(grep MPESA_CONSUMER_KEY .env.local | cut -d'=' -f2)
MPESA_SECRET=$(grep MPESA_CONSUMER_SECRET .env.local | cut -d'=' -f2)
MPESA_SHORTCODE=$(grep MPESA_SHORTCODE .env.local | cut -d'=' -f2)
MPESA_PASSKEY=$(grep MPESA_PASSKEY .env.local | cut -d'=' -f2)

echo "📋 Environment Variables Status:"
echo ""

# Check each variable
if [ -z "$MPESA_KEY" ]; then
    echo "❌ MPESA_CONSUMER_KEY - MISSING"
else
    echo "✅ MPESA_CONSUMER_KEY - Found (${#MPESA_KEY} chars)"
fi

if [ -z "$MPESA_SECRET" ]; then
    echo "❌ MPESA_CONSUMER_SECRET - MISSING"
else
    echo "✅ MPESA_CONSUMER_SECRET - Found (${#MPESA_SECRET} chars)"
fi

if [ -z "$MPESA_SHORTCODE" ]; then
    echo "❌ MPESA_SHORTCODE - MISSING"
else
    echo "✅ MPESA_SHORTCODE - Found ($MPESA_SHORTCODE)"
fi

if [ -z "$MPESA_PASSKEY" ]; then
    echo "❌ MPESA_PASSKEY - MISSING"
else
    echo "✅ MPESA_PASSKEY - Found (${#MPESA_PASSKEY} chars)"
fi

echo ""
echo "🧪 Testing M-Pesa Endpoints"
echo "=========================================="
echo ""

# Wait for user to confirm server is running
echo "⚠️  Make sure your dev server is running:"
echo "   npm run dev"
echo ""
read -p "Press Enter when dev server is ready..."
echo ""

# Test 1: STK Push endpoint
echo "Test 1: STK Push with Valid Phone Format"
echo "Phone: 254712345678"
echo "Amount: 100"
echo ""

curl -X POST http://localhost:3000/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254712345678",
    "amount": 100
  }' 2>/dev/null | python3 -m json.tool || echo "Failed to parse JSON"

echo ""
echo ""

# Test 2: STK Push with 0 prefix (should auto-convert)
echo "Test 2: STK Push with 0-prefixed Phone (should auto-convert)"
echo "Phone: 0712345678 (will be converted to 254712345678)"
echo "Amount: 100"
echo ""

curl -X POST http://localhost:3000/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0712345678",
    "amount": 100
  }' 2>/dev/null | python3 -m json.tool || echo "Failed to parse JSON"

echo ""
echo ""

# Test 3: Invalid phone
echo "Test 3: Invalid Phone Format (should get error)"
echo "Phone: 123 (too short)"
echo ""

curl -X POST http://localhost:3000/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "123",
    "amount": 100
  }' 2>/dev/null | python3 -m json.tool || echo "Failed to parse JSON"

echo ""
echo ""

# Test 4: Invalid amount
echo "Test 4: Invalid Amount (should get error)"
echo "Amount: 0 (minimum is 1)"
echo ""

curl -X POST http://localhost:3000/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254712345678",
    "amount": 0
  }' 2>/dev/null | python3 -m json.tool || echo "Failed to parse JSON"

echo ""
echo ""

echo "✅ Diagnostic tests complete!"
echo ""
echo "📊 Results Summary:"
echo "=========================================="
echo ""
echo "If you see 'The service request has been accepted successfully'"
echo "  → Your credentials and phone format are correct! ✅"
echo ""
echo "If you see 'The initiator information is invalid (2001)'"
echo "  → Check:"
echo "    1. Shortcode is registered in Safaricom sandbox"
echo "    2. Phone number format is correct (254...)"
echo "    3. Consumer key/secret haven't expired"
echo ""
echo "Check your terminal for the STK Push Request logs:"
echo "  Look for: '📤 STK Push Request:'"
echo "  Verify: BusinessShortCode, PartyA (phone), Amount"
echo ""
echo "Check Safaricom developer portal for account status:"
echo "  1. Go to https://developer.safaricom.co.ke"
echo "  2. Login"
echo "  3. Check 'My Applications' → Sandbox Settings"
echo "  4. Verify Business Shortcode 174379 is there"
echo "  5. Verify 'Lipa na M-Pesa Online' is enabled"
echo ""
