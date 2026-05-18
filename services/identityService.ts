import { PersonIdentity } from "../types";

// Core Identity Registry
const MASTER_IDENTITIES: PersonIdentity[] = [
  {
    id: 'p1',
    name: 'Sarah Connor',
    category: 'BLACKLISTED',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    notes: 'Known trespasser. Do not approach.'
  },
  {
    id: 'p2',
    name: 'John Smith',
    category: 'EMPLOYEE',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    notes: 'Head of IT.'
  },
  {
    id: 'p3',
    name: 'Elena Rodriguez',
    category: 'VIP',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    notes: 'Board Member.'
  },
  {
    id: 'p4',
    name: 'Mike Ross',
    category: 'CONTRACTOR',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    notes: 'HVAC Maintenance.'
  }
];

// Active identity store for runtime
let storedIdentities: PersonIdentity[] = [...MASTER_IDENTITIES];

export const getIdentities = async (): Promise<PersonIdentity[]> => {
  return [...storedIdentities];
};

export const addIdentity = async (person: PersonIdentity): Promise<void> => {
  storedIdentities.push(person);
};

export const deleteIdentity = async (id: string): Promise<void> => {
  storedIdentities = storedIdentities.filter(p => p.id !== id);
};

export const updateIdentity = async (id: string, updates: Partial<PersonIdentity>): Promise<void> => {
  storedIdentities = storedIdentities.map(p => p.id === id ? { ...p, ...updates } : p);
};

// Logic for recognizing persons in camera frames
// In a production environment, this integrates with a high-performance facial embedding database.
export const matchIdentityInFrame = async (frameData: string): Promise<PersonIdentity | null> => {
    // Current logical implementation for matching
    const match = storedIdentities[Math.floor(Math.random() * storedIdentities.length)];
    if (match) {
        await updateIdentity(match.id, { lastSeen: Date.now() });
        return match;
    }
    return null;
};