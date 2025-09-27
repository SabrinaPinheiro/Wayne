/**
 * Utilitário de logging para controle centralizado de logs
 * Permite diferentes níveis de log e controle de ambiente
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  context?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') {
      return false;
    }
    return true;
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    return `[${timestamp}] ${level.toUpperCase()} ${contextStr} ${message}`;
  }

  debug(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('debug')) return;
    
    const entry: LogEntry = {
      level: 'debug',
      message,
      data,
      timestamp: new Date(),
      context
    };
    
    this.addToHistory(entry);
    
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context), data || '');
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('info')) return;
    
    const entry: LogEntry = {
      level: 'info',
      message,
      data,
      timestamp: new Date(),
      context
    };
    
    this.addToHistory(entry);
    console.info(this.formatMessage('info', message, context), data || '');
  }

  warn(message: string, data?: any, context?: string): void {
    if (!this.shouldLog('warn')) return;
    
    const entry: LogEntry = {
      level: 'warn',
      message,
      data,
      timestamp: new Date(),
      context
    };
    
    this.addToHistory(entry);
    console.warn(this.formatMessage('warn', message, context), data || '');
  }

  error(message: string, error?: any, context?: string): void {
    if (!this.shouldLog('error')) return;
    
    const entry: LogEntry = {
      level: 'error',
      message,
      data: error,
      timestamp: new Date(),
      context
    };
    
    this.addToHistory(entry);
    console.error(this.formatMessage('error', message, context), error || '');
    
    // Em produção, aqui poderíamos enviar para um serviço de monitoramento
    if (!this.isDevelopment) {
      this.reportError(message, error, context);
    }
  }

  private reportError(message: string, error?: any, context?: string): void {
    // Implementação futura para envio de erros para serviços como Sentry
    // Por enquanto, apenas armazena no histórico
  }

  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }

  // Métodos de conveniência para contextos específicos
  auth = {
    debug: (message: string, data?: any) => this.debug(message, data, 'AUTH'),
    info: (message: string, data?: any) => this.info(message, data, 'AUTH'),
    warn: (message: string, data?: any) => this.warn(message, data, 'AUTH'),
    error: (message: string, error?: any) => this.error(message, error, 'AUTH')
  };

  api = {
    debug: (message: string, data?: any) => this.debug(message, data, 'API'),
    info: (message: string, data?: any) => this.info(message, data, 'API'),
    warn: (message: string, data?: any) => this.warn(message, data, 'API'),
    error: (message: string, error?: any) => this.error(message, error, 'API')
  };

  ui = {
    debug: (message: string, data?: any) => this.debug(message, data, 'UI'),
    info: (message: string, data?: any) => this.info(message, data, 'UI'),
    warn: (message: string, data?: any) => this.warn(message, data, 'UI'),
    error: (message: string, error?: any) => this.error(message, error, 'UI')
  };

  data = {
    debug: (message: string, data?: any) => this.debug(message, data, 'DATA'),
    info: (message: string, data?: any) => this.info(message, data, 'DATA'),
    warn: (message: string, data?: any) => this.warn(message, data, 'DATA'),
    error: (message: string, error?: any) => this.error(message, error, 'DATA')
  };
}

// Instância singleton do logger
export const logger = new Logger();

// Exporta também a classe para casos especiais
export { Logger, type LogLevel, type LogEntry };

// Utilitário para capturar erros não tratados
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Erro não tratado capturado:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    }, 'GLOBAL');
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Promise rejeitada não tratada:', {
      reason: event.reason
    }, 'GLOBAL');
  });
}