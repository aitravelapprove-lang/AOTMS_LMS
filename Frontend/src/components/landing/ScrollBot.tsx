import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";

const ScrollBot = () => {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [isScrolling, setIsScrolling] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // Detect scrolling and visibility
  useEffect(() => {
    const handleScroll = () => {
      // Chatbot visibility logic (show after scrolling past 400px or if not on home page)
      const currentScrollY = window.scrollY;
      const isHome = location.pathname === "/";

      if (!isHome || currentScrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1500); // 1.5 seconds of idle to switch to bot
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [location.pathname]);

  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessages = [...messages, { role: "user", text: inputValue }];
    setMessages(newMessages);
    setInputValue("");

    // Simple bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Thanks for your message! Our team will get back to you soon about AOTMS courses.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed right-6 bottom-10 z-[100] flex flex-col items-center">
      <AnimatePresence mode="wait">
        {isVisible && (
          <>
            {isScrolling && !isChatOpen ? (
              /* SCROLL BAR MODE */
              <motion.div
                key="scrollbar"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-2.5 h-48 bg-[#E6F2FA] rounded-full overflow-hidden relative border border-[#0075CF]/10 shadow-inner"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-[#0075CF] via-[#3391D9] to-[#FD5A1A] origin-top h-full"
                  style={{ scaleY }}
                />
              </motion.div>
            ) : (
              /* CHATBOT MODE */
              <motion.div
                key="chatbot"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="relative"
              >
                {isChatOpen ? (
                  /* OPEN CHAT WINDOW — PREMIUM GLASSMORPHISM */
                  <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9, rotate: 2 }}
                    className="relative bg-white/95 backdrop-blur-2xl border-2 border-white/50 shadow-[0_40px_100px_-20px_rgba(0,117,207,0.3)] rounded-[2.5rem] w-[320px] sm:w-[360px] overflow-hidden flex flex-col mb-4"
                    style={{ borderRadius: "2rem 4rem 2rem 4rem" }}
                  >
                    {/* Header — Quantum Gradient */}
                    <div className="bg-gradient-to-r from-[#0075CF] via-[#0057B7] to-[#FD5A1A] p-6 flex items-center justify-between text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 rotate-3 group-hover:rotate-0 transition-transform">
                            <Bot
                              size={24}
                              className="text-white drop-shadow-lg"
                            />
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                        </div>
                        <div>
                          <p className="font-black text-base tracking-tight italic">
                            AOTMS{" "}
                            <span className="font-normal opacity-80 not-italic">
                              Assistant
                            </span>
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-ping" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                              System Live
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsChatOpen(false)}
                        className="relative z-10 bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Messages with Custom Scrollbar */}
                    <div className="h-[320px] overflow-y-auto p-5 flex flex-col gap-5 bg-gradient-to-b from-slate-50/50 to-white">
                      {messages.map((m, i) => (
                        <motion.div
                          key={i}
                          initial={{
                            opacity: 0,
                            x: m.role === "user" ? 20 : -20,
                          }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] px-5 py-4 text-sm font-medium leading-relaxed ${
                              m.role === "user"
                                ? "bg-gradient-to-br from-[#0075CF] to-[#0057B7] text-white rounded-[1.5rem] rounded-br-none shadow-[0_10px_20px_rgba(0,117,207,0.15)]"
                                : "bg-white border border-slate-100 text-slate-700 rounded-[1.5rem] rounded-bl-none shadow-[0_10px_20px_rgba(0,0,0,0.03)]"
                            }`}
                          >
                            {m.text}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Input — Floating Style */}
                    <div className="p-6 bg-white border-t border-slate-100/50">
                      <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-[#0075CF]/30 focus-within:bg-white transition-all">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSend()}
                          placeholder="Ask about courses, exams..."
                          className="flex-1 bg-transparent border-none focus-visible:ring-0 text-slate-800 placeholder:text-slate-400 font-medium"
                        />
                        <Button
                          onClick={handleSend}
                          size="icon"
                          className="bg-gradient-to-tr from-[#0075CF] to-[#FD5A1A] hover:scale-105 transition-transform rounded-xl shadow-lg"
                        >
                          <Send size={18} className="text-white" />
                        </Button>
                      </div>
                      <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                        AOTMS Proprietary AI System
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* FLOATING CHAT BUBBLE — UNIQUE ASYMMETRIC SHAPE */
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="relative w-16 h-16 group outline-none"
                  >
                    {/* Background Blob 1 */}
                    <motion.div
                      animate={{
                        borderRadius: [
                          "40% 60% 70% 30% / 40% 50% 60% 50%",
                          "30% 70% 50% 50% / 50% 40% 60% 50%",
                          "40% 60% 70% 30% / 40% 50% 60% 50%",
                        ],
                        rotate: [0, 90, 0],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-tr from-[#0075CF] via-[#0057B7] to-[#FD5A1A] opacity-20 blur-xl group-hover:opacity-40 transition-opacity"
                    />

                    {/* Background Blob 2 */}
                    <motion.div
                      animate={{
                        borderRadius: [
                          "30% 70% 50% 50% / 50% 40% 60% 50%",
                          "40% 60% 70% 30% / 40% 50% 60% 50%",
                          "30% 70% 50% 50% / 50% 40% 60% 50%",
                        ],
                        rotate: [0, -90, 0],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-bl from-[#FD5A1A] via-[#FF7A00] to-[#0075CF] opacity-20 blur-xl group-hover:opacity-40 transition-opacity"
                    />

                    {/* Main Button Body - Asymmetric Capsule */}
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative z-10 w-full h-full bg-[#0075CF] text-white shadow-[0_10px_30px_rgba(0,117,207,0.3)] flex items-center justify-center overflow-hidden border-2 border-white/30 backdrop-blur-md"
                      style={{
                        borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                      <div className="flex flex-col items-center gap-1">
                        <MessageSquare className="w-6 h-6 drop-shadow-md" />
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-80">
                          Help
                        </span>
                      </div>

                      {/* Inner Flow Effect */}
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
                      />
                    </motion.div>

                    {/* Notification Badge */}
                    {!isScrolling && (
                      <span className="absolute top-2 right-2 z-20 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FD5A1A] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FD5A1A] border-2 border-white"></span>
                      </span>
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScrollBot;
