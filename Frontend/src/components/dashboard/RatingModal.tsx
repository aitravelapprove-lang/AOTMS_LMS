import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { fetchWithAuth } from '@/lib/api';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export function RatingModal({ isOpen, onClose, courseId, courseTitle }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await fetchWithAuth('/data/course_ratings', {
        method: 'POST',
        body: JSON.stringify({
          course_id: courseId,
          rating,
          review,
          created_at: new Date()
        })
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setRating(0);
        setReview('');
      }, 2500);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !submitted && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none bg-white rounded-[2rem] shadow-2xl">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="rating-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="h-20 w-20 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-primary/10 shadow-inner">
                  <Star className="h-10 w-10 fill-primary" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Rate Your Experience</h2>
                <p className="text-slate-500 font-bold text-sm px-4">
                  You've completed a major milestone in <span className="text-primary italic">{courseTitle}</span>. How did we do?
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className="transition-all duration-300 hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-12 w-12 transition-all duration-300 ${
                        (hover || rating) >= star 
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' 
                        : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                 <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest pl-1">Tell us more (Optional)</p>
                 <textarea
                  placeholder="Share what you liked or what we can improve..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full min-h-[120px] p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm outline-none resize-none placeholder:text-slate-400 font-bold leading-relaxed"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || loading}
                className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Processing Feedback...' : 'Pulse My Rating'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 text-center space-y-6 bg-gradient-to-b from-emerald-50/50 to-white"
            >
              <div className="h-24 w-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="h-14 w-14" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-black text-slate-900">Awesome!</h2>
                 <p className="text-slate-500 font-bold max-w-[200px] mx-auto">Your feedback fuels our learning mission.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
