
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, Github, Briefcase, Copy, CheckCircle, ExternalLink, Linkedin } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useRef } from 'react';

interface ProfileData {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    bio: string | null;
    phone: string | null;
    location: string | null;
    skills: string[];
    role?: string;
    github_url?: string | null;
    linkedin_url?: string | null;
    title?: string | null;
    description?: string | null;
    social_handles?: string | null;
    global_experience?: string | null;
    impact?: string | null;
    core_expertise?: string | null;
    resume_url?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function UserProfile() {
    const { user, userRole, checkSession } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileResumeRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<ProfileData>({
        id: '',
        full_name: '',
        email: '',
        avatar_url: '',
        bio: '',
        phone: '',
        location: '',
        skills: [],
        github_url: '',
        linkedin_url: '',
        title: '',
        description: '',
        social_handles: '',
        global_experience: '',
        impact: '',
        core_expertise: '',
        resume_url: ''
    });

    const fetchProfile = useCallback(async () => {
        try {
            if (!user) return;
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/user/profile?t=${Date.now()}`, {
                headers: { 
                    Authorization: `Bearer ${token}`
                },
                cache: 'no-store'
            });

            if (!res.ok) throw new Error('Failed to fetch profile');

            const result = await res.json();
            const data = result.profile;
            const userData = result.user;

            // Merge with user metadata for fallback
            setProfile({
                id: user.id,
                full_name: data?.full_name || userData?.user_metadata?.full_name || '',
                email: userData?.email || '',
                avatar_url: data?.avatar_url || userData?.user_metadata?.avatar_url || '',
                bio: data?.bio || '',
                phone: data?.phone || '',
                location: data?.location || '',
                skills: data?.skills || [],
                github_url: data?.github_url || '',
                linkedin_url: data?.linkedin_url || '',
                title: data?.title || '',
                description: data?.description || '',
                social_handles: data?.social_handles || '',
                global_experience: data?.global_experience || '',
                impact: data?.impact || '',
                core_expertise: data?.core_expertise || '',
                resume_url: data?.resume_url || ''
            });
        } catch (error: unknown) {
            console.error('Error fetching profile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast({
                title: 'Error loading profile',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user, fetchProfile]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            const updates = {
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                github_url: profile.github_url,
                linkedin_url: profile.linkedin_url,
                title: profile.title,
                description: profile.description,
                social_handles: profile.social_handles,
                global_experience: profile.global_experience,
                impact: profile.impact,
                core_expertise: profile.core_expertise,
                resume_url: profile.resume_url,
                bio: profile.bio,
                // Add extra fields if schema supports them
                // mobile_number: profile.phone,
            };

            const res = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Update failed');
            }

            toast({
                title: 'Success',
                description: 'Profile updated successfully',
            });
            await fetchProfile();
        } catch (error: unknown) {
            console.error('Error updating profile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Update failed';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_URL}/user/profile/image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Upload failed');
            }

            const data = await res.json();
            
            const imageUrl = data.url || data.path || data.fileUrl;
            if (imageUrl) {
                setProfile({ ...profile, avatar_url: imageUrl });
                
                // Refresh authentication context to update avatar everywhere
                if (checkSession) await checkSession();
                
                toast({
                    title: 'Profile Picture Updated',
                    description: 'Your profile picture has been successfully updated and saved.',
                });
            } else {
                 throw new Error("Invalid response format from server");
            }
        } catch (error: unknown) {
             const message = error instanceof Error ? error.message : 'Could not upload image';
             console.error('Error uploading image:', error);
             toast({
                 title: 'Upload Failed',
                 description: message,
                 variant: 'destructive'
             });
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingResume(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/s3/upload-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type,
                    folder: `resumes/${profile.id || user?.id}`
                })
            });

            if (!res.ok) throw new Error('Failed to get upload URL');
            const { uploadUrl, fileName: s3Key } = await res.json();

            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadRes.ok) throw new Error('Upload to S3 failed');
            
            const finalUrl = `/api/s3/public/${s3Key}`;
            setProfile({ ...profile, resume_url: finalUrl });
            toast({
                title: 'Resume Uploaded',
                description: 'Your resume has been successfully uploaded and secured in S3.',
            });
        } catch (error: unknown) {
            console.error('Error uploading resume:', error);
            const message = error instanceof Error ? error.message : 'Failed to upload resume';
            toast({
                title: 'Upload Error',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setUploadingResume(false);
            if (fileResumeRef.current) fileResumeRef.current.value = '';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="text-muted-foreground">Manage your personal information</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Profile Card */}
                <Card className="md:col-span-4 h-fit">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 relative group w-24 h-24">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={profile.avatar_url?.startsWith('http') ? profile.avatar_url : (profile.avatar_url ? `${API_URL}/s3/public/${profile.avatar_url}` : '')} />
                                <AvatarFallback className="text-2xl">{profile.full_name?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                            />
                            
                            <Button
                                size="icon"
                                variant="secondary"
                                type="button"
                                disabled={uploadingImage}
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                            >
                                {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            </Button>
                        </div>
                        <CardTitle>{profile.full_name}</CardTitle>
                        <CardDescription>{profile.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-sm text-muted-foreground text-center font-bold uppercase tracking-widest bg-primary/5 py-2 rounded-lg border border-primary/10">
                            {userRole ? userRole : 'Student'} • Joined {new Date().getFullYear()}
                        </div>

                        <div className="pt-4 border-t">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 block">My Identity ID (UUID)</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={profile.id}
                                    className="bg-muted/50 font-mono text-[10px] h-9"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-3"
                                    onClick={() => {
                                        navigator.clipboard.writeText(profile.id);
                                        toast({
                                            title: "ID Copied",
                                            description: "Your unique identification ID has been copied to clipboard.",
                                        });
                                    }}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
                                {userRole === 'student' 
                                    ? "Share this UUID with your instructor so they can manually enroll you in courses."
                                    : "This is your unique system identifier for administrative purposes."}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <Card className="md:col-span-8">
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={profile.full_name || ''}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={profile.email || ''}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                                    <div className="flex gap-2">
                                        <div className="flex bg-slate-100 border border-slate-200 rounded-lg px-3 items-center justify-center">
                                            <Linkedin className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <Input
                                            id="linkedin"
                                            placeholder="https://linkedin.com/in/username"
                                            value={profile.linkedin_url || ''}
                                            onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Professional Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Senior Software Engineer"
                                        value={profile.title || ''}
                                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="social_handles">All Social Media Handles</Label>
                                    <Input
                                        id="social_handles"
                                        placeholder="Twitter: @user, Insta: @user"
                                        value={profile.social_handles || ''}
                                        onChange={(e) => setProfile({ ...profile, social_handles: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="global_experience">Global Experience</Label>
                                    <Input
                                        id="global_experience"
                                        placeholder="e.g. 5+ Years across NA & APAC"
                                        value={profile.global_experience || ''}
                                        onChange={(e) => setProfile({ ...profile, global_experience: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="core_expertise">Core Expertise</Label>
                                    <Input
                                        id="core_expertise"
                                        placeholder="e.g. React, Node.js, AI Integration"
                                        value={profile.core_expertise || ''}
                                        onChange={(e) => setProfile({ ...profile, core_expertise: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Description (Bio)</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Tell us about yourself..."
                                        value={profile.description || ''}
                                        onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="impact">Impact</Label>
                                    <Textarea
                                        id="impact"
                                        placeholder="Share your major achievements and impact..."
                                        value={profile.impact || ''}
                                        onChange={(e) => setProfile({ ...profile, impact: e.target.value })}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                {userRole === 'student' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="github">GitHub Profile URL</Label>
                                            <div className="flex gap-2">
                                                <div className="flex bg-slate-100 border border-slate-200 rounded-lg px-3 items-center justify-center">
                                                    <Github className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <Input
                                                    id="github"
                                                    placeholder="https://github.com/username"
                                                    value={profile.github_url || ''}
                                                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="resume">Resume/Portfolio URL</Label>
                                            <div className="flex gap-2 items-center">
                                                <div className="flex bg-slate-100 border border-slate-200 rounded-lg px-3 items-center justify-center p-2">
                                                    <Briefcase className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <Input
                                                    id="resume"
                                                    placeholder="Upload your resume to secure AWS S3..."
                                                    value={profile.resume_url || ''}
                                                    readOnly
                                                    className="bg-muted text-xs cursor-default truncate"
                                                />
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    className="hidden"
                                                    ref={fileResumeRef}
                                                    onChange={handleResumeUpload}
                                                />
                                                {profile.resume_url && (
                                                    <a 
                                                        href={profile.resume_url.startsWith('http') 
                                                            ? profile.resume_url 
                                                            : `${API_URL.replace(/\/api$/, '')}${profile.resume_url.startsWith('/') ? '' : '/'}${profile.resume_url}`
                                                        } 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button type="button" variant="outline" className="flex-shrink-0" title="View Resume">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => fileResumeRef.current?.click()}
                                                    disabled={uploadingResume}
                                                    className="flex-shrink-0"
                                                >
                                                    {uploadingResume ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                                    Upload
                                                </Button>
                                            </div>
                                            {profile.resume_url && (
                                                <p className="text-[10px] text-green-600 font-semibold text-right">✓ Resume stored in AWS</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell us about yourself..."
                                    value={profile.bio || ''}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
