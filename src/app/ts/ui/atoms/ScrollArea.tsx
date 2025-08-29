const ScrollArea: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <div className={`overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500 ${className} custom-scrollbar`}>
      {children}
    </div>
  );
};

export { ScrollArea };