"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProcessingStep } from "@/lib/types";
import { getProcessingSteps, mockDocument } from "@/lib/mock-data";
import { useReviewContext } from "@/lib/review-context";
import { scoreToGrade, cn } from "@/lib/utils";
import ReviewDashboard from "@/components/review/ReviewDashboard";

const STEP_DURATION = 800;
const POST_COMPLETE_DELAY = 500;
const DASHBOARD_REVEAL_DELAY = 800;
const SCORE_COUNT_DURATION = 600;

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function StepIcon({ status }: { status: ProcessingStep["status"] }) {
  if (status === "complete") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-5 h-5 flex-shrink-0"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle
            cx="10"
            cy="10"
            r="9"
            fill="var(--success)"
            fillOpacity="0.12"
          />
          <motion.path
            d="M6 10.5l2.5 2.5L14 8"
            stroke="var(--success)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3 }}
          />
        </svg>
      </motion.div>
    );
  }

  if (status === "active") {
    return (
      <div className="w-5 h-5 flex-shrink-0">
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeDasharray="16 34"
            strokeLinecap="round"
          />
        </motion.svg>
      </div>
    );
  }

  return (
    <div className="w-5 h-5 flex-shrink-0">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="10"
          r="8"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

export default function ReviewPage() {
  const { uploadData } = useReviewContext();
  const [processingSteps, setProcessingSteps] =
    useState<ProcessingStep[]>(getProcessingSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [allStepsDone, setAllStepsDone] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  const docName = uploadData?.fileName ?? mockDocument.documentName;
  const targetScore = mockDocument.overallScore;
  const { color: scoreColor } = scoreToGrade(targetScore);
  const totalSteps = processingSteps.length;

  const completedCount = processingSteps.filter(
    (s) => s.status === "complete",
  ).length;
  const progress = isComplete ? 1 : completedCount / totalSteps;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  useEffect(() => {
    if (allStepsDone || currentStep >= totalSteps) return;

    setProcessingSteps((prev) =>
      prev.map((step, i) =>
        i === currentStep ? { ...step, status: "active" as const } : step,
      ),
    );

    const timer = setTimeout(() => {
      setProcessingSteps((prev) =>
        prev.map((step, i) =>
          i === currentStep ? { ...step, status: "complete" as const } : step,
        ),
      );

      if (currentStep + 1 < totalSteps) {
        setCurrentStep((s) => s + 1);
      } else {
        setAllStepsDone(true);
      }
    }, STEP_DURATION);

    return () => clearTimeout(timer);
  }, [currentStep, allStepsDone, totalSteps]);

  useEffect(() => {
    if (!allStepsDone) return;
    const timer = setTimeout(() => setIsComplete(true), POST_COMPLETE_DELAY);
    return () => clearTimeout(timer);
  }, [allStepsDone]);

  useEffect(() => {
    if (!isComplete) return;

    const start = performance.now();
    let rafId: number;
    let revealTimer: ReturnType<typeof setTimeout>;

    const tick = (now: number) => {
      const t = Math.min((now - start) / SCORE_COUNT_DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * targetScore));

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        revealTimer = setTimeout(
          () => setShowDashboard(true),
          DASHBOARD_REVEAL_DELAY,
        );
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(revealTimer);
    };
  }, [isComplete, targetScore]);

  return (
    <AnimatePresence mode="wait">
      {showDashboard ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <ReviewDashboard />
        </motion.div>
      ) : (
        <motion.div
          key="processing"
          exit={{ opacity: 0, scale: 0.96, y: -30 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="min-h-screen flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-10 max-w-md w-full px-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-text-muted text-sm tracking-[0.2em] uppercase mb-2">
                Analyzing
              </p>
              <h1 className="text-text-primary text-xl font-medium">
                {docName}
              </h1>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, y: -120, opacity: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative"
            >
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle
                  cx="90"
                  cy="90"
                  r={RADIUS}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="3"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={RADIUS}
                  fill="none"
                  stroke={isComplete ? "var(--success)" : "var(--accent)"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 90 90)"
                  style={{
                    transition:
                      "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease",
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="score"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="flex flex-col items-center"
                    >
                      <span
                        className={cn(
                          "text-5xl font-bold tabular-nums",
                          scoreColor,
                        )}
                      >
                        {displayScore}
                      </span>
                      <span className="text-text-muted text-sm mt-1">
                        / 100
                      </span>
                      <span className="text-text-muted text-[10px] mt-1 tracking-wide uppercase">
                        QA Readiness
                      </span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="percent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="text-text-secondary text-base font-mono tabular-nums"
                    >
                      {Math.round(progress * 100)}%
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <div className="h-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {!isComplete && currentStep < totalSteps && (
                  <motion.p
                    key={currentStep}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="text-accent text-base font-medium"
                  >
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {processingSteps[currentStep]?.label}
                    </motion.span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full space-y-3"
            >
              {processingSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <StepIcon status={step.status} />
                  <span
                    className={cn(
                      "text-base transition-colors duration-300",
                      step.status === "complete" && "text-text-secondary",
                      step.status === "active" && "text-text-primary",
                      step.status === "pending" && "text-text-muted",
                    )}
                  >
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
