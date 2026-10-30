import { useCallback, useEffect, useRef, useState } from "react";
import "./NewNoteModal.css";
import {
  AUTOSAVE_DELAY,
  DEFAULT_TABLE_SIZE,
  EDITOR_HEADINGS,
  EDITOR_LISTS,
  EDITOR_STYLES,
  EDITOR_TOOLS,
  GUEST_LOCKED_TOOLS,
  MAX_IMAGE_BYTES,
  NOTE_COLORS,
  TABLE_GRID,
} from "../../utils/constants";

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function formatDate(isoDate) {
  return dateFormatter.format(isoDate ? new Date(`${isoDate}T00:00:00`) : new Date());
}

function Icon({ children, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function renderToolIcon(id) {
  switch (id) {
    case "format":
      return (
        <>
          <path d="M4 19L10 5h4l6 14" />
          <path d="M7 14h10" />
        </>
      );
    case "lists":
      return (
        <>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </>
      );
    case "table":
      return (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </>
      );
    case "attach":
      return (
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
      );
    case "draw":
      return (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </>
      );
    default:
      return (
        <>
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.38-.42-.6-.98-.6-1.57 0-1.24 1.01-2.26 2.26-2.26H18c3.31 0 6-2.69 6-6 0-4.96-5.38-9-12-9z" />
        </>
      );
  }
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function buildTable(rows, cols) {
  const cells = "<td><br></td>".repeat(cols);
  return `<table><tbody>${`<tr>${cells}</tr>`.repeat(rows)}</tbody></table><p><br></p>`;
}

function NewNoteModal({ isOpen, note, isGuest, onClose, onSave, onDelete }) {
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const savedRangeRef = useRef(null);
  const timerRef = useRef(null);
  const noteIdRef = useRef(note?.id || null);
  const draftRef = useRef({ title: note?.title || "", tags: note?.tags || [], color: note?.color || "default" });

  const [title, setTitle] = useState(note?.title || "");
  const [tags, setTags] = useState(note?.tags || []);
  const [color, setColor] = useState(note?.color || "default");
  const [status, setStatus] = useState(note ? "saved" : "idle");
  const [editedThisSession, setEditedThisSession] = useState(false);
  const [openMenu, setOpenMenu] = useState("");
  const [tableSize, setTableSize] = useState(DEFAULT_TABLE_SIZE);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    draftRef.current = { title, tags, color };
  }, [title, tags, color]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.innerHTML = note?.content || "";
    // Only on mount: the editor owns the DOM after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistNote = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    const body = bodyRef.current;
    if (!body) return Promise.resolve();
    const text = body.innerText.replace(/\n{2,}/g, "\n").trim();
    const { title: currentTitle, tags: currentTags, color: currentColor } = draftRef.current;
    const isEmpty = !currentTitle.trim() && !text && !body.querySelector("img, table");

    if (isEmpty) {
      setStatus(noteIdRef.current ? "saved" : "idle");
      return Promise.resolve();
    }

    setStatus("saving");
    return onSave(
      {
        title: currentTitle.trim() || "Untitled",
        content: body.innerHTML,
        text,
        tags: currentTags,
        color: currentColor,
      },
      noteIdRef.current
    )
      .then((saved) => {
        noteIdRef.current = saved.id;
        setStatus("saved");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, [onSave]);

  const scheduleSave = useCallback(() => {
    setEditedThisSession(true);
    setStatus("saving");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(persistNote, AUTOSAVE_DELAY);
  }, [persistNote]);

  // State changes (title, tags, color) trigger a save after render so
  // persistNote() reads the latest values.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scheduleSave();
  }, [title, tags, color, scheduleSave]);

  const handleClose = useCallback(() => {
    const body = bodyRef.current;
    const isEmpty =
      body &&
      !draftRef.current.title.trim() &&
      !body.innerText.trim() &&
      !body.querySelector("img, table");
    const hasPendingSave = timerRef.current !== null;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    if (isEmpty && noteIdRef.current) {
      onDelete(noteIdRef.current);
    } else if (hasPendingSave) {
      persistNote();
    }
    onClose();
  }, [onClose, onDelete, persistNote]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key !== "Escape") return;
      if (openMenu) setOpenMenu("");
      else if (isDrawing) setIsDrawing(false);
      else handleClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, openMenu, isDrawing, handleClose]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!isOpen) return null;

  function rememberSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount && bodyRef.current.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    const body = bodyRef.current;
    body.focus();
    const selection = window.getSelection();
    selection.removeAllRanges();
    if (savedRangeRef.current) {
      selection.addRange(savedRangeRef.current);
    } else {
      const range = document.createRange();
      range.selectNodeContents(body);
      range.collapse(false);
      selection.addRange(range);
    }
  }

  function runCommand(command, value) {
    restoreSelection();
    document.execCommand(command, false, value);
    rememberSelection();
    setOpenMenu("");
    scheduleSave();
  }

  function insertHtml(html) {
    runCommand("insertHTML", html);
  }

  function handleToolClick(id) {
    if (id === "attach") {
      setOpenMenu("");
      fileInputRef.current.click();
      return;
    }
    if (id === "draw") {
      setOpenMenu("");
      setIsDrawing(true);
      return;
    }
    setOpenMenu((current) => (current === id ? "" : id));
  }

  function handleStyle(style) {
    if (style.command) {
      runCommand(style.command);
      return;
    }
    const selected = window.getSelection().toString() || "code";
    insertHtml(`<code>${escapeHtml(selected)}</code>&#8203;`);
  }

  function handleList(id) {
    if (id === "check") insertHtml('<ul class="checklist"><li><br></li></ul>');
    else runCommand(id === "bullet" ? "insertUnorderedList" : "insertOrderedList");
  }

  function handleFile(evt) {
    const file = evt.target.files[0];
    evt.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_BYTES) {
      insertHtml(`<p>📎 ${escapeHtml(file.name)}</p>`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => insertHtml(`<img src="${reader.result}" alt="${escapeHtml(file.name)}"><p><br></p>`);
    reader.readAsDataURL(file);
  }

  function handleBodyClick(evt) {
    const item = evt.target.closest(".note-editor__body ul.checklist > li");
    if (!item) return;
    const { left } = item.getBoundingClientRect();
    if (evt.clientX - left <= 28) {
      evt.preventDefault();
      item.toggleAttribute("data-checked");
      scheduleSave();
    }
  }

  function handleBodyKeyDown(evt) {
    if (evt.key !== "Enter") return;
    // A new checklist item should start unchecked.
    setTimeout(() => {
      const node = window.getSelection().anchorNode;
      const item = node && (node.nodeType === 1 ? node : node.parentElement).closest("ul.checklist > li");
      if (item && !item.textContent.trim()) item.removeAttribute("data-checked");
    });
  }

  function handlePaste(evt) {
    evt.preventDefault();
    document.execCommand("insertText", false, evt.clipboardData.getData("text/plain"));
  }

  function commitTag() {
    const value = tagDraft.replace(/^#/, "").trim();
    if (value && !tags.includes(value)) setTags([...tags, value]);
    setTagDraft("");
    setIsAddingTag(false);
  }

  function startStroke(evt) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#15191c";
    ctx.beginPath();
    ctx.moveTo((evt.clientX - rect.left) * scale, (evt.clientY - rect.top) * scale);
    canvas.setPointerCapture(evt.pointerId);
    canvas.dataset.active = "true";
  }

  function moveStroke(evt) {
    const canvas = canvasRef.current;
    if (canvas.dataset.active !== "true") return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    ctx.lineTo((evt.clientX - rect.left) * scale, (evt.clientY - rect.top) * scale);
    ctx.stroke();
  }

  function endStroke() {
    canvasRef.current.dataset.active = "false";
  }

  function insertDrawing() {
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setIsDrawing(false);
    insertHtml(`<img src="${dataUrl}" alt="Drawing"><p><br></p>`);
  }

  const meta = editedThisSession
    ? "Edited just now"
    : note
      ? `Edited ${formatDate(note.updatedAt)}`
      : "New note";
  const statusLabel = {
    saving: "Saving…",
    saved: isGuest ? "Saved on this device" : "Saved",
    error: "Not saved",
  }[status];
  const activeTool = openMenu || "format";
  const tint = color !== "default" ? NOTE_COLORS[color].fill : undefined;

  return (
    <div className="note-modal" onMouseDown={(e) => e.target === e.currentTarget && handleClose()}>
      <div
        className="note-editor"
        role="dialog"
        aria-modal="true"
        aria-label={note ? "Edit note" : "New note"}
        style={tint ? { backgroundColor: tint } : undefined}
      >
        <div className="note-editor__toolbar">
          <div className="note-editor__tools" role="toolbar" aria-label="Formatting">
            {EDITOR_TOOLS.map((tool) => {
              const isLocked = isGuest && GUEST_LOCKED_TOOLS.includes(tool.id);
              const label = isLocked ? `${tool.label} — sign up to use` : tool.label;
              return (
              <button
                key={tool.id}
                className={`note-editor__tool${activeTool === tool.id ? " note-editor__tool_active" : ""}${
                  isLocked ? " note-editor__tool_locked" : ""
                }`}
                type="button"
                title={label}
                aria-label={label}
                disabled={isLocked}
                aria-haspopup={tool.hasMenu || undefined}
                aria-expanded={openMenu === tool.id || undefined}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleToolClick(tool.id)}
              >
                <Icon>{renderToolIcon(tool.id)}</Icon>
              </button>
              );
            })}
          </div>
          <div className="note-editor__status">
            {statusLabel && (
              <span className={`note-editor__saved note-editor__saved_state_${status}`} role="status">
                {status === "saved" && (
                  <Icon size={16}>
                    <path strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </Icon>
                )}
                {statusLabel}
              </span>
            )}
            <button
              className="note-editor__close"
              type="button"
              title="Close & save note"
              aria-label="Close and save note"
              onClick={handleClose}
            >
              <Icon>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </Icon>
            </button>
          </div>
        </div>

        {openMenu === "format" && (
          <div className="note-menu note-menu_type_format" role="menu">
            <p className="note-menu__label">Hierarchy</p>
            {EDITOR_HEADINGS.map((heading) => (
              <button
                key={heading.tag}
                className={`note-menu__heading note-menu__heading_type_${heading.tag}`}
                type="button"
                role="menuitem"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand("formatBlock", heading.tag)}
              >
                <span>{heading.label}</span>
                <span className="note-menu__hint">{heading.hint}</span>
              </button>
            ))}
            <div className="note-menu__divider" />
            <p className="note-menu__label">Style</p>
            <div className="note-menu__styles">
              {EDITOR_STYLES.map((style) => (
                <button
                  key={style.id}
                  className={`note-menu__style note-menu__style_type_${style.id}`}
                  type="button"
                  aria-label={style.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleStyle(style)}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {openMenu === "lists" && (
          <div className="note-menu note-menu_type_lists" role="menu">
            {EDITOR_LISTS.map((item) => (
              <button
                key={item.id}
                className="note-menu__item"
                type="button"
                role="menuitem"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleList(item.id)}
              >
                <span className={`note-menu__glyph note-menu__glyph_type_${item.id}`} aria-hidden="true">
                  {item.id === "number" ? "1." : item.id === "check" ? "✓" : ""}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        )}

        {openMenu === "table" && (
          <div className="note-menu note-menu_type_table" role="menu">
            <p className="note-menu__label">Insert table</p>
            <div className="note-menu__grid" onMouseLeave={() => setTableSize(DEFAULT_TABLE_SIZE)}>
              {Array.from({ length: TABLE_GRID.rows * TABLE_GRID.cols }, (_, i) => {
                const row = Math.floor(i / TABLE_GRID.cols) + 1;
                const col = (i % TABLE_GRID.cols) + 1;
                const isOn = row <= tableSize.rows && col <= tableSize.cols;
                return (
                  <button
                    key={i}
                    className={`note-menu__cell${isOn ? " note-menu__cell_active" : ""}`}
                    type="button"
                    aria-label={`${col} x ${row} table`}
                    onMouseEnter={() => setTableSize({ rows: row, cols: col })}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertHtml(buildTable(row, col))}
                  />
                );
              })}
            </div>
            <p className="note-menu__size">
              {tableSize.cols} x {tableSize.rows} Table
            </p>
          </div>
        )}

        {openMenu === "palette" && (
          <div className="note-menu note-menu_type_palette" role="menu">
            {Object.entries(NOTE_COLORS).map(([id, swatch]) => (
              <button
                key={id}
                className={`note-menu__swatch${color === id ? " note-menu__swatch_active" : ""}`}
                type="button"
                aria-label={swatch.label}
                aria-pressed={color === id}
                style={{ backgroundColor: swatch.fill, borderColor: swatch.border }}
                onClick={() => {
                  setColor(id);
                  setOpenMenu("");
                }}
              />
            ))}
          </div>
        )}

        <div className="note-editor__content" onMouseDown={() => openMenu && setOpenMenu("")}>
          <input
            className="note-editor__title"
            type="text"
            placeholder="Title"
            aria-label="Note title"
            maxLength={80}
            value={title}
            onChange={(evt) => setTitle(evt.target.value)}
          />
          <p className="note-editor__meta">
            {`${formatDate(note?.createdAt)}  ·  ${meta}`}
          </p>
          <div
            ref={bodyRef}
            className="note-editor__body"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Note text"
            data-placeholder="Start writing…"
            onInput={scheduleSave}
            onKeyUp={rememberSelection}
            onMouseUp={rememberSelection}
            onClick={handleBodyClick}
            onKeyDown={handleBodyKeyDown}
            onPaste={handlePaste}
          />
          {isDrawing && (
            <div className="note-editor__drawing">
              <canvas
                ref={canvasRef}
                className="note-editor__canvas"
                width="1520"
                height="560"
                onPointerDown={startStroke}
                onPointerMove={moveStroke}
                onPointerUp={endStroke}
                onPointerCancel={endStroke}
              />
              <div className="note-editor__drawing-actions">
                <button className="note-editor__text-button" type="button" onClick={() => setIsDrawing(false)}>
                  Cancel
                </button>
                <button className="note-editor__text-button note-editor__text-button_primary" type="button" onClick={insertDrawing}>
                  Insert drawing
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="note-editor__footer">
          <ul className="note-editor__tags">
            {tags.map((tag) => (
              <li key={tag}>
                <button
                  className="note-editor__tag"
                  type="button"
                  title="Remove tag"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => setTags(tags.filter((item) => item !== tag))}
                >
                  #{tag}
                </button>
              </li>
            ))}
            <li>
              {isAddingTag ? (
                <input
                  className="note-editor__tag note-editor__tag_type_input"
                  type="text"
                  aria-label="New tag"
                  placeholder="#tag"
                  autoFocus
                  maxLength={24}
                  value={tagDraft}
                  onChange={(evt) => setTagDraft(evt.target.value.replace(/[\s,]/g, ""))}
                  onBlur={commitTag}
                  onKeyDown={(evt) => {
                    if (evt.key === "Enter" || evt.key === ",") {
                      evt.preventDefault();
                      commitTag();
                    }
                    if (evt.key === "Escape") {
                      evt.stopPropagation();
                      setTagDraft("");
                      setIsAddingTag(false);
                    }
                  }}
                />
              ) : (
                <button
                  className="note-editor__tag note-editor__tag_type_add"
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                >
                  + Add tag
                </button>
              )}
            </li>
          </ul>
        </div>

        <input
          ref={fileInputRef}
          className="note-editor__file"
          type="file"
          accept="image/*"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

export default NewNoteModal;
