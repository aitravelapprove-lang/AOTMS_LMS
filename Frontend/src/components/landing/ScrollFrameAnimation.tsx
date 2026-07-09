import { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ScrollFrameAnimation = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

    // Get scroll progress relative to the container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Map scroll progress (0 to 1) to frame index (0 to 223)
    const TOTAL_FRAMES = 224;
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

    // Opacity for the "Go to Home" button
    const buttonOpacity = useTransform(scrollYProgress, [0.95, 1], [0, 1]);
    const buttonPointerEvents = useTransform(scrollYProgress, (v) => (v > 0.95 ? "auto" : "none"));

    useEffect(() => {
        // Dynamically import all images from the folder
        const loadImages = async () => {
            const imageUrls = import.meta.glob('@/Home_images/*.jpg', { eager: true, query: '?url', import: 'default' });

            // Convert object to array and sort by filename to ensure correct sequence
            const sortedUrls = Object.keys(imageUrls)
                .sort((a, b) => {
                    const aNum = parseInt(a.match(/frame-(\d+)/)?.[1] || "0");
                    const bNum = parseInt(b.match(/frame-(\d+)/)?.[1] || "0");
                    return aNum - bNum;
                })
                .map(key => imageUrls[key] as string);

            const loadedImages: HTMLImageElement[] = [];
            let loadedCount = 0;

            for (const url of sortedUrls) {
                const img = new Image();
                img.src = url;
                await new Promise((resolve) => {
                    img.onload = () => {
                        loadedCount++;
                        resolve(null);
                    };
                    // Handle error just in case, to not break the loop
                    img.onerror = () => resolve(null);
                });
                loadedImages.push(img);
            }

            setImages(loadedImages);
            setIsLoaded(true);
        };

        loadImages();
    }, []);

    useEffect(() => {
        if (!isLoaded || images.length === 0) return;

        const renderFrame = (index: number) => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;

            const img = images[Math.round(index)];
            if (!img) return;

            // Set canvas dimensions to match its display size (responsive to container)
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            // Calculate separate scales for covering smoothly
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        };

        // Initial render
        renderFrame(0);

        // Subscribe to scroll changes to re-render
        const unsubscribe = frameIndex.on("change", (latest) => {
            renderFrame(latest);
        });

        return () => unsubscribe();
    }, [isLoaded, frameIndex, images]);

    const handleScrollToContent = () => {
        const contentElement = document.getElementById("home-content");
        if (contentElement) {
            contentElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div ref={containerRef} className="relative bg-black">
            <div className="sticky top-0 h-screen md:top-10 md:h-auto md:w-[60vh] lg:w-[70vh] md:aspect-[19/16] md:mx-auto md:rounded-3xl overflow-hidden bg-black md:border md:border-white/20 md:shadow-2xl transition-all duration-500">
                <canvas ref={canvasRef} className="w-full h-full block object-cover" />

                {/* Loading Indicator */}
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                        Loading Animation...
                    </div>
                )}

                {/* Call to Action Button */}
                <motion.div
                    style={{ opacity: buttonOpacity, pointerEvents: buttonPointerEvents }}
                    className="absolute bottom-10 left-0 right-0 flex justify-center z-50"
                >
                    <button
                        onClick={handleScrollToContent}
                        className="px-8 py-4 bg-primary text-primary-foreground text-xl font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                        Go to Home Page
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default ScrollFrameAnimation;
