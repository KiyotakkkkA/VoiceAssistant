import React from "react";
interface Props { title?: string; className?: string }
const Toast: React.FC<Props> = ({ title, className }) => {
  return (
    <div className={`pointer-events-auto select-none group relative px-4 py-3 rounded-md border border-[#2e2e2e] bg-gradient-to-br from-[#2b2b2b] to-[#222] shadow-lg overflow-hidden animate-slide-in ${className}`}>
      <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400' style={{background:'radial-gradient(circle at 85% 15%, rgba(0,122,204,0.18), transparent 60%)'}}/>
      <div className='flex items-start gap-3 relative z-10'>
        <div className='mt-0.5 h-2 w-2 rounded-full bg-[#007acc] shadow-inner animate-pulse'/>
        <div className='text-sm leading-snug text-gray-200'>{title}</div>
      </div>
      <div className='absolute left-0 bottom-0 h-0.5 bg-[#007acc] animate-toast-bar' />
    </div>
  )
};

export default Toast;