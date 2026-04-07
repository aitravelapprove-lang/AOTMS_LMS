import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // High-performance Framer Motion values for tracking cursor
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for the trailing ring effect
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only initialize on desktop devices with a fine pointer (mouse)
    // Avoids running this logic on mobile/touch screens
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    let rafId: number;

    const moveCursor = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      // Batch updates using requestAnimationFrame for maximum performance
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      });
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    
    // Hide cursor effects when leaving the viewport
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Dynamic detection of interactive elements to trigger the "hover" state
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.closest("button") !== null ||
        target.closest("a") !== null ||
        target.closest("[role='button']") !== null ||
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovering(isInteractive);
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY, isVisible]);

  // Don't render component on mobile devices
  if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
    return null;
  }

  return (
    <>
      <style>
        {`
          /* Subtle CSS to enhance the native cursor layering */
          body {
            /* We retain the native cursor for usability, but enhance it with our trailing components */
            cursor: default;
          }
        `}
      </style>

      {/* Trailing Aura / Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          scale: isClicked ? 0.85 : 1,
        }}
        transition={{ 
          width: { duration: 0.2 },
          height: { duration: 0.2 },
          scale: { duration: 0.1 }
        }}
      >
        <div 
          className={`w-full h-full rounded-full transition-all duration-300 ${
            isHovering 
              ? "border-2 border-[#FD5A1A]/60 bg-[#FD5A1A]/10 shadow-[0_0_20px_rgba(253,90,26,0.2)]" 
              : "border-[1.5px] border-[#0075CF]/70 shadow-[0_0_10px_rgba(0,117,207,0.15)]"
          }`}
        />
      </motion.div>
      
      {/* Precision Core Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10001] rounded-full"
        style={{
          x: mouseX, // Zero latency for the structural dot
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: 6,
          height: 6,
          backgroundColor: isHovering ? "#FD5A1A" : "#0075CF",
          scale: isClicked ? 0 : (isHovering ? 0 : 1), // Hide inner dot when hovering for cleaner look
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
};

export default CustomCursor;
