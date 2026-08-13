const USERS_KEY = 'hk-system-users';

export const USER_ROLES = ['Admin', 'Gestão', 'Treinador', 'Saúde', 'Manejo', 'Veterinário'];

export async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function loadSystemUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY));
    if (Array.isArray(stored) && stored.length) return stored;
  } catch { /* usa o administrador inicial */ }
  const users = [{ id: 'admin-default', name: 'Equipe HK', login: 'equipe@helenkeller.local', role: 'Admin', active: true, passwordHash: await hashPassword('demo123'), createdAt: '12/08/2026' }];
  saveSystemUsers(users);
  return users;
}

export function saveSystemUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function authenticateUser(login, password) {
  const users = await loadSystemUsers();
  const passwordHash = await hashPassword(password);
  return users.find((user) => user.active && user.login.toLowerCase() === login.trim().toLowerCase() && user.passwordHash === passwordHash) || null;
}
