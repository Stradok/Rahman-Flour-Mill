# Authentication Strategy: Local vs Google

## Question
**"Why not use Google OAuth? It has better session timeout and security practices."**

Great observation! Here's the trade-off analysis.

---

## Comparison Table

| Feature | Local Auth | Google OAuth |
|---------|-----------|--------------|
| **Cloud Dependency** | ❌ None (offline works) | ✅ Requires internet & Google API |
| **Session Timeout** | ✅ **Now 30 min** (we added it) | ✅ Yes, auto-logout built-in |
| **Password Management** | ⚠️ User responsible | ✅ Google handles |
| **Multi-Device** | ❌ Per-machine only | ✅ Syncs across devices |
| **Data Privacy** | ✅ Zero cloud contact | ❌ Google has access data |
| **Works Offline** | ✅ Yes | ❌ Needs internet to login |
| **Non-Technical Users** | ✅ Simple username/password | ⚠️ Google login flow |
| **Client Requirement** | ✅ Matches spec | ❌ Violates "no cloud" |
| **Session Extension** | ✅ **Activity-based** | ✅ Activity-based |
| **Forgot Password** | ⚠️ Owner must reset | ✅ Google handles |

---

## Why Local Auth?

From client requirements (`Second-ammendment.md`):

### 1. **"No Cloud" Requirement**
> "Client is not comfortable with business data living on any cloud server"

**Google OAuth requires:**
- Internet connection to authenticate
- Google API calls (cloud contact)
- Trusting Google with auth data
- Potential data residency concerns

**Our approach:**
- ✅ Completely offline capable
- ✅ No external API calls for auth
- ✅ No cloud dependency

### 2. **"Data Never Leaves the Machine"**
> "wants everything stored strictly on the mill's own computers"

**Google OAuth sends:**
- User identity to Google's servers
- Session tokens to Google
- Potential tracking data

**Our approach:**
- ✅ Everything stays local
- ✅ No data sent to any external service
- ✅ Full control and privacy

### 3. **"Non-Technical Users"**
> "end users are non-technical and cannot run anything from a terminal"

**Google OAuth:**
- Multiple screen redirects
- Confusing for non-technical users
- Requires Gmail account

**Our approach:**
- ✅ Simple: type username & password
- ✅ Familiar UI
- ✅ No external account needed

---

## Security Improvements We Added

You were right about session timeout being important! We've now implemented:

### 1. **30-Minute Session Timeout**
```typescript
session: {
  maxAge: 30 * 60, // 30 minutes
  updateAge: 5 * 60, // refresh after 5 min activity
}
```

### 2. **Activity-Based Session Extension**
```typescript
// SessionTimeoutWarning component tracks:
- Mouse movement
- Keyboard input
- Scrolling
- Touch events
- Clicks

// User activity automatically extends session
// Idle user gets logged out
```

### 3. **Visual Countdown Warning**
```
⏱️ Session Expiring Soon
Your session will expire in 5:00 minutes
Move your mouse or click to stay logged in.
```

**How it works:**
- User has 30 minutes of inactivity before logout
- At 25 minutes, warning appears
- User can dismiss warning
- Any activity (mouse/keyboard) resets the timer
- If time runs out, user is logged out

### 4. **Benefits**
✅ **If device left unattended** → Auto-logout protects data  
✅ **If user forgets to logout** → Automatic logout after 30 min  
✅ **If user is still working** → Activity keeps session alive  
✅ **User gets warning** → 5-minute countdown to save work  
✅ **No external API calls** → Stays local and private  

---

## Comparison: After Our Changes

| Scenario | Before | After |
|----------|--------|-------|
| User leaves device | ❌ Stays logged in forever | ✅ Auto-logout in 30 min |
| User forgets logout | ❌ Credential theft risk | ✅ Protected after 30 min |
| User still working | ❌ N/A | ✅ Stays logged in if active |
| Cloud dependency | ✅ None | ✅ None (better than Google!) |
| Session security | ⚠️ Limited | ✅ Now comprehensive |

---

## Code Implementation

### Session Configuration
```typescript
// auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,      // 30 minute timeout
    updateAge: 5 * 60,    // refresh every 5 minutes of activity
  },
  // ... other config
});
```

### Activity Monitoring
```typescript
// SessionTimeoutWarning.tsx
export default function SessionTimeoutWarning() {
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });
    
    // Shows countdown warning when timeout approaches
    // User activity extends session automatically
  }, [session]);
}
```

---

## When Google OAuth Would Be Better

Google OAuth is genuinely superior when:
- ✅ Users have multiple devices (cross-device sync)
- ✅ Users forget passwords frequently (recovery)
- ✅ Cloud infrastructure is acceptable
- ✅ Internet is always available
- ✅ You want to leverage Google's security

---

## When Local Auth Is Better (This Project)

Local auth is the right choice when:
- ✅ **No cloud allowed** (client requirement)
- ✅ **Must work offline** (mill has spotty internet)
- ✅ **Non-technical users** (simple username/password)
- ✅ **Privacy critical** (business data sensitivity)
- ✅ **Single machine** (no cross-device sync needed)
- ✅ **Compliance concerns** (data sovereignty, not leaving country)

---

## Comparison to Professional Apps

### Google's Approach (Google Workspace)
```
Login → Google OAuth → Google servers → Session token → App
```
- ✅ Professional security
- ❌ Cloud dependency
- ❌ Not acceptable for this project

### Our Approach (Local-Only)
```
Login → Local auth → Check users table → JWT token → App
↓
Automatic 30-min logout
Activity extends session
Warning before expiration
```
- ✅ Professional security (with timeout)
- ✅ No cloud needed
- ✅ Meets all requirements
- ✅ Activity-based (better UX than fixed 30 min)

---

## FAQ

### "Can't we use Google but store data locally?"
No - if using Google OAuth, some data must be sent to Google (authentication records). Client requires zero cloud contact.

### "What if user forgets password?"
Only the owner can reset staff passwords (designed for this). Database password is irretrievable by design for security.

### "Is 30 minutes too aggressive?"
Can be adjusted. Common timeouts:
- 15 min: Very secure, aggressive
- 30 min: **Our choice** - balanced
- 60 min: More lenient, less secure

### "Can we make it longer on night shift?"
Yes, could add configuration to adjust timeout by time of day. Let us know if needed.

### "What if internet goes down?"
✅ App continues working offline  
✅ Session still enforced locally  
✅ No issues with timeout

### "Can users opt out of logout?"
No - timeout is enforced. But activity resets timer automatically, so users who are actively working stay logged in.

---

## Summary

**Your suggestion was excellent.** We've now implemented:

✅ **Google-level session security** (30-min auto-logout)  
✅ **Activity-based session extension** (no fixed cutoff)  
✅ **User-friendly warning** (5-min countdown)  
✅ **Local-only architecture** (no cloud dependency)  
✅ **Protection for forgotten logout** (auto-logout if inactive)  

This gives us the **best of both worlds**:
- Security like Google OAuth (session timeout)
- Privacy like local auth (no cloud)
- Usability better than either (activity-based)

**Result**: Professional-grade security without cloud dependency.

---

**Current Implementation**: ✅ Complete  
**Session Timeout**: 30 minutes  
**Warning Display**: 5 minutes before expiration  
**Activity Extension**: Yes (mouse, keyboard, scroll, touch)
