import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ZoomMtg } from '@zoom/meetingsdk';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithAuth } from '@/lib/api';
import { AlertCircle, ArrowLeft, Video, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ZOOM_VERSION = '5.1.4';

// Key used to persist zoom state across React navigation
const ZOOM_SESSION_KEY = 'zoom_session_active';

/**
 * Hide/show the main app root so Zoom's #zmmtg-root stays on top.
 * Zoom injects #zmmtg-root directly into <body>; the app's #root sits
 * beside it. When Zoom is active we need to make sure our app root
 * doesn't cover it.
 */
function setAppRootVisibility(visible: boolean) {
    const appRoot = document.getElementById('root');
    if (appRoot) {
        appRoot.style.display = visible ? '' : 'none';
    }
}

function getZoomRoot(): HTMLElement | null {
    return document.getElementById('zmmtg-root');
}

export default function LiveSession() {
    const { meetingId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Initializing...');
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    // Use a ref AND sessionStorage so the flag survives React remounts
    // (e.g. navigating away while screen-sharing and coming back)
    const hasInitialized = useRef(false);

    const queryParams = new URLSearchParams(location.search);
    const password = queryParams.get('pwd') || '';
    const role = parseInt(queryParams.get('role') || '0');

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-4), msg]);
    };

    useEffect(() => {
        if (!meetingId || !user) return;

        // If SDK was already initialised in this browser tab (e.g. user navigated
        // away while sharing screen and came back), just re-show the Zoom root.
        const alreadyActive = sessionStorage.getItem(ZOOM_SESSION_KEY) === meetingId;
        if (alreadyActive || hasInitialized.current) {
            const zRoot = getZoomRoot();
            if (zRoot) {
                zRoot.style.display = 'block';
                setAppRootVisibility(false);
                setLoading(false);
            }
            return;
        }

        hasInitialized.current = true;
        sessionStorage.setItem(ZOOM_SESSION_KEY, meetingId);

        const setupMeeting = async () => {
            try {
                const sdkKey = import.meta.env.VITE_ZOOM_CLIENT_ID;

                if (!sdkKey) {
                    throw new Error('Frontend VITE_ZOOM_CLIENT_ID is missing. Check your .env file or Render dashboard.');
                }

                addLog('Verifying session schedule...');

                const meetingNumber = meetingId.replace(/\s/g, '');
                const liveClasses = await fetchWithAuth(`/data/live_classes?meeting_id=eq.${meetingNumber}`) as any[];

                if (!liveClasses || liveClasses.length === 0) {
                    throw new Error('Session not found in our records.');
                }

                addLog('Authenticating credentials...');

                ZoomMtg.setZoomJSLib(`https://source.zoom.us/${ZOOM_VERSION}/lib`, '/av');
                ZoomMtg.preLoadWasm();
                ZoomMtg.prepareWebSDK();
                ZoomMtg.i18n.load('en-US');
                ZoomMtg.i18n.reload('en-US');

                addLog('Generating security signature...');
                const response = await fetchWithAuth('/zoom/signature', {
                    method: 'POST',
                    body: JSON.stringify({ meetingNumber, role })
                });

                const signature = response.signature;
                if (!signature) throw new Error('Signature generation failed on backend.');

                addLog('Engine preparation...');

                // Show Zoom root, hide app root so the SDK view fills the screen
                const zRoot = getZoomRoot();
                if (zRoot) zRoot.style.display = 'block';
                setAppRootVisibility(false);

                ZoomMtg.init({
                    leaveUrl: window.location.origin + (role === 1 ? '/instructor' : '/student-dashboard'),
                    debug: true,
                    success: () => {
                        addLog('Engine ready. Joining room...');
                        ZoomMtg.join({
                            signature,
                            meetingNumber,
                            userName: user.user_metadata?.full_name || user.email || 'AOTMS User',
                            passWord: password,
                            tk: '',
                            success: () => {
                                addLog('Joined successfully!');
                                setStatus('Connected!');
                                setLoading(false);
                                // Keep app root hidden — Zoom SDK owns the screen now
                                setAppRootVisibility(false);
                            },
                            error: (err: any) => {
                                console.error('Join Error:', err);
                                addLog(`Join Fail: ${err.errorMessage || 'Invalid meeting'}`);
                                setError(`Failed to enter: ${err.errorMessage || 'Unknown Zoom error'}`);
                                setLoading(false);
                                // Restore app root on error
                                setAppRootVisibility(true);
                                sessionStorage.removeItem(ZOOM_SESSION_KEY);
                            }
                        });
                    },
                    error: (err: any) => {
                        console.error('Init Error:', err);
                        addLog(`Init Fail: ${err.errorMessage || 'Invalid parameters'}`);
                        setError(`Engine initialization failed: ${err.errorMessage || 'Please check SDK Key and Meeting ID format'}`);
                        setLoading(false);
                        setAppRootVisibility(true);
                        sessionStorage.removeItem(ZOOM_SESSION_KEY);
                    }
                });

            } catch (err: unknown) {
                console.error('Setup Error:', err);
                setError((err as Error).message || 'Identity check failed.');
                setLoading(false);
                setAppRootVisibility(true);
                sessionStorage.removeItem(ZOOM_SESSION_KEY);
            }
        };

        const timer = setTimeout(setupMeeting, 1000);
        document.body.style.overflow = 'hidden';

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = 'auto';
            // Don't hide zmmtg-root on cleanup — if the user is just switching
            // routes while in a meeting (e.g. screen share returning focus),
            // we want Zoom to stay visible. Only clean up when session ends.
        };
    }, [meetingId, user, role, password]);

    // When the user explicitly leaves (navigate(-1) / leaveUrl fires),
    // restore the app root and clear the session flag.
    useEffect(() => {
        return () => {
            // This runs when LiveSession unmounts for good (React Router navigates away)
            // Check if Zoom session is still marked active; if so, it means the user
            // navigated away intentionally, so restore app visibility.
            if (!sessionStorage.getItem(ZOOM_SESSION_KEY)) {
                setAppRootVisibility(true);
                const zRoot = getZoomRoot();
                if (zRoot) zRoot.style.display = 'none';
            }
        };
    }, []);

    if (error) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 z-[10000]">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-300">
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mx-auto ring-1",
                        isFinished ? "bg-amber-500/10 ring-amber-500/20" : "bg-red-500/10 ring-red-500/20"
                    )}>
                        <AlertCircle className={cn("w-10 h-10", isFinished ? "text-amber-500" : "text-red-500")} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            {isFinished ? "Session Ended" : "Something went wrong"}
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        {!isFinished && (
                            <Button className="h-12 bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => {
                                sessionStorage.removeItem(ZOOM_SESSION_KEY);
                                window.location.reload();
                            }}>
                                <RefreshCcw className="w-4 h-4 mr-2" /> RE-ENTER SESSION
                            </Button>
                        )}
                        <Button variant="ghost" className="text-slate-400" onClick={() => {
                            sessionStorage.removeItem(ZOOM_SESSION_KEY);
                            setAppRootVisibility(true);
                            const zRoot = getZoomRoot();
                            if (zRoot) zRoot.style.display = 'none';
                            navigate(-1);
                        }}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> {isFinished ? "RETURN TO DASHBOARD" : "EXIT ROOM"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            {loading && (
                <div className="fixed inset-0 bg-[#0b0e14] flex flex-col items-center justify-center p-6 z-[9999]">
                    <div className="relative mb-12">
                        <div className="w-28 h-28 border-[6px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Video className="w-10 h-10 text-blue-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-white text-2xl font-black mb-4 tracking-tighter uppercase italic">
                            Connecting...
                        </h2>
                        <div className="flex flex-col gap-2 items-center">
                            {logs.map((log, i) => (
                                <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-500 animate-in fade-in slide-in-from-bottom-1">
                                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                    <span className="uppercase tracking-widest">{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}