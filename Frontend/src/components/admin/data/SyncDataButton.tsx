import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SyncDataButtonProps {
  onSync: () => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
  label?: string;
}

export const SyncDataButton: React.FC<SyncDataButtonProps> = ({
  onSync,
  isLoading = false,
  className,
  label = "Sync Data"
}) => {
  return (
    <Button
      variant="outline"
      onClick={() => onSync()}
      disabled={isLoading}
      className={cn(
        "h-9 px-4 gap-2.5 rounded-xl border-slate-200 bg-white/70 backdrop-blur-md",
        "text-slate-700 font-bold hover:bg-white hover:border-primary/30 hover:text-primary",
        "transition-all shadow-sm hover:shadow-md active:scale-95 group",
        className
      )}
    >
      <div className="relative">
        <motion.div
          animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
          transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
          className="relative z-10"
        >
          <RefreshCw className={cn(
            "h-4 w-4 transition-colors duration-300",
            isLoading ? "text-primary" : "text-slate-400 group-hover:text-primary"
          )} />
        </motion.div>
        
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.2 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 bg-primary rounded-full blur-md"
            />
          )}
        </AnimatePresence>
      </div>
      
      <span className="text-xs uppercase tracking-wider">{label}</span>
      
      {isLoading && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "auto" }}
          className="overflow-hidden"
        >
          <span className="text-[10px] text-primary/60 font-black animate-pulse ml-1">
            ...
          </span>
        </motion.div>
      )}
    </Button>
  );
};
