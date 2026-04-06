import { fetchWithAuth, API_URL } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Course } from './useInstructorData';

export interface CourseModule {
    id: string;
    course_id: string;
    title: string;
    order_index: number;
    created_at: string;
}

export interface S3CourseVideo {
    id: string;
    module_id: string;
    title: string;
    description?: string;
    video_type: string;
    video_url: string;
    thumbnail_url?: string;
    is_published?: boolean;
    order_index: number;
    created_at: string;
}

export function useInstructorS3Courses(showAll?: boolean) {
    const { user, userRole } = useAuth();
    return useQuery({
        queryKey: ['s3-courses', user?.id, userRole, showAll],
        queryFn: async () => {
            if (!user?.id) return [];
            
            // If showAll is requested, fetch all courses
            if (showAll) {
                console.log(`[useInstructorS3Courses] Fetching all courses (Library View)`);
                return await fetchWithAuth('/data/courses');
            }
            
            // Otherwise, fetch courses assigned to this instructor/user
            console.log(`[useInstructorS3Courses] Fetching assigned courses for: ${user.id}`);
            return await fetchWithAuth(`/data/courses?instructor_id=eq.${user.id}`);
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCourseModules(courseId: string | null) {
    const result = useQuery({
        queryKey: ['course-modules', courseId],
        queryFn: async () => {
            if (!courseId) return [];
            // Use the specific sub-resource endpoint which handles sorting on the backend
            return fetchWithAuth(`/courses/${courseId}/modules`);
        },
        enabled: !!courseId
    });

    return {
        data: result.data || [],
        isLoading: result.isLoading,
        isError: result.isError,
        refetch: result.refetch
    };
}

export function useModuleVideos(moduleId: string | null, courseId?: string) {
    return useQuery({
        queryKey: ['module-videos', moduleId, courseId],
        queryFn: async () => {
            // If we have courseId but no moduleId, fetch all videos for the course
            if (courseId && !moduleId) {
                return fetchWithAuth(`/courses/${courseId}/videos`);
            }
            if (!moduleId) return [];
            // If we have courseId and moduleId, use the dedicated sub-resource route
            if (courseId) {
                return fetchWithAuth(`/courses/${courseId}/videos?module_id=eq.${moduleId}`);
            }
            // Fallback to generic table data
            return fetchWithAuth(`/data/course_videos?module_id=eq.${moduleId}&sort=order_index&order=asc`);
        },
        enabled: !!moduleId || !!courseId,
    });
}

export function useCreateS3Course() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (course: Partial<Course>) => {
            return fetchWithAuth('/data/courses', {
                method: 'POST',
                body: JSON.stringify({ ...course, instructor_id: user?.id }),
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['s3-courses'] }),
    });
}

export function useUpdateCourseStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ courseId, status }: { courseId: string; status: string }) => {
            const result = await fetchWithAuth(`/data/courses/${courseId}`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            });

            if (status === 'pending') {
                // Log action for Admin notification
                await fetchWithAuth('/rpc/log_admin_action', {
                    method: 'POST',
                    body: JSON.stringify({
                        _module: 'Course',
                        _action: 'New Course Submitted',
                        _details: { course_id: courseId },
                    })
                });
            }

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['s3-courses'] });
            queryClient.invalidateQueries({ queryKey: ['available-courses'] });
        },
    });
}

export function useCreateCourseModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ course_id, title, order_index }: Partial<CourseModule>) => {
            if (!course_id) throw new Error('Course ID is required');
            return fetchWithAuth(`/courses/${course_id}/modules`, {
                method: 'POST',
                body: JSON.stringify({
                    course_id,
                    title,
                    order_index: order_index || 0
                }),
            });
        },
        onSuccess: (newModule, variables) => {
            queryClient.invalidateQueries({ queryKey: ['course-modules', variables.course_id] });
        },
    });
}

export function useCreateCourseVideo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ moduleId, courseId, ...video }: { moduleId: string, courseId?: string, title: string, video_type: string, video_url: string, thumbnail_url?: string, order_index: number }) => {
            // Prefer the course sub-resource endpoint if courseId is provided
            if (courseId) {
                return fetchWithAuth(`/courses/${courseId}/videos`, {
                    method: 'POST',
                    body: JSON.stringify({ ...video, module_id: moduleId }),
                });
            }
            // Fallback for generic table data
            return fetchWithAuth('/data/course_videos', {
                method: 'POST',
                body: JSON.stringify({ ...video, module_id: moduleId }),
            });
        },
        onSuccess: (newVideo, variables) => {
            // Optimistically update the cache for the specific module
            queryClient.setQueryData(['module-videos', variables.moduleId, variables.courseId], (oldData: S3CourseVideo[] | undefined) => {
                if (!oldData) return [newVideo];
                return [...oldData, newVideo];
            });

            // Optimistically update the cache for "all videos" if it exists (VideoUploader view)
            if (variables.courseId) {
                queryClient.setQueryData(['module-videos', null, variables.courseId], (oldData: S3CourseVideo[] | undefined) => {
                    if (!oldData) return [newVideo];
                    return [...oldData, newVideo];
                });
            }

            queryClient.invalidateQueries({ queryKey: ['module-videos', variables.moduleId] });
            queryClient.invalidateQueries({ queryKey: ['module-videos', null] }); // Invalidates the "all videos" queries if any
        },
    });
}

export function useDeleteCourseVideo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (videoId: string) => {
            return fetchWithAuth(`/data/course_videos/${videoId}`, {
                method: 'DELETE',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['module-videos'] });
        },
    });
}

export function useDeleteCourseModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (moduleId: string) => {
            return fetchWithAuth(`/data/course_modules/${moduleId}`, {
                method: 'DELETE',
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-modules'] });
            queryClient.invalidateQueries({ queryKey: ['s3-courses'] });
        },
    });
}


export function useS3Upload() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ file, customTitle, folder, onProgress, courseId }: {
            file: File,
            customTitle?: string,
            folder?: string,
            onProgress?: (pct: number) => void,
            courseId?: string
        }) => {
            const token = localStorage.getItem('access_token');
            const fileExt = file.name.split('.').pop();
            const fileNameToUse = customTitle ? `${customTitle}.${fileExt}` : file.name;

            // Step 1: Get presigned URL
            const res = await fetch(`${API_URL}/s3/upload-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    fileName: fileNameToUse,
                    fileType: file.type,
                    folder: folder || 'LMS VIDEOS',
                    courseId
                })
            });

            if (!res.ok) {
                const error = await res.json();
                if (error.requiresApproval) {
                    throw new Error('COURSE_NOT_APPROVED');
                }
                throw new Error('Failed to get upload URL');
            }
            const { uploadUrl, fileName: s3Key } = await res.json();

            // Step 2: Upload directly to S3
            return new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable && onProgress) {
                        onProgress(Math.round((e.loaded * 100) / e.total));
                    }
                });

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // Use the provided bucket name from .env if possible, or fallback to the one in code
                        const bucketName = 'aotms-lms-backend'; 
                        const region = 'ap-southeast-2';
                        const bucketUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
                        resolve(bucketUrl);
                    } else {
                        reject(new Error(`S3 upload failed with status ${xhr.status}`));
                    }
                };

                xhr.onerror = () => reject(new Error('Network error during S3 upload'));

                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
            });
        }
    });
}
