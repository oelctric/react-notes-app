import { useState } from "react";
import "./NoteList.css";
import NoteCard from "../NoteCard/NoteCard";
import { NOTES_PER_PAGE } from "../../utils/constants";

function NoteList({ notes, variant = "home", savedIds, isLoggedIn, onSave, onEdit }) {
  const [visibleCount, setVisibleCount] = useState(NOTES_PER_PAGE);

  return (
    <div className={`note-list note-list_variant_${variant}`}>
      <ul className="note-list__grid">
        {notes.slice(0, visibleCount).map((note) => (
          <li key={note.id} className="note-list__item">
            <NoteCard
              note={note}
              variant={variant}
              isSaved={savedIds.has(note.id)}
              isLoggedIn={isLoggedIn}
              onSave={onSave}
              onEdit={note.isOwn ? onEdit : undefined}
            />
          </li>
        ))}
      </ul>
      {visibleCount < notes.length && (
        <button
          className="note-list__more"
          type="button"
          onClick={() => setVisibleCount((count) => count + NOTES_PER_PAGE)}
        >
          Show more
        </button>
      )}
    </div>
  );
}

export default NoteList;
