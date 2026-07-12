# QA Test Suite - Al Rehman Flour Mills System

## Test Environment
- **App Version**: 0.1.0 (Beta)
- **Framework**: Next.js 16 + TypeScript
- **Database**: SQLite (better-sqlite3)
- **Auth**: NextAuth with JWT sessions
- **Test Date**: 2026-07-12

---

## 1. SETUP & INITIALIZATION TESTS

### 1.1 Database Setup
- [ ] **TC-001**: Navigate to `/setup` without database
  - **Expected**: Setup form displays (3 steps)
  - **Status**: ✅ PASS
  
- [ ] **TC-002**: Create database with weak password (< 8 chars)
  - **Expected**: Error message displayed
  - **Status**: Need to test
  
- [ ] **TC-003**: Create database with matching passwords
  - **Expected**: Proceed to owner account step
  - **Status**: Need to test
  
- [ ] **TC-004**: Review step shows correct details
  - **Expected**: Owner name and username displayed
  - **Status**: Need to test
  
- [ ] **TC-005**: Confirm setup creates database
  - **Expected**: Database file created, redirected to login
  - **Status**: Need to test

### 1.2 Owner Account Creation
- [ ] **TC-006**: Create owner account with valid details
  - **Expected**: Account created, can login
  - **Status**: Need to test
  
- [ ] **TC-007**: Owner has correct role ("owner")
  - **Expected**: Settings menu visible in sidebar
  - **Status**: Need to test

---

## 2. AUTHENTICATION TESTS

### 2.1 Login
- [ ] **TC-008**: Login with correct credentials
  - **Expected**: Redirected to dashboard
  - **Status**: Need to test
  
- [ ] **TC-009**: Login with incorrect password
  - **Expected**: Error message "Invalid username or password"
  - **Status**: Need to test
  
- [ ] **TC-010**: Login with non-existent username
  - **Expected**: Error message displayed
  - **Status**: Need to test

### 2.2 Session Management
- [ ] **TC-011**: Session timeout after 30 minutes of inactivity
  - **Expected**: Logged out, redirected to login
  - **Status**: Need to test
  
- [ ] **TC-012**: Warning appears 5 minutes before timeout
  - **Expected**: Yellow warning banner with countdown
  - **Status**: Need to test
  
- [ ] **TC-013**: Activity resets timeout
  - **Expected**: Warning disappears after mouse/keyboard activity
  - **Status**: Need to test

### 2.3 Logout
- [ ] **TC-014**: Logout button in sidebar works
  - **Expected**: Session cleared, redirected to login
  - **Status**: Need to test
  
- [ ] **TC-015**: Logout confirmation dialog appears
  - **Expected**: Confirmation dialog shown
  - **Status**: Need to test

---

## 3. STAFF MANAGEMENT TESTS

### 3.1 Add Staff Member
- [ ] **TC-016**: Add staff with all required fields
  - **Input**: Name: "Ahmed Khan", Username: "ahmed", Password: "pass123"
  - **Expected**: Staff member added, listed on page
  - **Status**: Need to test
  
- [ ] **TC-017**: Add staff with duplicate username
  - **Expected**: Error "Username already exists"
  - **Status**: Need to test
  
- [ ] **TC-018**: Password eye icon toggle works
  - **Expected**: Password visibility toggles on click
  - **Status**: Need to test

### 3.2 Staff List & Management
- [ ] **TC-019**: View all staff members
  - **Expected**: Staff list displays name and username
  - **Status**: Need to test
  
- [ ] **TC-020**: Reset staff password
  - **Expected**: New password saved, old password invalid
  - **Status**: Need to test
  
- [ ] **TC-021**: Delete staff with confirmation
  - **Expected**: Confirmation dialog, staff removed
  - **Status**: Need to test
  
- [ ] **TC-022**: Delete staff shows in deletion log
  - **Expected**: Deletion logged with timestamp
  - **Status**: Need to test

---

## 4. SALES TESTS

### 4.1 Quick Bill Entry
- [ ] **TC-023**: Add item to bill (Brand + Size)
  - **Input**: Premium Atta 20kg, Qty: 5
  - **Expected**: Item added, subtotal calculated
  - **Status**: Need to test
  
