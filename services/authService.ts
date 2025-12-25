
import { UserProfile, UserRole } from "../types";

const AUTH_KEY = 'civicwatch_auth_session';
const USER_DB_KEY = 'civicwatch_users_registry';

const initializeRegistry = () => {
  const existing = localStorage.getItem(USER_DB_KEY);
  if (!existing) {
    const defaultUsers: UserProfile[] = [
      {
        uid: 'demo-citizen-id',
        email: 'citizen@civic.gov',
        role: UserRole.CITIZEN,
        createdAt: Date.now(),
        displayName: 'John Citizen',
        trustScore: 85
      },
      {
        uid: 'demo-authority-id',
        email: 'authority@civic.gov',
        role: UserRole.AUTHORITY,
        createdAt: Date.now(),
        displayName: 'Chief Inspector',
        trustScore: 100
      },
      {
        uid: 'demo-admin-id',
        email: 'admin@civic.gov',
        role: UserRole.ADMIN,
        createdAt: Date.now(),
        displayName: 'System Admin',
        trustScore: 100
      }
    ];
    localStorage.setItem(USER_DB_KEY, JSON.stringify(defaultUsers));
  }
};

initializeRegistry();

export const getCurrentUser = (): UserProfile | null => {
  const session = localStorage.getItem(AUTH_KEY);
  if (!session) return null;
  
  // Re-fetch from DB to get latest trust score
  const user = JSON.parse(session);
  const users: UserProfile[] = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  return users.find(u => u.uid === user.uid) || user;
};

export const updateUserTrustScore = (uid: string, delta: number) => {
  const users: UserProfile[] = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  const index = users.findIndex(u => u.uid === uid);
  
  if (index !== -1) {
    let newScore = users[index].trustScore + delta;
    newScore = Math.max(0, Math.min(100, newScore));
    users[index].trustScore = newScore;
    localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
    
    // Sync current session if this is the active user
    const session = localStorage.getItem(AUTH_KEY);
    if (session) {
      const currentUser = JSON.parse(session);
      if (currentUser.uid === uid) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(users[index]));
      }
    }
  }
};

export const login = async (email: string, pass: string): Promise<UserProfile> => {
  await new Promise(r => setTimeout(r, 800));
  const users: UserProfile[] = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("Invalid credentials.");
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
};

export const signup = async (email: string, pass: string, role: UserRole): Promise<UserProfile> => {
  await new Promise(r => setTimeout(r, 1200));
  const users: UserProfile[] = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  if (users.find(u => u.email === email)) throw new Error("Account already exists.");

  const newUser: UserProfile = {
    uid: crypto.randomUUID(),
    email,
    role,
    createdAt: Date.now(),
    displayName: email.split('@')[0],
    trustScore: 50 // Start neutral
  };

  users.push(newUser);
  localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
  localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
  return newUser;
};

export const resetPassword = async (email: string): Promise<void> => {
  await new Promise(r => setTimeout(r, 1500));
  const users: UserProfile[] = JSON.parse(localStorage.getItem(USER_DB_KEY) || '[]');
  const user = users.find(u => u.email === email);
  if (!user) throw new Error("Security verification failed.");
  console.log(`[AUTH SYSTEM] Reset link dispatched to: ${email}`);
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
  window.location.reload();
};
