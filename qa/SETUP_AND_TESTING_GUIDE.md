# Setup & QA Testing Guide

## Quick Start (5 minutes)

### 1. Start the Dev Server
```bash
npm run dev
```
Access at: **http://192.168.1.19:3000**

### 2. Complete Initial Setup
1. Go to `/setup`
2. **Database Password**: `demo123` (min 8 characters)
3. **Owner Account**:
   - Name: `Admin User`
   - Username: `admin`
   - Password: `admin123`
4. Review and confirm
5. Login with credentials above

### 3. Login
- Username: `admin`
- Password: `admin123`

---

## Full Testing Workflow (30 minutes)

### Phase 1: Setup & Admin (5 min)

#### ✅ Task: Database Initialization
- [ ] Navigate to `/setup`
- [ ] Create database with password: `demo123`
- [ ] Create owner account
- [ ] Confirm setup
- [ ] Verify redirected to `/login`

#### ✅ Task: Add Test Staff Members
Go to **Settings → Staff Management**:

**Staff Member 1:**
- Name: `Ahmed Khan`
- Username: `ahmed`
- Password: `ahmed123`

**Staff Member 2:**
- Name: `Fatima Ali`
- Username: `fatima`
- Password: `fatima123`

**Staff Member 3:**
- Name: `Hassan Malik`
- Username: `hassan`
- Password: `hassan123`

---

### Phase 2: Product Setup (5 min)

Go to **Dashboard → Product & Packaging**:

#### ✅ Task: Add Brands

**Brand 1: Premium Atta**
- Weight: 10kg, Price: 250
- Weight: 20kg, Price: 450
- Weight: 40kg, Price: 800

**Brand 2: Standard Flour**
- Weight: 10kg, Price: 200
- Weight: 20kg, Price: 350
- Weight: 40kg, Price: 650

**Brand 3: Chakki Atta**
- Weight: 20kg, Price: 500
- Weight: 40kg, Price: 900

---

### Phase 3: Demo Data Generation (3 min)

Option A: **Automatic (Recommended)**
```bash
npm run generate-demo-data 30 50
```
This generates:
- 30 days of history
- ~50 sales transactions
- Production entries
- Expenses
- Wheat purchases
- Grinding logs

Option B: **Manual Entry** (if you prefer)
Follow Phase 4 steps manually for 2-3 days

---

### Phase 4: Manual Testing (15 min)

#### ✅ Task: Production Entry (Cost & Overhead Ledger)
Go to **Dashboard → Cost & Overhead Ledger**

1. **Production Section:**
   - Premium Atta 10kg: 200 bags
   - Premium Atta 20kg: 150 bags
   - Standard Flour 40kg: 100 bags
   - Click "Save Production"

2. **Raw Wheat Section:**
   - Wheat Volume: 1500 kg
   - Rate: 50 PKR/kg
   - Supplier: "Khan Brothers"
   - Vehicle: "KHI-1234"
   - Click "Add"

3. **Daily Grinding Section:**
   - Wheat Grinded: 1200 kg
   - Click "Save"

4. **Expenses Section:**
   - Electricity: 5000
   - Transport: 3000
   - Salary: 15000
   - Click "Save Expenses"

#### ✅ Task: Sales Entry (Quick Bill)
Go to **Sales → Quick Bill & Ledger**

**Sale 1: Full Payment**
1. Brand: "Premium Atta 20kg"
2. Quantity: 10
3. Payment Mode: "Full Payment"
4. Payment Method: "Cash"
5. Click "Confirm Sale"
6. Verify: BILL-0001 appears in ledger with "Paid" status

**Sale 2: Credit Sale**
1. Brand: "Standard Flour 40kg"
2. Quantity: 5
3. Payment Mode: "Partial / Credit"
4. Customer Name: "Ahmed Khan"
5. Customer Phone: "0312-3456789"
6. Amount Paid: 1000
7. Click "Confirm Sale"
8. Verify: BILL-0002 appears with "Credit Pending" badge

**Sale 3: Partial Payment**
1. Brand: "Chakki Atta 20kg"
2. Quantity: 8
3. Payment Mode: "Full Payment"
4. Verify: BILL-0003 shows "Paid"

#### ✅ Task: Payment Recording
On Sale 2 (Credit), click "Record Payment":
- Enter: 2000
- Verify: Remaining balance updated

#### ✅ Task: Returns
On Sale 3, click "Return":
- Name: "admin"
- Reason: "Damaged bags"
- Verify: Status changes to "Returned", stock restored

---

### Phase 5: Dashboard Review (5 min)

#### ✅ Check Profit Projection
- Daily Sales: Should show 3 sales
- Weekly Sales: Should match daily
- Financial Health: Should show cost breakdown
- Stock Remaining: Should match production - sales

