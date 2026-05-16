import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import type { Track } from '../../types';
import { api } from '../../services/api';
import { TrackList } from '../shared/TrackList';
import { usePlayerStore } from '../../store/usePlayerStore';

export const Search = () => {
    const { hiddenTrackIds, hiddenArtistIds } = usePlayerStore();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 600);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            setError('');
            try {
                const tracks = await api.searchTracks(debouncedQuery);
                const filterTracks = (items: Track[]) => 
                    items.filter(i => !hiddenTrackIds.includes(i.id) && (!i.artistId || !hiddenArtistIds.includes(i.artistId)));
                setResults(filterTracks(tracks));
            } catch (err) {
                setError('Failed to fetch results. Ensure backend is running.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    return (
        <div className="h-full flex flex-col p-6 overflow-y-auto">
            <div className="sticky top-0 bg-surface/80 backdrop-blur-md z-10 -mx-6 px-6 pb-4 pt-2">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-textSecondary" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-full leading-5 bg-white/10 text-white placeholder-textSecondary focus:outline-none focus:bg-white/20 focus:ring-0 sm:text-sm transition-all"
                        placeholder="What do you want to listen to?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-textSecondary">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                        <p>Searching YouTube Music...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-center py-10 bg-red-400/10 rounded-lg">{error}</div>
                ) : results.length > 0 ? (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6">Top Results</h2>
                        <TrackList tracks={results} queueBehavior="radio" />
                    </div>
                ) : query && !isLoading ? (
                    <div className="text-textSecondary text-center py-20">
                        <h3 className="text-lg font-bold text-white mb-2">No results found for "{query}"</h3>
                        <p>Please make sure your words are spelled correctly, or use fewer or different keywords.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[
                            { name: 'Pop', color: 'from-pink-500 to-purple-600', image: '/genres/pop.png' },
                            { name: 'Rock', color: 'from-red-600 to-black', image: '/genres/rock.png' },
                            { name: 'Hip-Hop', color: 'from-blue-600 to-indigo-900', image: '/genres/hiphop.png' },
                            { name: 'Electronic', color: 'from-cyan-500 to-blue-500', image: '/genres/electronic.png' },
                        ].map((genre, i) => (
                            <div 
                                key={i} 
                                className={`aspect-square rounded-xl p-4 font-bold text-xl relative overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br ${genre.color}`}
                            >
                                <span className="absolute top-4 left-4 text-white z-10">{genre.name}</span>
                                <img src={genre.image} alt="" className="absolute -bottom-2 -right-4 w-24 h-24 object-cover rotate-[25deg] rounded shadow-2xl" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
