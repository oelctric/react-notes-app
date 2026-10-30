import { STORAGE_KEYS } from "./constants";

// Mock auth for stage 1. Each function returns a promise shaped like the
// real backend responses so the calling code won't change in stage 2.
function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || "[]");
}

function getPublicUser(user) {
  const publicUser = { ...user };
  delete publicUser.password;
  return publicUser;
}

export function register({ name, email, password }) {
  const users = getUsers();
  if (users.some((user) => user.email === email)) {
    return Promise.reject("This email is already registered");
  }
  const user = {
    _id: `user-${Date.now()}`,
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([...users, user]));
  return Promise.resolve(getPublicUser(user));
}

export function authorize({ email, password }) {
  const user = getUsers().find(
    (item) => item.email === email && item.password === password
  );
  if (!user) {
    return Promise.reject("Incorrect email or password");
  }
  return Promise.resolve({ token: `fake-jwt.${user._id}` });
}

export function checkToken(token) {
  const userId = token?.split(".")[1];
  const user = getUsers().find((item) => item._id === userId);
  if (!user) {
    return Promise.reject("Invalid token");
  }
  return Promise.resolve(getPublicUser(user));
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function setToken(token) {
  localStorage.setItem(STORAGE_KEYS.token, token);
}

export function removeToken() {
  localStorage.removeItem(STORAGE_KEYS.token);
}
