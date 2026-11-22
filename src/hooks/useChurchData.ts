import {useCallback, useEffect, useRef, useState} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../lib/firebase';
import {DEFAULT_CHURCH_DATA} from '../data/defaultChurchData';
import {
  BankDetails,
  BirthdayEntry,
  CalendarEvent,
  CatechismClass,
  ChurchData,
  ClassAnnouncement,
  ContactInfo,
  DonationRecord,
  GalleryPhoto,
  PrayerRequest,
  SundaySermon,
  WeeklyMessage,
  WeeklyProgramItem,
} from '../types/church';

function makeSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

export function useChurchData() {
  const [data, setData] = useState<ChurchData>(DEFAULT_CHURCH_DATA);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const seededRef = useRef(false);

  // Track Firebase auth state & verify admin role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.emailVerified) {
        if (currentUser.email === BOOTSTRAP_ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          try {
            const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminSnap.exists());
          } catch {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Seed or migrate default NG Kerk Bethlehem-Wes data when admin signs in
  const seedDatabaseIfEmpty = useCallback(async (uid: string) => {
    if (seededRef.current) return;
    seededRef.current = true;
    try {
      const [sermonsSnap, settingsSnap, gallerySnap, kat1Snap] = await Promise.all([
        getDocs(query(collection(db, 'sermons'), where('isPublic', '==', true))),
        getDoc(doc(db, 'churchContent', 'settings')),
        getDocs(query(collection(db, 'galleryPhotos'), where('isPublic', '==', true))),
        getDoc(doc(db, 'catechismClasses', 'kat-1')),
      ]);
      const settingsData = settingsSnap.exists() ? settingsSnap.data() : undefined;
      const existingChurchName = settingsData?.bankDetails?.churchName as
        | string
        | undefined;
      const existingEmail = settingsData?.contactInfo?.email as
        | string
        | undefined;
      const hasStaleCatechismTime =
        kat1Snap.exists() && kat1Snap.data()?.time === 'Tans in Vakansie-reses';

      // Skip if already seeded & migrated to latest NG Kerk Bethlehem-Wes schema
      if (
        !sermonsSnap.empty &&
        existingChurchName !== 'Olyfberg Gemeente' &&
        existingEmail === 'skriba@bhmwes.co.za' &&
        !gallerySnap.empty &&
        !hasStaleCatechismTime
      ) {
        return;
      }

      const batch = writeBatch(db);
      const now = serverTimestamp();

      // Remove stale Olyfberg placeholder docs if migrating
      if (existingChurchName === 'Olyfberg Gemeente') {
        const collectionsToClean = [
          'calendarEvents',
          'catechismClasses',
          'classAnnouncements',
          'birthdays',
          'weeklyProgram',
          'sermons',
          'prayerRequests',
          'galleryPhotos',
        ];
        for (const colName of collectionsToClean) {
          const snap = await getDocs(
            query(collection(db, colName), where('isPublic', '==', true)),
          );
          for (const d of snap.docs) {
            batch.delete(d.ref);
          }
        }
      }

      // Fetch existing public IDs per collection so existing default IDs use batch.update
      // (preserving immutable createdBy & createdAt) while missing IDs use batch.set.
      const existingIdsByCol = new Map<string, Set<string>>();
      if (existingChurchName !== 'Olyfberg Gemeente') {
        const colNames = [
          'calendarEvents',
          'catechismClasses',
          'classAnnouncements',
          'birthdays',
          'weeklyProgram',
          'sermons',
          'prayerRequests',
          'galleryPhotos',
        ];
        const snaps = await Promise.all(
          colNames.map((c) =>
            getDocs(query(collection(db, c), where('isPublic', '==', true))),
          ),
        );
        colNames.forEach((colName, idx) => {
          existingIdsByCol.set(
            colName,
            new Set(snaps[idx].docs.map((d) => d.id)),
          );
        });
      }

      const upsertDefaultDoc = (
        colName: string,
        docId: string,
        fields: Record<string, unknown>,
        isPrayer = false,
      ) => {
        const ref = doc(db, colName, docId);
        const exists = existingIdsByCol.get(colName)?.has(docId) ?? false;
        if (exists) {
          batch.update(ref, {
            ...fields,
            isPublic: true,
            updatedAt: now,
          });
        } else {
          batch.set(ref, {
            ...fields,
            isPublic: true,
            ...(isPrayer ? {authorUid: uid} : {createdBy: uid}),
            createdAt: now,
            updatedAt: now,
          });
        }
      };

      for (const ev of DEFAULT_CHURCH_DATA.calendarEvents) {
        upsertDefaultDoc('calendarEvents', ev.id, {
          title: ev.title,
          date: ev.date,
          time: ev.time,
          location: ev.location,
          category: ev.category,
          description: ev.description,
        });
      }

      for (const cls of DEFAULT_CHURCH_DATA.catechismClasses) {
        upsertDefaultDoc('catechismClasses', cls.id, {
          gradeGroup: cls.gradeGroup,
          title: cls.title,
          teacher: cls.teacher,
          time: cls.time,
          room: cls.room,
          currentTopic: cls.currentTopic,
          nextAssignment: cls.nextAssignment,
        });
      }

      for (const ann of DEFAULT_CHURCH_DATA.classAnnouncements) {
        upsertDefaultDoc('classAnnouncements', ann.id, {
          gradeGroup: ann.gradeGroup,
          title: ann.title,
          message: ann.message,
          dateLabel: ann.dateLabel,
          author: ann.author,
          important: ann.important,
        });
      }

      for (const bday of DEFAULT_CHURCH_DATA.birthdays) {
        upsertDefaultDoc('birthdays', bday.id, {
          name: bday.name,
          dayLabel: bday.dayLabel,
          dateStr: bday.dateStr,
          group: bday.group,
          wishedCount: bday.wishedCount,
        });
      }

      for (const wp of DEFAULT_CHURCH_DATA.weeklyProgram) {
        upsertDefaultDoc('weeklyProgram', wp.id, {
          dayOfWeek: wp.dayOfWeek,
          time: wp.time,
          title: wp.title,
          location: wp.location,
          leader: wp.leader,
          ...(wp.note ? {note: wp.note} : {}),
        });
      }

      for (const ser of DEFAULT_CHURCH_DATA.sermons) {
        upsertDefaultDoc('sermons', ser.id, {
          dateLabel: ser.dateLabel,
          title: ser.title,
          theme: ser.theme,
          scripture: ser.scripture,
          preacher: ser.preacher,
          ...(ser.organist ? {organist: ser.organist} : {}),
          ...(ser.doorCollection ? {doorCollection: ser.doorCollection} : {}),
          youtubeUrl: ser.youtubeUrl,
          summary: ser.summary,
          isCurrent: ser.isCurrent,
        });
      }

      for (const photo of DEFAULT_CHURCH_DATA.galleryPhotos) {
        upsertDefaultDoc('galleryPhotos', photo.id, {
          title: photo.title,
          eventLabel: photo.eventLabel,
          dateLabel: photo.dateLabel,
          imageUrl: photo.imageUrl,
          caption: photo.caption,
        });
      }

      for (const pr of DEFAULT_CHURCH_DATA.prayerRequests) {
        upsertDefaultDoc(
          'prayerRequests',
          pr.id,
          {
            personName: pr.personName,
            category: pr.category,
            request: pr.request,
            dateLabel: pr.dateLabel,
            prayingCount: pr.prayingCount,
            isAnswered: pr.isAnswered,
            isAnonymous: pr.isAnonymous,
          },
          true,
        );
      }

      batch.set(doc(db, 'churchContent', 'weeklyMessage'), {
        ...DEFAULT_CHURCH_DATA.weeklyMessage,
        isPublic: true,
        updatedBy: uid,
        updatedAt: now,
      });

      batch.set(doc(db, 'churchContent', 'settings'), {
        bankDetails: DEFAULT_CHURCH_DATA.bankDetails,
        contactInfo: DEFAULT_CHURCH_DATA.contactInfo,
        isPublic: true,
        updatedBy: uid,
        updatedAt: now,
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'initial-seed');
    }
  }, []);

  useEffect(() => {
    if (authReady && user && isAdmin) {
      void seedDatabaseIfEmpty(user.uid);
    }
  }, [authReady, user, isAdmin, seedDatabaseIfEmpty]);

  // Initial public snapshot read for visitors (one-shot) when signed out
  useEffect(() => {
    if (!authReady || user) return;

    const loadPublicOnce = async () => {
      try {
        const [
          evSnap,
          katSnap,
          annSnap,
          bdaySnap,
          wpSnap,
          serSnap,
          galSnap,
          prSnap,
          contentSnap,
        ] = await Promise.all([
          getDocs(query(collection(db, 'calendarEvents'), where('isPublic', '==', true))),
          getDocs(query(collection(db, 'catechismClasses'), where('isPublic', '==', true))),
          getDocs(query(collection(db, 'classAnnouncements'), where('isPublic', '==', true))),
          getDocs(query(collection(db, 'birthdays'), where('isPublic', '==', true))),
          getDocs(query(collection(db, 'weeklyProgram'), where('isPublic', '==', true))),
          getDocs(query(collection(db, 'sermons'), where('isPublic', '==', true))),
          getDocs(query(collection(db, 'galleryPhotos'), where('isPublic', '==', true))),
          getDocs(query(collection(db, 'prayerRequests'), where('isPublic', '==', true))),
          getDocs(query(collection(db, 'churchContent'), where('isPublic', '==', true))),
        ]);

        setData((prev) => {
          const next = {...prev};
          if (!evSnap.empty) {
            next.calendarEvents = evSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<CalendarEvent, 'id'>),
            }));
          }
          if (!katSnap.empty) {
            next.catechismClasses = katSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<CatechismClass, 'id'>),
            }));
          }
          if (!annSnap.empty) {
            next.classAnnouncements = annSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<ClassAnnouncement, 'id'>),
            }));
          }
          if (!bdaySnap.empty) {
            next.birthdays = bdaySnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<BirthdayEntry, 'id'>),
            }));
          }
          if (!wpSnap.empty) {
            next.weeklyProgram = wpSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<WeeklyProgramItem, 'id'>),
            }));
          }
          if (!serSnap.empty) {
            next.sermons = serSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<SundaySermon, 'id'>),
            }));
          }
          if (!galSnap.empty) {
            next.galleryPhotos = galSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<GalleryPhoto, 'id'>),
            }));
          }
          if (!prSnap.empty) {
            next.prayerRequests = prSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<PrayerRequest, 'id'>),
            }));
          }
          if (!contentSnap.empty) {
            for (const docSnap of contentSnap.docs) {
              if (docSnap.id === 'weeklyMessage') {
                const raw = docSnap.data() as WeeklyMessage;
                next.weeklyMessage = {
                  title: raw.title,
                  scripture: raw.scripture,
                  scriptureText: raw.scriptureText,
                  body: raw.body,
                  author: raw.author,
                  dateLabel: raw.dateLabel,
                };
              } else if (docSnap.id === 'settings') {
                const raw = docSnap.data() as {
                  bankDetails: BankDetails;
                  contactInfo: ContactInfo;
                };
                if (raw.bankDetails) next.bankDetails = raw.bankDetails;
                if (raw.contactInfo) {
                  next.contactInfo = {
                    ...DEFAULT_CHURCH_DATA.contactInfo,
                    ...raw.contactInfo,
                  };
                }
              }
            }
          }
          return next;
        });
      } catch {
        // Keep default fallback data if offline or unseeded
      }
    };

    void loadPublicOnce();
  }, [authReady, user]);

  // Attach real-time onSnapshot listeners only when auth is ready and user is authenticated
  useEffect(() => {
    if (!authReady || !user) return;

    const unsubs: Array<() => void> = [];

    unsubs.push(
      onSnapshot(
        query(collection(db, 'calendarEvents'), where('isPublic', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setData((prev) => ({
              ...prev,
              calendarEvents: snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<CalendarEvent, 'id'>),
              })),
            }));
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'calendarEvents'),
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'catechismClasses'), where('isPublic', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setData((prev) => ({
              ...prev,
              catechismClasses: snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<CatechismClass, 'id'>),
              })),
            }));
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'catechismClasses'),
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'classAnnouncements'), where('isPublic', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setData((prev) => ({
              ...prev,
              classAnnouncements: snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<ClassAnnouncement, 'id'>),
              })),
            }));
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'classAnnouncements'),
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'birthdays'), where('isPublic', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setData((prev) => ({
              ...prev,
              birthdays: snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<BirthdayEntry, 'id'>),
              })),
            }));
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'birthdays'),
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'weeklyProgram'), where('isPublic', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setData((prev) => ({
              ...prev,
              weeklyProgram: snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<WeeklyProgramItem, 'id'>),
              })),
            }));
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'weeklyProgram'),
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'sermons'), where('isPublic', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setData((prev) => ({
              ...prev,
              sermons: snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<SundaySermon, 'id'>),
              })),
            }));
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'sermons'),
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'galleryPhotos'), where('isPublic', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setData((prev) => ({
              ...prev,
              galleryPhotos: snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<GalleryPhoto, 'id'>),
              })),
            }));
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'galleryPhotos'),
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'prayerRequests'), where('isPublic', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setData((prev) => ({
              ...prev,
              prayerRequests: snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<PrayerRequest, 'id'>),
              })),
            }));
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'prayerRequests'),
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'churchContent'), where('isPublic', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setData((prev) => {
              const next = {...prev};
              for (const docSnap of snap.docs) {
                if (docSnap.id === 'weeklyMessage') {
                  const raw = docSnap.data() as WeeklyMessage;
                  next.weeklyMessage = {
                    title: raw.title,
                    scripture: raw.scripture,
                    scriptureText: raw.scriptureText,
                    body: raw.body,
                    author: raw.author,
                    dateLabel: raw.dateLabel,
                  };
                } else if (docSnap.id === 'settings') {
                  const raw = docSnap.data() as {
                    bankDetails: BankDetails;
                    contactInfo: ContactInfo;
                  };
                  if (raw.bankDetails) next.bankDetails = raw.bankDetails;
                  if (raw.contactInfo) {
                    next.contactInfo = {
                      ...DEFAULT_CHURCH_DATA.contactInfo,
                      ...raw.contactInfo,
                    };
                  }
                }
              }
              return next;
            });
          }
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'churchContent'),
      ),
    );

    // Private donation pledges scoped to current user (or all for bootstrap admin)
    const pledgesQuery =
      user.email === BOOTSTRAP_ADMIN_EMAIL
        ? collection(db, 'donationPledges')
        : query(
            collection(db, 'donationPledges'),
            where('ownerUid', '==', user.uid),
          );

    unsubs.push(
      onSnapshot(
        pledgesQuery,
        (snap) => {
          setData((prev) => ({
            ...prev,
            donations: snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<DonationRecord, 'id'>),
            })),
          }));
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'donationPledges'),
      ),
    );

    return () => {
      for (const unsub of unsubs) unsub();
    };
  }, [authReady, user]);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Kon nie met Google inteken nie.',
      );
      return false;
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const ensureSignedIn = async (): Promise<User | null> => {
    if (auth.currentUser && auth.currentUser.emailVerified) {
      return auth.currentUser;
    }
    const ok = await signInWithGoogle();
    return ok ? auth.currentUser : null;
  };

  // Mutations backed by Firestore when signed in, with defensive client validation
  const addCalendarEvent = async (ev: Omit<CalendarEvent, 'id'>) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser || !isAdmin) return;
    const id = makeSafeId('ev');
    const path = `calendarEvents/${id}`;
    try {
      await setDoc(doc(db, 'calendarEvents', id), {
        title: ev.title.slice(0, 120),
        date: ev.date,
        time: ev.time.slice(0, 30),
        location: ev.location.slice(0, 100),
        category: ev.category,
        description: ev.description.slice(0, 600),
        isPublic: true,
        createdBy: activeUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'calendarEvents', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `calendarEvents/${id}`);
    }
  };

  const addWeeklyProgramItem = async (item: Omit<WeeklyProgramItem, 'id'>) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser || !isAdmin) return;
    const id = makeSafeId('wp');
    try {
      await setDoc(doc(db, 'weeklyProgram', id), {
        dayOfWeek: item.dayOfWeek,
        time: item.time.slice(0, 30),
        title: item.title.slice(0, 140),
        location: item.location.slice(0, 100),
        leader: item.leader.slice(0, 100),
        ...(item.note ? {note: item.note.slice(0, 200)} : {}),
        isPublic: true,
        createdBy: activeUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `weeklyProgram/${id}`);
    }
  };

  const deleteWeeklyProgramItem = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'weeklyProgram', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `weeklyProgram/${id}`);
    }
  };

  const addBirthday = async (bday: Omit<BirthdayEntry, 'id' | 'wishedCount'>) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser || !isAdmin) return;
    const id = makeSafeId('bday');
    try {
      await setDoc(doc(db, 'birthdays', id), {
        name: bday.name.slice(0, 120),
        dayLabel: bday.dayLabel.slice(0, 30),
        dateStr: bday.dateStr.slice(0, 30),
        group: bday.group.slice(0, 60),
        wishedCount: 0,
        isPublic: true,
        createdBy: activeUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `birthdays/${id}`);
    }
  };

  const wishBirthday = async (id: string) => {
    // Immediate UI increment; syncs to Firestore if user is verified
    setData((prev) => ({
      ...prev,
      birthdays: prev.birthdays.map((b) =>
        b.id === id ? {...b, wishedCount: b.wishedCount + 1} : b,
      ),
    }));
    if (auth.currentUser?.emailVerified) {
      try {
        await updateDoc(doc(db, 'birthdays', id), {
          wishedCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `birthdays/${id}`);
      }
    }
  };

  const addClassAnnouncement = async (
    ann: Omit<ClassAnnouncement, 'id' | 'dateLabel'>,
  ) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser || !isAdmin) return;
    const id = makeSafeId('ann');
    try {
      await setDoc(doc(db, 'classAnnouncements', id), {
        gradeGroup: ann.gradeGroup,
        title: ann.title.slice(0, 140),
        message: ann.message.slice(0, 800),
        dateLabel: 'Vandag',
        author: ann.author.slice(0, 100),
        important: ann.important,
        isPublic: true,
        createdBy: activeUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `classAnnouncements/${id}`);
    }
  };

  const deleteClassAnnouncement = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'classAnnouncements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `classAnnouncements/${id}`);
    }
  };

  const updateSermon = async (updated: SundaySermon) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'sermons', updated.id), {
        dateLabel: updated.dateLabel.slice(0, 60),
        title: updated.title.slice(0, 160),
        theme: updated.theme.slice(0, 180),
        scripture: updated.scripture.slice(0, 120),
        preacher: updated.preacher.slice(0, 100),
        organist: (updated.organist || '').slice(0, 100),
        doorCollection: (updated.doorCollection || '').slice(0, 120),
        youtubeUrl: updated.youtubeUrl.slice(0, 300),
        summary: updated.summary.slice(0, 800),
        isCurrent: updated.isCurrent,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `sermons/${updated.id}`);
    }
  };

  const addSermon = async (newSermon: Omit<SundaySermon, 'id'>) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser || !isAdmin) return;
    const id = makeSafeId('ser');
    try {
      await setDoc(doc(db, 'sermons', id), {
        dateLabel: newSermon.dateLabel.slice(0, 60),
        title: newSermon.title.slice(0, 160),
        theme: newSermon.theme.slice(0, 180),
        scripture: newSermon.scripture.slice(0, 120),
        preacher: newSermon.preacher.slice(0, 100),
        ...(newSermon.organist
          ? {organist: newSermon.organist.slice(0, 100)}
          : {}),
        ...(newSermon.doorCollection
          ? {doorCollection: newSermon.doorCollection.slice(0, 120)}
          : {}),
        youtubeUrl: newSermon.youtubeUrl.slice(0, 300),
        summary: newSermon.summary.slice(0, 800),
        isCurrent: newSermon.isCurrent,
        isPublic: true,
        createdBy: activeUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `sermons/${id}`);
    }
  };

  const updateWeeklyMessage = async (updated: WeeklyMessage) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser || !isAdmin) return;
    try {
      await setDoc(doc(db, 'churchContent', 'weeklyMessage'), {
        title: updated.title.slice(0, 180),
        scripture: updated.scripture.slice(0, 100),
        scriptureText: updated.scriptureText.slice(0, 600),
        body: updated.body.slice(0, 15).map((p) => p.slice(0, 2000)),
        author: updated.author.slice(0, 100),
        dateLabel: updated.dateLabel.slice(0, 60),
        isPublic: true,
        updatedBy: activeUser.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        'churchContent/weeklyMessage',
      );
    }
  };

  const addGalleryPhoto = async (photo: Omit<GalleryPhoto, 'id'>) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser || !isAdmin) return;
    const id = makeSafeId('gal');
    try {
      await setDoc(doc(db, 'galleryPhotos', id), {
        title: photo.title.slice(0, 140),
        eventLabel: photo.eventLabel.slice(0, 100),
        dateLabel: photo.dateLabel.slice(0, 40),
        imageUrl: photo.imageUrl.slice(0, 500),
        caption: photo.caption.slice(0, 400),
        isPublic: true,
        createdBy: activeUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `galleryPhotos/${id}`);
    }
  };

  const deleteGalleryPhoto = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'galleryPhotos', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `galleryPhotos/${id}`);
    }
  };

  const updateFacebookUrl = async (facebookUrl: string) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser || !isAdmin) return;
    try {
      await setDoc(doc(db, 'churchContent', 'settings'), {
        bankDetails: data.bankDetails,
        contactInfo: {
          ...data.contactInfo,
          facebookUrl: facebookUrl.slice(0, 300),
        },
        isPublic: true,
        updatedBy: activeUser.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'churchContent/settings');
    }
  };

  const addPrayerRequest = async (
    req: Omit<PrayerRequest, 'id' | 'dateLabel' | 'prayingCount' | 'isAnswered'>,
  ) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser) return false;
    const id = makeSafeId('pr');
    try {
      await setDoc(doc(db, 'prayerRequests', id), {
        personName: req.personName.slice(0, 100),
        category: req.category,
        request: req.request.slice(0, 700),
        dateLabel: 'Vandag',
        prayingCount: 1,
        isAnswered: false,
        isAnonymous: req.isAnonymous,
        isPublic: true,
        authorUid: activeUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `prayerRequests/${id}`);
    }
  };

  const incrementPrayerCount = async (id: string) => {
    setData((prev) => ({
      ...prev,
      prayerRequests: prev.prayerRequests.map((p) =>
        p.id === id ? {...p, prayingCount: p.prayingCount + 1} : p,
      ),
    }));
    if (auth.currentUser?.emailVerified) {
      try {
        await updateDoc(doc(db, 'prayerRequests', id), {
          prayingCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `prayerRequests/${id}`);
      }
    }
  };

  const togglePrayerAnswered = async (id: string) => {
    if (!isAdmin) return;
    const current = data.prayerRequests.find((p) => p.id === id);
    if (!current) return;
    try {
      await updateDoc(doc(db, 'prayerRequests', id), {
        isAnswered: !current.isAnswered,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `prayerRequests/${id}`);
    }
  };

  const deletePrayerRequest = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'prayerRequests', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `prayerRequests/${id}`);
    }
  };

  const recordDonationPledge = async (
    pledge: Omit<DonationRecord, 'id' | 'dateLabel'>,
  ) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser) return false;
    const id = makeSafeId('don');
    try {
      await setDoc(doc(db, 'donationPledges', id), {
        fund: pledge.fund.slice(0, 80),
        amount: Math.max(1, Math.min(10000000, Number(pledge.amount))),
        reference: pledge.reference.slice(0, 80),
        method: pledge.method,
        dateLabel: 'Vandag',
        ownerUid: activeUser.uid,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `donationPledges/${id}`);
    }
  };

  const submitContactMessage = async (msg: {
    senderName: string;
    senderEmail: string;
    subject: string;
    message: string;
  }) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser) return false;
    const id = makeSafeId('msg');
    try {
      await setDoc(doc(db, 'contactMessages', id), {
        senderName: msg.senderName.slice(0, 100),
        senderEmail: msg.senderEmail.slice(0, 140),
        subject: msg.subject.slice(0, 100),
        message: msg.message.slice(0, 1200),
        status: 'Nuut',
        ownerUid: activeUser.uid,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `contactMessages/${id}`);
    }
  };

  const updateYoutubeChannelUrl = async (youtubeChannelUrl: string) => {
    const activeUser = await ensureSignedIn();
    if (!activeUser || !isAdmin) return;
    try {
      await setDoc(doc(db, 'churchContent', 'settings'), {
        bankDetails: data.bankDetails,
        contactInfo: {
          ...data.contactInfo,
          youtubeChannelUrl: youtubeChannelUrl.slice(0, 300),
        },
        isPublic: true,
        updatedBy: activeUser.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'churchContent/settings');
    }
  };

  return {
    data,
    user,
    authReady,
    isAdmin,
    authError,
    signInWithGoogle,
    signOutUser,
    addCalendarEvent,
    deleteCalendarEvent,
    addWeeklyProgramItem,
    deleteWeeklyProgramItem,
    addBirthday,
    wishBirthday,
    addClassAnnouncement,
    deleteClassAnnouncement,
    updateSermon,
    addSermon,
    updateWeeklyMessage,
    updateYoutubeChannelUrl,
    addGalleryPhoto,
    deleteGalleryPhoto,
    updateFacebookUrl,
    addPrayerRequest,
    incrementPrayerCount,
    togglePrayerAnswered,
    deletePrayerRequest,
    recordDonationPledge,
    submitContactMessage,
  };
}
