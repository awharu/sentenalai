import { ArchiveEvent } from "../types";

// Mock Database of indexed video events (representing pgvector embeddings)
const MOCK_ARCHIVE: ArchiveEvent[] = [
  {
    id: 'evt_1',
    timestamp: Date.now() - 3600000 * 2,
    streamId: '1',
    streamName: 'Main Entrance',
    description: 'Male subject wearing red hoodie entering through main doors carrying a black backpack.',
    confidence: 0.95,
    thumbnailUrl: 'https://images.unsplash.com/photo-1635338601661-d7d8004c8626?auto=format&fit=crop&q=80&w=400',
    tags: ['person', 'red_hoodie', 'backpack', 'entry']
  },
  {
    id: 'evt_2',
    timestamp: Date.now() - 3600000 * 24,
    streamId: '2',
    streamName: 'Perimeter HLS',
    description: 'White delivery van idling near the loading dock gate.',
    confidence: 0.88,
    thumbnailUrl: 'https://images.unsplash.com/photo-1616432043562-3671ea2e5242?auto=format&fit=crop&q=80&w=400',
    tags: ['vehicle', 'van', 'white', 'loading_dock']
  },
  {
    id: 'evt_3',
    timestamp: Date.now() - 3600000 * 5,
    streamId: '3',
    streamName: 'Server Room Hallway',
    description: 'Maintenance personnel with ladder and tool belt.',
    confidence: 0.92,
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&q=80&w=400',
    tags: ['person', 'maintenance', 'tools']
  },
  {
    id: 'evt_4',
    timestamp: Date.now() - 3600000 * 48,
    streamId: '1',
    streamName: 'Main Entrance',
    description: 'Crowd gathering near entrance, possible protest activity.',
    confidence: 0.85,
    thumbnailUrl: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=400',
    tags: ['crowd', 'gathering', 'entrance']
  },
  {
    id: 'evt_5',
    timestamp: Date.now() - 3600000 * 1,
    streamId: '2',
    streamName: 'Perimeter HLS',
    description: 'Stray dog crossing the perimeter fence line.',
    confidence: 0.75,
    thumbnailUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
    tags: ['animal', 'dog', 'perimeter']
  }
];

export const searchArchive = async (query: string): Promise<ArchiveEvent[]> => {
  // Simulate network latency for vector search
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  const terms = lowerQuery.split(' ');

  // Simple client-side relevance scoring to mock "semantic similarity"
  const results = MOCK_ARCHIVE.map(event => {
    let score = 0;
    const text = (event.description + ' ' + event.tags.join(' ')).toLowerCase();

    // Keyword matching
    terms.forEach(term => {
      if (text.includes(term)) score += 0.3;
    });

    // Random jitter to simulate "AI fuzziness"
    score += Math.random() * 0.1;

    // Cap at 0.99
    if (score > 0.99) score = 0.99;

    return { ...event, confidence: score };
  })
  .filter(item => item.confidence > 0.2) // Threshold
  .sort((a, b) => b.confidence - a.confidence);

  return results;
};