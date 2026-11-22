# Security Specification — Olyfberg Gemeente Portal

## 1. Data Invariants
1. **Identity Integrity**: Every user-authored record (`prayerRequests`, `donationPledges`, `contactMessages`) MUST bind `authorUid` or `ownerUid` to `request.auth.uid` on creation and preserve it immutably on update.
2. **Verified Auth Gate**: All writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **Admin Escalation Prevention**: Admin privileges come exclusively from the server-verified admin email (`bhmweskerk@gmail.com`) with `email_verified == true` or `/admins/{uid}` documents—never from client-controlled profile fields.
4. **PII Isolation**: Collections containing personal emails or private financial pledges (`contactMessages`, `donationPledges`) are strictly restricted to `isOwner(resource.data.ownerUid) || isAdmin()` for both `get` and `list`.
5. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time`; `createdAt` and `createdBy`/`authorUid`/`ownerUid` are immutable after creation.
6. **Public Bulletin Scoping**: Public congregation bulletin collections (`calendarEvents`, `catechismClasses`, `classAnnouncements`, `birthdays`, `weeklyProgram`, `sermons`, `prayerRequests`, `churchContent`) require `resource.data.isPublic == true` on `get` and `list` so query security is enforced inside the rules.
7. **Schema & Bounds Enforcement**: Every string checks `.size() <= MAX`, arrays enforce bounded `.size() <= MAX`, and document IDs match `^[a-zA-Z0-9_\-]+$`.

## 2. The "Dirty Dozen" Attack Payloads
1. **Shadow Field Injection on Prayer Create**: `{ personName: "Jan", category: "Gesondheid", request: "Bid saam", dateLabel: "21 Nov", prayingCount: 1, isAnswered: false, isAnonymous: false, isPublic: true, authorUid: "<uid>", createdAt: "<server>", updatedAt: "<server>", isAdmin: true }` -> Rejected by `keys().hasOnly(...)`.
2. **Author UID Spoofing on Prayer Create**: `authorUid: "someone-else-uid"` -> Rejected by `data.authorUid == request.auth.uid`.
3. **Unverified Email Spoof**: Request where `request.auth.token.email == "bhmweskerk@gmail.com"` and `email_verified == false` -> Rejected by `isVerified()`.
4. **Resource Poisoning via Oversized Prayer Text**: `request` string length 10,000 chars -> Rejected by `data.request.size() <= 700`.
5. **ID Poisoning**: Creating `/prayerRequests/bad$id!!withSpaces` -> Rejected by `isValidId(prayerId)`.
6. **Inflated Prayer Count Jump**: Non-admin updating `prayingCount` from `5` to `500` -> Rejected by `incoming().prayingCount == existing().prayingCount + 1`.
7. **Unauthorized Prayer Edit**: Non-admin, non-owner changing `request` text -> Rejected by `affectedKeys().hasOnly(['prayingCount', 'updatedAt'])`.
8. **Terminal State Bypass**: Non-admin attempting to un-answer or edit an already answered prayer (`existing().isAnswered == true`) -> Rejected by terminal lock.
9. **Blanket Contact Message Read**: Non-admin attempting `list` on `/contactMessages` without `ownerUid == request.auth.uid` -> Rejected by `allow list: if isAdmin() || (isVerified() && resource.data.ownerUid == request.auth.uid)`.
10. **Pledge Amount Poisoning**: Submitting `donationPledges` with `amount: -500` or `amount: 0` -> Rejected by `data.amount > 0 && data.amount <= 10000000`.
11. **Client Timestamp Forgery**: Submitting `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time` -> Rejected by `data.createdAt == request.time`.
12. **Self-Admin Escalation**: Regular user attempting `create` on `/admins/{uid}` -> Rejected by `allow write: if isAdmin()`.
