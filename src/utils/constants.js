export const API_BASE_URL = "https://dummyjson.com/posts";

export const SEARCH_RESULTS_LIMIT = 30;
export const NOTES_PER_PAGE = 8;

// Notes written without an account are stored under this owner id.
export const GUEST_ID = "guest";
export const GUEST_NOTE_LIMIT = 10;

export const STORAGE_KEYS = {
  guestNotice: "ideabinder-guest-notice-dismissed",
  token: "ideabinder-jwt",
  users: "ideabinder-users",
  notes: "ideabinder-notes",
  saved: "ideabinder-saved",
};

export const SEARCH_ERROR_MESSAGE =
  "Sorry, something went wrong during the request. Please try again later.";
export const EMPTY_SEARCH_MESSAGE = "Please enter a keyword";

export const TOAST_DURATION = 4000;

export const LOGIN_INITIAL_VALUES = { email: "", password: "" };
export const REGISTER_INITIAL_VALUES = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};
export const PROFILE_TABS = [
  { id: "mine", label: "My Notes" },
  { id: "saved", label: "Saved Notes" },
  { id: "tags", label: "Tags" },
];

// Note editor
export const AUTOSAVE_DELAY = 600;
export const MAX_IMAGE_BYTES = 1024 * 1024;
export const TABLE_GRID = { rows: 2, cols: 4 };
export const DEFAULT_TABLE_SIZE = { rows: 2, cols: 2 };

export const EDITOR_TOOLS = [
  { id: "format", label: "Text formatting", hasMenu: true },
  { id: "lists", label: "Lists", hasMenu: true },
  { id: "table", label: "Insert table", hasMenu: true },
  { id: "attach", label: "Attach image", hasMenu: false },
  { id: "draw", label: "Draw", hasMenu: false },
  { id: "palette", label: "Note color", hasMenu: true },
];

// Image attachments and drawings are account-only: they're large, and guest
// notes live in this browser's limited storage.
export const GUEST_LOCKED_TOOLS = ["attach", "draw"];

export const EDITOR_HEADINGS = [
  { tag: "h1", label: "Heading 1", hint: "#" },
  { tag: "h2", label: "Heading 2", hint: "##" },
  { tag: "h3", label: "Subheading", hint: "###" },
];

export const EDITOR_LISTS = [
  { id: "check", label: "Checkbox List" },
  { id: "bullet", label: "Bulleted List" },
  { id: "number", label: "Numbered List" },
];

export const EDITOR_STYLES = [
  { id: "bold", label: "B", command: "bold" },
  { id: "italic", label: "I", command: "italic" },
  { id: "strike", label: "S", command: "strikeThrough" },
  { id: "code", label: "</>" },
];

// Mirrors the cards in the Figma home screen. Shown to guests and used to
// seed a new account's notes.
export const DEFAULT_NOTES = [
  ["Project Ideas", "Research APIs for user recommendation system.", "Dev", "2026-10-28"],
  ["Project Starters", "Research APIs for user recommendation system.", "Dev", "2026-10-26"],
  ["Project Integration", "Research APIs for user recommendation system.", "Dev", "2026-10-25"],
  ["Project Meeting", "Research APIs for user data and collaboration.", "Work", "2026-10-23"],
  ["Recipe Ideas", "Research APIs for our recipe recommendation system.", "Food", "2026-10-24"],
  ["Meeting Minutes", "Research APIs for user planning, next steps and project updates.", "Work", "2026-10-23"],
  ["Level Up!", "Research APIs for user onboarding and skill tracking.", "Ideas", "2026-10-22"],
  ["Coding Notes", "Research APIs for user profiles and account settings.", "Dev", "2026-10-21"],
].map(([title, text, tag, date], i) => ({
  id: `sample-${i}`,
  title,
  text,
  content: `<p>${text}</p>`,
  tags: [tag],
  createdAt: date,
  updatedAt: date,
  color: "default",
  isSample: true,
}));

export const NOTE_COLORS = {
  default: { label: "Default", fill: "#ffffff", border: "#cbd5e1" },
  amber: { label: "Amber", fill: "#fde68a", border: "#fcd34d" },
  blue: { label: "Blue", fill: "#bfdbfe", border: "#93c5fd" },
  emerald: { label: "Emerald", fill: "#a7f3d0", border: "#6ee7b7" },
  purple: { label: "Purple", fill: "#e9d5ff", border: "#d8b4fe" },
  rose: { label: "Rose", fill: "#fecdd3", border: "#fda4af" },
};