- [ ] **TC-024**: Can't oversell (stock validation)
  - **Input**: Try to sell more than produced
  - **Expected**: Error "Only X bags available"
  - **Status**: Need to test
  
- [ ] **TC-025**: Full payment mode
  - **Expected**: No customer fields required
  - **Status**: Need to test
  
- [ ] **TC-026**: Partial/Credit mode
  - **Expected**: Customer name, phone, amount paid fields appear
  - **Status**: Need to test

### 4.2 Bill Confirmation
- [ ] **TC-027**: Confirm sale creates bill number
  - **Expected**: BILL-0001 format, added to ledger
  - **Status**: Need to test
  
- [ ] **TC-028**: Stock updated after sale
  - **Expected**: Produced - Sold = Stock
  - **Status**: Need to test
  
- [ ] **TC-029**: Credit sale shows "Credit Pending" badge
  - **Expected**: Balance displayed
  - **Status**: Need to test

### 4.3 Payment Recording
- [ ] **TC-030**: Record full payment on credit sale
  - **Expected**: Status changes to "Paid"
  - **Status**: Need to test
  
- [ ] **TC-031**: Record partial payment
  - **Expected**: Remaining balance shown, stays "Credit Pending"
  - **Status**: Need to test

### 4.4 Returns
- [ ] **TC-032**: Return full sale
  - **Expected**: Stock restored, sale marked "Returned"
  - **Status**: Need to test
  
- [ ] **TC-033**: Return credit sale
  - **Expected**: Credit amount deducted from balance
  - **Status**: Need to test

---

## 5. COST & OVERHEAD TESTS

### 5.1 Expenses
- [ ] **TC-034**: Add multiple expense categories at once
  - **Input**: Electricity, Transport, Salary
  - **Expected**: All saved in single action
  - **Status**: Need to test
  
- [ ] **TC-035**: Expense appears in Financial Health
  - **Expected**: Total Cost updated
  - **Status**: Need to test

### 5.2 Raw Wheat
- [ ] **TC-036**: Log wheat purchase
  - **Input**: 500kg @ 50/kg from Supplier X
  - **Expected**: Recorded with supplier name
  - **Status**: Need to test

### 5.3 Production Entry
- [ ] **TC-037**: Log production for multiple brands
  - **Input**: Brand A 20kg: 400 bags, Brand B 40kg: 100 bags
  - **Expected**: Both saved, Production Mix updated
  - **Status**: Need to test

### 5.4 Daily Grinding
- [ ] **TC-038**: Log wheat grinding
  - **Input**: 300kg grinded today
  - **Expected**: Appears on Mill Operations
  - **Status**: Need to test

---

## 6. DASHBOARD & REPORTING TESTS

### 6.1 Profit Projection
- [ ] **TC-039**: Sales Performance shows daily/weekly/monthly/yearly
  - **Expected**: Accurate totals for each period
  - **Status**: Need to test
  
- [ ] **TC-040**: Financial Health shows cost breakdown
  - **Expected**: Raw Material vs Overhead bar chart
  - **Status**: Need to test
  
- [ ] **TC-041**: Operational Snapshot shows current status
  - **Expected**: Produced, Grinded, Stock Remaining
  - **Status**: Need to test

### 6.2 Mill Operations
- [ ] **TC-042**: Wheat tracking (Received → Grinded → Balance)
  - **Expected**: Correct calculations
  - **Status**: Need to test
  
- [ ] **TC-043**: Atta tracking (Produced → Issued → Balance)
  - **Expected**: Correct calculations
  - **Status**: Need to test

### 6.3 Daily Stock
- [ ] **TC-044**: Stock per brand & size
  - **Expected**: Opening, Production, Sales, Closing columns
  - **Status**: Need to test

---

## 7. DATA MANAGEMENT TESTS

### 7.1 Entries Page
- [ ] **TC-045**: Search filters work on all lists
  - **Expected**: Results match search term
  - **Status**: Need to test
  
- [ ] **TC-046**: Delete entry with confirmation
  - **Expected**: Signature (name + reason) required
  - **Status**: Need to test
  
- [ ] **TC-047**: Undo after deletion
  - **Expected**: Entry restored, undo bar disappears
  - **Status**: Need to test

