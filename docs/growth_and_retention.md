# Growth, Analytics & Retention Playbook

## Early Analytics (implement from day 1)

Track these events via a simple `analytics_events` table (or Segment/Mixpanel):

| Event                    | Why it matters                            |
|--------------------------|-------------------------------------------|
| `signup_completed`       | Top-of-funnel health                      |
| `otp_verified`           | Conversion rate                           |
| `profile_created`        | Activation metric                         |
| `selfie_submitted`       | Trust funnel                              |
| `suggestion_viewed`      | Discovery engagement                      |
| `connection_sent`        | Intent-to-connect                         |
| `connection_accepted`    | Match quality proxy                       |
| `message_sent`           | Core engagement                           |
| `group_joined`           | Community signal                          |
| `report_filed`           | Safety health                             |

**Key metrics to watch weekly:**
- D1 / D7 / D30 retention
- Profile completion rate (target: >70%)
- Connection acceptance rate (target: >40%)
- Messages per accepted connection (target: >5)

---

## Growth Hooks

### 1. Invite-only beta
- Launch city by city (Bangalore → Mumbai → Delhi)
- Invite codes create scarcity and word-of-mouth
- "Your friend X wants you to join IntentConnect"

### 2. Intent-based referral
- "Invite someone who is also looking for [your intent]"
- Frames sharing as doing someone a favour, not spam

### 3. Group seeding
- Pre-create 3–5 groups per city before launch
- Makes the app feel alive immediately
- "Morning Runners Bangalore" with 0 members feels dead
- Seed with team accounts and early users

### 4. Verification as social proof
- Show verified badge prominently
- "X% of profiles are verified humans"
- Send email: "Your selfie was verified" with a trophy moment

### 5. Weekly match digest email
- "3 new people matching your intent in [city] this week"
- Drives D7+ re-engagement without being spammy

---

## Retention Mechanisms

### Short-term (week 1)
- Onboarding completeness nudge: "Complete your profile to see 3x more matches"
- OTP login creates low-friction return
- Real-time notifications for connection requests

### Medium-term (month 1)
- "Your connection [name] sent you a message" → pulls back dormant users
- Group activity: "Your group has 2 new members"
- Weekly: "Your profile was viewed X times this week"

### Long-term (month 2+)
- Intent evolution: allow users to update intent once per month
- City expansion: "IntentConnect is now in [new city]. Know anyone there?"
- Community milestones: "100 connections made in Bangalore this week"

---

## Women Safety Checklist (Critical for India)
- [ ] Selfie verification before first message (not after)
- [ ] Women can choose to only receive requests from verified users
- [ ] 1-tap emergency report with screenshot attachment
- [ ] Profile can be set to women-only visibility
- [ ] Auto-flag accounts with 3+ reports for admin review
- [ ] "Safe connect" — 48h cooldown before messaging after connection accept
- [ ] No phone number ever shared via platform
- [ ] Admin response SLA: <24h for harassment reports

---

## Trust Signals (show on profile cards)
- [✓] Phone verified
- [✓] Selfie verified
- [✓] Profile X% complete
- Member since [month year]
- Groups joined: [count]

---

## What kills apps like this (avoid these)
1. Fake profiles in early days → seed with real humans, not bots
2. Gender imbalance → invite more women first, restrict ratios per city
3. Ghosting after connection → nudge 48h after acceptance if no message
4. Feature creep → resist adding swipe/video until PMF is proven
5. No moderation at launch → have a human review reports, day 1
