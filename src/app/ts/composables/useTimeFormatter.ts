export const useTimeFormatter = () => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) {
      return 'только что';
    } else if (diffMins < 60) {
      return `${diffMins} мин назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`;
    } else {
      return `${diffDays} дн назад`;
    }
  };

  const formatTimeParts = () => {
    const now = new Date();
    return {
      hours: now.getHours().toString().padStart(2,'0'),
      minutes: now.getMinutes().toString().padStart(2,'0'),
      seconds: now.getSeconds().toString().padStart(2,'0'),
      date: now.toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long'}),
      timezone: now.getTimezoneOffset() / -60
    };
  };

  return {
    formatTime,
    formatRelativeTime,
    formatTimeParts
  };
};