### 7.2 Logs
- [ ] **TC-048**: Deletion Log shows all deletions
  - **Expected**: What, Who, When, Why
  - **Status**: Need to test
  
- [ ] **TC-049**: Return Log shows all returns
  - **Expected**: Separate from deletions
  - **Status**: Need to test
  
- [ ] **TC-050**: Change Log tracks product updates
  - **Expected**: Brand/size adds, edits, deletes logged
  - **Status**: Need to test

---

## 8. SETTINGS TESTS

### 8.1 Session Settings
- [ ] **TC-051**: Change session timeout
  - **Expected**: New timeout takes effect
  - **Status**: Need to test
  
- [ ] **TC-052**: Change warning time
  - **Expected**: Warning appears at new time
  - **Status**: Need to test

### 8.2 Feedback & Support
- [ ] **TC-053**: Send feedback (bug report)
  - **Expected**: Modal opens, form submits
  - **Status**: Need to test
  
- [ ] **TC-054**: Feedback includes user info
  - **Expected**: Name, email, role included in email
  - **Status**: Need to test

### 8.3 Database Management
- [ ] **TC-055**: Reset database requires password
  - **Expected**: Password verification step
  - **Status**: Need to test
  
- [ ] **TC-056**: Wrong password blocks reset
  - **Expected**: Error message shown
  - **Status**: Need to test

---

## 9. PRODUCT & PACKAGING TESTS

### 9.1 Add Brand
- [ ] **TC-057**: Add new brand
  - **Input**: "Chakki Atta"
  - **Expected**: Available in Quick Bill
  - **Status**: Need to test

### 9.2 Add Bag Size
- [ ] **TC-058**: Add size with weight & price
  - **Input**: 20kg @ 500/bag
  - **Expected**: Label auto-generated as "20kg"
  - **Status**: Need to test
  
- [ ] **TC-059**: Edit price and weight
  - **Expected**: Change logged, old values preserved
  - **Status**: Need to test

### 9.3 Delete Brand/Size
- [ ] **TC-060**: Delete requires signature
  - **Expected**: Name + reason required
  - **Status**: Need to test

---

## 10. SECURITY & ROBUSTNESS TESTS

### 10.1 Authorization
- [ ] **TC-061**: Non-owner can't access settings
  - **Expected**: "Access Denied" message
  - **Status**: Need to test
  
- [ ] **TC-062**: Logout clears session
  - **Expected**: Can't access protected pages
  - **Status**: Need to test

### 10.2 Data Validation
- [ ] **TC-063**: Invalid data rejected
  - **Expected**: Error messages shown
  - **Status**: Need to test
  
- [ ] **TC-064**: Database maintains integrity
  - **Expected**: No orphaned records
  - **Status**: Need to test

### 10.3 Cross-Origin & Network
- [ ] **TC-065**: Network access works (192.168.1.19)
  - **Expected**: No CORS errors
  - **Status**: ✅ PASS (fixed in config)

---

## TEST EXECUTION SUMMARY

| Category | Total | Passed | Failed | Pending |
|----------|-------|--------|--------|---------|
| Setup | 5 | 0 | 0 | 5 |
| Auth | 8 | 0 | 0 | 8 |
| Staff | 7 | 0 | 0 | 7 |
| Sales | 14 | 0 | 0 | 14 |
| Cost & Overhead | 4 | 0 | 0 | 4 |
| Dashboard | 6 | 0 | 0 | 6 |
| Data Mgmt | 6 | 0 | 0 | 6 |
| Settings | 5 | 0 | 0 | 5 |
| Product | 4 | 0 | 0 | 4 |
| Security | 4 | 0 | 0 | 4 |
| **TOTAL** | **65** | **0** | **0** | **65** |

---

## Known Issues to Monitor

1. **Database initialization** - Must complete setup before using app
2. **Network access** - Use 192.168.1.19 instead of localhost
3. **Session timeout** - Default 30 minutes, verify countdown works
4. **Stock validation** - Prevent overselling

---

## Future Enhancements

- [ ] Automated email reports
- [ ] GitHub version updates
- [ ] Cloud backup functionality
- [ ] Multi-user sync
- [ ] Mobile app
- [ ] Advanced analytics
