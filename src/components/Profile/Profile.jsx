import { useContext, useState } from "react";
import "./Profile.css";
import NoteList from "../NoteList/NoteList";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { PROFILE_TABS } from "../../utils/constants";

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Profile({ initialTab, myNotes, savedNotes, savedIds, onSave, onEdit, onNewNoteClick }) {
  const currentUser = useContext(CurrentUserContext);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeTag, setActiveTag] = useState("");

  const myIds = new Set(myNotes.map((note) => note.id));
  const allNotes = [...myNotes, ...savedNotes.filter((note) => !myIds.has(note.id))];
  const tagCounts = allNotes.reduce((counts, note) => {
    note.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    return counts;
  }, new Map());
  const username = currentUser.email.split("@")[0];
  const memberSince = new Date(currentUser.createdAt).getFullYear();

  function renderNotes(notes, key) {
    return (
      <NoteList
        key={key}
        variant="profile"
        notes={notes}
        savedIds={savedIds}
        isLoggedIn
        onSave={onSave}
        onEdit={onEdit}
      />
    );
  }

  function renderTab() {
    if (activeTab === "tags") {
      if (tagCounts.size === 0) {
        return <p className="profile__empty">No tags yet.</p>;
      }
      return (
        <>
          <ul className="profile__tags">
            {[...tagCounts].map(([tag, count]) => (
              <li key={tag}>
                <button
                  className={`profile__tag${tag === activeTag ? " profile__tag_active" : ""}`}
                  type="button"
                  aria-pressed={tag === activeTag}
                  onClick={() => setActiveTag(tag === activeTag ? "" : tag)}
                >
                  #{tag} <span className="profile__tag-count">{count}</span>
                </button>
              </li>
            ))}
          </ul>
          {activeTag &&
            renderNotes(
              allNotes.filter((note) => note.tags.includes(activeTag)),
              activeTag
            )}
        </>
      );
    }

    const notes = activeTab === "saved" ? savedNotes : myNotes;
    if (notes.length === 0) {
      return activeTab === "saved" ? (
        <p className="profile__empty">
          You haven&apos;t saved any notes yet. Search for a topic and tap the bookmark to keep it here.
        </p>
      ) : (
        <div className="profile__empty">
          <p>You haven&apos;t written any notes yet.</p>
          <button className="profile__new-note" type="button" onClick={onNewNoteClick}>
            New Note
          </button>
        </div>
      );
    }
    return renderNotes(notes, activeTab);
  }

  return (
    <main className="profile">
      <section className="profile__header">
        <div className="profile__user">
          <div className="profile__avatar" aria-hidden="true">
            {getInitials(currentUser.name)}
          </div>
          <div className="profile__info">
            <h1 className="profile__name">
              {currentUser.name}
              <span className="profile__username">(@{username})</span>
            </h1>
            <p className="profile__stats">
              <span>Member since: {memberSince}</span>
              <span>Total notes: {myNotes.length}</span>
              <span>Saved notes: {savedNotes.length}</span>
            </p>
          </div>
        </div>
        <div className="profile__tabs" role="tablist">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`profile__tab${activeTab === tab.id ? " profile__tab_active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>
      <section className="profile__notes">{renderTab()}</section>
    </main>
  );
}

export default Profile;
