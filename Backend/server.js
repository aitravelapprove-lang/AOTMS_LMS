require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { generateUploadUrl, generateViewUrl, deleteObject, uploadFile } = require('./utils/s3');
const axios = require('axios');
const connectDB = require('./config/db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = require('cloudinary').v2;
const vm = require('vm'); // Native Node.js module for executing code locally

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbhuezxh0',
    api_key: process.env.CLOUDINARY_API_KEY || '586353983153752',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'S6rxE-cjejQxkdWucUuAb7rGUXI'
});

// Import Mongoose Models
const { User, Profile, UserRole, OTP, VerifiedEmail, InstructorApplication, GuestCredential, ResumeScan } = require('./models/User');
const { Course, Enrollment, Topic, Module, Video, Announcement, Timeline, Resource, InstructorProgress, VideoProgress, CourseRating } = require('./models/Course');
const { Exam, QuestionBank, ExamSchedule, StudentExamAccess, ExamResult, MockPaper, ExamRule, MockTestConfig } = require('./models/Exam');
const { Assignment, Submission, Playlist, LiveClass } = require('./models/Content');
const { SystemLog, SecurityEvent, LeaderboardStat, Notification, Coupon, Lead } = require('./models/System');
const { Conversation, Message } = require('./models/Chat');
const { Doubt, DoubtReply } = require('./models/Doubt');
const { Batch, StudentBatch, BatchRequest } = require('./models/Batch');

// Map table names to Models for generic routes
const MODEL_MAP = {
    'profiles': Profile,
    'user_roles': UserRole,
    'conversations': Conversation,
    'messages': Message,
    'doubts': Doubt,
    'doubt_replies': DoubtReply,
    'courses': Course,
    'course_topics': Topic,
    'course_modules': Module,
    'course_videos': Video,
    'course_resources': Resource,
    'course_timeline': Timeline,
    'course_announcements': Announcement,
    'announcements': Announcement, // Alias for frontend compatibility
    'course_enrollments': Enrollment,
    'course_ratings': CourseRating,
    'exams': Exam,
    'question_bank': QuestionBank,
    'exam_schedules': ExamSchedule,
    'student_exam_access': StudentExamAccess,
    'exam_results': ExamResult,
    'student_exam_results': ExamResult, // Alias
    'mock_papers': MockPaper,
    'mock_test_configs': MockTestConfig,
    'exam_rules': ExamRule,
    'assignments': Assignment,
    'assignment_submissions': Submission,
    'playlists': Playlist,
    'live_classes': LiveClass,
    'system_logs': SystemLog,
    'security_events': SecurityEvent,
    'leaderboard_stats': LeaderboardStat,
    'leaderboard': LeaderboardStat, // Alias
    'leaderboard': LeaderboardStat, // Alias
    'instructor_applications': InstructorApplication,
    'instructor_progress': InstructorProgress,
    'video_progress': VideoProgress,
    'guest_credentials': GuestCredential,
    'notifications': Notification,
    'users': User,
    'resume_scans': ResumeScan,
    'leads': Lead,
    'batches': Batch,
    'student_batches': StudentBatch
};

const ALLOWED_TABLES = Object.keys(MODEL_MAP);
const ADMIN_ONLY_TABLES = ['user_roles', 'system_logs', 'security_events'];

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
const app = express();
const port = process.env.PORT || 5000;

// Create HTTP Server for Socket.io
const http = require('http');
const { Server } = require('socket.io');
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST"]
    }
});

// Socket.io Connection Logic
const userSockets = new Map(); // userId -> Set of socketIds
const onlineUsers = new Set(); // Set of online userIds

io.on('connection', (socket) => {
    socket.on('authenticate', (userId) => {
        if (!userId) return;
        socket.userId = userId;
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        onlineUsers.add(userId);
        
        console.log(`[Socket] User ${userId} connected (${socket.id})`);
        io.emit('user_status', { userId, status: 'online' });
    });

    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`[Socket] User ${socket.userId} joined conversation ${conversationId}`);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
        socket.to(conversationId).emit('typing_status', { 
            userId: socket.userId, 
            isTyping,
            conversationId 
        });
    });

    socket.on('mark_read', async ({ conversationId, messageIds }) => {
        try {
            if (!messageIds || messageIds.length === 0) return;
            
            // Update DB
            await Message.updateMany(
                { _id: { $in: messageIds }, conversation_id: conversationId },
                { status: 'read' }
            );

            // Emit to sender that messages are read
            io.to(conversationId).emit('messages_read', { 
                conversationId, 
                messageIds,
                readBy: socket.userId 
            });
        } catch (err) {
            console.error('Error marking messages read:', err);
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId && userSockets.has(socket.userId)) {
            userSockets.get(socket.userId).delete(socket.id);
            if (userSockets.get(socket.userId).size === 0) {
                userSockets.delete(socket.userId);
                onlineUsers.delete(socket.userId);
                io.emit('user_status', { userId: socket.userId, status: 'offline' });
            }
        }
        console.log(`[Socket] Disconnected: ${socket.id}`);
    });
});

// Notification Helper
const sendNotification = (userId, data) => {
    const sockets = userSockets.get(userId?.toString());
    if (sockets) {
        sockets.forEach(sid => {
            io.to(sid).emit('notification', {
                ...data,
                id: Date.now().toString(),
                timestamp: new Date()
            });
        });
        return true;
    }
    return false;
};

// Connect to MongoDB
connectDB();

// Zoom Credentials
const ZOOM_ACCOUNT_ID = process.env.ZOOM_S2S_ACCOUNT_ID || process.env.ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_S2S_CLIENT_ID || process.env.CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_S2S_CLIENT_SECRET || process.env.CLIENT_SECRET;

// Zoom Helper: Get Access Token (Server-to-Server OAuth)
const getZoomAccessToken = async () => {
    try {
        const auth = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
        const response = await axios.post('https://zoom.us/oauth/token', null, {
            params: {
                grant_type: 'account_credentials',
                account_id: ZOOM_ACCOUNT_ID
            },
            headers: {
                Authorization: `Basic ${auth}`
            }
        });
        return response.data.access_token;
    } catch (error) {
        if (error.response) {
            console.error('[Zoom OAuth Error Response]:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('[Zoom OAuth Error Message]:', error.message);
        }
        throw new Error('Failed to connect to Zoom: ' + (error.response?.data?.reason || error.message));
    }
};

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * Helper to standardise error responses
 */
const handleError = (res, err, context = '') => {
    console.error(`[Error ${context}]`, err);
    res.status(500).json({ error: err.message || 'Internal Server Error', context });
};

// --- Authentication Middleware ---

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id, // Use Mongoose ObjectId
            email: user.email,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Auth token required' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid or expired token' });
        req.user = decoded;
        next();
    });
};

// Role Caching (Simple In-Memory for now, similar to previous version)
const roleCache = new Map();
const ROLE_CACHE_TTL = 30 * 1000;

const getUserRole = async (userId) => {
    if (!userId) return null;
    const strId = userId.toString();
    
    if (roleCache.has(strId)) {
        const { role, timestamp } = roleCache.get(strId);
        if (Date.now() - timestamp < ROLE_CACHE_TTL) return role;
    }

    try {
        const roleDoc = await UserRole.findOne({ user_id: userId });
        const role = roleDoc ? roleDoc.role : null;
        if (role) roleCache.set(strId, { role, timestamp: Date.now() });
        return role;
    } catch (error) {
        console.error(`[Auth] Failed to fetch role for ${userId}:`, error);
        return null;
    }
};

const requireRole = (allowedRoles) => async (req, res, next) => {
    try {
        const role = await getUserRole(req.user.id);
        if (!role) {
            console.warn(`[Auth] No role found for user ID: ${req.user.id}`);
            return res.status(401).json({ error: 'User role not found' });
        }
        if (!allowedRoles.includes(role)) {
            console.warn(`[Auth] Access Denied for user ${req.user.id}. Role: ${role}. Required one of: ${allowedRoles}`);
            return res.status(403).json({ error: `Access denied. Your role is '${role}'. Required: ${allowedRoles.join(', ')}` });
        }
        next();
    } catch (err) {
        handleError(res, err, 'requireRole');
    }
};

const requireAdmin = requireRole(['admin']);
const requireManager = requireRole(['admin', 'manager']);
const requireAdminOrManager = requireRole(['admin', 'manager']);
const requireInstructor = requireRole(['admin', 'manager', 'instructor']);

// Zoom Routes
app.post('/api/zoom/meetings', authenticateToken, requireInstructor, async (req, res) => {
    const { topic, startTime, duration, agenda } = req.body;
    try {
        const accessToken = await getZoomAccessToken();
        const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
            topic,
            type: 2, // Scheduled meeting
            start_time: startTime,
            duration,
            agenda,
            settings: {
                host_video: true,
                participant_video: false,
                join_before_host: false,
                mute_upon_entry: true,
                waiting_room: true,
                auto_recording: 'cloud'
            }
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            meetingId: response.data.id,
            joinUrl: response.data.join_url,
            startUrl: response.data.start_url,
            password: response.data.password
        });
    } catch (err) {
        handleError(res, err, 'create-zoom-meeting');
    }
});
// 2. Zoom SDK Signature Generation (Meeting SDK)
app.post('/api/zoom/signature', (req, res) => {
    try {
        const { meetingNumber, role } = req.body;
        // Fallback to CLIENT_ID/SECRET if SDK_KEY/SECRET are not set
        const sdkKey = process.env.ZOOM_SDK_KEY || process.env.ZOOM_CLIENT_ID;
        const sdkSecret = process.env.ZOOM_SDK_SECRET || process.env.ZOOM_CLIENT_SECRET;

        if (!sdkKey || !sdkSecret) {
            console.error('[Zoom Signature] Missing Credentials in .env');
            return res.status(500).json({ error: 'Zoom SDK Credentials missing on server. Check .env for ZOOM_SDK_KEY or ZOOM_CLIENT_ID.' });
        }

        const iat = Math.floor(Date.now() / 1000) - 30;
        const exp = iat + 60 * 60 * 2; // 2 hours

        const payload = {
            sdkKey: sdkKey,
            appKey: sdkKey, // Required for SDK v5.0+
            mn: meetingNumber,
            role: role, // 0 for attendee, 1 for host
            iat: iat,
            exp: exp,
            tokenExp: exp,
            video_webrtc_mode: 1 // Force WebRTC mode to prevent "Job was cancelled" and "Gallery View Not Supported" errors
        };

        const jwt = require('jsonwebtoken');
        const signature = jwt.sign(payload, sdkSecret, { algorithm: 'HS256' });

        console.log(`[Zoom Signature] Generated for meeting: ${meetingNumber}`);
        // Return BOTH the signature and the sdkKey to ensure frontend syncs correctly
        res.json({ 
            signature, 
            sdkKey: sdkKey 
        });

    } catch (err) {
        console.error('[Zoom Signature Error]', err);
        res.status(500).json({ error: 'Signature generation failed' });
    }
});

app.post('/api/zoom/webhook', async (req, res) => {
    try {
        const { event, payload } = req.body;
        const secretToken = process.env.ZOOM_SECRET_TOKEN?.trim();

        // 1. URL Validation (Required by Zoom to activate webhooks)
        if (event === 'endpoint.url_validation') {
            if (!secretToken) {
                console.warn('[Zoom Webhook] No ZOOM_SECRET_TOKEN found for validation');
                return res.status(400).send('No secret token configured');
            }

            const hash = require('crypto')
                .createHmac('sha256', secretToken)
                .update(payload.plainToken)
                .digest('hex');

            console.log('[Zoom Webhook] Responding to validation');
            return res.status(200).json({
                plainToken: payload.plainToken,
                encryptedToken: hash
            });
        }

        // 2. Event Verification (Security check for other events)
        const signature = req.headers['x-zm-signature'];
        if (signature && secretToken) {
            const timestamp = req.headers['x-zm-request-timestamp'];
            const message = `v0:${timestamp}:${JSON.stringify(req.body)}`;
            const hash = require('crypto')
                .createHmac('sha256', secretToken)
                .update(message)
                .digest('hex');
            
            const expectedSignature = `v0=${hash}`;
            if (signature !== expectedSignature) {
                console.error('[Zoom Webhook] Invalid signature');
                return res.status(401).send('Invalid signature');
            }
        }

        // 3. Handle specific events
        console.log(`[Zoom Webhook] Event Received: ${event}`);
        
        switch (event) {
            case 'meeting.started':
                await LiveClass.findOneAndUpdate(
                    { meeting_id: payload.object.id.toString() },
                    { status: 'live' }
                );
                break;
            case 'meeting.ended':
                await LiveClass.findOneAndUpdate(
                    { meeting_id: payload.object.id.toString() },
                    { status: 'ended' }
                );
                break;
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error('[Zoom Webhook Error]', err);
        res.status(500).send('Internal Server Error');
    }
});


// --- Question Bank Generator Proxy ---
app.post('/api/manager/generate-questions', authenticateToken, requireInstructor, async (req, res) => {
    console.log('[API] Generate Questions Request:', req.body.topic, req.body.type);
    const { topic, type, count, difficulty, prompt } = req.body;
    
    // Determine webhook URL based on type
    const N8N_MCQ_WEBHOOK = process.env.N8N_MCQ_GENERATOR_URL || 'https://aotms.app.n8n.cloud/webhook/generate-quiz';
    const N8N_TRUE_FALSE_WEBHOOK = process.env.N8N_TRUE_FALSE_GENERATOR_URL || 'https://aotms.app.n8n.cloud/webhook/true';
    const N8N_SHORT_ANSWER_WEBHOOK = process.env.N8N_SHORT_ANSWER_GENERATOR_URL || 'https://aotms.app.n8n.cloud/webhook/generate-short-answer';
    const N8N_LONG_ANSWER_WEBHOOK = process.env.N8N_LONG_ANSWER_GENERATOR_URL || 'https://aotms.app.n8n.cloud/webhook/generate-long-answer';
    const N8N_FILL_BLANK_WEBHOOK = process.env.N8N_FILL_BLANK_GENERATOR_URL || 'https://aotms.app.n8n.cloud/webhook/generate-fill-blank';
    const N8N_CODING_WEBHOOK = process.env.N8N_CODING_GENERATOR_URL || 'https://aotms.app.n8n.cloud/webhook/generate-coding';
    
    let webhookUrl;
    switch (type) {
        case 'mcq':
            webhookUrl = N8N_MCQ_WEBHOOK;
            break;
        case 'true_false':
            webhookUrl = N8N_TRUE_FALSE_WEBHOOK;
            break;
        case 'short':
        case 'short_answer':
            webhookUrl = N8N_SHORT_ANSWER_WEBHOOK;
            break;
        case 'long':
        case 'long_answer':
            webhookUrl = N8N_LONG_ANSWER_WEBHOOK;
            break;
        case 'fill_blank':
            webhookUrl = N8N_FILL_BLANK_WEBHOOK;
            break;
        case 'coding':
            webhookUrl = N8N_CODING_WEBHOOK;
            break;
        default:
            webhookUrl = N8N_MCQ_WEBHOOK; // Default fallback
    }

    try {
        const response = await axios.post(webhookUrl, {
            topic,
            context: topic, // Alias for older n8n workflows
            type,
            question_type: type, // Alias
            count,
            questionCount: count, // Alias
            difficulty,
            prompt,
            timestamp: new Date().toISOString()
        }, { timeout: 120000 }); // AI generation can be slow

        // Forward the response data directly
        res.json(response.data);
    } catch (error) {
        console.error('Error calling n8n webhook:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to generate questions via AI service' });
        }
    }
});

// --- Code Execution Helper ---
const executeCode = async (language, sourceCode, stdin = '') => {
    // 1. Local JavaScript Execution (VM)
    if (language === 'javascript' || language === 'js' || language === 'node') {
        return new Promise((resolve) => {
            const outputBuffer = [];
            const errorBuffer = [];
            
            // Capture console.log
            const sandbox = {
                console: {
                    log: (...args) => outputBuffer.push(args.map(a => String(a)).join(' ')),
                    error: (...args) => errorBuffer.push(args.map(a => String(a)).join(' ')),
                    warn: (...args) => outputBuffer.push('[WARN] ' + args.map(a => String(a)).join(' '))
                },
                setTimeout: setTimeout,
                clearTimeout: clearTimeout,
                setInterval: setInterval,
                clearInterval: clearInterval,
                process: {
                    exit: (code) => { throw new Error(`Process exited with code ${code}`); }
                }
            };

            try {
                // Create script
                const script = new vm.Script(sourceCode);
                const context = vm.createContext(sandbox);
                
                // Run with timeout
                script.runInContext(context, { timeout: 2000 }); // 2s timeout
                
                resolve({
                    run: {
                        stdout: outputBuffer.join('\n'),
                        stderr: errorBuffer.join('\n'),
                        code: 0,
                        signal: null,
                        output: outputBuffer.join('\n')
                    },
                    language: 'javascript',
                    version: process.version
                });
            } catch (err) {
                resolve({
                    run: {
                        stdout: outputBuffer.join('\n'),
                        stderr: err.toString(),
                        code: 1,
                        signal: null,
                        output: outputBuffer.join('\n') + '\n' + err.toString()
                    },
                    language: 'javascript',
                    version: process.version
                });
            }
        });
    }

    // 2. Fallback to Piston (for other languages) - May fail if not whitelisted
    try {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language,
            version: '*', 
            files: [{ content: sourceCode }],
            stdin: stdin
        });
        return response.data;
    } catch (error) {
        // If Piston fails (400/401/403 whitelist), return a formatted error
        const msg = error.response?.data?.message || error.message;
        return {
            run: {
                stdout: '',
                stderr: `Execution Failed (External API): ${msg}\nNote: Only JavaScript is currently supported locally.`,
                code: 1
            }
        };
    }
};

// --- Piston Code Execution (Run Code) ---
app.post('/api/run-code', authenticateToken, async (req, res) => {
    const { language, version, files, stdin } = req.body;
    
    console.log(`[API] Run Code Request: ${language}`);

    if (!language || !files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'Language and files (array) are required.' });
    }

    try {
        const sourceCode = files[0].content;
        const result = await executeCode(language, sourceCode, stdin);
        res.json(result);
    } catch (err) {
        handleError(res, err, 'run-code');
    }
});

// --- Video Progress Tracking ---

/**
 * @route GET /api/progress/:videoId
 * @desc Fetch video progress for the logged-in user
 */
app.get('/api/progress/:videoId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const videoId = req.params.videoId;
        
        // Find existing progress for this user and video
        const progress = await VideoProgress.findOne({ user_id: userId, video_id: videoId });
        
        if (!progress) {
            return res.json({ 
                last_watched_time: 0, 
                watched_percentage: 0, 
                completed: false 
            });
        }
        
        res.json(progress);
    } catch (err) {
        handleError(res, err, 'get-progress');
    }
});

/**
 * @route POST /api/progress/save
 * @desc Save or update video progress
 */
