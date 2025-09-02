import React, { useEffect, useRef, useState } from 'react';
import { GContext } from '../../../providers';
import { TimeTracker, BatteryStatus } from '../../molecules/widgets';
import { DialogsPanel } from '../../molecules';
import { observer } from 'mobx-react-lite';
import { Dropdown } from '../../atoms/input';
import { useSocketActions } from '../../../composables';

import SettingsStore from '../../../store/SettingsStore';
import AIMessagesStore from '../../../store/AIMessagesStore';

interface Props {
  mode: string;
  systemReady?: boolean;
}

const Visualizer: React.FC<Props> = observer(({ mode, systemReady = true }) => {

  const gctx = React.useContext(GContext);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  useEffect(() => {
    const activeDialog = AIMessagesStore.getActiveDialog();
    const currentMessageCount = activeDialog?.messages.length || 0;
    
    if (currentMessageCount > lastMessageCount) {
      setLastMessageCount(currentMessageCount);
      if (!isHistoryVisible && currentMessageCount > 0) {
        window.safeTimers.setTimeout(() => {
        }, 500);
      }
    }
  }, [AIMessagesStore.getActiveDialog()?.messages.length, isHistoryVisible, lastMessageCount]);

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
        lastMode = m;
      }

      const time = performance.now()/1000;
      const currentMode = SettingsStore.data.runtime['runtime.current.mode'];
      const globalRot = mal 
        ? time * 0.01 + Math.sin(time*3)*0.002 
        : time * (
            m === 'listening' ? 0.25 : 
            m === 'thinking' ? 0.5 : 
            0.08
          );
      
      const interactiveBoost = 1;
      const modeSpeedMultiplier = 1;

      if (flash>0) flash *= 0.92;

      for (const p of particles) {
        let pulse = 0;
        if (mal) {
          pulse = Math.sin(time*10 + p.baseR*1.7) * 0.6 + Math.sin(time*25 + p.a*13)*0.3;
          p.a += p.spd * 0.0005 * (Math.sin(time*2)+1.2);
        } else {
          if (m === 'listening') pulse = Math.sin(time*4 + p.baseR)*2.2 * interactiveBoost;
          else if (m === 'thinking') pulse = Math.sin(time*6 + p.baseR*2)*1.5;
          p.a += p.spd * 0.002 * modeSpeedMultiplier + (
            m==='listening' ? 0.0005*interactiveBoost :
            m==='thinking' ? 0.005 :
            0
          );
        }
        const rr = p.r + pulse;
        const x = Math.cos(p.a + globalRot)*rr;
        const y = Math.sin(p.a + globalRot)*rr;

        let basePalette: [number, number, number] = [0, 0, 0];
        let particleMultiplier = 1;
        
        if (m === 'waiting' && currentMode === 'NORMAL') {
          basePalette = [30, 180, 220];
          particleMultiplier = 1;
        }
        else if (m === 'listening' && currentMode === 'NORMAL') {
          basePalette = [20, 220, 160];
          particleMultiplier = 1.3;
        }
        else if (m === 'thinking') {
          basePalette = [255, 140, 0]; // Оранжевый (#FF8C00)
          particleMultiplier = 1.5;
        }

        const baseColor = mal ? [160+Math.sin(time*6 + p.a*9)*60, 20+Math.sin(time*4 + p.a*3)*10, 25+Math.sin(time*5 + p.a*2)*20] : basePalette;
        const alpha = mal ? (0.15 + 0.6*((Math.sin(time*6 + p.a*7)+1)/2)) : 0.3 + 0.7*( (Math.sin(time*3 + p.a*5)+1)/2 );
        const f = flash>0 ? flash : 0;
        const r = Math.min(255, baseColor[0] + f*120);
        const g = Math.min(255, baseColor[1] + f*120);
        const b = Math.min(255, baseColor[2] + f*120);

        const sparkle = 1;
        const particleSize = (1.2 + (pulse>0?0.6:0)) * particleMultiplier * sparkle;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * sparkle})`;
        ctx.arc(x,y, particleSize, 0, Math.PI*2);
        ctx.fill();
      }

  
  let rgbacolor: string  = '';
  if (mal) {
    rgbacolor = 'rgba(200,30,40,0.25)';
  }
  else if (m === 'waiting' && currentMode === 'NORMAL') {
    rgbacolor = 'rgba(30,180,220,0.15)';
  }
  else if (m === 'listening' && currentMode === 'NORMAL') {
    rgbacolor = 'rgba(20,220,160,0.25)';
  }
  else if (m === 'thinking') {
    rgbacolor = 'rgba(255,140,0,0.25)'; // Оранжевый
  }
  
  const gradient = ctx.createRadialGradient(0,0,12,0,0, Math.min(width,height)/3);
  gradient.addColorStop(0, rgbacolor);
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

  const handleCurrentModelChange = (newModel: string) => {
      const { setAiModel } = useSocketActions();
      setAiModel(newModel);
      SettingsStore.data.settings['current.ai.model.id'] = newModel;
    };

  return (
    <div className='w-full h-full relative select-none'>
      <canvas ref={canvasRef} className='w-full h-full block' />
        <div className='absolute top-4 left-4'>
          <Dropdown
            options={Object.entries(SettingsStore.data.settings['current.ai.api'])?.map(([key, item]) => ({ value: key || '', label: item.name })) || []}
            value={SettingsStore.data.settings['current.ai.model.id']}
            onChange={handleCurrentModelChange}
            placeholder="Выберите модель"
          />
        </div>
      <div className="absolute top-4 right-6 flex flex-row gap-4 pointer-events-none z-20">
        <BatteryStatus />
        <TimeTracker />
      </div>
      <div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-xs tracking-widest uppercase text-ui-text-secondary mb-2'>СТАТУС</div>
          <div className={`text-4xl font-light ${!systemReady ? 'text-red-400 drop-shadow-[0_0_6px_rgba(255,0,0,0.4)] animate-pulse' : ''}`}>
            {!systemReady ? 'ИНИЦИАЛИЗАЦИЯ' : gctx.states[mode]}
          </div>
          
          {!systemReady && (
            <div className='mt-4 text-[10px] tracking-widest text-red-500/70 animate-[blink_1.2s_steps(2,start)_infinite]'>СИСТЕМА НЕ ГОТОВА</div>
          )}
        </div>
      </div>

      <DialogsPanel
        isVisible={isHistoryVisible}
        onToggle={() => setIsHistoryVisible(!isHistoryVisible)}
        isDropdownVisible={true}
      />
    </div>
  );
});

export { Visualizer };
