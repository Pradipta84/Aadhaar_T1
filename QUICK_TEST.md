# Quick Test Reference Card

## 🚀 Fast Testing (5 Minutes)

### Step 1: Setup (One Time)
```powershell
.\scripts\fix-and-add-test-data.ps1
```
Enter your PostgreSQL password when prompted.

### Step 2: Start Server
```powershell
npm run dev
```

### Step 3: Open Browser
```
http://localhost:3000
```

### Step 4: Test Search

**Test Record 1:**
- Enter: `123456789012`
- Click: **Search**
- ✅ Should show: **Rajesh Kumar** with all details

**Test Record 2:**
- Enter: `234567890123`
- Click: **Search**
- ✅ Should show: **Priya Sharma** with all details

**Test Record 3:**
- Enter: `345678901234`
- Click: **Search**
- ✅ Should show: **Amit Patel** with all details

### Step 5: Test All 8 Records

| Search This | Should Show |
|-------------|-------------|
| `123456789012` | Rajesh Kumar |
| `234567890123` | Priya Sharma |
| `345678901234` | Amit Patel |
| `456789012345` | Sneha Reddy |
| `567890123456` | Vikram Singh |
| `678901234567` | Anjali Desai |
| `789012345678` | Rahul Mehta |
| `890123456789` | Kavita Nair |

### ✅ What to Verify

For each search, you should see:
- ✅ Success message appears
- ✅ Details section shows:
  - Aadhaar Number
  - Name
  - Date of Birth
  - Gender
  - Address
  - Phone Number
  - Email
- ✅ Form is populated with the data

### ❌ Error Testing

1. **Invalid Format:** `12345` → Should show format error
2. **Not Found:** `999999999999` → Should show "not found"
3. **Empty:** Leave blank → Should show "please enter"

---

## 🎯 Success = All 8 Records Searchable!

If all 8 test records can be searched and display correctly, your project is working! ✅
