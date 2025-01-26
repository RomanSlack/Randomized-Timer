"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  // Timer inputs
  const [minutes, setMinutes] = useState<number>(1);
  const [seconds, setSeconds] = useState<number>(30);

  // Random extension range (in seconds)
  const [minExtension, setMinExtension] = useState<number>(1);
  const [maxExtension, setMaxExtension] = useState<number>(0);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Track whether we've already used the random extension
  const [usedExtension, setUsedExtension] = useState<boolean>(false);

  // For indicating that extension is active
  const [extensionActive, setExtensionActive] = useState<boolean>(false);

  // Audio reference for beep
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format time as mm:ss
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const mm = m < 10 ? `0${m}` : m;
    const ss = s < 10 ? `0${s}` : s;
    return `${mm}:${ss}`;
  };

  // Start the timer
  const handleStart = () => {
    // Calculate total base time in seconds
    const baseTime = minutes * 60 + seconds;
    setTimeLeft(baseTime);
    setIsRunning(true);
    setUsedExtension(false);
    setExtensionActive(false);
  };

  // Stop the sound
  const handleStopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause(); // Stop the audio
      audioRef.current.currentTime = 0; // Reset playback to the beginning
    }
  };

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      // Decrement time every second
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer just hit 0
      if (!usedExtension) {
        // We haven't used the random extension yet
        const randomSeconds =
          Math.floor(Math.random() * (maxExtension - minExtension + 1)) +
          minExtension;
        setTimeLeft(randomSeconds);
        setUsedExtension(true);
        setExtensionActive(true);
      } else {
        // The timer has ended (extension also finished)
        setIsRunning(false);
        setExtensionActive(false);
        // Play beep sound
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("Failed to play audio:", err);
          });
        }
      }
    }

    // Clean up
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, usedExtension, minExtension, maxExtension]);

  return (
    <div className="min-h-screen flex flex-col items-center text-black justify-center bg-gray-100 p-4">
      {/* Hidden audio element for beep */}
      <audio ref={audioRef} src="/TimerChimeEnd.mp3" preload="auto" />

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Randomized Timer - Roman Slack</h1>

        {/* Timer Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <label htmlFor="minutes" className="mb-1 font-medium">
              Minutes
            </label>
            <input
              id="minutes"
              type="number"
              min="0"
              className="border rounded p-2"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="seconds" className="mb-1 font-medium">
              Seconds
            </label>
            <input
              id="seconds"
              type="number"
              min="0"
              className="border rounded p-2"
              value={seconds}
              onChange={(e) => setSeconds(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>

        {/* Random Extension Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <label htmlFor="minExt" className="mb-1 font-medium">
              Min Ext (s)
            </label>
            <input
              id="minExt"
              type="number"
              min="0"
              className="border rounded p-2"
              value={minExtension}
              onChange={(e) => setMinExtension(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="maxExt" className="mb-1 font-medium">
              Max Ext (s)
            </label>
            <input
              id="maxExt"
              type="number"
              min="0"
              className="border rounded p-2"
              value={maxExtension}
              onChange={(e) => setMaxExtension(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <p className="text-4xl font-bold">
            {formatTime(timeLeft)}
          </p>
          {extensionActive && (
            <p className="text-green-600 text-sm mt-2">Extension Active!</p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-semibold"
            onClick={handleStart}
          >
            Start Timer
          </button>
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-semibold"
            onClick={handleStopSound}
          >
            Stop Sound
          </button>
        </div>
      </div>
    </div>
  );
}
