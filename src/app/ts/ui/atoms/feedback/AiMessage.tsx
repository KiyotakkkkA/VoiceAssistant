import React from 'react';

interface AiMessageProps {
  userText: string;
  aiResponse: string;
  modelName: string;
  timestamp?: Date;
  isLatest?: boolean;
}

const AiMessage: React.FC<AiMessageProps> = ({ 
  userText, 
  aiResponse, 
  modelName, 
  timestamp = new Date(), 
  isLatest = false 
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getModelIcon = (model: string) => {
    if (model.includes('gpt') || model.includes('openai')) {
      return '🤖';
    } else if (model.includes('claude')) {
      return '🧠';
    } else if (model.includes('gemini')) {
      return '💎';
    }
    return '🤖';
  };

  const getModelColor = (model: string) => {
    if (model.includes('gpt') || model.includes('openai')) {
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    } else if (model.includes('claude')) {
      return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    } else if (model.includes('gemini')) {
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
    return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  return (
    <div className={`group relative p-4 rounded-xl border transition-all duration-300 ${
      isLatest 
        ? 'border-ui-border-primary bg-gradient-to-br from-ui-accent/5 to-ui-accent/10 shadow-lg' 
        : 'border-ui-border-primary bg-gradient-to-br from-ui-bg-secondary/30 to-ui-bg-secondary/10 hover:border-ui-border-primary'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getModelColor(modelName)}`}>
            <span>{getModelIcon(modelName)}</span>
            <span className="font-mono">{modelName.replace(/^[^/]+\//, '')}</span>
          </div>
          {isLatest && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-ui-accent/10 text-ui-accent text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-ui-accent animate-pulse" />
              <span>Последнее</span>
            </div>
          )}
        </div>
        <div className="text-xs text-ui-text-muted font-mono">
          {formatTime(timestamp)}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-ui-accent/20 flex items-center justify-center">
            <span className="text-xs">👤</span>
          </div>
          <span className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">Запрос</span>
        </div>
        <div className="pl-8 text-sm text-ui-text-primary bg-ui-bg-secondary/30 rounded-lg p-3 border border-ui-border-primary/50">
          {userText}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getModelColor(modelName).split(' ')[1]}`}>
            <span className="text-xs">{getModelIcon(modelName)}</span>
          </div>
          <span className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">Ответ</span>
        </div>
        <div className="pl-8 text-sm text-ui-text-primary leading-relaxed">
          {aiResponse}
        </div>
      </div>

      {isLatest && (
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-ui-accent/40 to-transparent" />
      )}

      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-ui-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export { AiMessage };
