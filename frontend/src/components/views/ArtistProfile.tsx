import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { usePlayerStore } from '../../store/usePlayerStore';
import type { ArtistProfile as ArtistProfileType, Track, Album } from '../../types';
import { Play, User, Users, Info, ChevronRight, MoreHorizontal, X, MoreVertical } from 'lucide-react';
import { TrackContextMenu } from '../shared/TrackContextMenu';
import { ArtistContextMenu } from '../shared/ArtistContextMenu';

interface ArtistProfileProps {
    artistId: string;
}

export const ArtistProfile: React.FC<ArtistProfileProps> = ({ artistId }) => {
    const [profile, setProfile] = useState<ArtistProfileType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFullBio, setShowFullBio] = useState(false);
    const { playTrack, currentTrack, isPlaying, togglePlayPause, setActiveArtistId, hiddenTrackIds, hiddenArtistIds } = usePlayerStore();

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await api.getArtistProfile(artistId);
                
                // Filter hidden items
                data.songs = data.songs.filter(t => !hiddenTrackIds.includes(t.id));
                data.albums = data.albums.filter(a => !hiddenArtistIds.includes(a.id) && (!a.artistId || !hiddenArtistIds.includes(a.artistId)));
                data.related = data.related.filter(r => !hiddenArtistIds.includes(r.id));
                
                setProfile(data);
            } catch (e) {
                console.error("Failed to fetch artist profile", e);
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, [artistId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) return null;

    const bannerThumb = profile.thumbnails.find(t => t.width > 500)?.url || profile.thumbnails[profile.thumbnails.length - 1]?.url;

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-surfaceHover/40 to-surface pb-32 scrollbar-hide">
            {/* Hero Section */}
            <div className="relative h-[30vh] sm:h-[40vh] min-h-[220px] sm:min-h-[300px] w-full">
                <div className="absolute inset-0">
                    <img src={bannerThumb} alt={profile.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
                </div>
                
                <div className="absolute bottom-0 left-0 p-4 sm:p-8 w-full flex flex-col items-start">
                    <div className="flex items-center space-x-2 text-primary mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Verified Artist</span>
                    </div>
                    <h1 className="text-3xl sm:text-6xl md:text-8xl font-black text-white mb-3 sm:mb-6 tracking-tighter">{profile.name}</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-white/80 text-sm font-medium">{profile.subscribers || 'Millions of'} subscribers</span>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-8">
                {/* Action Bar */}
                <div className="flex items-center space-x-6 mb-8">
                    <button 
                        onClick={() => profile.songs.length > 0 && playTrack(profile.songs[0], profile.songs)}
                        className="w-14 h-14 bg-primary rounded-full flex items-center justify-center hover:scale-105 transition shadow-xl"
                    >
                        <Play className="w-6 h-6 fill-black text-black" />
                    </button>
                    <button className="px-6 py-2 rounded-full border border-white/20 text-white font-bold hover:bg-white/5 transition">
                        Follow
                    </button>
                    <button className="text-white/60 hover:text-white transition">
                        <MoreHorizontal className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
                    {/* Top Songs */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Popular</h2>
                        <div className="space-y-1">
                            {profile.songs.map((track, index) => {
                                const isCurrent = currentTrack?.id === track.id;
                                return (
                                    <div 
                                        key={track.id}
                                        onClick={() => playTrack(track, profile.songs)}
                                        className="group flex items-center p-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <span className="w-8 text-white/40 text-sm group-hover:hidden">{index + 1}</span>
                                        <div className="hidden group-hover:flex w-8 items-center">
                                            <Play className="w-3 h-3 fill-white text-white" />
                                        </div>
                                        <img src={track.thumbnail} className="w-10 h-10 rounded object-cover mx-3" alt="" />
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                                                {track.title}
                                            </span>
                                            {track.album && <span className="text-xs text-white/40 truncate">{track.album}</span>}
                                        </div>
                                            <span className="text-xs text-white/40 ml-4">
                                                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                                            </span>
                                            <TrackContextMenu track={track} className="ml-4 opacity-60 hover:opacity-100 transition-opacity" />
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">About</h2>
                        <div 
                            className="bg-white/5 rounded-2xl p-6 relative overflow-hidden group cursor-pointer hover:bg-white/10 transition h-fit"
                            onClick={() => setShowFullBio(true)}
                        >
                            <p className="text-white/60 text-sm leading-relaxed line-clamp-6 whitespace-pre-wrap">
                                {profile.description || "No biography available for this artist."}
                            </p>
                            <div className="mt-4 flex items-center text-white text-sm font-bold group-hover:underline">
                                Read more
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio Modal */}
                {showFullBio && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
                        <div 
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowFullBio(false)}
                        ></div>
                        <div className="relative bg-surfaceHover w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">About {profile.name}</h3>
                                <button 
                                    onClick={() => setShowFullBio(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto scrollbar-hide text-white/80 leading-relaxed text-lg whitespace-pre-wrap">
                                {profile.description}
                            </div>
                        </div>
                    </div>
                )}

                {/* Albums */}
                {profile.albums.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Albums</h2>
                        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                            {profile.albums.map(album => (
                                <div key={album.id} className="w-44 flex-shrink-0 group cursor-pointer">
                                    <div className="relative aspect-square rounded-lg overflow-hidden mb-3 shadow-lg">
                                        <img src={album.thumbnail} alt={album.title} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-2xl translate-y-4 group-hover:translate-y-0 transition duration-300">
                                                <Play className="w-6 h-6 fill-black text-black ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-white font-semibold text-sm truncate">{album.title}</div>
                                    <div className="text-white/40 text-xs mt-1">{album.year} • Album</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Related Artists */}
                {profile.related.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Fans also like</h2>
                        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                            {profile.related.map(artist => (
                                <div 
                                    key={artist.id} 
                                    className="w-40 flex-shrink-0 group cursor-pointer text-center relative"
                                    onClick={() => setActiveArtistId(artist.id)}
                                >
                                    <div className="relative aspect-square rounded-full overflow-hidden mb-4 shadow-xl border-4 border-transparent group-hover:border-white/10 transition">
                                        <img src={artist.thumbnail} alt={artist.name} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                                    </div>
                                    <div className="text-white font-bold text-sm truncate w-full px-2">{artist.name}</div>
                                    <div className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold">Artist</div>
                                    
                                    <ArtistContextMenu 
                                        artist={artist} 
                                        className="absolute top-2 right-2 opacity-60 hover:opacity-100 transition-opacity" 
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
