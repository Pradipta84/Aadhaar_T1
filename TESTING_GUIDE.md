# Complete Testing Guide - Aadhaar Details Project

## 🎯 Overview
This guide will help you test your Aadhaar Details Management application step by step.

---

## 📋 Prerequisites Checklist

Before testing, ensure you have:

- [ ] PostgreSQL installed and running
- [ ] Database credentials configured
- [ ] Node.js and npm installed
- [ ] All dependencies installed (`npm install`)

---

## 🚀 Step-by-Step Testing Guide

### **Step 1: Database Setup**

#### Option A: Automated Setup (Recommended)
```powershell
.\scripts\fix-and-add-test-data.ps1
```

**What it does:**
- Prompts for PostgreSQL password
- Updates `.env` file
- Creates database if needed
- Initializes database schema
- Adds 8 test records

#### Option B: Manual Setup
1. **Update `.env` file:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=aadhaar_db
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   ```

2. **Initialize database:**
   - Start server: `npm run dev`
   - Visit: `http://localhost:3000/api/init-db`

3. **Add test data:**
   - Visit: `http://localhost:3000/api/test-data` (POST)
   - Or run: `npm run add-test-data`

---

### **Step 2: Start the Development Server**

```powershell
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.3
- Local:        http://localhost:3000
- Ready in 2.5s
```

**✅ Success indicator:** Server running on `http://localhost:3000`

---

### **Step 3: Open the Application**

1. Open your web browser
2. Navigate to: `http://localhost:3000`

**✅ Expected:** You should see the Aadhaar Details Management interface with:
- Search Aadhaar section
- Add/Update Aadhaar Details form
- Clean, modern UI

---

### **Step 4: Test Search Functionality**

#### Test Case 1: Search Existing Record

1. **In the "Search Aadhaar" section:**
   - Enter Aadhaar number: `123456789012`
   - Click "Search" button

2. **Expected Results:**
   - ✅ Success message: "Aadhaar details fetched successfully"
   - ✅ Details section appears below showing:
     - Aadhaar Number: 123456789012
     - Name: Rajesh Kumar
     - Date of Birth: 5/15/1990
     - Gender: Male
     - Address: 123 Main Street, Sector 5, New Delhi, Delhi 110001
     - Phone Number: 9876543210
     - Email: rajesh.kumar@example.com
   - ✅ Form is populated with the fetched data

#### Test Case 2: Search Another Record

Try searching for:
- `234567890123` → Should show **Priya Sharma**
- `345678901234` → Should show **Amit Patel**
- `456789012345` → Should show **Sneha Reddy**

#### Test Case 3: Search Non-Existent Record

1. Enter Aadhaar number: `999999999999`
2. Click "Search"

**Expected:**
- ❌ Error message: "Aadhaar details not found"
- No details displayed

#### Test Case 4: Invalid Aadhaar Format

1. Enter: `12345` (less than 12 digits)
2. Click "Search"

**Expected:**
- ❌ Error message: "Invalid Aadhaar number format. Must be 12 digits"

#### Test Case 5: Empty Search

1. Leave search field empty
2. Click "Search"

**Expected:**
- ❌ Error message: "Please enter an Aadhaar number"

---

### **Step 5: Test Add/Update Functionality**

#### Test Case 1: Add New Record

1. **Fill in the form:**
   - Aadhaar Number: `111111111111`
   - Full Name: `Test User`
   - Date of Birth: `2000-01-01`
   - Gender: `Male`
   - Phone Number: `9999999999`
   - Email: `test@example.com`
   - Address: `Test Address, Test City`

2. Click "Save Details"

**Expected:**
- ✅ Success message: "Aadhaar details saved successfully"
- ✅ Details section shows the saved data
- ✅ Record is now searchable

#### Test Case 2: Update Existing Record

1. Search for: `123456789012`
2. Modify the name field to: `Rajesh Kumar Updated`
3. Click "Save Details"

**Expected:**
- ✅ Success message: "Aadhaar details saved successfully"
- ✅ Updated details displayed
- ✅ Changes persist (search again to verify)

#### Test Case 3: Validation Tests

**Test Required Fields:**
- Leave Aadhaar Number empty → Should show error
- Leave Name empty → Should show error
- Enter invalid Aadhaar (non-numeric) → Should show format error

---

### **Step 6: Test All Test Data Records**

Search each of these Aadhaar numbers to verify all test data:

| Aadhaar Number | Expected Name | City |
|----------------|---------------|------|
| `123456789012` | Rajesh Kumar | New Delhi |
| `234567890123` | Priya Sharma | Mumbai |
| `345678901234` | Amit Patel | Bangalore |
| `456789012345` | Sneha Reddy | Bangalore |
| `567890123456` | Vikram Singh | New Delhi |
| `678901234567` | Anjali Desai | Mumbai |
| `789012345678` | Rahul Mehta | Hyderabad |
| `890123456789` | Kavita Nair | Hyderabad |

**✅ All should display correctly with full details**

---

### **Step 7: Test UI Features**

1. **Clear Button:**
   - Fill form with data
   - Click "Clear"
   - ✅ Form should reset, details should disappear

2. **Loading States:**
   - During search/save, buttons should show "Searching..." or "Saving..."
   - ✅ Buttons should be disabled during loading

3. **Responsive Design:**
   - Resize browser window
   - ✅ Layout should adapt to different screen sizes

---

## 🐛 Troubleshooting

### Issue: "Database authentication failed"

**Solution:**
1. Check `.env` file has correct password
2. Run: `.\scripts\fix-and-add-test-data.ps1`
3. Restart server

### Issue: "Aadhaar details not found" (even for test data)

**Solution:**
1. Verify test data was added:
   ```powershell
   npm run add-test-data
   ```
2. Check database:
   ```powershell
   psql -U postgres -d aadhaar_db -c "SELECT COUNT(*) FROM aadhaar_details;"
   ```

### Issue: Server won't start

**Solution:**
1. Check if port 3000 is in use
2. Kill process: `Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process`
3. Try again: `npm run dev`

### Issue: Search shows nothing

**Solution:**
1. Check browser console for errors (F12)
2. Check server terminal for errors
3. Verify API is working: `http://localhost:3000/api/aadhaar?aadhaar_number=123456789012`

---

## ✅ Testing Checklist

Use this checklist to verify everything works:

- [ ] Server starts without errors
- [ ] Application loads in browser
- [ ] Search for `123456789012` shows Rajesh Kumar
- [ ] All 8 test records are searchable
- [ ] Form validation works (required fields, format)
- [ ] Add new record works
- [ ] Update existing record works
- [ ] Clear button works
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Details section displays all fields
- [ ] Form populates when searching
- [ ] Loading states work
- [ ] Responsive design works

---

## 🎯 Quick Test Commands

```powershell
# Test database connection
npm run test-db

# Add test data
npm run add-test-data

# Start server
npm run dev

# Check if server is running
Get-NetTCPConnection -LocalPort 3000
```

---

## 📊 Expected Test Results

After completing all tests, you should have:

- ✅ 8 test records in database (or more if you added new ones)
- ✅ All search operations working
- ✅ All CRUD operations working
- ✅ Proper error handling
- ✅ Good user experience

---

## 🎉 Success Criteria

Your project is working correctly if:

1. ✅ You can search for any test Aadhaar number
2. ✅ Details display correctly with all fields
3. ✅ You can add new records
4. ✅ You can update existing records
5. ✅ Validation works properly
6. ✅ Error messages are clear and helpful

---

**Happy Testing! 🚀**
