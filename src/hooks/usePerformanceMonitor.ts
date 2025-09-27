import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

/**
 * Hook para monitoramento de performance da aplicação
 * Útil para identificar componentes lentos e otimizar a experiência do usuário
 */

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
  memoryUsage?: number;
  props?: any;
}

interface PerformanceStats {
  averageRenderTime: number;
  slowestRender: number;
  fastestRender: number;
  totalRenders: number;
  memoryTrend: number[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;
  private slowRenderThreshold = 16; // 16ms para 60fps

  addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Manter apenas os últimos N métricas
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log de renders lentos
    if (metric.renderTime > this.slowRenderThreshold) {
      logger.warn(`Render lento detectado: ${metric.componentName}`, {
        renderTime: metric.renderTime,
        threshold: this.slowRenderThreshold
      }, 'PERFORMANCE');
    }
  }

  getStats(componentName?: string): PerformanceStats {
    const filteredMetrics = componentName 
      ? this.metrics.filter(m => m.componentName === componentName)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        averageRenderTime: 0,
        slowestRender: 0,
        fastestRender: 0,
        totalRenders: 0,
        memoryTrend: []
      };
    }

    const renderTimes = filteredMetrics.map(m => m.renderTime);
    const memoryUsages = filteredMetrics
      .map(m => m.memoryUsage)
      .filter(Boolean) as number[];

    return {
      averageRenderTime: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
      slowestRender: Math.max(...renderTimes),
      fastestRender: Math.min(...renderTimes),
      totalRenders: filteredMetrics.length,
      memoryTrend: memoryUsages.slice(-10) // Últimas 10 medições
    };
  }

  getSlowComponents(threshold = this.slowRenderThreshold): string[] {
    const componentStats = new Map<string, number[]>();
    
    this.metrics.forEach(metric => {
      if (!componentStats.has(metric.componentName)) {
        componentStats.set(metric.componentName, []);
      }
      componentStats.get(metric.componentName)!.push(metric.renderTime);
    });

    const slowComponents: string[] = [];
    
    componentStats.forEach((times, componentName) => {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      if (avgTime > threshold) {
        slowComponents.push(componentName);
      }
    });

    return slowComponents;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// Instância singleton
const performanceMonitor = new PerformanceMonitor();

/**
 * Hook para monitorar performance de componentes
 */
export const usePerformanceMonitor = (componentName: string, props?: any) => {
  const renderStartTime = useRef<number>(0);
  const [stats, setStats] = useState<PerformanceStats | null>(null);

  // Marcar início do render
  renderStartTime.current = performance.now();

  useEffect(() => {
    // Calcular tempo de render
    const renderTime = performance.now() - renderStartTime.current;
    
    // Obter uso de memória (se disponível)
    const memoryUsage = (performance as any).memory?.usedJSHeapSize;

    const metric: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
      memoryUsage,
      props: import.meta.env.DEV ? props : undefined
    };

    performanceMonitor.addMetric(metric);
  });

  const getComponentStats = useCallback(() => {
    return performanceMonitor.getStats(componentName);
  }, [componentName]);

  const updateStats = useCallback(() => {
    setStats(getComponentStats());
  }, [getComponentStats]);

  return {
    stats,
    updateStats,
    getComponentStats
  };
};

/**
 * Hook para monitorar performance de operações assíncronas
 */
export const useAsyncPerformanceMonitor = () => {
  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      logger.debug(`Operação assíncrona concluída: ${operationName}`, {
        duration: `${duration.toFixed(2)}ms`
      }, 'PERFORMANCE');
      
      if (duration > 1000) { // Operações > 1s
        logger.warn(`Operação lenta detectada: ${operationName}`, {
          duration: `${duration.toFixed(2)}ms`
        }, 'PERFORMANCE');
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Erro em operação assíncrona: ${operationName}`, {
        duration: `${duration.toFixed(2)}ms`,
        error
      }, 'PERFORMANCE');
      throw error;
    }
  }, []);

  return { measureAsync };
};

/**
 * Hook para monitorar Web Vitals
 */
export const useWebVitals = () => {
  const [vitals, setVitals] = useState<{
    CLS?: number;
    FID?: number;
    FCP?: number;
    LCP?: number;
    TTFB?: number;
  }>({});

  useEffect(() => {
    // Monitorar FCP (First Contentful Paint)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          setVitals(prev => ({ ...prev, FCP: entry.startTime }));
          logger.info('First Contentful Paint', {
            value: `${entry.startTime.toFixed(2)}ms`
          }, 'WEB_VITALS');
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      // Navegador não suporta
    }

    // Monitorar LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setVitals(prev => ({ ...prev, LCP: lastEntry.startTime }));
      logger.info('Largest Contentful Paint', {
        value: `${lastEntry.startTime.toFixed(2)}ms`
      }, 'WEB_VITALS');
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      // Navegador não suporta
    }

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
    };
  }, []);

  return vitals;
};

/**
 * Utilitários de performance
 */
export const performanceUtils = {
  // Debounce para otimizar eventos frequentes
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle para limitar execuções
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Lazy loading de componentes
  createLazyComponent: <T extends React.ComponentType<any>>(importFunc: () => Promise<{ default: T }>) => {
    return React.lazy(() => {
      const startTime = performance.now();
      return importFunc().then(module => {
        const loadTime = performance.now() - startTime;
        logger.debug('Componente carregado', {
          loadTime: `${loadTime.toFixed(2)}ms`
        }, 'PERFORMANCE');
        return module;
      });
    });
  },

  // Medir tempo de execução de funções
  measureFunction: <T extends (...args: any[]) => any>(
    func: T,
    functionName: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const startTime = performance.now();
      const result = func(...args);
      const duration = performance.now() - startTime;
      
      logger.debug(`Função executada: ${functionName}`, {
        duration: `${duration.toFixed(2)}ms`
      }, 'PERFORMANCE');
      
      return result;
    }) as T;
  }
};

// Exportar monitor para uso direto
export { performanceMonitor };

// Adicionar React import
import React from 'react'