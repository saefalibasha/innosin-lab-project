
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
        return 0.0008;
      case "fast":
        return 0.0012;
      default:
        return 0.0008;
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

  const waveColors = colors ?? [
    "hsl(200, 90%, 45%)",
    "hsl(200, 85%, 35%)", 
    "hsl(200, 80%, 30%)",
    "hsl(200, 75%, 25%)"
  ];
  
  const drawWave = (n: number) => {
    nt += getSpeed();
    
    // Create smooth flowing waves like in the reference
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 120; // Increased for smoother appearance
      ctx.strokeStyle = waveColors[i % waveColors.length];
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      // Create smoother wave path
      let firstPoint = true;
      for (x = 0; x <= w; x += 1) {
        // Multiple noise layers for more complex, flowing waves
        var y1 = noise(x / 1200, 0.2 * i, nt) * 60;
        var y2 = noise(x / 800, 0.4 * i, nt * 0.8) * 40;
        var y3 = noise(x / 400, 0.6 * i, nt * 1.2) * 20;
        
        var combinedY = y1 + y2 + y3;
        
        var finalY = pushWavesUp 
          ? combinedY + h * (0.2 + i * 0.15) 
          : combinedY + h * (0.5 + i * 0.1);
          
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
    // Create gradient background similar to reference
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, backgroundFill || "hsl(200, 85%, 20%)");
    gradient.addColorStop(0.5, backgroundFill || "hsl(200, 85%, 25%)");
    gradient.addColorStop(1, backgroundFill || "hsl(200, 85%, 30%)");
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, w, h);
    
    ctx.globalAlpha = waveOpacity || 0.8;
    drawWave(3);
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
