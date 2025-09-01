import { makeAutoObservable } from 'mobx';

interface StreamingMessage {
  id: string;
  type: 'thinking' | 'content';
  content: string;
  timestamp: Date;
  isComplete: boolean;
}

interface StreamingSession {
  id: string;
  originalText: string;
  modelName: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  thinking: string;
  content: string;
  chunks: StreamingMessage[];
}

class StreamingAIStore {
  currentSession: StreamingSession | null = null;
  sessions: StreamingSession[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  startSession(originalText: string, modelName: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      originalText,
      modelName,
      startTime: new Date(),
      isActive: true,
      thinking: '',
      content: '',
      chunks: []
    };

    this.sessions.push(this.currentSession);
    return sessionId;
  }

  addChunk(type: 'thinking' | 'content', content: string, accumulated?: string) {
    if (!this.currentSession || !this.currentSession.isActive) return;

    const chunkId = `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const chunk: StreamingMessage = {
      id: chunkId,
      type,
      content,
      timestamp: new Date(),
      isComplete: false
    };

    this.currentSession.chunks.push(chunk);

    if (type === 'thinking' && accumulated) {
      this.currentSession.thinking = accumulated;
    } else if (type === 'content' && accumulated) {
      this.currentSession.content = accumulated;
    }
  }

  endSession() {
    if (!this.currentSession) return;

    this.currentSession.isActive = false;
    this.currentSession.endTime = new Date();
    
    this.currentSession.chunks.forEach(chunk => {
      chunk.isComplete = true;
    });

    this.currentSession = null;
  }

  clearSessions() {
    this.sessions = [];
    this.currentSession = null;
  }

  getCurrentStreamingContent(): { thinking: string; content: string } | null {
    if (!this.currentSession) return null;
    
    return {
      thinking: this.currentSession.thinking,
      content: this.currentSession.content
    };
  }

  isStreaming(): boolean {
    return this.currentSession?.isActive ?? false;
  }
}

export default new StreamingAIStore();
