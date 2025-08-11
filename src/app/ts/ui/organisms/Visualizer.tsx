import React, { useEffect, useRef } from 'react';
import { GContext } from '../../providers';
import { TimeTracker, BatteryStatus } from '../molecules/widgets';

interface Props {
  mode: string;
  systemReady?: boolean;
}

const Visualizer: React.FC<Props> = ({ mode, systemReady = true }) => {

  const gctx = React.useContext(GContext);

  if (!gctx?.states) return null;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const readyRef = useRef(systemReady);
  readyRef.current = systemReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const onResize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    window.addEventListener('resize', onResize);

  const rings = !readyRef.current ? 7 : 9;
  const pointsPerRing = !readyRef.current ? 70 : 90;
    const particles: {r:number; a:number; spd:number; baseR:number;}[] = [];
    for (let i=0;i<rings;i++) {
      for (let j=0;j<pointsPerRing;j++) {
        const a = (j/pointsPerRing) * Math.PI * 2;
        const baseR = (Math.min(width,height)/2)*0.15 + i* (Math.min(width,height)/2)*0.035;
        particles.push({ r: baseR, a, spd: (Math.random()*0.3+0.05)*(i+1)/rings, baseR });
      }
    }

    let flash = 0;
    let lastMode = modeRef.current;

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0,0,width,height);
      ctx.save();
      ctx.translate(width/2,height/2);

  const m = modeRef.current;
  const mal = !readyRef.current;
      if (m !== lastMode) {
        if (m === 'wake') flash = 1.2;
        lastMode = m;
      }

      const time = performance.now()/1000;
  const globalRot = mal ? time * 0.01 + Math.sin(time*3)*0.002 : time * (m === 'listening' ? 0.25 : 0.08);

      if (flash>0) flash *= 0.92;

      for (const p of particles) {
        let pulse = 0;
        if (mal) {
          pulse = Math.sin(time*10 + p.baseR*1.7) * 0.6 + Math.sin(time*25 + p.a*13)*0.3;
          p.a += p.spd * 0.0005 * (Math.sin(time*2)+1.2);
        } else {
          if (m === 'listening') pulse = Math.sin(time*4 + p.baseR)*2.2;
          else if (m === 'wake') pulse = Math.sin(time*8 + p.baseR)*1.2;
          p.a += p.spd * 0.002 + (m==='listening'?0.0005:0);
        }
        const rr = p.r + pulse;
        const x = Math.cos(p.a + globalRot)*rr;
        const y = Math.sin(p.a + globalRot)*rr;

  const baseColor = mal ? [160+Math.sin(time*6 + p.a*9)*60, 20+Math.sin(time*4 + p.a*3)*10, 25+Math.sin(time*5 + p.a*2)*20] : (m === 'listening' ? [0,173,133] : m === 'wake' ? [0,122,204] : [80,100,120]);
  const alpha = mal ? (0.15 + 0.6*((Math.sin(time*6 + p.a*7)+1)/2)) : 0.25 + 0.55*( (Math.sin(time*3 + p.a*5)+1)/2 );
        const f = flash>0 ? flash : 0;
        const r = Math.min(255, baseColor[0] + f*120);
        const g = Math.min(255, baseColor[1] + f*120);
        const b = Math.min(255, baseColor[2] + f*120);

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.arc(x,y, 1.2 + (pulse>0?0.6:0), 0, Math.PI*2);
        ctx.fill();
      }

  const gradient = ctx.createRadialGradient(0,0,12,0,0, Math.min(width,height)/3);
  gradient.addColorStop(0, mal ? 'rgba(200,30,40,0.25)' : m==='listening' ? 'rgba(0,173,133,0.22)' : m==='wake' ? 'rgba(0,122,204,0.22)' : 'rgba(0,150,180,0.12)');
      gradient.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(0,0, Math.min(width,height)/3, 0, Math.PI*2);
      ctx.fill();

      ctx.restore();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

    return () => { window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <div className='w-full h-full relative select-none'>
      <canvas ref={canvasRef} className='w-full h-full block' />
      <div className="absolute top-4 right-6 flex flex-row gap-4 pointer-events-none z-20">
        <BatteryStatus />
        <TimeTracker />
      </div>
      <div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-xs tracking-widest uppercase text-gray-500 mb-2'>СТАТУС</div>
          <div className={`text-4xl font-light ${!systemReady ? 'text-red-400 drop-shadow-[0_0_6px_rgba(255,0,0,0.4)] animate-pulse' : ''}`}>{!systemReady ? 'ИНИЦИАЛИЗАЦИЯ' : gctx.states[mode]}</div>
          {!systemReady && (
            <div className='mt-4 text-[10px] tracking-widest text-red-500/70 animate-[blink_1.2s_steps(2,start)_infinite]'>СИСТЕМА НЕ ГОТОВА</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
