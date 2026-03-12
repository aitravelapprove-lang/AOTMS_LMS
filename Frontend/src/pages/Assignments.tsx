import { useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    UploadCloud,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    ExternalLink,
    Info,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import LowPolyBackground from "@/components/landing/LowPolyBackground";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Assignments = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'submitted'>('pending');

    const handleFileUpload = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setIsUploading(true);
        // Simulate upload
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                toast.success("File uploaded successfully!");
            }
        }, 300);
    };

    const handleSubmit = () => {
        setSubmissionStatus('submitted');
        toast.success("Assignment submitted successfully!");
    };

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            <LowPolyBackground />
            <Header />

            <main className="relative z-10 w-full pt-20 pb-16">
                {/* 1. Hero Header */}
                <section className="container-width section-padding pb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-slate-900/10 shadow-2xl shadow-slate-200/50"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                                    <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-0">
                                        Advanced React
                                    </Badge>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground">Module 4: State Management</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight font-heading">
                                    Building a <span className="text-[#0075CF]">Real-World Dashboard</span>
                                </h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    Instructor: <span className="font-medium text-foreground">Sarah Johnson</span>
                                </p>
                            </div>
                            <div className="text-right hidden md:block">
                                <span className="text-sm text-muted-foreground block mb-1">Due Date</span>
                                <span className="text-xl font-bold text-destructive flex items-center gap-2 justify-end">
                                    <Clock className="w-5 h-5" /> In 2 Days
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </section>

                <div className="container-width section-padding grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Details & Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 2. Overview */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="bg-white/70 backdrop-blur-2xl border-slate-900/10 shadow-xl rounded-[2rem] overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl font-extrabold text-slate-900 font-heading">Assignment Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`prose prose-sm max-w-none text-slate-600 font-medium leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                                        <p>
                                            In this assignment, you will apply your knowledge of React Context API and Redux Toolkit to build a functional analytics dashboard.
                                            This task mirrors real-world requirements for frontend developers in 2024.
                                        </p>
                                        <h4 className="text-slate-900 font-bold mt-4">Learning Objectives:</h4>
                                        <ul className="list-disc pl-5 mt-2 space-y-1">
                                            <li>Implement global state management effectively.</li>
                                            <li>Optimize rendering performance using memoization.</li>
                                            <li>Handle asynchronous data fetching with Redux Thunks.</li>
                                        </ul>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="mt-2 text-primary hover:text-primary/80 p-0 h-auto font-medium"
                                    >
                                        {isExpanded ? (
                                            <span className="flex items-center gap-1">Show Less <ChevronUp className="w-4 h-4" /></span>
                                        ) : (
                                            <span className="flex items-center gap-1">Read Full Description <ChevronDown className="w-4 h-4" /></span>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* 3. Key Details Grid (3D Cards) */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { label: "Max Marks", value: "100 Points", icon: AlertCircle, color: "text-blue-500" },
                                { label: "Format", value: "ZIP / PDF", icon: FileText, color: "text-purple-500" },
                                { label: "Size Limit", value: "Max 50MB", icon: UploadCloud, color: "text-orange-500" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="bg-white p-4 rounded-xl border border-border/50 shadow-sm hover:shadow-lg transition-all"
                                >
                                    <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mb-3 ${item.color}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.label}</span>
                                    <p className="font-bold text-lg text-foreground">{item.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* 5. Submission Area */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            id="submission-area"
                        >
                            <Card className="bg-white/70 backdrop-blur-2xl border-slate-900/10 shadow-2xl rounded-[2rem] overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0075CF] to-[#FD5A1A]" />
                                <CardHeader>
                                    <CardTitle className="text-2xl font-extrabold text-slate-900 font-heading">Submit Your Work</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium">Upload your assignment files or paste a link.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="upload" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-6">
                                            <TabsTrigger value="upload">File Upload</TabsTrigger>
                                            <TabsTrigger value="link">External Link</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="upload">
                                            <div
                                                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${isUploading ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30'}`}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={handleFileUpload}
                                            >
                                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                                    <UploadCloud className="w-8 h-8" />
                                                </div>
                                                <h3 className="font-medium text-lg mb-1">Drag & Drop assignment here</h3>
                                                <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                                                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                                                    Choose File
                                                </Button>
                                                <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
                                            </div>

                                            {isUploading || uploadProgress > 0 ? (
                                                <div className="mt-6 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Uploading: project-dashboard.zip</span>
                                                        <span>{uploadProgress}%</span>
                                                    </div>
                                                    <Progress value={uploadProgress} className="h-2" />
                                                </div>
                                            ) : null}
                                        </TabsContent>

                                        <TabsContent value="link">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Project URL (GitHub / Vercel)</Label>
                                                    <Textarea placeholder="https://..." />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Comments (Optional)</Label>
                                                    <Textarea placeholder="Any notes for the instructor..." />
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                                        <Button variant="ghost">Save Draft</Button>
                                        <Button
                                            size="lg"
                                            className="px-8 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/25 transition-all"
                                            onClick={handleSubmit}
                                            disabled={submissionStatus === 'submitted'}
                                        >
                                            {submissionStatus === 'submitted' ? (
                                                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Submitted</span>
                                            ) : "Submit Assignment"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.section>

                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* 4. Resources */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="bg-white/70 backdrop-blur-2xl border-slate-900/10 shadow-xl rounded-[2rem] overflow-hidden">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl font-extrabold text-slate-900 font-heading">Resources</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { name: "Assignment Guidelines.pdf", type: "PDF" },
                                        { name: "Starter Code", type: "ZIP" },
                                        { name: "Class Recording", type: "Video" }
                                    ].map((res, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors group cursor-pointer border border-transparent hover:border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm">
                                                    <Download className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{res.name}</p>
                                                    <span className="text-xs text-muted-foreground">{res.type}</span>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* 6. Submission Status */}
                        <Card className="bg-white/70 backdrop-blur-2xl border-slate-900/10 shadow-xl rounded-[2rem] overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl font-extrabold text-slate-900 font-heading">Status & History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${submissionStatus === 'submitted' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]'}`} />
                                        <span className="font-medium text-foreground">
                                            {submissionStatus === 'submitted' ? 'Submitted for Grading' : 'Pending Submission'}
                                        </span>
                                    </div>

                                    <div className="relative pl-4 border-l-2 border-border space-y-6">
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                                            <p className="text-sm font-medium">Assignment Created</p>
                                            <span className="text-xs text-muted-foreground">Oct 24, 10:00 AM</span>
                                        </div>
                                        {submissionStatus === 'submitted' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="relative"
                                            >
                                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-background" />
                                                <p className="text-sm font-medium">You Submitted</p>
                                                <span className="text-xs text-muted-foreground">Just now</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 8. Rules */}
                        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex gap-3 text-orange-900/80">
                            <Info className="w-5 h-5 flex-shrink-0 text-orange-500" />
                            <div className="text-sm">
                                <p className="font-medium mb-1">Late Submission Policy</p>
                                <p className="leading-relaxed opacity-90">
                                    Submissions after the due date will incur a <span className="font-bold">10% penalty</span> per day.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Assignments;
