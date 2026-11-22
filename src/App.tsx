/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useEffect, useState} from 'react';
import {ErrorBoundary} from './components/ErrorBoundary';
import {Header} from './components/Header';
import {HeroSection} from './components/HeroSection';
import {SermonAndMessageSection} from './components/SermonAndMessageSection';
import {CalendarAndWeekSection} from './components/CalendarAndWeekSection';
import {CatechismSection} from './components/CatechismSection';
import {PrayerListSection} from './components/PrayerListSection';
import {GallerySection} from './components/GallerySection';
import {DonationsAndContactSection} from './components/DonationsAndContactSection';
import {Footer} from './components/Footer';
import {useChurchData} from './hooks/useChurchData';

function ChurchPortal() {
  const {
    data,
    user,
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
    addGalleryPhoto,
    deleteGalleryPhoto,
    updateFacebookUrl,
    addPrayerRequest,
    incrementPrayerCount,
    togglePrayerAnswered,
    deletePrayerRequest,
    recordDonationPledge,
    submitContactMessage,
  } = useChurchData();

  const [editMode, setEditMode] = useState(false);
  const [showInlinePlayer, setShowInlinePlayer] = useState(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Header onNavigate={handleNavigate} />

      {authError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-center text-xs text-red-800">
          {authError}
        </div>
      )}

      <main className="flex-1">
        <HeroSection
          editMode={editMode && isAdmin}
          isAdmin={isAdmin}
          userEmail={user?.email || null}
          onToggleEditMode={() => setEditMode((prev) => !prev)}
          onSignIn={signInWithGoogle}
          onSignOut={async () => {
            setEditMode(false);
            await signOutUser();
          }}
          onNavigate={handleNavigate}
          onPlayCurrentSermon={() => setShowInlinePlayer(true)}
        />

        <SermonAndMessageSection
          sermons={data.sermons}
          weeklyMessage={data.weeklyMessage}
          editMode={editMode && isAdmin}
          showInlinePlayer={showInlinePlayer}
          onSetShowInlinePlayer={setShowInlinePlayer}
          onUpdateSermon={updateSermon}
          onAddSermon={addSermon}
          onUpdateWeeklyMessage={updateWeeklyMessage}
        />

        <CalendarAndWeekSection
          calendarEvents={data.calendarEvents}
          weeklyProgram={data.weeklyProgram}
          birthdays={data.birthdays}
          editMode={editMode && isAdmin}
          isAdmin={isAdmin}
          onAddEvent={addCalendarEvent}
          onDeleteEvent={deleteCalendarEvent}
          onAddProgramItem={addWeeklyProgramItem}
          onDeleteProgramItem={deleteWeeklyProgramItem}
          onAddBirthday={addBirthday}
          onWishBirthday={wishBirthday}
        />

        <CatechismSection
          classes={data.catechismClasses}
          announcements={data.classAnnouncements}
          editMode={editMode && isAdmin}
          isAdmin={isAdmin}
          onAddAnnouncement={addClassAnnouncement}
          onDeleteAnnouncement={deleteClassAnnouncement}
        />

        <PrayerListSection
          requests={data.prayerRequests}
          isSignedIn={!!user}
          editMode={editMode && isAdmin}
          isAdmin={isAdmin}
          onAddRequest={addPrayerRequest}
          onPrayTogether={incrementPrayerCount}
          onToggleAnswered={togglePrayerAnswered}
          onDeleteRequest={deletePrayerRequest}
          onSignIn={signInWithGoogle}
        />

        <GallerySection
          photos={data.galleryPhotos}
          facebookUrl={
            data.contactInfo.facebookUrl ||
            'https://www.facebook.com/search/top?q=NG%20Kerk%20Bethlehem-Wes'
          }
          editMode={editMode && isAdmin}
          isAdmin={isAdmin}
          onAddPhoto={addGalleryPhoto}
          onDeletePhoto={deleteGalleryPhoto}
          onUpdateFacebookUrl={updateFacebookUrl}
        />

        <DonationsAndContactSection
          bankDetails={data.bankDetails}
          contactInfo={data.contactInfo}
          donations={data.donations}
          isSignedIn={!!user}
          onRecordDonation={recordDonationPledge}
          onSubmitContact={submitContactMessage}
          onSignIn={signInWithGoogle}
        />
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ChurchPortal />
    </ErrorBoundary>
  );
}
