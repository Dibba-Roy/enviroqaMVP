"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { ReviewProvider } from "@/lib/review-context";
import { ToastProvider } from "@/lib/toast-context";

function ResponsiveGuard() {
  const [tooSmall, setTooSmall] = useState(false);

  useEffect(() => {
    const check = () => setTooSmall(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <AnimatePresence>
      {tooSmall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-bg flex items-center justify-center p-6"
        >
          <div className="text-center max-w-sm">
            <Monitor
              size={36}
              className="text-text-muted mx-auto mb-4 opacity-50"
            />
            <h2 className="text-base font-medium text-text-primary mb-2">
              Desktop Required
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              EnviroQA is designed for desktop use. Please use a screen width of
              1024px or larger.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ReviewProvider>
        <ToastProvider>
          <ResponsiveGuard />
          {children}
        </ToastProvider>
      </ReviewProvider>
    </ThemeProvider>
  );
}
