const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

const userSocketIds = new Map();
const socketToUserId = new Map();
const userLastSeenAt = new Map();

const toIso = (value) => {
  if (!value) return null;
  return new Date(value).toISOString();
};

const markUserActive = (userId) => {
  if (!userId) return;
  userLastSeenAt.set(String(userId), Date.now());
};

const registerUserSocket = (userId, socketId) => {
  if (!userId || !socketId) return;
  const normalizedUserId = String(userId);
  const normalizedSocketId = String(socketId);
  const sockets = userSocketIds.get(normalizedUserId) || new Set();
  sockets.add(normalizedSocketId);
  userSocketIds.set(normalizedUserId, sockets);
  socketToUserId.set(normalizedSocketId, normalizedUserId);
  markUserActive(normalizedUserId);
};

const unregisterSocket = (socketId) => {
  if (!socketId) return;
  const normalizedSocketId = String(socketId);
  const userId = socketToUserId.get(normalizedSocketId);
  socketToUserId.delete(normalizedSocketId);

  if (!userId) return;

  const sockets = userSocketIds.get(userId);
  if (!sockets) return;
  sockets.delete(normalizedSocketId);

  if (sockets.size === 0) {
    userSocketIds.delete(userId);
    markUserActive(userId);
    return;
  }

  userSocketIds.set(userId, sockets);
};

const getUserPresence = (userId) => {
  const normalizedUserId = String(userId || "");
  const sockets = userSocketIds.get(normalizedUserId);
  const hasSocketConnection = Boolean(sockets && sockets.size > 0);
  const lastSeenAtMs = userLastSeenAt.get(normalizedUserId) || null;
  const isActiveRecently = lastSeenAtMs
    ? Date.now() - lastSeenAtMs <= ACTIVE_WINDOW_MS
    : false;

  return {
    is_online: hasSocketConnection,
    is_active: hasSocketConnection || isActiveRecently,
    last_seen_at: toIso(lastSeenAtMs),
  };
};

const getPresenceForUsers = (userIds = []) => {
  return userIds.reduce((acc, userId) => {
    acc[String(userId)] = getUserPresence(userId);
    return acc;
  }, {});
};

module.exports = {
  markUserActive,
  registerUserSocket,
  unregisterSocket,
  getUserPresence,
  getPresenceForUsers,
  ACTIVE_WINDOW_MS,
};
