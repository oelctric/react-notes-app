import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "../Header/Header";
import Main from "../Main/Main";
import Profile from "../Profile/Profile";
import Footer from "../Footer/Footer";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";
import LoginModal from "../LoginModal/LoginModal";
import RegisterModal from "../RegisterModal/RegisterModal";
import NewNoteModal from "../NewNoteModal/NewNoteModal";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import * as api from "../../utils/api";
import * as auth from "../../utils/auth";
import {
  GUEST_ID,
  GUEST_NOTE_LIMIT,
  SEARCH_ERROR_MESSAGE,
  TOAST_DURATION,
} from "../../utils/constants";

function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingToken, setIsCheckingToken] = useState(() => Boolean(auth.getToken()));
  const [activeModal, setActiveModal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [modalNotice, setModalNotice] = useState("");
  const [toast, setToast] = useState("");
  const [editingNote, setEditingNote] = useState(null);

  const [myNotes, setMyNotes] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const isLoggedIn = Boolean(currentUser);
  const ownerId = currentUser?._id || GUEST_ID;

  useEffect(() => {
    const token = auth.getToken();
    if (!token) return;
    auth
      .checkToken(token)
      .then(setCurrentUser)
      .catch(() => auth.removeToken())
      .finally(() => setIsCheckingToken(false));
  }, []);

  // Guests get notes too — stored on this device under GUEST_ID.
  useEffect(() => {
    if (isCheckingToken) return;
    Promise.all([
      api.getMyNotes(ownerId),
      isLoggedIn ? api.getSavedNotes(ownerId) : Promise.resolve([]),
    ])
      .then(([notes, saved]) => {
        setMyNotes(notes);
        setSavedNotes(saved);
      })
      .catch(console.error);
  }, [ownerId, isLoggedIn, isCheckingToken]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  const closeActiveModal = useCallback(() => {
    setActiveModal("");
    setAuthError("");
    setModalNotice("");
  }, []);

  const openModal = useCallback((name, notice = "") => {
    setAuthError("");
    setModalNotice(notice);
    setActiveModal(name);
  }, []);

  const openLoginModal = useCallback(() => openModal("login"), [openModal]);

  function handleSearch(query) {
    setKeyword(query);
    setIsSearching(true);
    setSearchError("");
    navigate("/");
    api
      .fetchNotes(query)
      .then(setSearchResults)
      .catch((err) => {
        console.error(err);
        setSearchResults([]);
        setSearchError(SEARCH_ERROR_MESSAGE);
      })
      .finally(() => setIsSearching(false));
  }

  function handleClearSearch() {
    setKeyword("");
    setSearchResults([]);
    setSearchError("");
  }

  // Logs in, then moves any notes written as a guest into the account.
  function signIn(credentials) {
    let user;
    return auth
      .authorize(credentials)
      .then(({ token }) => {
        auth.setToken(token);
        return auth.checkToken(token);
      })
      .then((data) => {
        user = data;
        return api.migrateGuestNotes(user._id);
      })
      .then((movedCount) => {
        if (movedCount > 0) {
          setToast(
            `Moved ${movedCount} note${movedCount === 1 ? "" : "s"} from this device into your account`
          );
        }
        return user;
      });
  }

  function handleLogin(credentials) {
    setIsSubmitting(true);
    signIn(credentials)
      .then((user) => {
        setCurrentUser(user);
        closeActiveModal();
      })
      .catch(setAuthError)
      .finally(() => setIsSubmitting(false));
  }

  function handleRegister({ name, email, password }) {
    setIsSubmitting(true);
    auth
      .register({ name, email, password })
      .then(() => signIn({ email, password }))
      .then((user) => {
        setCurrentUser(user);
        closeActiveModal();
      })
      .catch(setAuthError)
      .finally(() => setIsSubmitting(false));
  }

  function handleLogout() {
    auth.removeToken();
    setCurrentUser(null);
    setSavedNotes([]);
    navigate("/");
  }

  const handleSaveNote = useCallback(
    (fields, noteId) => {
      const request = noteId
        ? api.updateNote(ownerId, noteId, fields)
        : api.createNote(ownerId, fields);
      return request.then((saved) => {
        setMyNotes((notes) =>
          noteId ? notes.map((note) => (note.id === noteId ? saved : note)) : [saved, ...notes]
        );
        setSavedNotes((notes) => notes.map((note) => (note.id === saved.id ? saved : note)));
        return saved;
      });
    },
    [ownerId]
  );

  const handleDeleteNote = useCallback(
    (noteId) => {
      api
        .deleteNote(ownerId, noteId)
        .then((id) => setMyNotes((notes) => notes.filter((note) => note.id !== id)))
        .catch(console.error);
    },
    [ownerId]
  );

  function handleEditNote(note) {
    setEditingNote(note);
    openModal("note");
  }

  function handleToggleSave(note) {
    if (!isLoggedIn) {
      openModal("login", "Log in to save notes to your account.");
      return;
    }
    const isSaved = savedNotes.some((item) => item.id === note.id);
    const request = isSaved
      ? api
          .removeSavedNote(currentUser._id, note.id)
          .then((id) => setSavedNotes((notes) => notes.filter((item) => item.id !== id)))
      : api
          .saveNote(currentUser._id, note)
          .then((saved) => setSavedNotes((notes) => [saved, ...notes]));
    request.catch(console.error);
  }

  const guestNoteCount = isLoggedIn ? 0 : myNotes.filter((note) => !note.isSample).length;
  const isAtGuestLimit = guestNoteCount >= GUEST_NOTE_LIMIT;

  function handleNewNoteClick() {
    if (isAtGuestLimit) {
      openModal(
        "register",
        `Guests can keep up to ${GUEST_NOTE_LIMIT} notes. Sign up for unlimited notes — the ones you wrote come with you.`
      );
      return;
    }
    setEditingNote(null);
    openModal("note");
  }

  const savedIds = new Set(savedNotes.map((note) => note.id));

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header
          isLoggedIn={isLoggedIn}
          onSearch={handleSearch}
          onLoginClick={openLoginModal}
          onLogout={handleLogout}
        />
        <Routes>
          <Route
            path="/"
            element={
              <Main
                isLoggedIn={isLoggedIn}
                keyword={keyword}
                searchResults={searchResults}
                isSearching={isSearching}
                searchError={searchError}
                myNotes={myNotes}
                savedIds={savedIds}
                onSave={handleToggleSave}
                onEdit={handleEditNote}
                onClearSearch={handleClearSearch}
                onSignUpClick={() => openModal("register")}
                onNewNoteClick={handleNewNoteClick}
              />
            }
          />
          {["/profile", "/saved-notes"].map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  isCheckingToken={isCheckingToken}
                  onUnauthorized={openLoginModal}
                >
                  <Profile
                    key={path}
                    initialTab={path === "/saved-notes" ? "saved" : "mine"}
                    myNotes={myNotes}
                    savedNotes={savedNotes}
                    savedIds={savedIds}
                    onSave={handleToggleSave}
                    onEdit={handleEditNote}
                    onNewNoteClick={handleNewNoteClick}
                  />
                </ProtectedRoute>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />

        <LoginModal
          isOpen={activeModal === "login"}
          onClose={closeActiveModal}
          onLogin={handleLogin}
          onSwitch={() => openModal("register")}
          isSubmitting={isSubmitting}
          serverError={authError}
          notice={modalNotice}
        />
        <RegisterModal
          isOpen={activeModal === "register"}
          onClose={closeActiveModal}
          onRegister={handleRegister}
          onSwitch={() => openModal("login")}
          isSubmitting={isSubmitting}
          serverError={authError}
          notice={modalNotice}
        />
        {activeModal === "note" && (
          <NewNoteModal
            key={editingNote?.id || "new"}
            isOpen
            note={editingNote}
            isGuest={!isLoggedIn}
            onClose={closeActiveModal}
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
          />
        )}

        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
