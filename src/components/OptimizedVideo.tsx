
import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  interactive?: boolean;
  playsInline?: boolean;
  startTime?: number; // Start time in seconds
  blendWithBackground?: boolean;
  mobileSizeReduction?: boolean;
}

const OptimizedVideo: React.FC<OptimizedVideoProps> = ({
  src,
  poster,
  className = '',
  autoplay = false,
  muted = true,
  loop = false,
  controls = false,
  interactive = true,
  playsInline = true,
  startTime = 0,
  blendWithBackground = false,
  mobileSizeReduction = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const isMobile = useIsMobile();

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLoadedData = () => {
    if (videoRef.current && startTime > 0) {
      videoRef.current.currentTime = startTime;
    }
  };

  const containerClasses = `relative group ${className} ${
    blendWithBackground ? 'video-blend-container' : ''
  } ${mobileSizeReduction && isMobile ? 'mobile-reduced' : ''}`;

  const videoClasses = `w-full h-full object-cover transition-all duration-700 ${
    blendWithBackground ? 'rounded-2xl sm:rounded-3xl' : ''
  } ${mobileSizeReduction && isMobile ? 'scale-95' : ''}`;

  return (
    <div className={containerClasses}>
      {/* Background blending effects */}
      {blendWithBackground && (
        <>
          {/* Gradient overlay for seamless blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl sm:rounded-3xl"></div>
          {/* Soft shadow for depth */}
          <div className="absolute inset-0 shadow-2xl rounded-2xl sm:rounded-3xl opacity-60"></div>
          {/* Vignette effect */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/10 rounded-2xl sm:rounded-3xl"></div>
        </>
      )}
      
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
        className={videoClasses}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedData={handleLoadedData}
        preload={isMobile ? "metadata" : "auto"}
      />
      
      {!controls && interactive && !isMobile && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <button
              onClick={togglePlay}
              className="bg-sea/80 text-white p-3 rounded-full hover:bg-sea transition-all duration-200 backdrop-blur-sm shadow-lg"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={toggleMute}
              className="bg-sea/80 text-white p-3 rounded-full hover:bg-sea transition-all duration-200 backdrop-blur-sm shadow-lg"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile tap controls */}
      {!controls && interactive && isMobile && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          onClick={togglePlay}
        >
          <div className={`bg-sea/60 text-white p-4 rounded-full backdrop-blur-sm shadow-lg transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            <Play className="w-8 h-8" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedVideo;
