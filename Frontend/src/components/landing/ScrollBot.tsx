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
                  /* OPEN CHAT WINDOW */
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="bg-[#FDFEFE] border-2 border-white shadow-[0_20px_50px_rgba(0,117,207,0.2)] rounded-3xl w-80 sm:w-96 overflow-hidden flex flex-col mb-4"
                  >
                    {/* Header */}
                    <div className="bg-[#0075CF] p-4 flex items-center justify-between text-[#FDFEFE]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Bot size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">AOTMS Assistant</p>
                          <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">
                            Online
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsChatOpen(false)}
                        className="hover:bg-white/10 p-1 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="h-80 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50">
                      {messages.map((m, i) => (
                        <div
                          key={i}
                          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                              m.role === "user"
                                ? "bg-[#0075CF] text-[#FDFEFE] rounded-br-none"
                                : "bg-[#FDFEFE] border border-slate-100 text-slate-700 shadow-sm rounded-bl-none"
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-[#FDFEFE] border-t border-slate-100 flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-50 border-none focus:ring-1 focus:ring-[#0075CF]"
                      />
                      <Button
                        onClick={handleSend}
                        size="icon"
                        className="bg-[#0075CF] hover:bg-[#0066B3]"
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  /* FLOATING CHAT BUBBLE */
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="w-14 h-14 rounded-full bg-[#0075CF] text-[#FDFEFE] shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group relative overflow-hidden border-2 border-white"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0075CF] to-[#FD5A1A] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageSquare className="relative z-10 w-6 h-6" />

                    {/* Scroll Indicator Pulse */}
                    {!isScrolling && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FD5A1A] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FD5A1A]"></span>
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