#### ✅ Check Mill Operations
- Wheat Received: 1500 kg
- Grinded: 1200 kg
- Balance: 300 kg
- Atta Produced: Should match production entries
- Atta Issued: Should match sales

#### ✅ Check Daily Stock
- Shows per-brand stock breakdown
- Opening + Production - Sales = Closing

---

## Test Results Template

### Execution Date: _________________
### Tester Name: _________________
### App Version: 0.1.0

| TC # | Test Case | Steps | Expected Result | Actual Result | Status | Notes |
|------|-----------|-------|-----------------|---------------|--------|-------|
| TC-001 | Setup form displays | Navigate to /setup | 3-step form shown | | [ ] | |
| TC-006 | Owner login works | Login with admin/admin123 | Dashboard displayed | | [ ] | |
| TC-016 | Add staff member | Create Ahmed Khan account | Staff added to list | | [ ] | |
| TC-023 | Add item to bill | Add 10x Premium 20kg | Subtotal calculated | | [ ] | |
| TC-027 | Confirm sale | Click confirm | BILL-0001 created | | [ ] | |
| TC-029 | Credit sale badge | Confirm credit sale | "Credit Pending" shown | | [ ] | |
| TC-030 | Record payment | Record 2000 on credit | Balance updated | | [ ] | |
| TC-032 | Return sale | Click return | Status = "Returned" | | [ ] | |
| TC-037 | Production entry | Log 150 bags | Appears in ledger | | [ ] | |
| TC-038 | Grinding log | Log 1200kg | Appears in operations | | [ ] | |

### Summary
- **Total Tests**: ___
- **Passed**: ___
- **Failed**: ___
- **Issues Found**: ___

### Issues & Bugs Found
```
1. [Description]
   - Steps to reproduce:
   - Expected: 
   - Actual:
   - Severity: Critical/High/Medium/Low

2. [Description]
   - Steps to reproduce:
   - Expected:
   - Actual:
   - Severity: Critical/High/Medium/Low
```

### Performance Notes
- Load time for dashboard: ___ ms
- Load time for sales page: ___ ms
- Database file size: ___ MB
- Any slowness noticed: ___ 

### Browser & Environment
- Browser: _________
- OS: _________
- Screen Resolution: _________
- Network: 192.168.1.19

---

## Automated Testing (Future)

### Scripts to Create
```bash
# Generate demo data (30 days, 50 sales)
npm run generate-demo-data

# Run Playwright tests
npm run test:e2e

# Check types
npm run type-check

# Build for production
npm run build
```

### Test Coverage Needed
- [ ] Auth flows (login, logout, session)
- [ ] CRUD operations (create, read, update, delete)
- [ ] Business logic (stock calculations, bill totals)
- [ ] UI interactions (buttons, forms, navigation)
- [ ] Data persistence (database saves correctly)

---

## Troubleshooting

### Issue: "file is not a database"
**Solution**: Database not initialized. Complete setup at `/setup`

### Issue: ERR_TOO_MANY_REDIRECTS
**Solution**: Clear browser cache or use incognito/private mode

### Issue: Can't access localhost:3000
**Solution**: Use http://192.168.1.19:3000 instead

### Issue: Staff member won't add
**Solution**: Ensure database setup is complete and you're logged in as owner

---

## Deployment Checklist

Before deploying to production:

- [ ] All 65 test cases passed
- [ ] No console errors or warnings
- [ ] Database backup tested
- [ ] All staff accounts can login
- [ ] Session timeout works (test after 30 min)
- [ ] All calculations verified (cost, revenue, stock)
- [ ] Help page is complete
- [ ] Feedback feature works
- [ ] Password reset works
- [ ] Build runs without errors (`npm run build`)

---

## Demo Script (For Owner Presentation)

**Duration**: 10 minutes

1. **Login** (30 sec)
   - Show login page
   - Login as admin

2. **Dashboard Overview** (2 min)
   - Show Profit Projection with actual data
   - Show Financial Health breakdown
   - Show Operational Snapshot

3. **Sales Entry** (2 min)
   - Create new sale (Quick Bill)
   - Record payment
   - Show ledger update

4. **Reports** (2 min)
   - Mill Operations
   - Daily Stock
   - Cost breakdown

5. **Settings & Admin** (2 min)
   - Show staff management
   - Session settings
   - Feedback feature

6. **Q&A** (1.5 min)

---

## Success Criteria

✅ App is considered **ready for demo** when:
1. Database initializes cleanly
2. All staff can login
3. Sales can be recorded and appear in reports
4. Calculations are accurate
5. No crashes or errors in console
6. Page loads within 2 seconds
7. Feedback feature works

✅ App is considered **production ready** when:
1. All 65 tests passed
2. No security vulnerabilities
3. Windows .exe build created
4. User manual completed
5. Owner has trained 2+ staff members
6. 1 week of real usage data recorded
