"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Keep this import if using shadcn/ui

// Inline RetroGrid component inside this file
function RetroGrid({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "gray",
  darkLineColor = "gray",
}: {
  angle?: number;
  cellSize?: number;
  opacity?: number;
  lightLineColor?: string;
  darkLineColor?: string;
}) {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:200px] opacity-[var(--opacity)]"
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  );
}

// Main Welcome Landing Page
export default function WelcomeLandingPage() {
  const router = useRouter();

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* RetroGrid directly included here */}
      <RetroGrid
        angle={75}
        cellSize={80}
        opacity={0.15}
        lightLineColor="#FFD319"
        darkLineColor="#FF2975"
      />

      {/* Foreground content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl sm:text-7xl font-bold text-transparent bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-700 bg-clip-text drop-shadow-md">
          Welcome to Innosin Lab
        </h1>

        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Pioneering lab furniture designed for science, safety, and tomorrow.
        </p>

        <Button
          className="mt-8 px-6 py-4 text-lg rounded-full bg-[#ff2975] hover:bg-[#d82063] text-white shadow-xl"
          onClick={() => router.push("/home")}
        >
          Enter Site →
        </Button>
      </div>
    </div>
  );
}