app.post('/api/progress/save', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { videoId, courseId, watchedPercentage, lastWatchedTime, completed } = req.body;
        
        if (!videoId || !courseId) {
            return res.status(400).json({ error: 'videoId and courseId are required.' });
        }

        console.log(`[Progress] Saving: User=${userId}, Course=${courseId}, Video=${videoId}, %=${watchedPercentage}`);

        const progress = await VideoProgress.findOneAndUpdate(
            { user_id: userId, video_id: videoId },
            {
                $set: {
                    user_id: userId,
                    course_id: courseId,
                    video_id: videoId,
                    watched_percentage: watchedPercentage || 0,
                    last_watched_time: lastWatchedTime || 0,
                    completed: completed || (watchedPercentage >= 95),
                    updated_at: new Date()
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Update overall course progress on every update
        if (courseId) {
             const allVideos = await Video.find({ course_id: courseId }).select('_id').lean();
             const totalVideos = allVideos.length;
             
             console.log(`[Progress Recalc] Course=${courseId}, TotalVideos=${totalVideos}`);

             if (totalVideos > 0) {
                 const allProgress = await VideoProgress.find({ 
                     user_id: userId, 
                     course_id: courseId 
                 }).lean();

                 let totalProgressSum = 0;
                 const progressMap = new Map();
                 allProgress.forEach(p => {
                     // Normalize key for comparison
                     const key = p.video_id?.toString();
                     if (key) progressMap.set(key, p);
                 });

                 allVideos.forEach(v => {
                     const vIdStr = v._id.toString();
                     const p = progressMap.get(vIdStr);
                     if (p) {
                         let vidPercent = 0;
                         if (p.completed) vidPercent = 100;
                         else if (p.watched_percentage !== undefined) vidPercent = p.watched_percentage;
                         else if (p.total_seconds > 0) vidPercent = (p.watched_seconds / p.total_seconds) * 100;
                         
                         totalProgressSum += Math.min(100, Math.max(0, vidPercent));
                     }
                 });

                 const coursePercent = Math.round(totalProgressSum / totalVideos);
                 console.log(`[Progress] Course ${courseId} Recalculated: ${coursePercent}% (User=${userId})`);
                 
                 const updatedEnrollment = await Enrollment.findOneAndUpdate(
                     { user_id: userId, course_id: courseId },
                     { $set: { progress_percentage: coursePercent, last_accessed_at: new Date() } },
                     { new: true }
                 );

                 if (!updatedEnrollment) {
                     console.warn(`[Progress] Enrollment NOT FOUND for user ${userId} and course ${courseId}`);
                 }

                 // Real-time update to the student
                 io.to(userId.toString()).emit('progress_updated', {
                     course_id: courseId,
                     progress: coursePercent,
                     videoId,
                     watchedPercentage
                 });

                 // Also notify admins/managers
                 io.emit('course_enrollments_changed', { courseId, userId });
             } else {
                 // Even if 0 videos, update last_accessed_at
                 await Enrollment.findOneAndUpdate(
                     { user_id: userId, course_id: courseId },
                     { $set: { last_accessed_at: new Date() } }
                 );
             }
        }

        res.json({ success: true, progress });
    } catch (err) {
        handleError(res, err, 'save-progress');
    }
});

// --- Auth Routes ---

app.post('/api/auth/send-otp', async (req, res) => {
    const { email, full_name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        await OTP.findOneAndUpdate(
            { email },
            { otp, full_name, expires_at: expiresAt },
            { upsert: true, new: true }
        );

        console.log(`[AUTH-OTP] OTP for ${email}: ${otp}`);

        // Trigger n8n webhook (Legacy support)
        if (process.env.N8N_EMAIL_WEBHOOK_URL) {
            axios.post(process.env.N8N_EMAIL_WEBHOOK_URL, {
                event: 'otp_request', email, otp, full_name, timestamp: new Date()
            }).catch(e => console.error('n8n OTP trigger failed:', e.message));
        }

        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        handleError(res, err, 'send-otp');
    }
});

app.post('/api/auth/resend-otp', async (req, res) => {
    // Reuse logic, maybe separate if needed differently
    const { email, full_name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    try {
         const otp = Math.floor(100000 + Math.random() * 900000).toString();
         const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
         
         await OTP.findOneAndUpdate(
            { email },
            { otp, full_name, expires_at: expiresAt },
            { upsert: true, new: true }
        );
        console.log(`[AUTH-OTP] Resent OTP for ${email}: ${otp}`);

        if (process.env.N8N_EMAIL_WEBHOOK_URL) {
            axios.post(process.env.N8N_EMAIL_WEBHOOK_URL, {
                event: 'otp_request', email, otp, full_name, timestamp: new Date()
            }).catch(e => console.error('n8n OTP trigger failed:', e.message));
        }

        res.json({ message: 'OTP resent successfully' });
    } catch (err) {
        handleError(res, err, 'resend-otp');
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    try {
        const otpDoc = await OTP.findOne({ email });
        if (!otpDoc) return res.status(400).json({ error: 'No OTP found' });
        if (otpDoc.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
        if (new Date() > otpDoc.expires_at) return res.status(400).json({ error: 'OTP expired' });

        await VerifiedEmail.findOneAndUpdate(
            { email },
            { verified: true, verified_at: new Date() },
            { upsert: true }
        );

        res.json({ success: true, message: 'OTP verified' });
    } catch (err) {
        handleError(res, err, 'verify-otp');
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/auth/refresh', async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'Refresh token required' });
    // In a real app, verify refresh_token in DB. For now, we just mock success if token exists.
    res.json({ 
        session: { 
            access_token: 'new_mock_token_' + Date.now(),
            refresh_token: 'new_mock_refresh_' + Date.now()
        } 
    });
});

app.post('/api/public/enroll', async (req, res) => {
    try {
        const { name, email, phone, course } = req.body;
        if (!name || !email || !phone || !course) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const lead = await Lead.create({ name, email, phone, course });
        res.json({ success: true, message: 'Enrolled successfully', leadId: lead._id });
    } catch (err) {
        handleError(res, err, 'public-enroll');
    }
});

app.post('/api/auth/signup', async (req, res) => {
    const { email, password, fullName, phone } = req.body;
    try {
        // ... (verification check)
        const verifiedDoc = await VerifiedEmail.findOne({ email });
        
        // ... (existing check)
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff`;

        // Create User
        const user = await User.create({
            email,
            password_hash: passwordHash,
            full_name: fullName,
            avatar_url: avatarUrl,
            phone: phone // Store phone in User model too
        });

        // Create Profile
        await Profile.create({
            user_id: user._id,
            email,
            full_name: fullName,
            avatar_url: avatarUrl,
            mobile_number: phone, // Store as mobile_number in Profile
            approval_status: 'pending'
        });

        // Create Role
        await UserRole.create({
            user_id: user._id,
            role: 'student'
        });

        const token = generateToken(user);
        res.json({
            user: { id: user._id, email, full_name: fullName, avatar_url: avatarUrl },
            session: { access_token: token, expires_in: 604800 }
        });

    } catch (err) {
        handleError(res, err, 'signup');
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        const loginIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!user) {
            // Log generic failed attempt for unknown user
            await SecurityEvent.create({
                event_type: 'login_failed_unknown',
                ip_address: loginIp,
                details: { email, timestamp: new Date() }
            });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            // Brute force protection
            user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
            await user.save();

            let errorMessage = 'Invalid credentials';
            
            if (user.failed_login_attempts >= 3) {
                await Profile.findOneAndUpdate({ user_id: user._id }, { approval_status: 'suspended' });
                await SecurityEvent.create({
                    event_type: 'account_auto_suspended',
                    ip_address: loginIp,
                    user_id: user._id,
                    details: { reason: 'Too many failed login attempts', attempts: user.failed_login_attempts }
                });
                errorMessage = 'Account suspended due to too many failed attempts. Contact Administrator.';
            }

            return res.status(401).json({ error: errorMessage });
        }

        // Check if suspended
        const [profile, roleDoc] = await Promise.all([
            Profile.findOne({ user_id: user._id }),
            UserRole.findOne({ user_id: user._id })
        ]);

        if (profile?.approval_status === 'suspended') {
            // Check if auto-unsuspend is applicable
            if (profile?.suspended_until && new Date() > new Date(profile.suspended_until)) {
                profile.approval_status = 'approved';
                profile.suspended_until = null;
                await profile.save();
            } else {
                return res.status(403).json({ error: 'Your account is suspended. Please contact the administrator.' });
            }
        }

        // Login Success Housekeeping
        user.failed_login_attempts = 0;
        user.last_login_ip = loginIp;
        await user.save();

        const userRole = roleDoc ? roleDoc.role : 'student';
        const loginTime = new Date().toISOString();

        console.log(`[Auth] Login Successful: ${email} | Role: ${userRole}`);

        // --- ADMIN OTP GATE ---
        // Admin must verify via OTP before receiving an access token
        if (userRole === 'admin') {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

            await OTP.findOneAndUpdate(
                { email },
                { otp, full_name: user.full_name, expires_at: expiresAt },
                { upsert: true, new: true }
            );

            // Log the OTP dispatch as a security event
            await SecurityEvent.create({
                event_type: 'admin_login_otp_sent',
                user_id: user._id,
                ip_address: loginIp,
                details: { email, timestamp: loginTime }
            });

            // Call n8n webhook to deliver OTP to admin email
            axios.post('https://aotms.app.n8n.cloud/webhook/Email', {
                event: 'admin_login_otp',
                email,
                otp,
                full_name: user.full_name,
                ip: loginIp,
                time: loginTime,
                message: 'Your Admin Login OTP'
            })
            .then(() => console.log(`[Security] Admin OTP webhook SUCCESS for ${email}`))
            .catch(e => console.error(`[Security] Admin OTP webhook ERROR:`, e.message));

            console.log(`[Security] Admin OTP sent to ${email}: ${otp}`);
            return res.json({ requiresOtp: true, message: 'OTP sent to your admin email' });
        }
        // ----------------------

        const token = generateToken(user);

        res.json({
            user: {
                id: user._id,
                email,
                full_name: user.full_name,
                avatar_url: user.avatar_url || (profile ? profile.avatar_url : null),
                role: userRole,
                approval_status: profile ? profile.approval_status : 'pending',
                suspended_until: profile ? profile.suspended_until : null
            },
            session: { access_token: token, expires_in: 604800 }
        });

    } catch (err) {
        handleError(res, err, 'login');
    }
});


// Admin OTP Verification — completes admin login by verifying the OTP sent via n8n
app.post('/api/auth/admin-verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    try {
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) return res.status(400).json({ error: 'OTP not found. Please log in again.' });
        if (otpRecord.otp !== otp) return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
        if (new Date() > new Date(otpRecord.expires_at)) return res.status(400).json({ error: 'OTP has expired. Please log in again.' });

        // Consume the OTP
        await OTP.deleteOne({ email });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const [profile, roleDoc] = await Promise.all([
            Profile.findOne({ user_id: user._id }),
            UserRole.findOne({ user_id: user._id })
        ]);

        const userRole = roleDoc ? roleDoc.role : 'student';
        if (userRole !== 'admin') return res.status(403).json({ error: 'Admin access only.' });

        const token = generateToken(user);
        const loginTime = new Date().toISOString();
        const loginIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Persistent notification for the admin
        await Notification.create({
            user_id: user._id,
            type: 'system',
            title: '🔐 Admin Login Verified',
            message: `OTP verified. Admin session started from IP: ${loginIp} at ${new Date().toLocaleString()}.`,
            data: { ip: loginIp, time: loginTime },
            created_at: new Date()
        });

        // Broadcast to other active admins
        io.emit('admin_login_alert', { email, time: loginTime, ip: loginIp });

        console.log(`[Security] Admin OTP verified — login complete for ${email}`);

        res.json({
            user: {
                id: user._id,
                email,
                full_name: user.full_name,
                avatar_url: user.avatar_url || (profile ? profile.avatar_url : null),
                role: userRole,
                approval_status: profile ? profile.approval_status : 'approved',
                suspended_until: profile ? profile.suspended_until : null
            },
            session: { access_token: token, expires_in: 604800 }
        });
    } catch (err) {
        handleError(res, err, 'admin-verify-otp');
    }
});

// Admin OTP Resend
app.post('/api/auth/admin-resend-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const roleDoc = await UserRole.findOne({ user_id: user._id });
        if (!roleDoc || roleDoc.role !== 'admin') return res.status(403).json({ error: 'Admin access only.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.findOneAndUpdate(
            { email },
            { otp, full_name: user.full_name, expires_at: expiresAt },
            { upsert: true, new: true }
        );

        axios.post('https://aotms.app.n8n.cloud/webhook/Email', {
            event: 'admin_login_otp',
            email,
            otp,
            full_name: user.full_name,
            time: new Date().toISOString(),
            message: 'Your Admin Login OTP (Resent)'
        })
        .then(() => console.log(`[Security] Admin OTP resend webhook SUCCESS for ${email}`))
        .catch(e => console.error(`[Security] Admin OTP resend webhook ERROR:`, e.message));

        console.log(`[Security] Admin OTP resent to ${email}: ${otp}`);
        res.json({ message: 'OTP resent successfully' });
    } catch (err) {
        handleError(res, err, 'admin-resend-otp');
    }
});

// Self-Upgrade endpoint (for dev/setup phase)
app.post('/api/auth/self-upgrade', authenticateToken, async (req, res) => {
    const { email } = req.user;
    // Allow raman or aotms emails to upgrade
    if (!email.toLowerCase().includes('raman') && !email.toLowerCase().includes('aotms')) {
        return res.status(403).json({ error: 'This secret feature is not available for your email.' });
    }

    try {
        const UserRole = mongoose.model('UserRole');
        const roleDoc = await UserRole.findOneAndUpdate(
            { user_id: req.user.id },
            { role: 'manager', updated_at: new Date() },
            { upsert: true, new: true }
        );
        res.json({ success: true, message: 'Your role has been upgraded to MANAGER', role: roleDoc.role });
    } catch (err) {
        handleError(res, err, 'self-upgrade');
    }
});

// --- Admin/User Management ---

app.put('/api/admin/update-user-role', authenticateToken, requireAdmin, async (req, res) => {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ error: 'Missing userId or role' });

    try {
        await UserRole.findOneAndUpdate(
            { user_id: userId },
            { role, updated_at: new Date() },
            { upsert: true }
        );

        if (['admin', 'manager'].includes(role)) {
            await Profile.findOneAndUpdate({ user_id: userId }, { approval_status: 'approved' });
        }

        res.json({ message: 'User role updated', userId, role });
    } catch (err) {
        handleError(res, err, 'update-role');
    }
});

app.put('/api/admin/update-user-status', authenticateToken, requireAdmin, async (req, res) => {
    const { userId, status } = req.body;
    if (!userId || !status) return res.status(400).json({ error: 'Missing userId or status' });

    try {
        let updateData = { approval_status: status, updated_at: new Date() };
        
        if (status === 'suspended' && req.body.suspensionDays) {
            const suspendedUntil = new Date();
            suspendedUntil.setDate(suspendedUntil.getDate() + parseInt(req.body.suspensionDays));
            updateData.suspended_until = suspendedUntil;
        } else if (status === 'approved') {
            updateData.suspended_until = null;
        }

        await Profile.findOneAndUpdate(
            { user_id: userId },
            updateData,
            { new: true }
        );

        // Notify user via socket for real-time suspension/approval
        if (status === 'suspended') {
            io.to(userId.toString()).emit('user_suspended', { 
                suspended_until: updateData.suspended_until 
            });
        } else if (status === 'approved') {
            io.to(userId.toString()).emit('user_approved');
        }

        res.json({ message: `User status updated to ${status}` });
    } catch (err) {
        handleError(res, err, 'update-user-status');
    }
});

app.post('/api/admin/send-approval-email', authenticateToken, requireAdmin, async (req, res) => {
    const { userId } = req.body;
    try {
        const profile = await Profile.findOne({ user_id: userId });
        if (!profile) return res.status(404).json({ error: 'User not found' });

        if (process.env.N8N_EMAIL_WEBHOOK_URL) {
            axios.post(process.env.N8N_EMAIL_WEBHOOK_URL, {
                event: 'user_approved',
                email: profile.email,
                full_name: profile.full_name,
                user_id: userId,
                timestamp: new Date()
            }).catch(e => console.error('n8n trigger failed', e.message));
        }
        res.json({ message: 'Approval email sent' });
    } catch (err) {
        handleError(res, err, 'send-approval-email');
    }
});

app.post('/api/rpc/log_admin_action', authenticateToken, requireAdminOrManager, async (req, res) => {
    const { _module, _action, _details } = req.body;
    try {
        await SystemLog.create({
            log_type: 'audit',
            module: _module,
            action: _action,
            details: _details,
            user_id: req.user.id
        });
        res.json({ success: true });
    } catch (err) {
        handleError(res, err, 'log-admin-action');
    }
});

app.put('/api/admin/approve-course', authenticateToken, requireAdmin, async (req, res) => {
    const { courseId, status, rejectionReason } = req.body;
    if (!courseId || !status) return res.status(400).json({ error: 'Missing courseId or status' });

    try {
        const updateData = {
            status,
            reviewed_at: new Date(),
            reviewed_by: req.user.id,
            updated_at: new Date()
        };
        if (rejectionReason) updateData.rejection_reason = rejectionReason;

        const course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
        
        // Log action
        await SystemLog.create({
            log_type: 'audit',
            module: 'Course',
            action: `Course ${status}`,
            details: { course_id: courseId, status },
            user_id: req.user.id
        });

        res.json({ message: `Course ${status}`, course });
    } catch (err) {
        handleError(res, err, 'approve-course');
    }
});

app.put('/api/admin/toggle-course-active', authenticateToken, requireAdminOrManager, async (req, res) => {
    const { courseId, is_active } = req.body;
    if (!courseId) return res.status(400).json({ error: 'Missing courseId' });

    try {
        const course = await Course.findByIdAndUpdate(
            courseId, 
            { is_active, updated_at: new Date() }, 
            { new: true }
        );
        
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Log action
        await SystemLog.create({
            log_type: 'audit',
            module: 'Course',
            action: `Course ${is_active ? 'Activated' : 'Deactivated'}`,
            details: { course_id: courseId, is_active },
            user_id: req.user.id
        });

        res.json({ message: `Course ${is_active ? 'activated' : 'deactivated'}`, course });
    } catch (err) {
        handleError(res, err, 'toggle-course-active');
    }
});


app.put('/api/admin/approve-question-bank', authenticateToken, requireAdmin, async (req, res) => {
    const { topic, status, course_id } = req.body;
    if (!topic || !status) return res.status(400).json({ error: 'Missing topic or status' });

    try {
        const updateData = {
            approval_status: status,
            course_id: course_id || undefined,
            updated_at: new Date()
        };

        const result = await QuestionBank.updateMany({ topic }, updateData);
        
        // Log action
        await SystemLog.create({
            log_type: 'audit',
            module: 'QuestionBank',
            action: `Question Bank ${status} for topic: ${topic}`,
            details: { topic, status, modified_count: result.modifiedCount },
            user_id: req.user.id
        });

        res.json({ message: `Question Bank for ${topic} ${status}`, modified_count: result.modifiedCount });
    } catch (err) {
        handleError(res, err, 'approve-question-bank');
    }
});

// Remove/Disable Question Bank
app.delete('/api/admin/question-bank/:topic', authenticateToken, requireAdmin, async (req, res) => {
    const { topic } = req.params;
    if (!topic) return res.status(400).json({ error: 'Missing topic' });

    try {
        const result = await QuestionBank.deleteMany({ topic });
        
        // Log action
        await SystemLog.create({
            log_type: 'audit',
            module: 'QuestionBank',
            action: `Question Bank Permanently Removed for topic: ${topic}`,
            details: { topic, deleted_count: result.deletedCount },
            user_id: req.user.id
        });

        res.json({ message: `Question Bank for ${topic} permanently removed`, deleted_count: result.deletedCount });
    } catch (err) {
        handleError(res, err, 'remove-question-bank');
    }
});

// Get Student Access List for Question Bank
app.get('/api/admin/question-bank/:topic/access-list', authenticateToken, requireAdmin, async (req, res) => {
    const { topic } = req.params;
    if (!topic) return res.status(400).json({ error: 'Missing topic' });

    try {
        const accesses = await StudentExamAccess.find({ 
            question_bank_topic: topic,
            access_type: 'question_bank'
        })
        .populate('student_id', 'full_name email avatar_url')
        .populate('assigned_by', 'full_name')
        .sort({ granted_at: -1 })
        .lean();

        const data = accesses.map(a => ({
            student_id: a.student_id?._id,
            student_name: a.student_id?.full_name || 'Unknown',
            student_email: a.student_id?.email || 'N/A',
            student_avatar: a.student_id?.avatar_url || '',
            assigned_by: a.assigned_by?.full_name || 'System',
            granted_at: a.granted_at,
            access_type: a.access_type
        }));

        res.json({
            topic,
            total_count: data.length,
            students: data
        });
    } catch (err) {
        handleError(res, err, 'get-qb-access-list');
    }
});


app.get('/api/admin/courses-with-instructors', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const courses = await Course.find()
            .sort({ created_at: -1 })
            .lean();

        // Get all unique instructor IDs
        const instructorIds = [...new Set(courses.map(c => c.instructor_id).filter(id => id))];

        // Fetch profiles for these instructors
        const profiles = await Profile.find({ user_id: { $in: instructorIds } }).lean();
        const profileMap = profiles.reduce((acc, p) => {
            acc[p.user_id] = p;
            return acc;
        }, {});

        // Map courses to include instructor details
        const data = courses.map(course => {
            const instructor = profileMap[course.instructor_id] || {};
            return {
                ...course,
                id: course._id, // Ensure id is present for frontend
                instructor_name: instructor.full_name || 'Unknown',
                instructor_email: instructor.email || '',
                instructor_avatar: instructor.avatar_url || ''
            };
        });

        res.json(data);
    } catch (err) {
        handleError(res, err, 'admin-courses-with-instructors');
    }
});

app.get('/api/admin/course-enrollments/:courseId', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ course_id: req.params.courseId })
            .populate('user_id')
            .lean();

        // Get profiles for these users to get mobile numbers
        const userIds = enrollments.map(e => e.user_id?._id).filter(id => id);
        const [profiles, roles] = await Promise.all([
            Profile.find({ user_id: { $in: userIds } }).lean(),
            UserRole.find({ user_id: { $in: userIds } }).lean()
        ]);

        const profileMap = profiles.reduce((acc, p) => { acc[p.user_id] = p; return acc; }, {});
        const roleMap = roles.reduce((acc, r) => { acc[r.user_id] = r.role; return acc; }, {});

        const data = enrollments.map(e => {
            const user = e.user_id || {};
            const profile = profileMap[user._id] || {};
            return {
                id: e._id,
                student_id: user._id,
                full_name: user.full_name || profile.full_name,
                email: user.email || profile.email,
                avatar_url: user.avatar_url || profile.avatar_url,
                mobile_number: profile.mobile_number || 'N/A',
                role: roleMap[user._id] || 'student',
                status: e.status,
                progress: e.progress_percentage || 0,
                enrolled_at: e.enrolled_at
            };
        });

        res.json(data);
    } catch (err) {
        handleError(res, err, 'admin-course-enrollments');
    }
});

app.get('/api/admin/instructors', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        // 1. Get everyone with instructor role
        const roleUsers = await UserRole.find({ role: 'instructor' });
        const instructorRoleIds = roleUsers.map(r => r.user_id.toString());

        // 2. Get everyone assigned to a course (handles admins/managers who are teaching)
        const courses = await Course.find({ instructor_id: { $ne: null } }).select('instructor_id');
        const assignedIds = courses.map(c => c.instructor_id.toString());

        // 3. Combine unique IDs
        const allInstructorIds = Array.from(new Set([...instructorRoleIds, ...assignedIds]));

        // 4. Fetch Users and Profiles
        const [users, profiles] = await Promise.all([
            User.find({ _id: { $in: allInstructorIds } }).select('full_name email avatar_url created_at'),
            Profile.find({ user_id: { $in: allInstructorIds } })
        ]);

        const profileMap = new Map(profiles.map(p => [p.user_id.toString(), p]));

        const result = users.map(u => {
            const userId = u._id.toString();
            const p = profileMap.get(userId);
            const roleDoc = roleUsers.find(r => r.user_id.toString() === userId);

            return {
                user_id: userId,
                full_name: u.full_name || p?.full_name || 'Instructor',
                email: u.email || p?.email,
                mobile_number: p?.mobile_number || u.phone,
                role: roleDoc?.role || 'instructor', // Default to instructor if teaching but has other role
                created_at: u.created_at || p?.created_at,
                avatar_url: u.avatar_url || p?.avatar_url
            };
        });

        res.json(result);
    } catch (err) {
        handleError(res, err, 'get-admin-instructors');
    }
});

app.post('/api/admin/assign-course', authenticateToken, requireAdminOrManager, async (req, res) => {
    const { courseId, instructorId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'Missing courseId' });

    try {
        const updateData = {
            instructor_id: instructorId || null,
            updated_at: new Date()
        };

        const course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
        
        // Log action
        await SystemLog.create({
            log_type: 'audit',
            module: 'Course',
            action: instructorId ? 'Course Assigned' : 'Course Unassigned',
            details: { course_id: courseId, instructor_id: instructorId },
            user_id: req.user.id
        });

        res.json({ message: 'Course assignment updated', course });
    } catch (err) {
        handleError(res, err, 'assign-course');
    }
});

app.get('/api/admin/lookup-user/:userId', authenticateToken, requireAdminOrManager, async (req, res) => {
    const { userId } = req.params;
    try {
        let user = await User.findById(userId);
        if (!user) {
            const profile = await Profile.findById(userId);
            if (profile) user = await User.findById(profile.user_id);
        }

        if (!user) return res.status(404).json({ error: 'User not found' });

        const profile = await Profile.findOne({ user_id: user._id });
        const userRole = await UserRole.findOne({ user_id: user._id });

        res.json({
            user_id: user._id,
            full_name: user.full_name || profile?.full_name,
            email: user.email || profile?.email,
            avatar_url: user.avatar_url || profile?.avatar_url,
            role: userRole?.role || 'user'
        });
    } catch (err) {
        handleError(res, err, 'lookup-user-admin');
    }
});

app.delete('/api/admin/delete-user/:userId', authenticateToken, requireAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
        // Unassign courses (set to draft so they don't appear without instructor)
        await Course.updateMany(
            { instructor_id: userId },
            { $unset: { instructor_id: "" }, status: 'draft' }
        );
        
        // Delete User Data
        await Promise.all([
            User.findByIdAndDelete(userId),
            Profile.findOneAndDelete({ user_id: userId }),
            UserRole.findOneAndDelete({ user_id: userId })
        ]);

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        handleError(res, err, 'delete-user');
    }
});

// Quality Assurance - Data Summary (Enhanced for Admin Dashboard)
app.get('/api/admin/data-summary', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const [
            users, 
            courses, 
            enrollments, 
            questionBanks, 
            exams, 
            securityEvents,
            pendingCourses,
            pendingEnrollments,
            pendingExams,
            highPriorityEvents,
            activeCoursesCount
        ] = await Promise.all([
            User.countDocuments(),
            Course.countDocuments(),
            Enrollment.countDocuments(),
            QuestionBank.countDocuments(),
            Exam.countDocuments(),
            SecurityEvent.countDocuments(),
            Course.countDocuments({ status: 'pending' }),
            Enrollment.countDocuments({ status: 'pending' }),
            Exam.countDocuments({ approval_status: 'pending' }),
            SecurityEvent.countDocuments({ risk_level: { $in: ['high', 'critical'] }, resolved: false }),
            Course.countDocuments({ is_active: { $ne: false } })
        ]);

        // Aggregate role counts
        const roleCountsRaw = await UserRole.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);
        const roleCounts = {};
        roleCountsRaw.forEach(r => roleCounts[r._id] = r.count);

        res.json({
            users,
            courses,
            activeCourses: activeCoursesCount,
            enrollments,
            questionBanks,
            exams,
            securityEvents,
            pendingCourses,
            pendingEnrollments,
            pendingExams,
            highPriorityEvents,
            roleCounts
        });
    } catch (err) {
        handleError(res, err, 'data-summary');
    }
});

// Admin Student Performance
app.get('/api/admin/student-performance/:studentId', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const profile = await Profile.findOne({ user_id: studentId }).lean();
        const enrollmentsRaw = await Enrollment.find({ user_id: studentId }).populate('course_id', 'title').lean();
        const resultsRaw = await ExamResult.find({ user_id: studentId }).populate('exam_id', 'title').lean();
        
        const performanceData = {
            enrollments: enrollmentsRaw.map(e => ({
                course_name: e.course_id?.title || 'Unknown Course',
                progress: typeof e.progress === 'number' ? e.progress : 0,
                status: e.status || 'Unknown'
            })),
            results: resultsRaw.map(r => ({
                title: r.exam_id?.title || 'Unknown Assessment',
                score: r.score,
                total: r.total_questions || 0,
                percentage: r.percentage,
                date: r.created_at
            })),
            github_url: profile?.github_url || null,
            resume_url: profile?.resume_url || null
        };
        
        res.json(performanceData);
    } catch (err) {
        handleError(res, err, 'student-performance');
    }
});

app.get('/api/admin/exams-list', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const exams = await Exam.find()
            .sort({ created_at: -1 })
            .limit(100)
            .lean();
        
        // Transformed for frontend compatibility
        const transformedExams = exams.map(e => ({ ...e, id: e._id }));
        res.json(transformedExams);
    } catch (err) {
        handleError(res, err, 'exams-list');
    }
});

// Quality Assurance - Get Data Lists
app.get('/api/admin/users-list', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const users = await Profile.find()
            .populate('user_id', 'email created_at')
            .sort({ created_at: -1 })
            .limit(100)
            .lean();
        res.json(users);
    } catch (err) {
        handleError(res, err, 'users-list');
    }
});

app.get('/api/admin/courses-list', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const courses = await Course.find()
            .sort({ created_at: -1 })
            .limit(100)
            .lean();
        res.json(courses);
    } catch (err) {
        handleError(res, err, 'courses-list');
    }
});

app.get('/api/admin/enrollments-list', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('user_id', 'full_name email')
            .populate('course_id', 'title')
            .sort({ enrolled_at: -1 })
            .limit(100)
            .lean();
        res.json(enrollments);
    } catch (err) {
        handleError(res, err, 'enrollments-list');
    }
});

// Quality Assurance - Permanent Delete
app.delete('/api/admin/permanent-delete/:dataType', authenticateToken, requireAdmin, async (req, res) => {
    const { dataType } = req.params;
    
    const validTypes = ['users', 'courses', 'enrollments', 'questionBanks', 'exams', 'conversations'];
    if (!validTypes.includes(dataType)) {
        return res.status(400).json({ error: 'Invalid data type' });
    }

    try {
        let result = { deletedCount: 0 };
        
        switch (dataType) {
            case 'users':
                // Delete all user-related data
                const userIds = await User.find().select('_id').lean();
                const ids = userIds.map(u => u._id);
                
                await Promise.all([
                    User.deleteMany({}),
                    Profile.deleteMany({ user_id: { $in: ids } }),
                    UserRole.deleteMany({ user_id: { $in: ids } }),
                    Enrollment.deleteMany({ user_id: { $in: ids } }),
                    Message.deleteMany({ sender: { $in: ids } }),
                    Conversation.deleteMany({ participants: { $in: ids } })
                ]);
                result.deletedCount = ids.length;
                break;

            case 'courses':
                const courseIds = await Course.find().select('_id').lean();
                const cIds = courseIds.map(c => c._id);
                
                await Promise.all([
                    Course.deleteMany({}),
                    Topic.deleteMany({ course_id: { $in: cIds } }),
                    Module.deleteMany({ course_id: { $in: cIds } }),
                    Video.deleteMany({ course_id: { $in: cIds } }),
                    Enrollment.deleteMany({ course_id: { $in: cIds } })
                ]);
                result.deletedCount = cIds.length;
                break;

            case 'enrollments':
                result = await Enrollment.deleteMany({});
                break;

            case 'questionBanks':
                result = await QuestionBank.deleteMany({});
                break;

            case 'exams':
                const examIds = await Exam.find().select('_id').lean();
                const eIds = examIds.map(e => e._id);
                
                await Promise.all([
                    Exam.deleteMany({}),
                    ExamSchedule.deleteMany({ exam_id: { $in: eIds } }),
                    ExamResult.deleteMany({ exam_id: { $in: eIds } }),
                    StudentExamAccess.deleteMany({ exam_id: { $in: eIds } }),
                    MockPaper.deleteMany({ exam_id: { $in: eIds } })
                ]);
                result.deletedCount = eIds.length;
                break;

            case 'conversations':
                const convIds = await Conversation.find().select('_id').lean();
                const convIdList = convIds.map(c => c._id);
                
                await Promise.all([
                    Conversation.deleteMany({}),
                    Message.deleteMany({ conversation_id: { $in: convIdList } })
                ]);
                result.deletedCount = convIdList.length;
                break;
        }

        // Log the deletion
        await SystemLog.create({
            log_type: 'audit',
            module: 'QualityAssurance',
            action: `Permanent Deletion: ${dataType}`,
            details: { dataType, deletedCount: result.deletedCount, timestamp: new Date() },
            user_id: req.user.id
        });

        res.json({ 
            message: `${dataType} data permanently deleted`,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        handleError(res, err, 'permanent-delete');
    }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        let [role, profile] = await Promise.all([
            getUserRole(req.user.id),
            Profile.findOne({ user_id: req.user.id })
        ]);

        // Auto-Unsuspend check
        if (profile?.approval_status === 'suspended' && profile?.suspended_until && new Date() > new Date(profile.suspended_until)) {
            profile.approval_status = 'approved';
            profile.suspended_until = null;
            await profile.save();
        }

        console.log("==> GET PROFILE DATA SERVING:", profile ? profile.github_url : 'NO PROFILE DOC');

        res.json({
            profile,
            user: {
                id: req.user.id,
                email: req.user.email,
                role: role || 'student',
                full_name: profile?.full_name || null,
                avatar_url: profile?.avatar_url || null,
                approval_status: profile?.approval_status || 'pending',
                suspended_until: profile?.suspended_until || null
            }
        });
    } catch (err) {
        handleError(res, err, 'get-profile');
    }
});
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        console.log("==> SCHEMA KEYS:", Object.keys(Profile.schema.paths));
        console.log("==> PROFILE PUT RECEIVED FOR:", req.user.id);
        console.log("==> PAYLOAD:", req.body);
        const updates = { ...req.body, updated_at: new Date() };
        
        // Update Profile
        await Profile.findOneAndUpdate(
            { user_id: req.user.id },
            { $set: updates },
            { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
        );

        // Update core User record to keep data in sync
        const userUpdates = {};
        if (updates.full_name) userUpdates.full_name = updates.full_name;
        if (updates.avatar_url) userUpdates.avatar_url = updates.avatar_url;
        
        if (Object.keys(userUpdates).length > 0) {
            await User.findByIdAndUpdate(req.user.id, userUpdates);
        }

        res.json({ message: 'Profile updated' });
    } catch (err) {
        handleError(res, err, 'update-profile');
    }
});

// Profile Image Upload (Cloudinary)
app.post('/api/user/profile/image', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        // 1. Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'profile_pics',
            resource_type: 'image'
        });

        const imageUrl = result.secure_url;

        // 2. Update Database (User & Profile models)
        await Promise.all([
            User.findByIdAndUpdate(req.user.id, { avatar_url: imageUrl }),
            Profile.findOneAndUpdate(
                { user_id: req.user.id }, 
                { avatar_url: imageUrl, updated_at: new Date() }
            )
        ]);

        res.json({ success: true, url: imageUrl });
    } catch (err) {
        handleError(res, err, 'upload-profile-image');
    }
});



app.get('/api/admin/conversations', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate('participants', 'full_name avatar_url email')
            .populate('last_message')
            .sort({ updated_at: -1 })
            .lean();

        // Get profiles to check approval_status (blocked/active)
        const userIds = [];
        conversations.forEach(c => {
             if (c.participants) {
                 c.participants.forEach(p => {
                     if (p._id) userIds.push(p._id);
                 });
             }
        });
        
        const profiles = await Profile.find({ user_id: { $in: userIds } }).select('user_id approval_status').lean();
        const statusMap = profiles.reduce((acc, p) => {
            acc[p.user_id.toString()] = p.approval_status;
            return acc;
        }, {});

        // Transform for frontend
        const data = conversations.map(c => ({
            id: c._id,
            participants: (c.participants || []).map(p => ({
                id: p._id,
                name: p.full_name,
                avatar: p.avatar_url,
                email: p.email,
                status: statusMap[p._id.toString()] || 'pending'
            })),
            lastMessage: c.last_message ? {
                content: c.last_message.content,
                timestamp: c.last_message.created_at,
                sender: c.last_message.sender
            } : null,
            updatedAt: c.updated_at
        }));

        res.json(data);
    } catch (err) {
        handleError(res, err, 'admin-get-conversations');
    }
});

app.get('/api/admin/conversations/:id/messages', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const messages = await Message.find({ conversation_id: req.params.id })
            .sort({ created_at: 1 })
            .lean();
            
        res.json(messages.map(m => ({
            id: m._id,
            content: m.content,
            sender: m.sender,
            timestamp: m.created_at,
            status: m.status,
            type: m.type
        })));
    } catch (err) {
        handleError(res, err, 'admin-get-messages');
    }
});

// --- Chat Routes ---


app.get('/api/users/:id/public-profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('full_name avatar_url email created_at');
        if (!user) return res.status(404).json({ error: 'User not found' });

        const role = await getUserRole(userId);
        let details = {};

        if (role === 'instructor') {
            const app = await InstructorApplication.findOne({ user_id: userId });
            details.expertise = app?.area_of_expertise || 'General Instructor';
            details.experience = app?.experience || 'N/A';
            details.bio = app?.custom_expertise || '';
            details.courses_count = await Course.countDocuments({ instructor_id: userId, status: 'published' });
        } else {
            details.enrolled_courses = await Enrollment.countDocuments({ user_id: userId });
            details.completed_courses = await Enrollment.countDocuments({ user_id: userId, status: 'completed' });
        }

        res.json({
            id: user._id,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            email: user.email,
            joined_at: user.created_at,
            role,
            details
        });
    } catch (err) {
        handleError(res, err, 'get-public-profile');
    }
});

app.post('/api/chat/start', authenticateToken, async (req, res) => {
    const { participantId, recipientId } = req.body;
    const targetId = participantId || recipientId;
    
    if (!targetId) return res.status(400).json({ error: 'Missing participantId' });

    try {
        const participant = await User.findById(targetId);
        if (!participant) return res.status(404).json({ error: 'User not found' });

        // Find existing conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.id, targetId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user.id, targetId],
                unread_counts: { [req.user.id]: 0, [targetId]: 0 }
            });
        }

        // Populate for frontend
        const populatedConv = await Conversation.findById(conversation._id)
            .populate('participants', 'full_name avatar_url email')
            .populate('last_message')
            .lean();

        const otherUser = populatedConv.participants.find(p => p._id.toString() !== req.user.id);
        
        const formattedConv = {
            id: populatedConv._id,
            user: otherUser ? {
                id: otherUser._id,
                name: otherUser.full_name,
                avatar: otherUser.avatar_url,
                email: otherUser.email
            } : null,
            lastMessage: populatedConv.last_message ? {
                content: populatedConv.last_message.content,
                timestamp: populatedConv.last_message.created_at,
                status: populatedConv.last_message.status,
                sender: populatedConv.last_message.sender
            } : null,
            unreadCount: populatedConv.unread_counts?.[req.user.id] || 0
        };

        res.json(formattedConv);
    } catch (err) {
        handleError(res, err, 'start-conversation');
    }
});

app.get('/api/chat/conversations', authenticateToken, async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.user.id })
            .populate('participants', 'full_name avatar_url email')
            .populate('last_message')
            .sort({ updated_at: -1 })
            .lean();

        // Transform for frontend
        const data = conversations.map(c => {
            const otherUser = c.participants.find(p => p._id.toString() !== req.user.id);
            return {
                id: c._id,
                user: otherUser ? {
                    id: otherUser._id,
                    name: otherUser.full_name,
                    avatar: otherUser.avatar_url,
                    email: otherUser.email
                } : null,
                lastMessage: c.last_message ? {
                    content: c.last_message.content,
                    timestamp: c.last_message.created_at,
                    status: c.last_message.status,
                    sender: c.last_message.sender
                } : null,
                unreadCount: c.unread_counts?.[req.user.id] || 0
            };
        });

        res.json(data);
    } catch (err) {
        handleError(res, err, 'get-conversations');
    }
});

app.get('/api/chat/messages/:conversationId', authenticateToken, async (req, res) => {
    const { conversationId } = req.params;
    try {
        const messages = await Message.find({ conversation_id: conversationId })
            .sort({ created_at: 1 })
            .lean();
        
        // Mark as read (simple implementation: assume viewing marks all as read for now)
        // Ideally handled via specific socket event or batch update
        await Message.updateMany(
            { conversation_id: conversationId, sender: { $ne: req.user.id }, status: { $ne: 'read' } },
            { status: 'read' }
        );

        // Reset unread count for this user
        await Conversation.findByIdAndUpdate(conversationId, {
            [`unread_counts.${req.user.id}`]: 0
        });

        res.json(messages.map(m => ({
            id: m._id,
            content: m.content,
            sender: m.sender,
            timestamp: m.created_at,
            status: m.status,
            type: m.type
        })));
    } catch (err) {
        handleError(res, err, 'get-messages');
    }
});


app.get('/api/chat/contacts', authenticateToken, async (req, res) => {
    try {
        const role = await getUserRole(req.user.id);
        let contacts = [];

        if (role === 'student') {
            // Students see instructors of courses they are enrolled in
            const enrollments = await Enrollment.find({ 
                user_id: req.user.id, 
                status: 'active' 
            }).lean();
            
            const courseIds = enrollments.map(e => e.course_id);
            const courses = await Course.find({ 
                _id: { $in: courseIds }, 
                instructor_id: { $ne: null } 
            }).lean();
            
            const instructorIds = [...new Set(courses.map(c => c.instructor_id))];
            
            const instructors = await User.find({ _id: { $in: instructorIds } })
                .select('full_name avatar_url email')
                .lean();

            contacts = instructors.map(i => ({
                id: i._id,
                name: i.full_name,
                avatar: i.avatar_url,
                email: i.email,
                role: 'instructor'
            }));

        } else if (role === 'instructor') {
            // Instructors see students enrolled in their courses
            const myCourses = await Course.find({ instructor_id: req.user.id }).select('_id').lean();
            const courseIds = myCourses.map(c => c._id);
            
            const enrollments = await Enrollment.find({ 
                course_id: { $in: courseIds }, 
                status: 'active' 
            })
            .populate('user_id', 'full_name avatar_url email')
            .lean();

            // Deduplicate students
            const studentMap = new Map();
            enrollments.forEach(e => {
                if (e.user_id) {
                    studentMap.set(e.user_id._id.toString(), {
                        id: e.user_id._id,
                        name: e.user_id.full_name,
                        avatar: e.user_id.avatar_url,
                        email: e.user_id.email,
                        role: 'student'
                    });
                }
            });
            
            contacts = Array.from(studentMap.values());
        }

        res.json(contacts);
    } catch (err) {
        handleError(res, err, 'get-chat-contacts');
    }
});

app.post('/api/chat/send', authenticateToken, async (req, res) => {
    const { conversationId, content, type } = req.body;
    try {
        console.log('--- START CHAT SEND ---');
        console.log('Request User:', req.user.id);
        console.log('Conversation ID:', conversationId);

        // Check if user is blocked/suspended
        const profile = await Profile.findOne({ user_id: req.user.id });
        if (profile?.approval_status === 'rejected' || profile?.approval_status === 'suspended') {
            return res.status(403).json({ error: 'Your account has been suspended. You cannot send messages.' });
        }

        // Fetch conversation first to get participants
        // RENAMED from 'conversation' to 'chatConv' to avoid any scope collision
        let chatConv = await Conversation.findById(conversationId);
        if (!chatConv) {
            console.error('Conversation not found:', conversationId);
            return res.status(404).json({ error: 'Conversation not found' });
        }

        console.log('Conversation Found:', chatConv._id);

        // Determine initial status based on recipient online status
        const otherUserId = chatConv.participants.find(p => p.toString() !== req.user.id);
        let initialStatus = 'sent';
        if (otherUserId && userSockets.has(otherUserId.toString())) {
            initialStatus = 'delivered';
        }

        const message = await Message.create({
            conversation_id: conversationId,
            sender: req.user.id,
            content,
            type: type || 'text',
            status: initialStatus
        });

        chatConv = await Conversation.findByIdAndUpdate(
            conversationId,
            { 
                last_message: message._id, 
                updated_at: new Date(),
                // We update unread counts separately below or here if we have the ID
            },
            { new: true }
        );

        if (otherUserId) {
            await Conversation.findByIdAndUpdate(conversationId, {
                $inc: { [`unread_counts.${otherUserId}`]: 1 }
            });
        }

        // Emit socket event to room (real-time)
        io.to(conversationId).emit('receive_message', {
            id: message._id,
            conversationId,
            sender: req.user.id,
            content,
            timestamp: message.created_at,
            status: initialStatus,
            type: message.type
        });

        // Notify specific user if online but maybe not in room (push notification style)
        if (otherUserId) {
            const socketIds = userSockets.get(otherUserId.toString());
            if (socketIds) {
                socketIds.forEach(sid => {
                    io.to(sid).emit('new_message_notification', {
                        senderName: req.user.full_name || 'User',
                        content: content
                    });
                });
            }
        }

        console.log('Message sent successfully:', message._id);
        res.json({ 
            success: true, 
            message: {
                ...message.toObject(),
                id: message._id
            }
        });
    } catch (err) {
        console.error('Error in /api/chat/send:', err);
        handleError(res, err, 'send-message');
    }
});

app.post('/api/chat/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'chat_uploads',
            resource_type: 'auto'
        });

        res.json({ url: result.secure_url });
    } catch (err) {
        handleError(res, err, 'chat-upload');
    }
});

app.put('/api/chat/block-user', authenticateToken, requireAdminOrManager, async (req, res) => {
    // Already implemented as /api/admin/update-user-status but specialized for chat context if needed
    // We'll reuse update-user-status on frontend, or create a specific chat block if needed.
    // Let's stick to update-user-status for now.
    res.status(501).json({ error: 'Not implemented, use update-user-status' });
});

// --- Course Resources Upload (S3) ---
app.post('/api/upload/course-resources', authenticateToken, requireInstructor, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const originalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `Resources/${Date.now()}_${originalName}`;
        
        // Upload to S3
        const s3Key = await uploadFile(req.file.buffer, fileName, req.file.mimetype);

        // Generate a signed URL immediately so the uploader can preview/download it
        // Or if the bucket is public, construct the public URL.
        // Assuming we want to return a usable URL:
        const signedUrl = await generateViewUrl(s3Key);

        res.json({ 
            url: s3Key, // Store the KEY in the database, not the signed URL
            public_id: s3Key, 
            format: req.file.mimetype.split('/')[1] || 'raw',
            original_filename: req.file.originalname,
            view_url: signedUrl // Frontend can use this immediately
        });
    } catch (err) {
        console.error('Resource upload failed:', err);
        handleError(res, err, 'upload-resource');
    }
});

// Handled by consolidated /api/progress/save route

app.post('/api/student/video-progress', authenticateToken, async (req, res) => {
    try {
        const { courseId, videoId, watchedPercentage, lastWatchedTime, completed } = req.body;
        const userId = req.user.id;

        if (!courseId || !videoId) {
            return res.status(400).json({ error: 'courseId and videoId are required' });
        }

        // 1. Update/Create Video Progress
        await VideoProgress.findOneAndUpdate(
            { user_id: userId, course_id: courseId, video_id: videoId },
            { 
                watched_percentage: watchedPercentage,
                last_watched_time: lastWatchedTime,
                completed: !!completed,
                updated_at: new Date()
            },
            { upsert: true, new: true }
        );

        // 2. Calculate and update overall enrollment progress
        const [allVideos, watchedVideos] = await Promise.all([
            Video.find({ course_id: courseId }).select('_id').lean(),
            VideoProgress.find({ user_id: userId, course_id: courseId, watched_percentage: { $gt: 0 } }).lean()
        ]);

        if (allVideos.length > 0) {
            // Formula: Sum of (watched_percentage / 100) / total_videos * 100
            // We simplify to Sum(watched_percentage) / total_videos 
            const totalPercentage = watchedVideos.reduce((acc, vp) => {
                // Find if this vp belongs to a current video in course
                const exists = allVideos.some(v => v._id.toString() === vp.video_id.toString());
                return exists ? acc + (vp.watched_percentage || 0) : acc;
            }, 0);

            const progress = Math.min(100, Math.round(totalPercentage / allVideos.length));
            
            await Enrollment.findOneAndUpdate(
                { user_id: userId, course_id: courseId },
                { 
                    progress_percentage: progress,
                    last_accessed_at: new Date()
                }
            );
        }

        res.json({ success: true });
    } catch (err) {
        handleError(res, err, 'save-video-progress');
    }
});

app.get('/api/student/video-progress/:courseId', authenticateToken, async (req, res) => {
    try {
        const progress = await VideoProgress.find({ 
            user_id: req.user.id, 
            course_id: req.params.courseId 
        });
        res.json(progress);
    } catch (err) {
        handleError(res, err, 'get-student-progress');
    }
});

app.get('/api/instructor/student-progress/:studentId', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { courseId } = req.query;
        
        const query = { user_id: studentId };
        if (courseId) {
            query.course_id = courseId;
        }
        
        const progress = await VideoProgress.find(query).lean();
        res.json(progress);
    } catch (err) {
        handleError(res, err, 'get-student-progress-instructor');
    }
});

app.get('/api/instructor/course-progress/:courseId', authenticateToken, requireInstructor, async (req, res) => {
    try {
        // Returns progress for all students enrolled in this course
        // Grouped by student
        const enrollments = await Enrollment.find({ course_id: req.params.courseId })
            .populate('user_id', 'full_name email avatar_url')
            .lean();
            
        const studentIds = enrollments.map(e => e.user_id?._id).filter(id => id);
        
        const allProgress = await VideoProgress.find({ 
            course_id: req.params.courseId,
            user_id: { $in: studentIds }
        }).lean();

        // Map progress to students
        const data = enrollments.map(enrollment => {
            const studentId = enrollment.user_id?._id?.toString();
            const studentProgress = allProgress.filter(p => p.user_id.toString() === studentId);
            const videosCompleted = studentProgress.filter(p => p.completed).length;
            
            return {
                student: {
                    id: studentId,
                    name: enrollment.user_id?.full_name,
                    email: enrollment.user_id?.email,
                    avatar: enrollment.user_id?.avatar_url
                },
                overall_progress: enrollment.progress_percentage,
                videos_completed: videosCompleted,
                last_active: enrollment.last_accessed_at,
                video_details: studentProgress.map(p => ({
                    videoId: p.video_id,
                    watched: p.watched_seconds,
                    total: p.total_seconds,
                    completed: p.completed,
                    last_watched: p.last_watched_at
                }))
            };
        });

        res.json(data);
    } catch (err) {
        handleError(res, err, 'get-course-progress-instructor');
    }
});

// --- Instructor Routes ---

app.post('/api/instructor/register', upload.single('resume'), async (req, res) => {
    const { email, password, fullName, areaOfExpertise, customExpertise, experience } = req.body;
    try {
        // Reuse Signup Logic (Partial)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ email, password_hash: passwordHash, full_name: fullName });
        }

        // Create Application
        await InstructorApplication.create({
            user_id: user._id,
            full_name: fullName,
            email,
            area_of_expertise: areaOfExpertise === 'Other' ? customExpertise : areaOfExpertise,
            custom_expertise: areaOfExpertise === 'Other' ? customExpertise : null,
            experience,
            status: 'pending'
        });

        // Ensure Profile
        await Profile.findOneAndUpdate(
            { user_id: user._id },
            { user_id: user._id, email, full_name: fullName, approval_status: 'pending' },
            { upsert: true }
        );

        // Set Role
        await UserRole.findOneAndUpdate(
            { user_id: user._id },
            { role: 'instructor' },
            { upsert: true }
        );

        res.json({ message: 'Instructor application submitted', userId: user._id });

    } catch (err) {
        handleError(res, err, 'instructor-register');
    }
});

app.post('/api/instructor/choose-course', authenticateToken, requireInstructor, async (req, res) => {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        
        if (course.instructor_id && course.instructor_id.toString() !== req.user.id) {
            return res.status(400).json({ error: 'Course already assigned to another instructor' });
        }

        course.instructor_id = req.user.id;
        course.status = 'pending';
        course.updated_at = new Date();
        await course.save();

        res.json({ message: 'Course requested successfully' });

        // Notify Admins/Managers (Broadly for now, or specific)
        // We'll emit to a general 'admin' room if implemented, 
        // but for now let's just log and show how it would work.
        // In a real app, you'd find admins and send to them.
    } catch (err) {
        handleError(res, err, 'choose-course');
    }
});

app.get('/api/instructor/courses', authenticateToken, requireInstructor, async (req, res) => {
    try {
        let query = { instructor_id: req.user.id };
        if (req.user.role === 'admin' || req.user.role === 'manager') {
            query = {}; // Managers and admins can see all courses
        }
        const courses = await Course.find(query);
        res.json(courses);
    } catch (err) {
        handleError(res, err, 'instructor-courses');
    }
});

// --- Enrollment & Course Logic ---

app.get('/api/courses/enrollments', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('user_id', 'full_name email mobile_number') // Populate user details
            .populate('course_id', 'title price')   // Populate course details
            .sort({ enrolled_at: -1 });

        // Transform to match frontend expectation
        const data = enrollments.map(e => ({
            id: e._id,
            user_id: e.user_id?._id,
            course_id: e.course_id?._id,
            status: e.status,
            enrollment_date: e.enrolled_at,
            profile: {
                full_name: e.user_id?.full_name,
                email: e.user_id?.email,
                mobile_number: e.user_id?.mobile_number
            },
            course: {
                title: e.course_id?.title,
                price: e.course_id?.price
            },
            progress_percentage: e.progress_percentage || 0,
            utr_number: e.utr_number,
            payment_proof_url: e.payment_proof_url,
            applied_coupon: e.applied_coupon,
            final_price: e.final_price || e.course_id?.price,
            payment_term: e.payment_term || 'full',
            remaining_balance: e.remaining_balance || 0
        }));

        res.json(data);
    } catch (err) {
        handleError(res, err, 'get-enrollments-admin');
    }
});

app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'payment_proofs'
        });
        
        res.json({ url: result.secure_url, public_id: result.public_id });
    } catch (err) {
        handleError(res, err, 'upload-file');
    }
});

app.post('/api/courses/enroll', authenticateToken, async (req, res) => {
    const { course_id, courseId, payment_proof_url, utr_number, coupon_code, payment_term = 'full' } = req.body;
    const finalCourseId = course_id || courseId;
    if (!finalCourseId) return res.status(400).json({ error: 'Course ID required' });

    try {
        const course = await Course.findById(finalCourseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        let basePrice = course.price || 0;
        let couponApplied = null;

        if (coupon_code) {
            const coupon = await Coupon.findOne({ 
                code: coupon_code.toUpperCase(), 
                user_id: req.user.id, 
                is_used: false 
            });
            if (coupon) {
                basePrice = coupon.discounted_price;
                couponApplied = coupon.code;
                coupon.is_used = true;
                await coupon.save();
            }
        }

        let amountToPay = basePrice;
        let balance = 0;

        if (payment_term === 'term1') {
            amountToPay = Math.round(basePrice * 0.6);
            balance = basePrice - amountToPay;
        } else if (payment_term === 'term2') {
            amountToPay = Math.round(basePrice * 0.4);
            balance = 0; // Assuming this is the final payment
        }

        await Enrollment.findOneAndUpdate(
            { user_id: req.user.id, course_id: finalCourseId },
            { 
                status: 'pending', 
                enrolled_at: new Date(),
                progress_percentage: 0,
                payment_proof_url: payment_proof_url || null,
                utr_number: utr_number || null,
                applied_coupon: couponApplied,
                final_price: amountToPay,
                payment_term: payment_term,
                remaining_balance: balance
            },
            { upsert: true, new: true }
        );

        res.json({ message: 'Enrollment application submitted! Waiting for administrative approval.' });

        // Notify Instructor
        if (course.instructor_id) {
            const studentName = (await User.findById(req.user.id))?.full_name || 'A new student';
            sendNotification(course.instructor_id, {
                type: 'enrollment_request',
                title: 'New Enrollment Request',
                message: `${studentName} wants to join your course: ${course.title}`,
                courseId: finalCourseId
            });
        }

        // Notify Admin/Manager for Approval
        const admins = await User.find({ role: { $in: ['admin', 'manager'] } });
        admins.forEach(admin => {
            sendNotification(admin._id.toString(), {
                type: 'enrollment_request_admin',
                title: 'Enrollment Approval Needed',
                message: `New payment proof submitted for ${course.title}. Click to review.`,
                courseId: finalCourseId,
                severity: 'high'
            });
        });

        // Emit Socket Event for Real-time Dashboard Updates
        io.emit('course_enrollments_changed', { courseId: finalCourseId });
    } catch (err) {
        handleError(res, err, 'enroll-course');
    }
});

app.get('/api/courses/enrollment/:courseId', authenticateToken, async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({ 
            user_id: req.user.id, 
            course_id: req.params.courseId 
        });
        res.json({ enrolled: !!enrollment });
    } catch (err) {
        handleError(res, err, 'check-enrollment');
    }
});

app.get('/api/student/my-courses', authenticateToken, async (req, res) => {
    try {
        // Fetch enrollments and populate nested course details in one go
        const enrollments = await Enrollment.find({ user_id: req.user.id })
            .populate('course_id')
            .sort({ enrolled_at: -1 })
            .lean();

        // Filter out enrollments for courses that are missing or deactivated
        const activeEnrollments = enrollments.filter(e => e.course_id && e.course_id.is_active !== false);

        // Transform into a flat structure for easier frontend consumption
        const data = activeEnrollments.map(e => {
            const course = e.course_id || {};
            return {
                id: course._id,
                enrollmentId: e._id,
                title: course.title || 'Untitled Course',
                description: course.description || '',
                category: course.category || 'General',
                thumbnail_url: course.thumbnail_url || '',
                status: course.status || 'published',
                level: course.level || 'Beginner',
                duration: course.duration || '0h',
                instructor_id: course.instructor_id,
                enrollmentStatus: e.status, // active, pending, rejected
                progress: e.progress_percentage || 0,
                enrolled_at: e.enrolled_at,
                price: course.price,
                original_price: course.original_price,
                final_price: e.final_price,
                payment_term: e.payment_term,
                remaining_balance: e.remaining_balance,
                // Virtual/Helper fields for UI badges
                is_active: course.is_active !== false
            };
        });

        res.json(data);
    } catch (err) {
        handleError(res, err, 'student-my-courses');
    }
});

app.delete('/api/courses/enrollment/:id', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Enrollment.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        console.log(`[Admin] Enrollment ${id} deleted by ${req.user.id}`);
        res.json({ message: 'Enrollment deleted successfully', id });
    } catch (err) {
        handleError(res, err, 'delete-enrollment');
    }
});

app.get('/api/student/dashboard-data', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const enrollments = await Enrollment.find({ user_id: userId, status: 'active' }).populate('course_id').lean();
        const activeCourseIds = enrollments
            .filter(e => e.course_id && e.course_id.is_active !== false)
            .map(e => e.course_id._id);

        if (activeCourseIds.length === 0) {
            return res.json({ resources: [], activity: [], skills: [] });
        }

        // 1. Get Recent Resources (top 5 across all active courses)
        const resources = await Resource.find({ 
            course_id: { $in: activeCourseIds } 
        }).sort({ created_at: -1 }).limit(5).lean();

        // 2. Generate Real Activity Data (last 7 days)
        // Groups updated_at counts from VideoProgress
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const videoProgress = await VideoProgress.find({
            user_id: userId,
            course_id: { $in: activeCourseIds },
            updated_at: { $gt: sevenDaysAgo }
        }).select('updated_at watched_percentage').lean();

        // Aggregate by weekday
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const activityMap = {};
        weekdays.forEach(day => activityMap[day] = 0);

        videoProgress.forEach(p => {
            const dayName = weekdays[new Date(p.updated_at).getDay()];
            // Weight: Every 1% watched is 1 "intensity unit", plus base for interaction
            activityMap[dayName] += (p.watched_percentage || 0) + 10;
        });

        const activity = weekdays.map(day => ({ 
            name: day, 
            intensity: Math.min(100, activityMap[day] || 0)
        }));

        // 3. Skill Mastery (Categorized Progress)
        const categories = {};
        enrollments.forEach(e => {
            const cat = e.course_id?.category || 'General';
            if (!categories[cat]) categories[cat] = { sum: 0, count: 0 };
            categories[cat].sum += e.progress_percentage || 0;
            categories[cat].count += 1;
        });

        const skills = Object.keys(categories).map(cat => ({
            name: cat,
            progress: Math.round(categories[cat].sum / categories[cat].count)
        })).slice(0, 4);

        // 4. Mock Test / Exam Performance History (Recent 5)
        const recentResults = await ExamResult.find({ student_id: userId })
            .populate('exam_id', 'title')
            .populate('mock_paper_id', 'title')
            .sort({ submitted_at: -1 })
            .limit(5)
            .lean();

        res.json({ 
            resources, 
            activity, 
            skills, 
            results: recentResults.map(r => ({
                id: r._id,
                title: r.exam_id?.title || r.mock_paper_id?.title || 'Assessment',
                percentage: Math.round(r.percentage || 0),
                score: r.score,
                total: r.total_questions,
                date: r.submitted_at
            }))
        });
    } catch (err) {
        handleError(res, err, 'student-dashboard-data');
    }
});

// --- Resume ATS Scanning (n8n + OpenRouter) ---

app.post('/api/student/scan-resume', authenticateToken, upload.single('resume'), async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await Profile.findOne({ user_id: userId });
        
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        
        // 1. Credits Check (Disabled for Unlimited Access)
        /*
        if ((profile.ats_credits || 0) <= 0) {
            return res.status(403).json({ error: 'No ATS scan credits remaining. Please contact admin for more.' });
        }
        */

        if (!req.file && !req.body.text) {
            return res.status(400).json({ error: 'Please upload a resume file or provide resume text.' });
        }

        let resumeText = req.body.text || "";
        let scanResult;
        
        // 2. OCR Conversion: Extract text from PDF if file is uploaded
        if (req.file) {
            console.log(`[Resume Engine] Received file: ${req.file.originalname} (Mime: ${req.file.mimetype})`);
            
            const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
            
            if (isPdf) {
                try {
                    const pdfParse = require('pdf-parse');
                    const data = await pdfParse(req.file.buffer);
                    resumeText = data.text;
                    console.log(`[OCR Success] Extracted ${resumeText?.length || 0} characters from PDF.`);
                } catch (err) {
                    console.error('[OCR Error] PDF parsing failed:', err);
                }
            }
        }

        // 3. Integration: Call n8n Webhook
        const N8N_URL = process.env.N8N_ATS_WEBHOOK_URL;
        const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY; 
        
        if (N8N_URL) {
            const n8nBody = {
                userId,
                text: resumeText,
                originalName: req.file?.originalname,
                userEmail: req.user.email,
                userName: profile.full_name || req.user.full_name
            };
            
            // If we have a file, send it as Multipart to allow n8n to do its own OCR/Analysis
            if (req.file) {
                const FormData = require('form-data');
                const form = new FormData();
                form.append('resume', req.file.buffer, req.file.originalname);
                form.append('userId', userId);
                form.append('text', resumeText);
                form.append('userEmail', req.user.email);
                form.append('userName', profile.full_name || req.user.full_name);
                
                const n8nResponse = await axios.post(N8N_URL, form, {
                    headers: { ...form.getHeaders() }
                });
                scanResult = n8nResponse.data;
            } else {
                // If only text was provided
                const n8nResponse = await axios.post(N8N_URL, n8nBody);
                scanResult = n8nResponse.data;
            }
        } else if (OPENROUTER_KEY) {
            // Option B: Direct OpenRouter call (if n8n not ready)
            const aiResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are an ATS Expert. Analyze the resume and provide a score (0-100) and analysis. Return JSON: { "score": number, "analysis": { "missing_keywords": [], "formatting_issues": [], "suggestions": [] } }' 
                    },
                    { role: 'user', content: resumeText }
                ],
                response_format: { type: 'json_object' }
            }, {
                headers: { 'Authorization': `Bearer ${OPENROUTER_KEY}` }
            });
            
            scanResult = JSON.parse(aiResponse.data.choices[0].message.content);
        } else {
            // Fallback for Development
            scanResult = {
                score: 82,
                analysis: {
                    missing_keywords: ["Cloud Infrastructure", "CI/CD", "Unit Testing"],
                    formatting_issues: ["Standard professional layout", "Good font choice"],
                    suggestions: ["Quantify your impact with numbers", "Link to your GitHub profile"]
                }
            };
        }

        // 3. Save History
        const finalScore = scanResult.score || scanResult.overall_score || 0;
        
        // Remove score fields from analysis to avoid "Duplicate Score" in DB
        let finalAnalysis;
        if (scanResult.analysis) {
            finalAnalysis = { ...scanResult.analysis };
            delete finalAnalysis.score;
            delete finalAnalysis.overall_score;
        } else {
            finalAnalysis = {
                missing_keywords: scanResult.missing_keywords || scanResult.keywords || [],
                formatting_issues: scanResult.formatting_issues || scanResult.issues || [],
                suggestions: scanResult.suggestions || scanResult.improvements || []
            };
        }

        const scan = await ResumeScan.create({
            user_id: userId,
            score: finalScore,
            analysis: finalAnalysis,
            file_name: req.file?.originalname || 'Text Input',
            created_at: new Date()
        });

        // 4. Update Credits (Disabled for Unlimited Access)
        // profile.ats_credits = Math.max(0, (profile.ats_credits || 0) - 1);
        // await profile.save();

        res.json({
            success: true,
            credits_left: 999, // Faked for UI compatibility
            scan
        });

    } catch (err) {
        console.error('[ATS Scan Error]:', err.message);
        handleError(res, err, 'ats-scan');
    }
});

app.get('/api/admin/resume-scans', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const scans = await ResumeScan.find()
            .populate('user_id', 'full_name email avatar_url')
            .sort({ created_at: -1 });
        res.json(scans);
    } catch (err) {
        handleError(res, err, 'get-all-scans');
    }
});

app.post('/api/admin/refill-ats-credits', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const { userId, credits = 3 } = req.body;
        await Profile.findOneAndUpdate({ user_id: userId }, { ats_credits: credits });
        res.json({ success: true, message: `Credits refilled to ${credits}` });
    } catch (err) {
        handleError(res, err, 'refill-credits');
    }
});

app.get('/api/admin/live-monitoring', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        // 1. Fetch All Enrollments with Progress
        const enrollments = await Enrollment.find()
            .populate('user_id', 'full_name email')
            .populate('course_id', 'title category')
            .sort({ updated_at: -1, enrolled_at: -1 })
            .lean();

        // 2. Fetch All Exam/Mock Results
        const examResults = await ExamResult.find()
            .populate('student_id', 'full_name email')
            .populate('exam_id', 'title exam_type')
            .populate('mock_paper_id', 'title')
            .sort({ submitted_at: -1 })
            .limit(200)
            .lean();

        res.json({
            enrollments: enrollments.map(e => ({
                id: e._id,
                student: e.user_id?.full_name || 'Deleted User',
                email: e.user_id?.email || 'N/A',
                course: e.course_id?.title || 'Unknown Course',
                category: e.course_id?.category || 'General',
                progress: e.progress_percentage || 0,
                status: e.status,
                last_accessed: e.last_accessed_at || e.enrolled_at
            })),
            results: examResults.map(r => ({
                id: r._id,
                student: r.student_id?.full_name || 'Deleted User',
                email: r.student_id?.email || 'N/A',
                test_title: r.exam_id?.title || r.mock_paper_id?.title || 'System Generated Test',
                type: r.exam_id?.exam_type || 'mock',
                score: r.score,
                total: r.total_questions,
                percentage: Math.round(r.percentage || 0),
                time_spent: r.time_spent,
                submitted_at: r.submitted_at
            }))
        });
    } catch (err) {
        handleError(res, err, 'admin-live-monitoring');
    }
});

app.get('/api/student/all-resources', authenticateToken, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user_id: req.user.id, status: 'active' }).select('course_id').lean();
        const courseIds = enrollments.map(e => e.course_id);

        if (courseIds.length === 0) return res.json([]);

        // Get batch assignments for this student across all enrolled courses
        const batchAssignments = await StudentBatch.find({
            student_id: req.user.id,
            course_id: { $in: courseIds }
        }).lean();
        const batchMap = batchAssignments.reduce((acc, sb) => {
            acc[sb.course_id.toString()] = sb.batch_id;
            return acc;
        }, {});

        // Fetch resources course by course with batch filtering
        const resourcePromises = courseIds.map(async (courseId) => {
            const cidStr = courseId.toString();
            const batchFilter = { course_id: courseId };
            if (batchMap[cidStr]) {
                batchFilter.$or = [
                    { allowed_batches: { $exists: false } },
                    { allowed_batches: null },
                    { allowed_batches: { $size: 0 } },
                    { allowed_batches: batchMap[cidStr] }
                ];
            }
            return Resource.find(batchFilter).sort({ created_at: -1 }).limit(10).lean();
        });
        const grouped = await Promise.all(resourcePromises);
        const resources = grouped.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20);

        // Transform S3 keys into signed URLs
        const processedResources = await Promise.all(resources.map(async (item) => {
            if (item.file_url && !item.file_url.startsWith('http')) {
                try {
                    item.view_url = await generateViewUrl(item.file_url);
                } catch (e) {
                    console.error('Error signing file_url:', e);
                }
            } else {
                item.view_url = item.file_url;
            }
            if (item._id) item.id = item._id.toString();
            return item;
        }));

        res.json(processedResources);
    } catch (err) {
        handleError(res, err, 'get-all-student-resources');
    }
});

app.put('/api/courses/enrollment-status', authenticateToken, requireAdmin, async (req, res) => {
    const { enrollmentId, status } = req.body;
    try {
        await Enrollment.findByIdAndUpdate(enrollmentId, { status, updated_at: new Date() });
        res.json({ success: true });

        // Notify Student of approval/rejection
        const enrollment = await Enrollment.findById(enrollmentId);
        if (enrollment) {
            const course = await Course.findById(enrollment.course_id);
            sendNotification(enrollment.user_id, {
                type: 'enrollment_update',
                title: `Enrollment ${status}`,
                message: `Your enrollment for ${course?.title || 'a course'} has been ${status}.`,
                status
            });
        }
    } catch (err) {
        handleError(res, err, 'update-enrollment-status');
    }
});

// --- Student Exam Routes ---

app.get('/api/student/accessible-exams', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.id;

        // 1. Get explicit access records from StudentExamAccess
        const explicitAccess = await StudentExamAccess.find({ student_id: studentId })
            .populate('exam_id')
            .populate('mock_paper_id')
            .lean();

        // 2. Get active enrollments to determine implicit course-based access
        const enrollments = await Enrollment.find({ user_id: studentId, status: 'active' }).lean();
        const enrolledCourseIds = enrollments.map(e => e.course_id);

        // 2.5. Get all results for this student to determine completion status
        const examResults = await ExamResult.find({ student_id: studentId }).select('exam_id mock_paper_id test_title').lean();
        const completedExamIds = new Set(examResults.map(r => r.exam_id?.toString()).filter(Boolean));
        const completedMockIds = new Set(examResults.map(r => r.mock_paper_id?.toString()).filter(Boolean));
        const completedQBTopics = new Set(examResults.map(r => r.test_title).filter(Boolean));

        const checkCompleted = (type, id) => {
            if (type === 'qb') return completedQBTopics.has(id);
            if (type === 'exam') return completedExamIds.has(id?.toString());
            if (type === 'mock') return completedMockIds.has(id?.toString());
            return false;
        };

        // 3. Get implicitly accessible exams (live/scheduled) and mocks via courses
        const courseExams = await Exam.find({ 
            course_id: { $in: enrolledCourseIds },
            approval_status: 'approved',
            status: 'active'
        }).lean();

        // 4. Identify all accessible topics (implicit from courses + explicit granted)
        const explicitQBTopics = explicitAccess
            .filter(a => a.access_type === 'question_bank' && a.question_bank_topic)
            .map(a => a.question_bank_topic);

        // 5. Build the list of Question Banks (qbs)
        const qbs = await QuestionBank.find({
            $or: [
                { course_id: { $in: enrolledCourseIds }, approval_status: 'approved' },
                { topic: { $in: explicitQBTopics }, approval_status: 'approved' }
            ]
        }).lean();

        // 6. Map Question Banks into the "topicMap" for frontend mock test interface
        const topicMap = new Map();
        qbs.forEach(qb => {
            if (!topicMap.has(qb.topic)) {
                // Find if there's an explicit grant for this topic to use its granted_at date
                const explicitGrant = explicitAccess.find(a => a.question_bank_topic === qb.topic);
                
                topicMap.set(qb.topic, {
                    id: `qb_${qb.topic}`,
                    access_type: 'mock', 
                    granted_at: explicitGrant ? explicitGrant.granted_at : (qb.updated_at || qb.created_at),
                    mock_paper_id: `qb_${qb.topic}`, // Topic becomes the ID
                    is_completed: checkCompleted('qb', qb.topic),
                    mock_papers: {
                        title: `${qb.topic} Practice Set${explicitGrant ? ' (Unlocked)' : ''}`,
                        description: `Topic-wise questions for ${qb.topic}`,
                        duration_minutes: 60,
                        total_marks: 0, 
                        question_count: 0
                    }
                });
            }
            const item = topicMap.get(qb.topic);
            item.mock_papers.question_count++;
            item.mock_papers.total_marks++; 
        });

        // 7. Map Course-based Exams into consistent format
        const implicitExams = courseExams.map(exam => {
            const isMock = exam.exam_type === 'mock';
            return {
                id: `implicit_${exam._id}`,
                access_type: isMock ? 'mock' : 'exam',
                granted_at: exam.updated_at || exam.created_at,
                exam_id: isMock ? null : exam._id,
                mock_paper_id: isMock ? exam._id : null,
                is_completed: isMock ? checkCompleted('mock', exam._id) : checkCompleted('exam', exam._id),
                exam_schedules: isMock ? null : {
                    title: exam.title,
                    description: exam.description || '',
                    duration_minutes: exam.duration_minutes,
                    total_marks: exam.total_marks,
                    passing_marks: exam.passing_marks
                },
                mock_papers: isMock ? {
                    title: exam.title,
                    description: exam.description || '',
                    duration_minutes: exam.duration_minutes,
                    total_marks: exam.total_marks,
                    question_count: exam.total_questions || 0
                } : null
            };
        });

        // 8. Map Explicit Exams/Mock Papers from StudentExamAccess
        const explicitExams = explicitAccess
            .filter(a => a.access_type !== 'question_bank')
            .map(access => ({
                id: access._id,
                access_type: access.access_type,
                granted_at: access.granted_at,
                exam_id: access.exam_id?._id,
                mock_paper_id: access.mock_paper_id?._id,
                is_completed: access.access_type === 'mock' 
                    ? checkCompleted('mock', access.mock_paper_id?._id) 
                    : checkCompleted('exam', access.exam_id?._id),
                exam_schedules: access.exam_id ? {
                    title: access.exam_id.title,
                    duration_minutes: access.exam_id.duration_minutes,
                    total_marks: access.exam_id.total_marks,
                    passing_marks: access.exam_id.passing_marks
                } : null,
                mock_papers: access.mock_paper_id ? {
                    title: access.mock_paper_id.title,
                    description: access.mock_paper_id.description || '',
                    duration_minutes: access.mock_paper_id.duration_minutes || 60,
                    question_count: access.mock_paper_id.questions?.length || 0
                } : null
            }));

        // 9. Combine and deduplicate
        const combined = [...explicitExams, ...Array.from(topicMap.values())];
        const existingExamIds = new Set(explicitExams.map(e => e.exam_id?.toString()).filter(Boolean));
        const existingMockIds = new Set(explicitExams.map(e => e.mock_paper_id?.toString()).filter(Boolean));

        implicitExams.forEach(ia => {
             const examId = ia.exam_id?.toString();
             const mockId = ia.mock_paper_id?.toString();
             
             if (examId && !existingExamIds.has(examId)) {
                 combined.push(ia);
             } else if (mockId && !existingMockIds.has(mockId)) {
                 combined.push(ia);
             }
        });

        res.json(combined);
    } catch (err) {
        handleError(res, err, 'student-accessible-exams');
    }
});

app.get('/api/student/exam-questions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        let questions = [];

        if (id.startsWith('qb_')) {
            const topic = id.replace('qb_', '');
            questions = await QuestionBank.find({ 
                topic, 
                approval_status: 'approved' 
            }).lean();
        } else {
            // Try to find as Mock Paper first
            const mockPaper = await MockPaper.findById(id).populate('questions').lean();
            if (mockPaper) {
                questions = mockPaper.questions || [];
            } else {
                // Try as Exam
                const exam = await Exam.findById(id).lean();
                if (exam) {
                    // Fetch by topics if exam refers to QB topics, or other logic
                    questions = await QuestionBank.find({ 
                        topic: { $in: exam.topics }, 
                        approval_status: 'approved' 
                    })
                    .limit(exam.total_questions || 50)
                    .lean();
                }
            }
        }

        // Shuffle questions for simulation integrity
        questions = questions.sort(() => Math.random() - 0.5);

        // Sanitize: Map to standard format and remove status/approvals
        const data = questions.map(q => ({
            id: q._id,
            text: q.question_text,
            type: q.type,
            options: q.options.map(opt => ({ id: opt._id || Math.random(), text: opt.text })),
            // Do NOT send is_correct to frontend during exam
            marks: q.marks || 1
        }));

        res.json(data);
    } catch (err) {
        handleError(res, err, 'get-exam-questions');
    }
});

// --- Manager Routes ---

app.get('/api/manager/lookup-student/:studentId', authenticateToken, requireAdminOrManager, async (req, res) => {
    const { studentId } = req.params;
    try {
        // Try to find by User ID
        let user = await User.findById(studentId);
        if (!user) {
            // Fallback: Try to find by Profile ID
            const profile = await Profile.findById(studentId);
            if (profile) {
                user = await User.findById(profile.user_id);
            }
        }

        if (!user) return res.status(404).json({ error: 'Student not found' });

        const profile = await Profile.findOne({ user_id: user._id });
        
        res.json({
            id: user._id,
            full_name: user.full_name,
            email: user.email,
            avatar_url: user.avatar_url,
            role: 'student', // Default assumption unless role checked
            profile: profile
        });
    } catch (err) {
        handleError(res, err, 'lookup-student');
    }
});

app.get('/api/admin/student-performance/:studentId', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const { studentId } = req.params;
        const enrollments = await Enrollment.find({ user_id: studentId }).populate('course_id').lean();
        
        const activeEnrollments = enrollments.filter(e => e.course_id && e.course_id.is_active !== false);
        
        const courseProgress = activeEnrollments.map(e => ({
             course_name: e.course_id.title,
             progress: e.progress_percentage || 0,
             status: e.status
        }));

        const results = await ExamResult.find({ user_id: studentId }).populate('exam_id mock_paper_id').lean();
        
        const profile = await Profile.findOne({ user_id: studentId }).lean();
        
        res.json({
            enrollments: courseProgress,
            results: results.map(r => ({
                title: r.exam_id?.title || r.mock_paper_id?.title || r.test_title || 'Unknown Test',
                score: r.score,
                total: r.total_score || r.total,
                percentage: r.percentage,
                date: r.created_at || r.submitted_at
            })),
            github_url: profile?.github_url,
            resume_url: profile?.resume_url
        });
    } catch (err) {
        handleError(res, err, 'admin-student-performance');
    }
});

app.post('/api/manager/grant-exam-access', authenticateToken, requireAdminOrManager, async (req, res) => {
    const { studentId, examId, mockPaperId } = req.body;
    
    if (!studentId || (!examId && !mockPaperId)) {
        return res.status(400).json({ error: 'Student ID and either Exam ID or Mock Paper ID required' });
    }

    try {
        const accessType = examId ? 'exam' : 'mock';
        
        await StudentExamAccess.findOneAndUpdate(
            { 
                student_id: studentId, 
                exam_id: examId || null, 
                mock_paper_id: mockPaperId || null 
            },
            {
                access_type: accessType,
                assigned_by: req.user.id,
                granted_at: new Date()
            },
            { upsert: true, new: true }
        );

        res.json({ message: 'Access granted successfully' });
    } catch (err) {
        handleError(res, err, 'grant-exam-access');
    }
});

app.get('/api/manager/approved-question-banks', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const banks = await QuestionBank.aggregate([
            { $match: { approval_status: 'approved' } },
            { 
                $group: {
                    _id: '$topic',
                    topic: { $first: '$topic' },
                    count: { $sum: 1 },
                    difficulties: { $addToSet: '$difficulty' },
                    created_at: { $max: '$created_at' },
                    created_by: { $first: '$created_by' }
                }
            },
            { $sort: { created_at: -1 } }
        ]);
        res.json(banks);
    } catch (err) {
        handleError(res, err, 'get-approved-questions-grouped');
    }
});

app.get('/api/admin/question-bank-summary', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const [banks, accessCounts] = await Promise.all([
            QuestionBank.aggregate([
                { 
                    $group: {
                        _id: { topic: '$topic', status: '$approval_status' },
                        topic: { $first: '$topic' },
                        status: { $first: '$approval_status' },
                        count: { $sum: 1 },
                        created_by: { $first: '$created_by' },
                        created_at: { $max: '$created_at' }
                    }
                },
                { $sort: { created_at: -1 } }
            ]),
            StudentExamAccess.aggregate([
                { $match: { access_type: 'question_bank' } },
                { $group: { _id: '$question_bank_topic', count: { $sum: 1 } } }
            ])
        ]);

        // Map access counts for quick lookup
        const accessMap = {};
        accessCounts.forEach(a => { if (a._id) accessMap[a._id] = a.count; });

        // Format the summary response
        const summary = banks.map(b => ({
            topic: b.topic,
            approval_status: b.status,
            count: b.count,
            created_by: b.created_by,
            created_at: b.created_at,
            access_count: accessMap[b.topic] || 0
        }));

        res.json(summary);
    } catch (err) {
        handleError(res, err, 'question-bank-summary');
    }
});

app.get('/api/admin/question-bank/:topic/access-list', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const { topic } = req.params;
        
        // 1. Get explicit access from StudentExamAccess
        const explicitAccess = await StudentExamAccess.find({ 
            question_bank_topic: topic,
            access_type: 'question_bank'
        })
        .populate('student_id', 'full_name email avatar_url')
        .populate('assigned_by', 'full_name')
        .lean();

        // 2. Get implicit access via courses
        // Find courses where this topic is used in QuestionBank
        const qbs = await QuestionBank.find({ topic, approval_status: 'approved', course_id: { $ne: null } }).select('course_id').lean();
        const courseIds = qbs.map(q => q.course_id).filter(id => id);
        
        const courseEnrollments = await Enrollment.find({ 
            course_id: { $in: courseIds },
            status: 'active'
        })
        .populate('user_id', 'full_name email avatar_url')
        .lean();

        // 3. Combine and Deduplicate
        const studentMap = new Map();

        explicitAccess.forEach(a => {
            if (a.student_id) {
                studentMap.set(a.student_id._id.toString(), {
                    student_id: a.student_id._id,
                    student_name: a.student_id.full_name || 'Unknown Student',
                    student_email: a.student_id.email || 'N/A',
                    student_avatar: a.student_id.avatar_url,
                    assigned_by: a.assigned_by?.full_name || 'System',
                    granted_at: a.granted_at
                });
            }
        });

        courseEnrollments.forEach(e => {
            if (e.user_id && !studentMap.has(e.user_id._id.toString())) {
                studentMap.set(e.user_id._id.toString(), {
                    student_id: e.user_id._id,
                    student_name: e.user_id.full_name || 'Unknown Student',
                    student_email: e.user_id.email || 'N/A',
                    student_avatar: e.user_id.avatar_url,
                    assigned_by: 'Course Enrollment',
                    granted_at: e.enrolled_at
                });
            }
        });

        res.json({ students: Array.from(studentMap.values()) });
    } catch (err) {
        handleError(res, err, 'get-qb-access-list');
    }
});

app.post('/api/admin/question-bank/grant-access', authenticateToken, requireAdminOrManager, async (req, res) => {
    const { userId, topic, batchId, type } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic required' });

    try {
        let studentIds = [];
        if (type === 'batch' && batchId) {
            const assignments = await StudentBatch.find({ batch_id: batchId }).select('student_id').lean();
            studentIds = assignments.map(a => a.student_id);
            if (studentIds.length === 0) {
                return res.status(400).json({ error: 'No students found in the selected batch.' });
            }
        } else if (userId) {
            studentIds = [userId];
        } else {
            return res.status(400).json({ error: 'Student ID or Batch ID required' });
        }

        const grants = studentIds.map(studentId => ({
            student_id: studentId,
            question_bank_topic: topic,
            access_type: 'question_bank',
            assigned_by: req.user.id,
            granted_at: new Date()
        }));

        // Use bulkWrite for efficiency
        const operations = grants.map(grant => ({
            updateOne: {
                filter: { student_id: grant.student_id, question_bank_topic: grant.question_bank_topic },
                update: { $set: grant },
                upsert: true
            }
        }));

        await StudentExamAccess.bulkWrite(operations);

        // Send notifications
        for (const studentId of studentIds) {
            sendNotification(studentId.toString(), {
                title: "New Mock Repository Available",
                message: `You have been granted access to the "${topic}" question bank. You can start mock tests now.`,
                type: "mock_test",
                data: { topic }
            });
        }

        res.json({ 
            success: true, 
            message: type === 'batch' 
                ? `Access granted to ${studentIds.length} students in the batch.` 
                : `Access granted to student.` 
        });
    } catch (err) {
        handleError(res, err, 'grant-qb-access-unified');
    }
});

app.post('/api/manager/grant-question-bank-access', authenticateToken, requireInstructor, async (req, res) => {
    const { studentId, topic } = req.body;
    if (!studentId || !topic) return res.status(400).json({ error: 'Student ID and Topic required' });

    try {
        await StudentExamAccess.findOneAndUpdate(
            { student_id: studentId, question_bank_topic: topic },
            {
                access_type: 'question_bank',
                assigned_by: req.user.id,
                granted_at: new Date()
            },
            { upsert: true, new: true }
        );
        
        sendNotification(studentId.toString(), {
            title: "Mock Repository Access",
            message: `You have been granted access to "${topic}".`,
            type: "mock_test",
            data: { topic }
        });

        res.json({ message: `Access granted for topic: ${topic}` });
    } catch (err) {
        handleError(res, err, 'grant-qb-access-manager');
    }
});

app.post('/api/student/submit-exam', authenticateToken, async (req, res) => {
    try {
        const { examId, answers, timeSpent, totalQuestions } = req.body;
        
        // Calculate score server-side
        let score = 0;
        let correctCount = 0;
        let wrongCount = 0;
        const qIds = Object.keys(answers);
        const questions = await QuestionBank.find({ _id: { $in: qIds } }).lean();
        
        // Use for...of loop to allow await for async operations (grading coding questions)
        for (const q of questions) {
            const studentAns = answers[q._id.toString()];
            if (!studentAns) continue; // Skip if not answered

            let isCorrect = false;

            // Normalize question type
            const type = q.type || 'multiple_choice';

            if (type === 'multiple_choice' || type === 'mcq') {
                const correctOpt = q.options.find(opt => opt.is_correct);
                if (correctOpt) {
                    const correctId = correctOpt._id?.toString();
                    const correctText = correctOpt.text;
                    // Check ID match OR exact text match
                    if (studentAns === correctId || studentAns === correctText) {
                        isCorrect = true;
                    }
                }
            } 
            else if (type === 'true_false') {
                // Compare case-insensitive "true"/"false"
                const correctVal = String(q.correct_answer || q.options.find(o => o.is_correct)?.text).toLowerCase();
                if (String(studentAns).toLowerCase() === correctVal) {
                    isCorrect = true;
                }
            } 
            else if (type === 'fill_blank') {
                // Compare trimmed, case-insensitive
                const correctVal = String(q.correct_answer || q.options.find(o => o.is_correct)?.text).trim().toLowerCase();
                if (String(studentAns).trim().toLowerCase() === correctVal) {
                    isCorrect = true;
                }
            }
            else if (type === 'coding') {
                 // AUTO-GRADING FOR CODING
                 // Strategy: Compare the OUTPUT of the student's code with the OUTPUT of the correct_answer (Solution Code).
                 // This allows flexibility in how the student writes code, as long as the output matches.
                 
                 try {
                     // 1. Execute Student Code
                     const studentResult = await executeCode('javascript', studentAns);
                     const studentOutput = studentResult.run ? studentResult.run.stdout.trim() : '';
                     
                     // 2. Execute Solution Code (stored in correct_answer)
                     // If correct_answer is just plain text (not code), this might fail or print nothing, 
                     // so we treat it as the expected output itself if execution produces no output/error? 
                     // No, safer to assume it IS code.
                     const solutionResult = await executeCode('javascript', q.correct_answer || '');
                     const expectedOutput = solutionResult.run ? solutionResult.run.stdout.trim() : '';
                     
                     // 3. Compare Outputs
                     if (studentOutput === expectedOutput && expectedOutput !== '') {
                         isCorrect = true;
                     } else if (expectedOutput === '' && studentOutput === '') {
                         // If both produce no output, is it correct? Maybe.
                         // But usually we expect some output.
                         // Fallback: exact string match of code if output is empty
                         if (String(studentAns).trim() === String(q.correct_answer).trim()) {
                             isCorrect = true;
                         }
                     }
                 } catch (e) {
                     console.error(`Error grading coding question ${q._id}:`, e);
                 }
            }
            else if (type === 'short' || type === 'long' || type === 'short_answer' || type === 'long_answer') {
                 // Logic: If there is a strict answer key, try to match it.
                 // Otherwise, we might mark it as 0 (pending review).
                 // For MVP, we'll leave it as 0 but ensure it's recorded.
                 if (q.correct_answer && String(studentAns).trim() === String(q.correct_answer).trim()) {
                     isCorrect = true; 
                 }
            }

            if (isCorrect) {
                score += q.marks || 1;
                correctCount++;
            } else {
                wrongCount++;
            }
        }

        const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

        const result = await ExamResult.create({
            student_id: req.user.id,
            exam_id: examId.startsWith('qb_') ? null : examId,
            mock_paper_id: examId.startsWith('qb_') ? null : examId, // Alias for now
            test_title: examId.startsWith('qb_') ? examId.replace('qb_', '') : null,
            score,
            total_questions: totalQuestions,
            percentage,
            answers,
            time_spent: timeSpent,
            submitted_at: new Date()
        });

        // Update Leaderboard stats
        await LeaderboardStat.findOneAndUpdate(
            { user_id: req.user.id },
            { 
                $inc: { exams_taken: 1, total_score: score },
                $set: { last_activity: new Date() }
            },
            { upsert: true }
        );

        res.json({ message: 'Exam submitted successfully', resultId: result._id, score, percentage, correctCount, wrongCount });

        // Notify Instructor
        const exam = await Exam.findById(examId);
        if (exam && exam.instructor_id) {
            const student = await User.findById(req.user.id);
            sendNotification(exam.instructor_id, {
                type: 'exam_submission',
                title: 'Exam Submitted',
                message: `${student?.full_name || 'A student'} submitted the exam: ${exam.title}`,
                score,
                percentage
            });
        }
    } catch (err) {
        handleError(res, err, 'submit-exam');
    }
});

app.get('/api/student/exam-review/:resultId', authenticateToken, async (req, res) => {
    try {
        const result = await ExamResult.findById(req.params.resultId).lean();
        if (!result) return res.status(404).json({ error: 'Result not found' });
        
        // Authorization: Only student or staff can view
        if (result.student_id.toString() !== req.user.id) {
            const role = await getUserRole(req.user.id);
            if (!['admin', 'manager', 'instructor'].includes(role)) {
                return res.status(403).json({ error: 'Access denied to this result' });
            }
        }

        // result.answers is a Map in Mongoose, in lean it's a plain object or Map depending on version
        // In this project we'll treat it as a plain object or Map
        const answers = result.answers instanceof Map ? Object.fromEntries(result.answers) : result.answers;
        const qIds = Object.keys(answers);
        const questions = await QuestionBank.find({ _id: { $in: qIds } }).lean();

        const review = questions.map(q => {
            const studentAns = answers[q._id.toString()];
            let isCorrect = false;
            
            // Re-evaluate correctness for review display
            // Note: This duplicates logic from submit-exam but is necessary since we don't store per-question results
            // For Coding, this is imperfect because we can't re-run code here efficiently.
            
            if (q.type === 'multiple_choice' || q.type === 'mcq') {
                const correctOpt = q.options.find(opt => opt.is_correct);
                if (correctOpt && (studentAns === correctOpt._id?.toString() || studentAns === correctOpt.text)) {
                    isCorrect = true;
                }
            } else if (q.type === 'true_false') {
                 const correctVal = String(q.correct_answer || q.options.find(o => o.is_correct)?.text).toLowerCase();
                 if (String(studentAns).toLowerCase() === correctVal) isCorrect = true;
            } else if (q.type === 'fill_blank') {
                 const correctVal = String(q.correct_answer || q.options.find(o => o.is_correct)?.text).trim().toLowerCase();
                 if (String(studentAns).trim().toLowerCase() === correctVal) isCorrect = true;
            } else if (q.type === 'coding') {
                // Approximate check: If strict match, it's correct. 
                // If not, we can't easily know without re-running. 
                // We'll return 'null' to indicate "Manual Review" or "Unknown" status to frontend?
                // For now, let's just do strict match or check if marks were awarded (impossible to know from here).
                // We'll default to strict string match or 'review'
                if (String(studentAns).trim() === String(q.correct_answer).trim()) isCorrect = true;
                else isCorrect = null; // Unknown/Review
            }

            return {
                id: q._id,
                text: q.question_text,
                type: q.type,
                options: q.options.map(opt => ({ 
                    id: opt._id?.toString() || opt.text, 
                    text: opt.text,
                    is_correct: opt.is_correct 
                })),
                correct_answer: q.correct_answer,
                studentAnswerId: studentAns,
                is_correct: isCorrect,
                marks: q.marks || 1
            };
        });

        res.json({
            meta: {
                score: result.score,
                total: result.total_questions,
                percentage: result.percentage,
                submitted_at: result.submitted_at
            },
            questions: review
        });
    } catch (err) {
        handleError(res, err, 'exam-review');
    }
});


// --- Generic Course Resources ---

const createCourseResourceRoutes = (resourceName, Model) => {
    app.get(`/api/courses/:courseId/${resourceName}`, async (req, res) => {
        try {
            const filter = { course_id: req.params.courseId };

            // Optional auth: identify student for batch filtering
            let userId = null;
            let userRole = null;
            const authHeader = req.headers['authorization'];
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decoded = jwt.verify(token, JWT_SECRET);
                    userId = decoded.id;
                    userRole = await getUserRole(userId);
                } catch (_) { /* unauthenticated — proceed without filtering */ }
            }

            // Batch access control: students only see content assigned to their batch
            // (or content with no batch restriction — empty allowed_batches = global)
            if (userId && userRole === 'student' && ['videos', 'resources', 'announcements', 'timeline'].includes(resourceName)) {
                const studentBatch = await StudentBatch.findOne({
                    student_id: userId,
                    course_id: req.params.courseId
                }).lean();

                const globalFilter = [
                    { allowed_batches: { $exists: false } },
                    { allowed_batches: null },
                    { allowed_batches: { $size: 0 } }
                ];

                if (studentBatch) {
                    filter.$or = [
                        ...globalFilter,
                        { allowed_batches: studentBatch.batch_id }
                    ];
                } else {
                    // Student has no batch assignment — only show global items
                    filter.$or = globalFilter;
                }
                console.log(`[ACL] Resource ${resourceName} scoped for student. Batch: ${studentBatch?.batch_id || 'Global Only'}`);
            }

            // Support basic filtering (e.g., ?module_id=eq.123)
            Object.keys(req.query).forEach(key => {
                if (req.query[key].startsWith('eq.')) {
                    filter[key] = req.query[key].slice(3);
                } else {
                    filter[key] = req.query[key];
                }
            });

            // Use .lean() so we can modify the objects
            const data = await Model.find(filter).sort({ order_index: 1, created_at: -1 }).lean();

            // Transform S3 keys into signed URLs
            const processedData = await Promise.all(data.map(async (item) => {
                // If the item has a file_url or video_url, check if it's an S3 key
                if (item.file_url && !item.file_url.startsWith('http')) {
                    try {
                        item.file_url = await generateViewUrl(item.file_url);
                    } catch (e) {
                        console.error('Error signing file_url:', e);
                    }
                }
                if (item.video_url && !item.video_url.startsWith('http')) {
                    try {
                        item.video_url = await generateViewUrl(item.video_url);
                    } catch (e) {
                        console.error('Error signing video_url:', e);
                    }
                }
                // Ensure frontend gets 'id' property
                if (item._id) {
                    item.id = item._id.toString();
                }
                return item;
            }));

            res.json(processedData);
        } catch (err) {
            handleError(res, err, `get-${resourceName}`);
        }
    });

    app.post(`/api/courses/:courseId/${resourceName}`, authenticateToken, requireInstructor, async (req, res) => {
        try {
            const item = await Model.create({ ...req.body, course_id: req.params.courseId });
            res.json(item);
        } catch (err) {
            handleError(res, err, `create-${resourceName}`);
        }
    });

    // Add generic update/delete routes for this resource type
    // e.g. /api/topics/:id, /api/videos/:id
    app.put(`/api/${resourceName}/:id`, authenticateToken, requireInstructor, async (req, res) => {
        try {
            // In a real app, verify ownership:
            // const doc = await Model.findById(req.params.id);
            // const course = await Course.findById(doc.course_id);
            // if (course.instructor_id !== req.user.id) throw new Error('Forbidden');
            
            const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(item);
        } catch (err) {
            handleError(res, err, `update-${resourceName}`);
        }
    });

    app.delete(`/api/${resourceName}/:id`, authenticateToken, requireInstructor, async (req, res) => {
        try {
            await Model.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch (err) {
            handleError(res, err, `delete-${resourceName}`);
        }
    });
};

createCourseResourceRoutes('topics', Topic);
createCourseResourceRoutes('modules', Module);
createCourseResourceRoutes('videos', Video);
createCourseResourceRoutes('resources', Resource);
createCourseResourceRoutes('timeline', Timeline);
createCourseResourceRoutes('announcements', Announcement);

app.get('/api/courses/:courseId/roster', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ course_id: req.params.courseId })
            .populate('user_id', 'full_name email phone avatar_url')
            .lean();
        
        // Fetch profiles separately if needed, or join if possible. 
        // For now, let's just get the basic user info and use the Profile model if mobile_number is there.
        const userIds = enrollments.map(e => e.user_id?._id).filter(id => id);
        
        const [profiles, allProgress, batchAssignments] = await Promise.all([
            Profile.find({ user_id: { $in: userIds } }).lean(),
            VideoProgress.find({ 
                course_id: req.params.courseId,
                user_id: { $in: userIds }
            }).lean(),
            StudentBatch.find({ course_id: req.params.courseId, student_id: { $in: userIds } }).populate('batch_id').lean()
        ]);

        const profileMap = profiles.reduce((acc, p) => {
            acc[p.user_id.toString()] = p;
            return acc;
        }, {});

        const batchMap = batchAssignments.reduce((acc, sb) => {
            acc[sb.student_id.toString()] = sb.batch_id;
            return acc;
        }, {});

        // Deduplicate roster by user_id to prevent duplicates if multiple enrollments somehow exist
        const uniqueRoster = [];
        const seenUserIds = new Set();

        enrollments.forEach(e => {
            const userIdStr = e.user_id?._id?.toString();
            if (!userIdStr || seenUserIds.has(userIdStr)) return;
            seenUserIds.add(userIdStr);
            
            const profile = profileMap[userIdStr] || null;
            const studentProgress = allProgress.filter(p => p.user_id.toString() === userIdStr);

            uniqueRoster.push({
                id: e.user_id?._id,
                full_name: e.user_id?.full_name || profile?.full_name || 'Unknown Student',
                email: e.user_id?.email || profile?.email || '',
                mobile_number: profile?.mobile_number || e.user_id?.phone || '',
                avatar_url: e.user_id?.avatar_url || profile?.avatar_url || null,
                role: 'student',
                batch: batchMap[userIdStr] || null,
                status: e.status,
                enrolled_at: e.enrolled_at,
                progress: e.progress_percentage || 0,
                video_details: studentProgress.map(p => ({
                    videoId: p.video_id,
                    watched: p.watched_seconds,
                    total: p.total_seconds,
                    completed: p.completed,
                    last_watched: p.last_watched_at
                }))
            });
        });
        
        res.json(uniqueRoster);
    } catch (err) {
        handleError(res, err, 'get-course-roster');
    }
});


// --- Generic Data Proxy (The "Supabase" style API) ---

// --- Coupon & Notification endpoints ---

app.post('/api/admin/coupons/generate', authenticateToken, requireAdminOrManager, async (req, res) => {
    const { userId, amount } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: 'User ID and discounted amount required' });

    // Format: AOTMS + 5 random digits = 10 chars total
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const code = `AOTMS${randomDigits}`;

    try {
        // Save coupon record
        const coupon = new Coupon({
            code,
            user_id: userId,
            discounted_price: amount
        });
        await coupon.save();

        const notification = new Notification({
            user_id: userId,
            type: 'coupon',
            title: `Special Gift Coupon: ${code} 🎁`,
            message: `Admin has assigned you a special course price: ₹${amount}. Use code ${code} at checkout to apply this offer!`,
            data: { code, amount },
            created_at: new Date()
        });
        await notification.save();

        sendNotification(userId, {
            type: 'coupon',
            title: 'New Coupon Received! 🎁',
            message: `You received a coupon for ₹${amount}: ${code}`,
            code,
            amount
        });

        res.json({ success: true, code });
    } catch (err) {
        handleError(res, err, 'generate-coupon');
    }
});

app.post('/api/coupons/validate', authenticateToken, async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code required' });

    try {
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(), 
            user_id: req.user.id,
            is_used: false 
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Invalid, assigned to someone else, or already used coupon.' });
        }

        res.json({ 
            success: true, 
            discounted_price: coupon.discounted_price 
        });
    } catch (err) {
        handleError(res, err, 'validate-coupon');
    }
});

app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.user.id })
            .sort({ created_at: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        handleError(res, err, 'get-notifications');
    }
});

app.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        await Notification.findOneAndUpdate({ _id: req.params.id, user_id: req.user.id }, { is_read: true });
        res.json({ success: true });
    } catch (err) {
        handleError(res, err, 'mark-individual-notification-read');
    }
});

app.post('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
    try {
        await Notification.updateMany({ user_id: req.user.id, is_read: false }, { is_read: true });
        res.json({ success: true });
    } catch (err) {
        handleError(res, err, 'mark-all-read');
    }
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
    try {
        await Notification.deleteOne({ _id: req.params.id, user_id: req.user.id });
        res.json({ success: true, message: 'Notification removed permanently' });
    } catch (err) {
        handleError(res, err, 'delete-notification');
    }
});

app.get('/api/admin/students', authenticateToken, requireAdminOrManager, async (req, res) => {
    try {
        const studentRoles = await UserRole.find({ role: 'student' }).select('user_id');
        const studentIds = studentRoles.map(r => r.user_id);
        const students = await User.find({ _id: { $in: studentIds } }).select('full_name email phone');
        res.json(students);
    } catch (err) {
        handleError(res, err, 'get-admin-students');
    }
});

app.get('/api/data/:table', authenticateToken, async (req, res) => {
    const { table } = req.params;
    const Model = MODEL_MAP[table];
    
    if (!Model) return res.status(403).json({ error: 'Invalid table' });

    try {
        let query = {};
        let sort = {};
        let limit = 100;
        let skip = 0;

        // Utility to convert hex strings to ObjectId if they look like one
        const tryConvertId = (val) => {
            if (typeof val === 'string' && val.length === 24 && /^[0-9a-fA-F]{24}$/.test(val)) {
                try { return new mongoose.Types.ObjectId(val); } catch (e) { return val; }
            }
            return val;
        };

        // Filter Logic
        for (const [key, value] of Object.entries(req.query)) {
            if (['sort', 'order', 'limit', 'offset', 'select'].includes(key)) continue;

            const filterKey = key === 'id' ? '_id' : key;
            const valStr = value.toString();
            if (valStr.startsWith('eq.')) {
                query[filterKey] = tryConvertId(valStr.slice(3));
            } else if (valStr.startsWith('in.')) {
                const ids = valStr.slice(4, -1).split(',');
                query[filterKey] = { $in: ids.map(id => tryConvertId(id.trim())) };
            } else if (valStr.startsWith('lt.')) {
                query[filterKey] = { $lt: valStr.slice(3) };
            } else if (valStr.startsWith('gt.')) {
                query[filterKey] = { $gt: valStr.slice(3) };
            } else {
                query[filterKey] = tryConvertId(valStr); // Default exact match
            }
        }

        // Authorization Scoping
        const role = await getUserRole(req.user.id);

        if (role === 'instructor' && table === 'question_bank') {
            const accessFilter = {
                $or: [
                    { approval_status: 'approved' },
                    { created_by: req.user.id }
                ]
            };
            // If query already has keys, wrap it in $and along with our access filter
            if (Object.keys(query).length > 0) {
                query = { $and: [query, accessFilter] };
            } else {
                query = accessFilter;
            }
        }

        // Student-specific scoping logic - only apply to students
        if (role === 'student') {
            const studentScopedTables = {
                'exam_results': 'student_id',
                'resume_scans': 'user_id',
                'student_exam_access': 'student_id',
                'course_enrollments': 'user_id'
            };

            if (studentScopedTables[table]) {
                const scopeField = studentScopedTables[table];
                // Overwrite any attempted ID with the actual user ID to prevent unauthorized access
                query[scopeField] = req.user.id;
                console.log(`[ACL] Student scoping ${table} to ${scopeField}=${req.user.id}`);
            }

            // Batch-wise scoping for content
            if (['course_videos', 'course_resources'].includes(table)) {
                // Find all batches the student is part of
                const studentBatches = await StudentBatch.find({ student_id: req.user.id }).lean();
                const studentBatchIds = studentBatches.map(sb => sb.batch_id.toString());
                
                const batchFilter = {
                    $or: [
                        { allowed_batches: { $exists: false } }, // No field at all
                        { allowed_batches: { $size: 0 } },      // Empty array (visible to all)
                        { allowed_batches: { $in: studentBatchIds } } // Specifically allowed for student's batches
                    ]
                };

                // Apply filter
                if (Object.keys(query).length > 0) {
                    query = { $and: [query, batchFilter] };
                } else {
                    query = batchFilter;
                }
                console.log(`[ACL] Student batch-scoping applied for ${table}. Batches: ${studentBatchIds.join(', ') || 'None'}`);
            }
            
            if (table === 'courses') {
                query['is_active'] = { $ne: false };
                query['status'] = { $in: ['approved', 'published'] };
            }
        } else if (role === 'instructor') {
            console.log(`[ACL] Instructor access to ${table}`);
            // Instructors can see their own courses but logic is often in the data fetch
            // We'll let them fetch anything they query, but we assume course_id filtering is used
        } else {
            console.log(`[ACL] Admin/Manager access to ${table}`);
        }

        // Sort & Pagination
        if (req.query.sort) {
            sort[req.query.sort] = req.query.order === 'desc' ? -1 : 1;
        }
        if (req.query.limit) limit = parseInt(req.query.limit);
        if (req.query.offset) skip = parseInt(req.query.offset);

        // Execute query
        console.log(`[DB] Fetching ${table} with query:`, JSON.stringify(query));
        
        let data;
        if (table === 'leaderboard_stats' || table === 'leaderboard') {
            data = await Model.find(query).sort(sort).limit(limit).skip(skip).populate('user_id', 'full_name avatar_url email');
        } else if (table === 'exam_results') {
            data = await Model.find(query).sort(sort).limit(limit).skip(skip)
                .populate('exam_id', 'title')
                .populate('mock_paper_id', 'title');
        } else if (table === 'courses') {
            data = await Model.find(query).sort(sort).limit(limit).skip(skip)
                .populate('instructor_id', 'full_name avatar_url');
        } else if (table === 'course_enrollments') {
            data = await Model.find(query).sort(sort).limit(limit).skip(skip)
                .populate('user_id', 'full_name email avatar_url phone')
                .populate('course_id', 'title category thumbnail_url');
        } else if (table === 'course_ratings') {
            data = await Model.find(query).sort(sort).limit(limit).skip(skip)
                .populate('user_id', 'full_name avatar_url');
        } else {
            data = await Model.find(query).sort(sort).limit(limit).skip(skip);
        }
        res.json(data);

    } catch (err) {
        handleError(res, err, `data-get-${table}`);
    }
});

app.post('/api/data/:table', authenticateToken, async (req, res) => {
    const { table } = req.params;
    const Model = MODEL_MAP[table];
    if (!Model) return res.status(403).json({ error: 'Invalid table' });

    try {
        const role = await getUserRole(req.user.id);
        
        // Security: Restrict who can create entries in sensitive tables
        if (role !== 'admin' && role !== 'manager') {
            if (['course_enrollments', 'student_exam_access', 'course_ratings'].includes(table)) {
                // Force user_id and pending status for students
                req.body.user_id = req.user.id;
                if (table !== 'course_ratings') req.body.status = 'pending';
            } else if (table === 'question_bank') {
                // Instructors can create questions, but forced to pending
                req.body.created_by = req.user.id;
                req.body.approval_status = 'pending';
            } else if (['exams', 'mock_papers', 'exam_schedules', 'mock_test_configs'].includes(table)) {
                if (role !== 'instructor') return res.status(403).json({ error: 'Unauthorized to manage exams' });
                if (table !== 'exam_schedules') {
                    req.body.created_by = req.user.id;
                }
                if (table === 'exams') req.body.status = 'scheduled';
            } else if (table === 'courses') {
                if (role !== 'instructor') return res.status(403).json({ error: 'Only instructors can create courses' });
                req.body.instructor_id = req.user.id;
                req.body.status = 'draft'; // Forces draft state
            } else if ([
                'course_topics', 'course_modules', 'course_videos', 
                'course_resources', 'course_timeline', 'course_announcements', 'live_classes'
            ].includes(table)) {
                if (role !== 'instructor') return res.status(403).json({ error: 'Unauthorized to create course content' });
                
                if (table === 'live_classes') {
                    // Logic handled below specialized for live_classes or default to check course_id if provided
                } else if (!req.body.course_id) {
                    return res.status(400).json({ error: 'course_id is required' });
                }
                
                if (req.body.course_id) {
                    const course = await Course.findById(req.body.course_id);
                    if (!course || course.instructor_id?.toString() !== req.user.id) {
                        return res.status(403).json({ error: 'Forbidden: You must be the assigned instructor of this course' });
                    }
                }
            } else if (['user_roles', 'system_logs'].includes(table)) {
                return res.status(403).json({ error: 'Unauthorized to create entries in this table' });
            }
        } else {
             // Admin/Manager creation logic
             if (table === 'question_bank') {
                 // Admins/Managers can set status, but default created_by to themselves if not set
                 req.body.created_by = req.body.created_by || req.user.id;
                 // If they didn't provide status, let schema default (pending) or they can set 'approved'
             }
        }

        const item = await Model.create(req.body);

        // Socket Events for Doubts
        // Emit realtime update
        io.emit(`${table}_changed`, { action: 'create', item });
        res.json(item);
    } catch (err) {
        handleError(res, err, `data-create-${table}`);
    }
});

app.put('/api/data/:table/:id', authenticateToken, async (req, res) => {
    const { table, id } = req.params;
    const Model = MODEL_MAP[table];
    if (!Model) return res.status(403).json({ error: 'Invalid table' });

    try {
        const role = await getUserRole(req.user.id);

        // Security: Restrict who can update sensitive data
        if (role !== 'admin' && role !== 'manager') {
            if (['course_enrollments', 'student_exam_access', 'exam_results'].includes(table)) {
                // ... same logic for students
                const existing = await Model.findById(id);
                if (existing && existing.user_id?.toString() !== req.user.id) {
                    return res.status(403).json({ error: 'Forbidden: Cannot update other users records' });
                }
                if (req.body.status && req.body.status !== existing.status) {
                    return res.status(403).json({ error: 'Forbidden: Cannot change status' });
                }
            } else if (table === 'courses') {
                // Allow instructors to update their own courses or assigning themselves
                const existing = await Model.findById(id);
                if (role === 'instructor') {
                    const isAlreadyOwner = existing?.instructor_id?.toString() === req.user.id;
                    const isAssigningSelf = req.body.instructor_id === req.user.id;
                    
                    if (!isAlreadyOwner && !isAssigningSelf) {
                        return res.status(403).json({ error: 'Forbidden: Cannot modify courses assigned to others' });
                    }
                }
            } else if ([
                'course_topics', 'course_modules', 'course_videos', 
                'course_resources', 'course_timeline', 'course_announcements', 'live_classes'
            ].includes(table)) {
                if (role === 'instructor') {
                    const item = await Model.findById(id);
                    if (!item) return res.status(404).json({ error: 'Item not found' });
                    
                    if (table === 'live_classes' && item.instructor_id?.toString() === req.user.id) {
                        // Priority check: If they are the host of the meeting, allow it
                    } else if (item.course_id) {
                        const course = await Course.findById(item.course_id);
                        if (!course || course.instructor_id?.toString() !== req.user.id) {
                            return res.status(403).json({ error: 'Forbidden: You must be the assigned instructor of this course' });
                        }
                    } else {
                        // Not host and no course attached
                         return res.status(403).json({ error: 'Forbidden: Action unauthorized for this session' });
                    }
                }
            } else if (table === 'question_bank') {
                const existing = await Model.findById(id);
                if (existing && existing.created_by?.toString() !== req.user.id) {
                    return res.status(403).json({ error: 'Forbidden: Cannot update questions created by others' });
                }
                // Force status to pending on update if not admin
                req.body.approval_status = 'pending';
                delete req.body.created_by;
            } else if (!['doubts', 'doubt_replies'].includes(table)) {
                 return res.status(403).json({ error: 'Unauthorized to update this table' });
            }
        }

        const item = await Model.findByIdAndUpdate(id, req.body, { new: true });
        
        // Socket Events for Updates
        io.emit(`${table}_changed`, { action: 'update', item, id });
        if (table === 'doubts') {
            io.emit('doubt_updated', item);
        }

        res.json(item);
    } catch (err) {
        handleError(res, err, `data-update-${table}`);
    }
});

app.delete('/api/data/:table/:id', authenticateToken, async (req, res) => {
    const { table, id } = req.params;
    const Model = MODEL_MAP[table];
    if (!Model) return res.status(403).json({ error: 'Invalid table' });

    try {
        const role = await getUserRole(req.user.id);

        // Security: Restrict deletions
        if (role !== 'admin' && role !== 'manager') {
            const item = await Model.findById(id);
            if (!item) return res.status(404).json({ error: 'Item not found' });

            // Instructors
            if (role === 'instructor') {
                const courseRelatedTables = [
                    'courses', 'course_topics', 'course_modules', 'course_videos', 
                    'course_resources', 'course_timeline', 'course_announcements', 'live_classes'
                ];
                
                if (courseRelatedTables.includes(table)) {
                    // Get courseId for sub-items or item itself if it's a course
                    if (table === 'live_classes' && item.instructor_id?.toString() === req.user.id) {
                         // Priority check: allow meeting host to delete
                    } else {
                        const courseId = table === 'courses' ? item._id : item.course_id;
                        
                        if (courseId) {
                            const course = await Course.findById(courseId);
                            if (!course || course.instructor_id?.toString() !== req.user.id) {
                                return res.status(403).json({ error: 'Forbidden: You must be the assigned instructor of this course' });
                            }
                        } else if (table === 'live_classes') {
                             return res.status(403).json({ error: 'Forbidden: You are not the host of this session' });
                        }
                    }
                } else if (table === 'question_bank') {
                    if (item.created_by?.toString() !== req.user.id) {
                        return res.status(403).json({ error: 'Forbidden: You can only delete your own questions' });
                    }
                } else if (['doubts', 'doubt_replies'].includes(table)) {
                    if (item.user_id?.toString() !== req.user.id) {
                         return res.status(403).json({ error: 'Forbidden: Ownership required' });
                    }
                } else {
                    return res.status(403).json({ error: 'Unauthorized to delete from this table' });
                }
            } else {
                // Students or others
                return res.status(403).json({ error: 'Unauthorized to delete' });
            }
        }

        await Model.findByIdAndDelete(id);
        io.emit(`${table}_changed`, { action: 'delete', id });
        res.json({ success: true });
    } catch (err) {
        handleError(res, err, `data-delete-${table}`);
    }
});

// ============================================================
// --- Batch Management Routes ---
// ============================================================

// Create a batch (admin / manager / instructor)
app.post('/api/batches', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const batch = await Batch.create({ ...req.body });
        res.json(batch);
    } catch (err) {
        handleError(res, err, 'create-batch');
    }
});

// List batches for a course
app.get('/api/batches/student-assignments', authenticateToken, requireInstructor, async (req, res) => {
    try {
        let query = {};
        const courseQuery = req.query.course_id;
        
        if (courseQuery && courseQuery.startsWith('in.(')) {
            const ids = courseQuery.slice(4, -1).split(',').map(id => id.trim());
            query.course_id = { $in: ids };
        } else if (courseQuery) {
            query.course_id = courseQuery;
        }

        const assignments = await StudentBatch.find(query)
            .populate('batch_id')
            .lean();
            
        res.json(assignments);
    } catch (err) {
        handleError(res, err, 'get-student-assignments');
    }
});

app.get('/api/batches', authenticateToken, async (req, res) => {
    try {
        const filter = {};
        if (req.query.course_id) filter.course_id = req.query.course_id;
        if (req.query.is_active !== undefined) filter.is_active = req.query.is_active === 'true';
        const batches = await Batch.find(filter).sort({ batch_type: 1, batch_name: 1 }).lean();
        const batchesWithCount = await Promise.all(batches.map(async (b) => {
            const count = await StudentBatch.countDocuments({ batch_id: b._id });
            return { ...b, id: b._id.toString(), student_count: count };
        }));
        res.json(batchesWithCount);
    } catch (err) {
        handleError(res, err, 'list-batches');
    }
});

// Get single batch
app.get('/api/batches/:id', authenticateToken, async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id).lean();
        if (!batch) return res.status(404).json({ error: 'Batch not found' });
        const count = await StudentBatch.countDocuments({ batch_id: batch._id });
        res.json({ ...batch, id: batch._id.toString(), student_count: count });
    } catch (err) {
        handleError(res, err, 'get-batch');
    }
});

// Update batch
app.put('/api/batches/:id', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(batch);
    } catch (err) {
        handleError(res, err, 'update-batch');
    }
});

// Delete batch (also removes all student assignments)
app.delete('/api/batches/:id', authenticateToken, requireInstructor, async (req, res) => {
    try {
        await StudentBatch.deleteMany({ batch_id: req.params.id });
        await Batch.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        handleError(res, err, 'delete-batch');
    }
});
// Get current student's batch for a specific course
app.get('/api/batches/my-batch/:courseId', authenticateToken, async (req, res) => {
    try {
        const assignment = await StudentBatch.findOne({ 
            student_id: req.user.id, 
            course_id: req.params.courseId 
        }).populate('batch_id').lean();
        
        if (!assignment) return res.json(null);
        res.json({
            ...assignment.batch_id,
            id: assignment.batch_id._id.toString(),
            assigned_at: assignment.assigned_at
        });
    } catch (err) {
        handleError(res, err, 'my-batch');
    }
});

// Get full course roster for instructors, grouped by batch type
app.get('/api/batches/course-roster/:courseId', authenticateToken, requireInstructor, async (req, res) => {
    try {
        // Get all course enrollments (students)
        const enrollments = await Enrollment.find({ 
            course_id: req.params.courseId,
            status: { $in: ['active', 'completed'] }
        }).lean();
        
        const studentIds = enrollments.map(e => e.user_id);
        
        // Get all batch assignments for these students
        const assignments = await StudentBatch.find({ 
            course_id: req.params.courseId,
            student_id: { $in: studentIds }
        }).populate('batch_id').lean();
        
        // Get profiles and roles
        const profiles = await Profile.find({ user_id: { $in: studentIds } }).lean();
        const profileMap = profiles.reduce((acc, p) => { acc[p.user_id?.toString()] = p; return acc; }, {});
        
        const roles = await UserRole.find({ user_id: { $in: studentIds } }).lean();
        const roleMap = roles.reduce((acc, r) => { acc[r.user_id?.toString()] = r.role; return acc; }, {});
        
        const assignmentMap = assignments.reduce((acc, a) => {
            acc[a.student_id?.toString()] = a.batch_id;
            return acc;
        }, {});
        
        const rosterData = enrollments.map(e => {
            const uid = e.user_id?.toString();
            return {
                student_id: uid,
                full_name: profileMap[uid]?.full_name || 'Student',
                email: profileMap[uid]?.email || profileMap[uid]?.email,
                avatar_url: profileMap[uid]?.avatar_url,
                role: roleMap[uid] || 'student',
                batch: assignmentMap[uid] ? {
                    id: assignmentMap[uid]._id.toString(),
                    name: assignmentMap[uid].batch_name,
                    type: assignmentMap[uid].batch_type
                } : null
            };
        }).filter(s => s.role === 'student'); // Exclude instructors/admins
        
        // Group by batch type
        const grouped = {
            morning: rosterData.filter(s => s.batch?.type === 'morning'),
            afternoon: rosterData.filter(s => s.batch?.type === 'afternoon'),
            evening: rosterData.filter(s => s.batch?.type === 'evening'),
            unassigned: rosterData.filter(s => !s.batch)
        };
        
        res.json(grouped);
    } catch (err) {
        handleError(res, err, 'course-roster');
    }
});


// List students in a batch (with profile info)
app.get('/api/batches/:batchId/students', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const assignments = await StudentBatch.find({ batch_id: req.params.batchId }).lean();
        const studentIds = assignments.map(a => a.student_id);
        const profiles = await Profile.find({ user_id: { $in: studentIds } }).lean();
        const profileMap = profiles.reduce((acc, p) => { acc[p.user_id?.toString()] = p; return acc; }, {});
        const result = assignments.map(a => ({
            ...a,
            id: a._id.toString(),
            profile: profileMap[a.student_id?.toString()] || null
        }));
        res.json(result);
    } catch (err) {
        handleError(res, err, 'batch-students');
    }
});

// Assign student to a batch
app.post('/api/batches/:batchId/students', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const { student_id, course_id } = req.body;
        const batch = await Batch.findById(req.params.batchId).lean();
        if (!batch) return res.status(404).json({ error: 'Batch not found' });

        // Check capacity
        const currentCount = await StudentBatch.countDocuments({ batch_id: req.params.batchId });
        if (currentCount >= batch.max_students) {
            return res.status(400).json({ error: `Batch is full (max ${batch.max_students} students)` });
        }

        const assignment = await StudentBatch.findOneAndUpdate(
            { student_id, course_id },
            {
                batch_id: req.params.batchId,
                assigned_by: req.user.id,
                assigned_at: new Date(),
                updated_at: new Date()
            },
            { upsert: true, new: true }
        );
        res.json(assignment);
    } catch (err) {
        handleError(res, err, 'assign-student-batch');
    }
});

// Remove student from batch
app.delete('/api/batches/:batchId/students/:studentId', authenticateToken, requireInstructor, async (req, res) => {
    try {
        await StudentBatch.findOneAndDelete({
            batch_id: req.params.batchId,
            student_id: req.params.studentId
        });
        res.json({ success: true });
    } catch (err) {
        handleError(res, err, 'remove-student-batch');
    }
});

// Reassign student to a different batch
app.put('/api/batches/students/reassign', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const { student_id, course_id, new_batch_id } = req.body;
        const newBatch = await Batch.findById(new_batch_id).lean();
        if (!newBatch) return res.status(404).json({ error: 'Target batch not found' });

        const currentCount = await StudentBatch.countDocuments({ batch_id: new_batch_id });
        if (currentCount >= newBatch.max_students) {
            return res.status(400).json({ error: `Target batch is full (max ${newBatch.max_students} students)` });
        }

        const existing = await StudentBatch.findOne({ student_id, course_id }).lean();
        const assignment = await StudentBatch.findOneAndUpdate(
            { student_id, course_id },
            {
                batch_id: new_batch_id,
                previous_batch_id: existing ? existing.batch_id : null,
                assigned_by: req.user.id,
                updated_at: new Date()
            },
            { upsert: true, new: true }
        );
        res.json(assignment);
    } catch (err) {
        handleError(res, err, 'reassign-student-batch');
    }
});

// Get batch assignments for multiple courses

// Get available batches for a course (student view)
app.get('/api/batches/course/:courseId', authenticateToken, async (req, res) => {
    try {
        const batches = await Batch.find({ course_id: req.params.courseId, is_active: true }).lean();
        res.json(batches.map(b => ({ ...b, id: b._id.toString() })));
    } catch (err) {
        handleError(res, err, 'get-course-batches');
    }
});

// Bulk Assign Mock Test or Exam to a Batch
app.post('/api/exams/bulk-assign', authenticateToken, async (req, res) => {
    try {
        const { batch_id, mock_paper_id, exam_id } = req.body;
        if (!batch_id) return res.status(400).json({ error: 'Batch ID is required' });
        if (!mock_paper_id && !exam_id) return res.status(400).json({ error: 'Mock paper or Exam ID required' });

        // 1. Get all students in the batch
        const studentAssignments = await StudentBatch.find({ batch_id }).lean();
        if (!studentAssignments || studentAssignments.length === 0) {
            return res.status(404).json({ error: 'No students found in this batch' });
        }

        const studentIds = studentAssignments.map(a => a.student_id);

        // 2. Prepare access records
        const accessType = mock_paper_id ? 'mock' : 'exam';
        const accessRecords = studentIds.map(sid => ({
            student_id: sid,
            exam_id: exam_id || null,
            mock_paper_id: mock_paper_id || null,
            access_type: accessType,
            assigned_by: req.user.id,
            granted_at: new Date()
        }));

        // 3. Insert Many
        await StudentExamAccess.insertMany(accessRecords, { ordered: false });

        res.json({ 
            success: true, 
            count: studentIds.length, 
            message: `Mock Test assigned to ${studentIds.length} students` 
        });
    } catch (err) {
        handleError(res, err, 'bulk-assign-mock');
    }
});

// Student request to join or change batch
app.post('/api/batches/student-request', authenticateToken, async (req, res) => {
    try {
        const { courseId, batchId } = req.body;
        const userId = req.user.id;

        const batch = await Batch.findById(batchId).populate('course_id').lean();
        if (!batch) return res.status(404).json({ error: 'Batch not found' });

        const course = await Course.findById(courseId).lean();
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Check if student is enrolled
        const enrollmentValue = await Enrollment.findOne({ user_id: userId, course_id: courseId }).lean();
        if (!enrollmentValue) return res.status(403).json({ error: 'You are not enrolled in this course' });

        // Check if student already has a batch
        const existingAssignment = await StudentBatch.findOne({ student_id: userId, course_id: courseId }).populate('batch_id').lean();

        if (!existingAssignment) {
            // Initial Assignment - Auto Approve but Notify Instructor
            const assignment = await StudentBatch.create({
                student_id: userId,
                course_id: courseId,
                batch_id: batchId,
                assigned_at: new Date(),
                assigned_by: userId // Self assigned for initial
            });

            // Notify Instructor
            const student = await Profile.findOne({ user_id: userId }).lean();
            const notification = new Notification({
                user_id: course.instructor_id,
                title: "New Batch Assignment",
                message: `${student?.full_name || 'A student'} joined ${batch.batch_name} for ${course.title}`,
                type: "batch_assignment",
                data: { 
                    student_id: userId, 
                    course_id: courseId, 
                    batch_id: batchId,
                    actor_avatar: student?.avatar_url,
                    actor_name: student?.full_name
                },
                created_at: new Date()
            });
            await notification.save();

            sendNotification(course.instructor_id?.toString(), {
                title: "New Batch Assignment",
                message: `${student?.full_name || 'A student'} joined ${batch.batch_name} for ${course.title}`,
                type: "batch_assignment",
                data: { 
                    student_id: userId, 
                    course_id: courseId, 
                    batch_id: batchId,
                    actor_avatar: student?.avatar_url,
                    actor_name: student?.full_name
                }
            });

            res.json({ message: 'Batch assigned successfully', assignment });
        } else {
            // Change Request - Needs Permission
            if (existingAssignment.batch_id._id.toString() === batchId) {
                return res.status(400).json({ error: 'You are already in this batch' });
            }

            // Create or update pending request
            const request = await BatchRequest.findOneAndUpdate(
                { student_id: userId, course_id: courseId, status: 'pending' },
                {
                    batch_id: batchId,
                    type: 'change',
                    requested_at: new Date()
                },
                { upsert: true, new: true }
            );

            // Notify Instructor for Permission
            const student = await Profile.findOne({ user_id: userId }).lean();
            const notification = new Notification({
                user_id: course.instructor_id,
                title: "Batch Change Request",
                message: `${student?.full_name || 'A student'} requested to move from ${existingAssignment.batch_id.batch_name} to ${batch.batch_name}`,
                type: "batch_request",
                data: { 
                    request_id: request._id, 
                    student_id: userId, 
                    course_id: courseId,
                    actor_avatar: student?.avatar_url,
                    actor_name: student?.full_name
                },
                created_at: new Date()
            });
            await notification.save();

            sendNotification(course.instructor_id?.toString(), {
                title: "Batch Change Request",
                message: `${student?.full_name || 'A student'} requested to move from ${existingAssignment.batch_id.batch_name} to ${batch.batch_name}`,
                type: "batch_request",
                data: { 
                    request_id: request._id, 
                    student_id: userId, 
                    course_id: courseId,
                    actor_avatar: student?.avatar_url,
                    actor_name: student?.full_name
                }
            });

            res.json({ message: 'Change request submitted for instructor permission', request });
        }
    } catch (err) {
        handleError(res, err, 'student-batch-request');
    }
});

// Instructor see pending requests
app.get('/api/batches/requests/pending', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const requests = await BatchRequest.find({ status: 'pending' })
            .populate('student_id', 'full_name email')
            .populate('course_id', 'title')
            .populate('batch_id', 'batch_name batch_type')
            .lean();
        
        // Filter by instructor's courses
        const instructorCourses = await Course.find({ instructor_id: req.user.id }).select('_id').lean();
        const courseIds = instructorCourses.map(c => c._id.toString());
        
        const filtered = requests.filter(r => courseIds.includes(r.course_id._id.toString()));
        res.json(filtered.map(r => ({ ...r, id: r._id.toString() })));
    } catch (err) {
        handleError(res, err, 'get-pending-requests');
    }
});

// Instructor Approve/Reject
app.post('/api/batches/requests/:requestId/approve', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const request = await BatchRequest.findById(req.params.requestId);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        // Update Assignment
        const previous = await StudentBatch.findOne({ student_id: request.student_id, course_id: request.course_id }).lean();
        
        await StudentBatch.findOneAndUpdate(
            { student_id: request.student_id, course_id: request.course_id },
            {
                batch_id: request.batch_id,
                previous_batch_id: previous ? previous.batch_id : null,
                assigned_by: req.user.id,
                updated_at: new Date()
            },
            { upsert: true }
        );

        request.status = 'approved';
        request.processed_at = new Date();
        request.processed_by = req.user.id;
        await request.save();

        // Notify Student
        await Notification.create({
            user_id: request.student_id,
            title: "Batch Request Approved",
            message: `Your request to join the new batch was approved.`,
            type: "batch_approved",
            data: { course_id: request.course_id }
        });

        sendNotification(request.student_id.toString(), {
            title: "Batch Request Approved",
            message: `Your request to join the new batch has been approved.`,
            type: "batch_approved",
            data: { course_id: request.course_id }
        });

        res.json({ success: true });
    } catch (err) {
        handleError(res, err, 'approve-request');
    }
});

app.post('/api/batches/requests/:requestId/reject', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const request = await BatchRequest.findById(req.params.requestId);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        request.status = 'rejected';
        request.processed_at = new Date();
        request.processed_by = req.user.id;
        await request.save();

        // Notify Student
        await Notification.create({
            user_id: request.student_id,
            title: "Batch Request Rejected",
            message: `Your request to change batches was not approved at this time.`,
            type: "batch_rejected",
            data: { course_id: request.course_id }
        });

        sendNotification(request.student_id.toString(), {
            title: "Batch Request Rejected",
            message: `Your request to change batches was not approved at this time.`,
            type: "batch_rejected",
            data: { course_id: request.course_id }
        });

        res.json({ success: true });
    } catch (err) {
        handleError(res, err, 'reject-request');
    }
});

// Auto-split enrolled students into batches for a course
app.post('/api/batches/auto-split/:courseId', authenticateToken, requireInstructor, async (req, res) => {
    try {
        const { courseId } = req.params;

        // Get active batches for this course
        const batches = await Batch.find({ course_id: courseId, is_active: true }).sort({ batch_type: 1 }).lean();
        if (batches.length === 0) {
            return res.status(400).json({ error: 'No active batches exist for this course. Create batches first.' });
        }

        // Get enrolled students not yet assigned to any batch
        const enrollments = await Enrollment.find({ course_id: courseId, status: 'active' }).lean();
        const existingAssignments = await StudentBatch.find({ course_id: courseId }).lean();
        const assignedStudentIds = new Set(existingAssignments.map(a => a.student_id.toString()));

        const unassigned = enrollments.filter(e => !assignedStudentIds.has(e.user_id.toString()));

        if (unassigned.length === 0) {
            return res.json({ message: 'All enrolled students are already assigned to batches', assigned: 0 });
        }

        // Count current students per batch
        const batchCounts = await Promise.all(batches.map(async b => ({
            batch: b,
            count: await StudentBatch.countDocuments({ batch_id: b._id })
        })));

        let assignedCount = 0;
        const assignments = [];

        // Helper to find or create a batch of a specific type with capacity
        const findOrCreateBatchWithCapacity = async (type) => {
            // Find existing active batches of this type with room
            const typeBatches = batchCounts
                .filter(bc => bc.batch.batch_type === type && bc.count < bc.batch.max_students)
                .sort((a, b) => a.count - b.count);

            if (typeBatches.length > 0) {
                const target = typeBatches[0];
                target.count++;
                return target.batch._id;
            }

            // No room in existing batches of this type — auto-create new "Batch N"
            const batchTypeCount = await Batch.countDocuments({ course_id: courseId, batch_type: type });
            const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
            
            // Get timing defaults from earlier batches of same type if they exist
            const template = batches.find(b => b.batch_type === type) || { start_time: "09:00", end_time: "11:00", max_students: 30 };

            const newBatch = await Batch.create({
                course_id: courseId,
                batch_type: type,
                batch_name: `${typeLabel} Batch ${batchTypeCount + 1}`,
                start_time: template.start_time,
                end_time: template.end_time,
                max_students: template.max_students,
                instructor_id: req.user.id
            });

            console.log(`[Batch Scaling] Created new batch: ${newBatch.batch_name}`);
            
            // Add new batch to our local tracking to avoid immediate re-creation
            batchCounts.push({ batch: newBatch, count: 1 });
            return newBatch._id;
        };

        for (const enrollment of unassigned) {
            // Determine preferred type — default to morning if unspecified, or spread evenly
            // For auto-split, we'll try to fill existing partially-filled batches first
            const available = batchCounts
                .filter(bc => bc.count < bc.batch.max_students)
                .sort((a, b) => a.count - b.count);

            let targetId;
            if (available.length > 0) {
                const target = available[0];
                target.count++;
                targetId = target.batch._id;
            } else {
                // All current batches are full — auto-create based on morning by default
                targetId = await findOrCreateBatchWithCapacity('morning');
            }

            assignments.push({
                student_id: enrollment.user_id,
                course_id: courseId,
                batch_id: targetId,
                assigned_by: req.user.id,
                assigned_at: new Date(),
                updated_at: new Date()
            });
            assignedCount++;
        }

        if (assignments.length > 0) {
            await StudentBatch.insertMany(assignments, { ordered: false });
        }

        res.json({
            message: `Auto-split & scaling complete. Assigned ${assignedCount} student(s). Created new batches as needed.`,
            assigned: assignedCount,
            skipped: unassigned.length - assignedCount
        });
    } catch (err) {
        handleError(res, err, 'auto-split-batches');
    }
});

// Get student's batch assignment for a specific course
app.get('/api/student/my-batch/:courseId', authenticateToken, async (req, res) => {
    try {
        const assignment = await StudentBatch.findOne({
            student_id: req.user.id,
            course_id: req.params.courseId
        }).populate('batch_id').lean();

        if (!assignment) return res.json(null);
        res.json({ ...assignment, id: assignment._id.toString() });
    } catch (err) {
        handleError(res, err, 'student-my-batch');
    }
});

// --- Public Course Routes ---

app.get('/api/public/courses', async (req, res) => {
    try {
        const query = { 
            status: { $in: ['published', 'approved'] },
            is_active: { $ne: false } 
        };
        if (req.query.category && req.query.category.toLowerCase() !== 'all') {
            query.category = req.query.category;
        }
        const courses = await Course.find(query).limit(50);
        res.json(courses);
    } catch (err) {
        handleError(res, err, 'public-courses');
    }
});

app.get('/api/courses/:id', async (req, res) => {
    try {
        let course;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            course = await Course.findById(req.params.id);
        } else {
             // Fallback for slugs if you use them
             course = await Course.findOne({ slug: req.params.id });
        }
        
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (err) {
        handleError(res, err, 'get-course-detail');
    }
});

// --- S3 Helper Routes ---

app.post('/api/s3/upload-url', authenticateToken, async (req, res) => {
    try {
        const { fileName, fileType, folder } = req.body;
        const folderPath = folder ? `${folder}/` : `${req.user.id}/`;
        const uploadFileName = `${folderPath}${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadUrl = await generateUploadUrl(uploadFileName, fileType);
        res.json({ uploadUrl, fileName: uploadFileName });
    } catch (err) {
        handleError(res, err, 's3-upload');
    }
});

app.post('/api/s3/view-url', authenticateToken, async (req, res) => {
    try {
        const viewUrl = await generateViewUrl(req.body.fileName);
        res.json({ viewUrl });
    } catch (err) {
        handleError(res, err, 's3-view');
    }
});

// Serve public S3 assets (images/thumbnails) via redirect to signed URL
app.get(/\/api\/s3\/public\/(.*)/, async (req, res) => {
    try {
        const key = req.params[0];
        console.log(`[S3 PROXY] Accessing: ${key}`);
        if (!key) return res.status(404).send('Not Found');
        
        const url = await generateViewUrl(key);
        res.redirect(url);
    } catch (err) {
        console.error('S3 Public Proxy Error:', err);
        res.status(404).send('Resource not found');
    }
});

// Start Server
httpServer.listen(port, () => {
    console.log(`Server running on port ${port} - Socket.io Enabled`);
});

// Trigger nodemon restart
