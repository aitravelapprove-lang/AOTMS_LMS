import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Arun Kumar",    score: 9850, avatar: "AK", badge: "bg-amber-500" },
  { rank: 2, name: "Priya Sharma",  score: 9720, avatar: "PS", badge: "bg-slate-400" },
  { rank: 3, name: "Rahul Verma",   score: 9580, avatar: "RV", badge: "bg-orange-700" },
  { rank: 4, name: "Sneha Patel",   score: 9420, avatar: "SP", badge: "bg-blue-500" },
  { rank: 5, name: "Vikram Singh",  score: 9350, avatar: "VS", badge: "bg-blue-500" },
];

const rankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-orange-700" />;
  return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
};

const Leaderboard = () => {
  return (
    <section id="leaderboard" className="relative py-24 lg:py-32 overflow-hidden bg-slate-50/50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 text-[#FD5A1A]" />
              Real-Time Rankings
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 mb-7 leading-[1.05] tracking-tighter">
              Compete, Improve <br className="hidden md:block" />
              <span className="text-[#FD5A1A]">& Lead</span>.
            </h2>
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed mb-10 font-medium max-w-xl">
              Our live ranking system motivates you to sharpen skills daily. Compare with peers and earn your spot among Vijayawada's top tech talent.
            </p>
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {[
                { value: "500+",  label: "Weekly Peers", color: "text-[#0075CF]" },
                { value: "25+",   label: "Active Boards", color: "text-[#FD5A1A]" },
                { value: "2.5K",  label: "Challenges",   color: "text-[#0075CF]" },
                { value: "40%",   label: "Avg. Growth",  color: "text-[#FD5A1A]" },
              ].map((s) => (
                <div key={s.label} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className={`text-2xl md:text-4xl font-black ${s.color} tracking-tighter`}>{s.value}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Leaderboard card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative lg:pt-10"
          >
            {/* Background Blob decoration */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#0075CF]/5 blur-3xl rounded-full" />
            
            <div className="relative bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between px-8 py-7 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">Top Performers</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live this week</p>
                </div>
                <span className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-green-600 rounded-full text-[10px] font-black border border-slate-100 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  LIVE SERVER
                </span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-50">
                {leaderboardData.map((user, idx) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-center gap-5 px-8 py-5 transition-all duration-300 group ${user.rank === 1 ? "bg-[#FFF2EC]/40" : "hover:bg-slate-50/80"}`}
                  >
                    {/* Rank */}
                    <div className="w-8 flex justify-center flex-shrink-0 group-hover:scale-125 transition-transform">
                      {rankIcon(user.rank)}
                    </div>
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-2xl ${user.badge} flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-lg group-hover:rotate-6 transition-transform`}>
                      {user.avatar}
                    </div>
                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-sm tracking-tight truncate">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Level {30 + user.rank * 3}</p>
                    </div>
                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <span className="font-black text-slate-900 text-lg tracking-tighter">{user.score.toLocaleString()}</span>
                      <p className="text-[11px] text-green-500 font-black">+{(user.rank * 1.5).toFixed(1)}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50">
                <button className="w-full py-4 rounded-2xl bg-[#0075CF] text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-[#0066B3] hover:shadow-xl hover:shadow-[#0075CF]/20 active:scale-95 transition-all">
                  View Full Leaderboard
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
