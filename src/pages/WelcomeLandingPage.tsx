"use client";

import { useRouter } from "next/navigation"; // use 'next/router' if you're on an older Next.js version
import { RetroGrid } from "@/components/magicui/retro-grid";
import { Button } from "@/components/ui/button"; // Assuming you're using shadcn/ui or similar

export default function WelcomeLandingPage() {
  const router = useRouter();

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* Animated Grid Background */}
      <RetroGrid />

      {/* Content Layer */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl sm:text-7xl font-bold text-transparent bg-gradient-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text">
          Welcome to Innosin Lab
        </h1>

        <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Custom lab furniture and stainless steel solutions built for tomorrow’s laboratories.
        </p>

        <Button
          className="mt-8 text-lg px-6 py-4 rounded-full bg-[#ff2975] hover:bg-[#d82063] text-white transition-all shadow-lg"
          onClick={() => router.push("/home")}
        >
          Enter Website →
        </Button>
      </div>
    </div>
  );
}
