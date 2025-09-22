import React from 'react';

const AnimatedWaveBackground: React.FC = () => {
  const balls = [
    { color: 'hsl(var(--sea))', intensity: 12, duration: '3.4s' },
    { color: 'hsl(var(--sea-light))', intensity: 18, duration: '6.1s' },
    { color: 'hsl(var(--primary))', intensity: 10, duration: '2.9s' },
    { color: 'hsl(var(--sea-dark))', intensity: 16, duration: '7.8s' },
    { color: 'hsl(var(--accent))', intensity: 14, duration: '4.6s' },
    { color: 'hsl(var(--sea))', intensity: 11, duration: '3.3s' },
    { color: 'hsl(var(--primary))', intensity: 17, duration: '5.5s' },
    { color: 'hsl(var(--sea-light))', intensity: 13, duration: '6.7s' },
    { color: 'hsl(var(--sea-dark))', intensity: 19, duration: '8.2s' },
    { color: 'hsl(var(--accent))', intensity: 15, duration: '9.1s' },
    { color: 'hsl(var(--sea))', intensity: 14, duration: '4.2s' },
    { color: 'hsl(var(--primary))', intensity: 16, duration: '5.8s' },
    { color: 'hsl(var(--sea-light))', intensity: 10, duration: '7.3s' },
    { color: 'hsl(var(--sea-dark))', intensity: 18, duration: '6.4s' },
    { color: 'hsl(var(--accent))', intensity: 20, duration: '10s' },
    { color: 'hsl(var(--sea))', intensity: 12, duration: '3.7s' },
    { color: 'hsl(var(--primary))', intensity: 11, duration: '2.6s' },
    { color: 'hsl(var(--sea-light))', intensity: 17, duration: '6.9s' },
    { color: 'hsl(var(--sea-dark))', intensity: 13, duration: '5.3s' },
    { color: 'hsl(var(--accent))', intensity: 19, duration: '7.7s' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ 
          width: '400px', 
          height: '400px',
          transform: 'translate(-50%, -50%) scale(0.8)'
        }}
      >
        {balls.map((ball, index) => (
          <div
            key={index}
            className={`absolute rounded-full animate-wave-rotate mix-blend-multiply opacity-30 ${
              index % 2 === 0 ? 'animate-reverse' : ''
            }`}
            style={{
              width: `calc(400px + ${ball.intensity}px)`,
              height: `calc(400px + ${ball.intensity}px)`,
              backgroundColor: ball.color,
              transformOrigin: '400px',
              animationDuration: ball.duration,
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedWaveBackground;