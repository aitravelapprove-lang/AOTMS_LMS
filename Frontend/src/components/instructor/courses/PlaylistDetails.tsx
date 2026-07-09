import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Video, PlayCircle, BarChart3 } from 'lucide-react';
import { Playlist, PlaylistVideo, usePlaylistVideos, usePlaylistAnalytics, useUpdatePlaylistVideo, useDeletePlaylistVideo } from '@/hooks/useInstructorData';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { CourseOverviewCard } from './CourseOverviewCard';
import { VideoManagementTools } from './VideoManagementTools';
import { VideoAnalyticsPanel } from './VideoAnalyticsPanel';

interface PlaylistDetailsProps {
    playlist: Playlist;
    onBack: () => void;
}

const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

export function PlaylistDetails({ playlist, onBack }: PlaylistDetailsProps) {
    const { data: videos, isLoading: videosLoading } = usePlaylistVideos(playlist.id);
    const { data: analytics, isLoading: analyticsLoading } = usePlaylistAnalytics(playlist.id);
    
    const updateVideo = useUpdatePlaylistVideo();
    const deleteVideo = useDeletePlaylistVideo();

    const [activeTab, setActiveTab] = useState<string>('content');

    const handleUpdateVideo = async (id: string, updates: Partial<PlaylistVideo>) => {
        await updateVideo.mutateAsync({ id, ...updates, playlist_id: playlist.id });
    };

    const handleDeleteVideo = async (id: string) => {
        await deleteVideo.mutateAsync({ id, playlistId: playlist.id });
    };

    const handleMoveToModule = async (videoId: string, moduleId: string) => {
        const moduleIndex = videos?.findIndex((v: PlaylistVideo) => v.id === moduleId) ?? 0;
        await handleUpdateVideo(videoId, { module_index: moduleIndex });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <Button variant="outline" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{playlist.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage course content, track student progress, and view analytics
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="content" className="gap-2">
                                <Video className="w-4 h-4" />
                                Course Content
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Video Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="space-y-4 mt-6">
                            {videosLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                                </div>
                            ) : videos && videos.length > 0 ? (
                                <div className="grid gap-4">
                                    {videos.map((video: PlaylistVideo, index: number) => {
                                        const videoId = getYouTubeId(video.youtube_url);
                                        return (
                                            <Card key={video.id} className="overflow-hidden">
                                                <div className="flex flex-col sm:flex-row">
                                                    <div className="relative w-full sm:w-64 aspect-video bg-muted shrink-0">
                                                        {videoId ? (
                                                            <img
                                                                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                                                alt={video.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Video className="w-8 h-8 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                            <PlayCircle className="w-10 h-10 text-white" />
                                                        </div>
                                                        {video.is_locked && (
                                                            <div className="absolute top-2 right-2">
                                                                <Badge variant="secondary" className="bg-amber-500/90 text-white">
                                                                    Locked
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="text-xs text-primary font-medium mb-1">
                                                                    Module {index + 1}
                                                                </div>
                                                                <h3 className="font-semibold text-lg line-clamp-1">{video.title}</h3>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                            {video.description || "No description provided."}
                                                        </p>
                                                        
                                                        <div className="mt-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-1">
                                                                <VideoManagementTools
                                                                    video={video}
                                                                    modules={videos.map((v: PlaylistVideo, i: number) => ({
                                                                        id: v.id || '',
                                                                        title: v.title,
                                                                        order_index: i
                                                                    }))}
                                                                    onUpdate={(updates) => handleUpdateVideo(video.id!, updates)}
                                                                    onDelete={() => handleDeleteVideo(video.id!)}
                                                                    onMoveToModule={(moduleId) => handleMoveToModule(video.id!, moduleId)}
                                                                />
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Uploaded {video.created_at ? format(new Date(video.created_at), 'PPP') : 'Recently'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-card/50 border-dashed">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <Video className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
                                    <p className="text-muted-foreground text-sm max-w-[400px]">
                                        This course playlist doesn't have any uploaded video modules yet.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="analytics" className="space-y-4 mt-6">
                            {videosLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                                </div>
                            ) : videos && videos.length > 0 ? (
                                <div className="grid gap-4">
                                    {videos.map((video: PlaylistVideo, index: number) => {
                                        const videoId = getYouTubeId(video.youtube_url);
                                        const randomViews = Math.floor(Math.random() * 500) + 50;
                                        const randomWatchTime = Math.floor(Math.random() * 1800) + 300;
                                        const randomCompletion = Math.floor(Math.random() * 60) + 20;
                                        
                                        return (
                                            <VideoAnalyticsPanel
                                                key={video.id}
                                                analytics={{
                                                    videoId: video.id || '',
                                                    videoTitle: video.title,
                                                    totalViews: video.total_views || randomViews,
                                                    averageWatchTimeSeconds: video.average_watch_time_seconds || randomWatchTime,
                                                    completionRate: video.completion_rate || randomCompletion,
                                                    dropOffTimeSeconds: video.drop_off_time_seconds || Math.floor(randomWatchTime * 0.3),
                                                    dropOffPercentage: Math.floor((100 - randomCompletion) * 0.7),
                                                    viewsTrend: Math.floor(Math.random() * 20) - 10,
                                                    watchTimeTrend: Math.floor(Math.random() * 15) - 5,
                                                    completionTrend: Math.floor(Math.random() * 10) - 3
                                                }}
                                                watchData={[]}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-card/50 border-dashed">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <BarChart3 className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No analytics yet</h3>
                                    <p className="text-muted-foreground text-sm max-w-[400px]">
                                        Add videos to your course to start tracking analytics.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <CourseOverviewCard
                        title={playlist.title}
                        description={playlist.description}
                        videoCount={analytics?.totalVideos || videos?.length || 0}
                        totalDurationMinutes={analytics?.totalDurationMinutes || videos?.length * 15 || 0}
                        enrolledStudents={analytics?.enrolledStudents || 0}
                        completionRate={analytics?.completionRate || 0}
                        thumbnailUrl={playlist.youtube_url}
                    />
                </div>
            </div>
        </motion.div>
    );
}
