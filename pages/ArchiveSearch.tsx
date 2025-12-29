import React, { useState } from 'react';
import { Search, Clock, Filter, PlayCircle, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { ArchiveEvent } from '../types';
import { searchArchive } from '../services/searchService';

export default function ArchiveSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ArchiveEvent[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await searchArchive(query);
      setResults(data);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <PageHeader 
        title="Smart Archive Search"
        description={
            <span className="flex items-center gap-2">
                Use natural language to find specific events across your entire video retention history.
                <Badge variant="purple">Beta</Badge>
            </span>
        }
        icon={Search}
      />

      {/* Search Input Area */}
      <Card className="shadow-xl">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
             <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-4 pl-5 pr-12 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                placeholder="Describe what you are looking for (e.g., 'Person wearing red jacket', 'White truck at loading dock')"
                value={query}
                onChange={e => setQuery(e.target.value)}
             />
             <div className="absolute right-3 top-3">
                 <Button type="submit" isLoading={isSearching} disabled={!query.trim()}>
                    Search
                 </Button>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 cursor-pointer hover:bg-slate-800">
                <Calendar size={14} />
                <span>Last 24 Hours</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 cursor-pointer hover:bg-slate-800">
                <Filter size={14} />
                <span>Min Confidence: 70%</span>
            </div>
             <div className="flex-1"></div>
             <span className="text-xs text-slate-600 pt-2">Powered by pgvector & Gemini Embeddings</span>
          </div>
        </form>
      </Card>

      {/* Results Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {!hasSearched && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <Search size={64} strokeWidth={1} className="mb-4" />
                <p>Enter a description to search the video archive.</p>
            </div>
        )}

        {hasSearched && results.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <p>No matching events found in the selected timeframe.</p>
                <Button variant="outline" className="mt-4" onClick={() => setQuery('')}>Clear Search</Button>
            </div>
        )}

        {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                {results.map(evt => (
                    <Card key={evt.id} noPadding className="group hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-900/10">
                        <div className="relative aspect-video bg-black">
                            <img src={evt.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Confidence Badge */}
                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded border border-white/10">
                                {Math.round(evt.confidence * 100)}% Match
                            </div>
                            
                            {/* Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <PlayCircle size={48} className="text-white drop-shadow-lg transform scale-90 group-hover:scale-100 transition-transform" />
                            </div>
                        </div>
                        
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-semibold text-white">{evt.streamName}</h3>
                                <div className="flex items-center text-xs text-slate-500">
                                    <Clock size={12} className="mr-1" />
                                    {new Date(evt.timestamp).toLocaleString()}
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                {evt.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1">
                                {evt.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}