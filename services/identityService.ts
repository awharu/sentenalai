import { PersonIdentity } from "../types";

// Initial Mock Data
const INITIAL_IDENTITIES: PersonIdentity[] = [
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

// In-memory store (simulating DB)
let identities: PersonIdentity[] = [...INITIAL_IDENTITIES];

export const getIdentities = async (): Promise<PersonIdentity[]> => {
  return [...identities];
};

export const addIdentity = async (person: PersonIdentity): Promise<void> => {
  identities.push(person);
};

export const deleteIdentity = async (id: string): Promise<void> => {
  identities = identities.filter(p => p.id !== id);
};

export const updateIdentity = async (id: string, updates: Partial<PersonIdentity>): Promise<void> => {
  identities = identities.map(p => p.id === id ? { ...p, ...updates } : p);
};

// Simulate Facial Recognition logic
// In a real app, this would send the frame embedding to a Vector DB or FaceAPI
export const identifyPersonInFrame = async (): Promise<PersonIdentity | null> => {
  // 30% chance to match a known person for demo purposes
  if (Math.random() > 0.7) {
    const randomIndex = Math.floor(Math.random() * identities.length);
    const person = identities[randomIndex];
    
    // Update last seen
    await updateIdentity(person.id, { lastSeen: Date.now() });
    
    return person;
  }
  return null;
};