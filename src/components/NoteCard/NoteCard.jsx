import "./NoteCard.css";
import { NOTE_COLORS } from "../../utils/constants";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function formatDate(isoDate) {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00`));
}

function BookmarkIcon({ filled }) {
  return (
    <svg className="note-card__bookmark-icon" width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
      <path
        d="M15.58 3.25c.49 0 .96.23 1.3.63.34.41.54.96.54 1.54v16.25c0 .19-.04.37-.12.54a.98.98 0 0 1-.33.4.86.86 0 0 1-.46.14.8.8 0 0 1-.46-.14l-4.13-2.8a1.66 1.66 0 0 0-1.82 0l-4.14 2.8a.8.8 0 0 1-.46.14.86.86 0 0 1-.46-.14.98.98 0 0 1-.33-.4 1.27 1.27 0 0 1-.12-.54V5.42c0-.58.19-1.13.54-1.54.34-.4.8-.63 1.3-.63h9.15Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Two card layouts from the Figma file:
// "home"    — created/updated dates, EDIT button, bookmark that becomes SAVE on hover
// "profile" — date, tags, filled bookmark, blue outline + SAVED badge on hover
function NoteCard({ note, variant = "home", isSaved, isLoggedIn, onSave, onEdit }) {
  const saveLabel = !isLoggedIn
    ? "Sign in to save notes"
    : isSaved
      ? "Remove from saved"
      : "Save note";
  const color = NOTE_COLORS[note.color] || NOTE_COLORS.default;
  const style = note.color && note.color !== "default" ? { backgroundColor: color.fill } : undefined;

  const bookmark = (
    <button
      className={`note-card__bookmark${isSaved ? " note-card__bookmark_active" : ""}`}
      type="button"
      aria-label={saveLabel}
      aria-pressed={isSaved}
      title={saveLabel}
      onClick={() => onSave(note)}
    >
      <BookmarkIcon filled={isSaved} />
      {variant === "home" && !isSaved && <span className="note-card__save-label">Save</span>}
    </button>
  );

  if (variant === "profile") {
    return (
      <article className={`note-card note-card_variant_profile${isSaved ? " note-card_saved" : ""}`} style={style}>
        <time className="note-card__date" dateTime={note.createdAt}>
          {formatDate(note.createdAt)}
        </time>
        <h3 className="note-card__title">
          {onEdit ? (
            <button className="note-card__title-button" type="button" onClick={() => onEdit(note)}>
              {note.title}
            </button>
          ) : (
            note.title
          )}
        </h3>
        <p className="note-card__text">{note.text}</p>
        <div className="note-card__footer">
          <ul className="note-card__tags">
            {note.tags.slice(0, 1).map((tag) => (
              <li key={tag} className="note-card__tag">
                #{tag}
              </li>
            ))}
            {isSaved && <li className="note-card__badge">✓ SAVED</li>}
          </ul>
          {bookmark}
        </div>
      </article>
    );
  }

  return (
    <article className="note-card note-card_variant_home" style={style}>
      <div className="note-card__dates">
        <time className="note-card__date" dateTime={note.createdAt}>
          {formatDate(note.createdAt)}
        </time>
        <time className="note-card__date note-card__date_type_updated" dateTime={note.updatedAt}>
          {formatDate(note.updatedAt)}
        </time>
      </div>
      <h3 className="note-card__title">{note.title}</h3>
      <p className="note-card__text">{note.text}</p>
      <div className="note-card__actions">
        {onEdit && (
          <button className="note-card__edit" type="button" onClick={() => onEdit(note)}>
            Edit
          </button>
        )}
        {bookmark}
      </div>
    </article>
  );
}

export default NoteCard;
