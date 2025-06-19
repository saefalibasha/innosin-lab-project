
"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 2,
  speed = "fast",
  waveOpacity = 0.8,
  pushWavesUp = false,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  pushWavesUp?: boolean;
  [key: string]: any;
}) => {
  const noise = createNoise3D();
  let w: number,
    h: number,
    nt: number,
    i: number,
    x: number,
    ctx: any,
    canvas: any;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.0006;
      case "fast":
        return 0.001;
      default:
        return 0.0006;
    }
  };

  const init = () => {
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    w = ctx.canvas.width = window.innerWidth;
    h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
    nt = 0;
    window.onresize = function () {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };
    render();
  };

  // Colors inspired by the reference image - purple to blue gradient
  const waveColors = colors ?? [
    "hsl(280, 80%, 60%)",
    "hsl(260, 85%, 55%)", 
    "hsl(240, 90%, 50%)",
    "hsl(220, 95%, 45%)",
    "hsl(200, 100%, 40%)"
  ];
  
  const drawWave = (n: number) => {
    nt += getSpeed();
    
    // Create smaller, more subtle waves
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 80; // Reduced from 120
      ctx.strokeStyle = waveColors[i % waveColors.length];
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      // Create smoother wave path with reduced amplitude
      let firstPoint = true;
      for (x = 0; x <= w; x += 2) {
        // Reduced wave amplitude for smaller waves
        var y1 = noise(x / 1000, 0.3 * i, nt) * 30; // Reduced from 60
        var y2 = noise(x / 600, 0.5 * i, nt * 0.7) * 20; // Reduced from 40
        var y3 = noise(x / 300, 0.7 * i, nt * 1.1) * 10; // Reduced from 20
        
        var combinedY = y1 + y2 + y3;
        
        var finalY = pushWavesUp 
          ? combinedY + h * (0.3 + i * 0.12) 
          : combinedY + h * (0.6 + i * 0.08);
          
        if (firstPoint) {
          ctx.moveTo(x, finalY);
          firstPoint = false;
        } else {
          ctx.lineTo(x, finalY);
        }
      }
      
      ctx.stroke();
    }
  };

  let animationId: number;
  const render = () => {
    // Create gradient background similar to reference with purple-blue gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, backgroundFill || "hsl(280, 60%, 15%)");
    gradient.addColorStop(0.3, backgroundFill || "hsl(260, 70%, 20%)");
    gradient.addColorStop(0.7, backgroundFill || "hsl(240, 80%, 25%)");
    gradient.addColorStop(1, backgroundFill || "hsl(220, 90%, 30%)");
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, w, h);
    
    ctx.globalAlpha = waveOpacity || 0.6;
    drawWave(4); // Reduced from 3 to 4 for more subtle layering
    animationId = requestAnimationFrame(render);
  };

  useEffect(() => {
    init();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
