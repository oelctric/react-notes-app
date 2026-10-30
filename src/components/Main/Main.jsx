import { useState } from "react";
import "./Main.css";
import NoteList from "../NoteList/NoteList";
import Preloader from "../Preloader/Preloader";
import { GUEST_NOTE_LIMIT, STORAGE_KEYS } from "../../utils/constants";

function readNoticeDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEYS.guestNotice) === "true";
  } catch {
    return false;
  }
}

function Main({
  isLoggedIn,
  keyword,
  searchResults,
  isSearching,
  searchError,
  myNotes,
  savedIds,
  onSave,
  onEdit,
  onClearSearch,
  onNewNoteClick,
  onSignUpClick,
}) {
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(readNoticeDismissed);

  function dismissNotice() {
    setIsNoticeDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEYS.guestNotice, "true");
    } catch {
      // Storage unavailable — the notice just comes back next visit.
    }
  }

  function renderNotes(notes, key) {
    return (
      <NoteList
        key={key}
        notes={notes}
        savedIds={savedIds}
        isLoggedIn={isLoggedIn}
        onSave={onSave}
        onEdit={onEdit}
      />
    );
  }

  function renderSearch() {
    if (isSearching) return <Preloader />;
    if (searchError) {
      return <p className="main__message main__message_type_error">{searchError}</p>;
    }
    if (searchResults.length === 0) {
      return (
        <div className="main__empty">
          <h3 className="main__empty-title">Nothing found</h3>
          <p className="main__message">
            Sorry, but nothing matched “{keyword}”. Try another keyword.
          </p>
        </div>
      );
    }
    return renderNotes(searchResults, keyword);
  }

  function renderWorkspace() {
    if (myNotes.length === 0) {
      return <p className="main__message">No notes yet. Create your first one!</p>;
    }
    return renderNotes(myNotes, "mine");
  }

  return (
    <main className="main">
      <section className="main__hero">
        <h1 className="main__title">
          A Custom Notes App <br className="main__break" />
          for Your Thoughts
        </h1>
        <button className="main__new-note" type="button" onClick={onNewNoteClick}>
          New Note
        </button>
      </section>

      <section className="main__notes" aria-live="polite">
        {!isLoggedIn && !isNoticeDismissed && (
          <div className="main__guest-notice">
            <p className="main__guest-text">
              <strong>You&apos;re using IdeaBinder as a guest.</strong> Notes are saved on this
              device only, up to {GUEST_NOTE_LIMIT}.{" "}
              <button className="main__guest-link" type="button" onClick={onSignUpClick}>
                Sign up
              </button>{" "}
              to keep them in your account, bookmark notes and attach images.
            </p>
            <button
              className="main__guest-dismiss"
              type="button"
              aria-label="Dismiss"
              onClick={dismissNotice}
            />
          </div>
        )}
        {keyword ? (
          <>
            <div className="main__notes-header">
              <h2 className="main__notes-title">Results for “{keyword}”</h2>
              <button className="main__clear" type="button" onClick={onClearSearch}>
                Clear search
              </button>
            </div>
            {renderSearch()}
          </>
        ) : (
          renderWorkspace()
        )}
      </section>
    </main>
  );
}

export default Main;
