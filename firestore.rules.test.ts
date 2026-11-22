/**
 * Firestore Security Rules Test Specification (Dirty Dozen Verification)
 * Run with @firebase/rules-unit-testing against Firestore Emulator if available.
 */
export const DIRTY_DOZEN_CASES = [
  {
    name: '1. Shadow field injection on prayerRequests create',
    collection: 'prayerRequests',
    operation: 'create',
    payload: {
      personName: 'Jan',
      category: 'Gesondheid',
      request: 'Bid saam vir herstel',
      dateLabel: '21 Nov 2026',
      prayingCount: 1,
      isAnswered: false,
      isAnonymous: false,
      isPublic: true,
      authorUid: 'user-1',
      isAdmin: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '2. Author UID spoofing on prayerRequests create',
    collection: 'prayerRequests',
    operation: 'create',
    authUid: 'user-1',
    payload: { authorUid: 'victim-uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '3. Unverified email spoof of bootstrap admin',
    collection: 'sermons',
    operation: 'create',
    auth: { uid: 'attacker', email: 'bhmweskerk@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '4. Resource poisoning (>700 char prayer request)',
    collection: 'prayerRequests',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '5. Document ID poisoning',
    path: 'prayerRequests/invalid$id!!',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '6. Inflated prayingCount jump (+500)',
    collection: 'prayerRequests',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '7. Unauthorized edit of another member prayer text',
    collection: 'prayerRequests',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '8. Terminal state bypass on answered prayer',
    collection: 'prayerRequests',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '9. Blanket list query on private contactMessages by non-admin',
    collection: 'contactMessages',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '10. Negative donationPledge amount poisoning',
    collection: 'donationPledges',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '11. Forged client timestamp on create',
    collection: 'prayerRequests',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '12. Self-admin escalation on /admins/{uid}',
    collection: 'admins',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
];
