/* eslint-disable react-hooks/purity */
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  EXPLODE_ON_NO_COUNT,
  MOCHI_BEAR_ASKING,
  MOCHI_BEAR_DANCE,
  MOCHI_BEAR_ROSE_KISSED,
} from "./constants";

const App: React.FC = () => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [yesScale, setYesScale] = useState(1);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const maxPositionsRef = useRef({ xLeft: 0, xRight: 0, yTop: 0, yBottom: 0 });

  const random = (min: number, max: number, oldValue: number) => {
    let newValue = Math.random() * (max - min) + min;

    while (Math.abs(newValue - oldValue) < 50) {
      newValue = Math.random() * (max - min) + min;
    }

    return newValue;
  };

  // Trigger confetti from multiple edges
  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // From Left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0, y: Math.random() },
        colors: ["#ff0000", "#ff69b4", "#ffffff"],
      });
      // From Right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 1, y: Math.random() },
        colors: ["#ff0000", "#ff69b4", "#ffffff"],
      });
      // From Top
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: 0 },
        colors: ["#ff0000", "#ff69b4", "#ffffff"],
      });
    }, 250);
  };

  const handleYes = () => {
    setIsAccepted(true);
    triggerConfetti();
  };

  const moveNoButton = useCallback(() => {
    if (!noButtonRef.current) return;

    const { xLeft, xRight, yTop, yBottom } = maxPositionsRef.current;

    const newX = random(xRight, xLeft, noPosition.x);
    const newY = random(
      yBottom,
      noCount === EXPLODE_ON_NO_COUNT - 1 ? yTop + 200 : yTop,
      noPosition.y,
    );

    setNoPosition({
      x: newX,
      y: newY,
    });

    setNoCount((prev) => prev + 1);
    setYesScale((prev) => prev + 0.05);
  }, [noCount, noPosition.x, noPosition.y]);

  const explodeNoButton = useCallback(() => {
    if (!noButtonRef.current) return;

    const rect = noButtonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    confetti({
      particleCount: 100,
      spread: 50,
      origin: {
        x: centerX / window.innerWidth,
        y: centerY / window.innerHeight,
      },
      colors: ["#ff0000", "#f2ce57", "#f08512"],
    });

    setNoCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (noButtonRef.current) {
      const rect = noButtonRef.current.getBoundingClientRect();

      maxPositionsRef.current = {
        xLeft: -rect.left + 50,
        xRight: window.innerWidth - rect.right - rect.width,
        yTop: -rect.top,
        yBottom: window.innerHeight - rect.bottom - rect.height - 100,
      };

      // Math.floor on all maxPositionsRef.current values to ensure they are integers
      maxPositionsRef.current = {
        xLeft: Math.floor(maxPositionsRef.current.xLeft),
        xRight: Math.floor(maxPositionsRef.current.xRight),
        yTop: Math.floor(maxPositionsRef.current.yTop),
        yBottom: Math.floor(maxPositionsRef.current.yBottom),
      };
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-pink-50 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!isAccepted ? (
          <motion.div
            key="ask"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex flex-col items-center text-center space-y-6 md:space-y-8 z-10 w-full max-w-2xl"
          >
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-4xl md:text-6xl font-cursive text-rose-600 font-bold drop-shadow-sm px-2"
            >
              Evie, will you be my valentine?
            </motion.h1>

            <div className="relative w-48 h-48 md:w-80 md:h-80">
              <img
                src={MOCHI_BEAR_ASKING}
                alt="Cute Mochi Bear"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 relative w-full min-h-[100px]">
              <motion.button
                onClick={handleYes}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: yesScale,
                  fontSize: `${Math.min(1.2 * yesScale, 4)}rem`,
                }}
                style={{
                  scale: yesScale,
                  fontSize: `${Math.min(1.2 * yesScale, 4)}rem`,
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-colors z-20 whitespace-nowrap"
              >
                Yes! ✨
              </motion.button>

              <motion.button
                ref={noButtonRef}
                animate={{ x: noPosition.x, y: noPosition.y }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
                onMouseEnter={
                  noCount < EXPLODE_ON_NO_COUNT ? moveNoButton : explodeNoButton
                }
                style={noCount > EXPLODE_ON_NO_COUNT ? { scale: 0 } : undefined}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-10 rounded-full shadow-md z-30"
              >
                No
              </motion.button>
            </div>

            <AnimatePresence>
              {noCount > 3 && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-rose-400 italic font-medium"
                >
                  {noCount < 7
                    ? "Wait, try again! 🥺"
                    : noCount < 10
                      ? "Iceland might be getting awkward? 😂"
                      : noCount <= EXPLODE_ON_NO_COUNT
                        ? "Click 'Yes' already! 💔"
                        : "There we go 🌚"}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="flex flex-col items-center text-center space-y-8 z-10"
          >
            <motion.h1
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-5xl md:text-7xl font-cursive text-rose-600 font-bold"
            >
              Yay! I limpet you! 💜
            </motion.h1>

            <div className="relative w-64 h-64 md:w-96 md:h-96">
              <img
                src={MOCHI_BEAR_ROSE_KISSED}
                alt="Happy Mochi Bear"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xl md:text-2xl text-rose-500 font-medium max-w-md m-0">
              You've made me the happiest person in the world!
            </p>
            <p className="text-xl md:text-2xl text-rose-500 font-medium max-w-md mt-0">
              Happy Valentine's Day!
            </p>

            <div className="flex space-x-4">
              <img
                src={MOCHI_BEAR_DANCE}
                alt="Love"
                className="w-16 h-16 opacity-80"
              />
              <img
                src={MOCHI_BEAR_DANCE}
                alt="Love"
                className="w-16 h-16 opacity-80"
              />
              <img
                src={MOCHI_BEAR_DANCE}
                alt="Love"
                className="w-16 h-16 opacity-80"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Floating Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              y: "110vh",
              x: `${Math.random() * 100}vw`,
            }}
            animate={{
              opacity: [0, 0.3, 0],
              y: "-10vh",
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="text-pink-300 text-2xl"
          >
            💜
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default App;
