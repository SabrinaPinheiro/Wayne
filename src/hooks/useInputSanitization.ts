import React, { useCallback } from 'react';

// Tipos de sanitização
type SanitizationType = 
  | 'html' 
  | 'sql' 
  | 'xss' 
  | 'filename' 
  | 'email' 
  | 'phone' 
  | 'alphanumeric' 
  | 'numeric' 
  | 'text';

// Configurações de sanitização
interface SanitizationConfig {
  maxLength?: number;
  allowedChars?: RegExp;
  removeChars?: RegExp;
  trim?: boolean;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
}

// Funções de sanitização
const sanitizers = {
  // Remove tags HTML e caracteres perigosos
  html: (input: string): string => {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
      .replace(/<[^>]*>/g, '') // Remove todas as tags HTML
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
  },

  // Previne SQL injection básico
  sql: (input: string): string => {
    return input
      .replace(/['"\\]/g, '') // Remove aspas e barras
      .replace(/;/g, '') // Remove ponto e vírgula
      .replace(/--/g, '') // Remove comentários SQL
      .replace(/\/\*/g, '') // Remove início de comentário
      .replace(/\*\//g, '') // Remove fim de comentário
      .replace(/\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|ALTER|CREATE)\b/gi, ''); // Remove palavras-chave SQL
  },

  // Previne XSS básico
  xss: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },

  // Sanitiza nomes de arquivo
  filename: (input: string): string => {
    return input
      .replace(/[<>:"/\\|?*]/g, '') // Remove caracteres inválidos para arquivos
      .replace(/\.\.+/g, '.') // Remove múltiplos pontos
      .replace(/^\.|\.$/, '') // Remove pontos no início e fim
      .substring(0, 255); // Limita o tamanho
  },

  // Sanitiza email
  email: (input: string): string => {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9@._-]/g, '') // Mantém apenas caracteres válidos
      .replace(/\.{2,}/g, '.') // Remove múltiplos pontos
      .replace(/_{2,}/g, '_') // Remove múltiplos underscores
      .replace(/-{2,}/g, '-'); // Remove múltiplos hífens
  },

  // Sanitiza telefone
  phone: (input: string): string => {
    return input
      .replace(/[^0-9+()-\s]/g, '') // Mantém apenas números e caracteres de formatação
      .replace(/\s+/g, ' ') // Remove espaços múltiplos
      .trim();
  },

  // Apenas caracteres alfanuméricos
  alphanumeric: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9]/g, '');
  },

  // Apenas números
  numeric: (input: string): string => {
    return input.replace(/[^0-9.-]/g, '');
  },

  // Texto geral (remove caracteres de controle)
  text: (input: string): string => {
    return input
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove caracteres de controle
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  },
};

// Hook principal de sanitização
export const useInputSanitization = () => {
  // Sanitiza um valor com base no tipo
  const sanitize = useCallback(
    (value: string, type: SanitizationType, config?: SanitizationConfig): string => {
      if (!value || typeof value !== 'string') {
        return '';
      }

      let sanitized = value;

      // Aplica sanitização específica do tipo
      if (sanitizers[type]) {
        sanitized = sanitizers[type](sanitized);
      }

      // Aplica configurações adicionais
      if (config) {
        // Trim
        if (config.trim !== false) {
          sanitized = sanitized.trim();
        }

        // Case transformation
        if (config.toLowerCase) {
          sanitized = sanitized.toLowerCase();
        } else if (config.toUpperCase) {
          sanitized = sanitized.toUpperCase();
        }

        // Remove caracteres específicos
        if (config.removeChars) {
          sanitized = sanitized.replace(config.removeChars, '');
        }

        // Mantém apenas caracteres permitidos
        if (config.allowedChars) {
          sanitized = sanitized.replace(new RegExp(`[^${config.allowedChars.source}]`, 'g'), '');
        }

        // Limita o comprimento
        if (config.maxLength && sanitized.length > config.maxLength) {
          sanitized = sanitized.substring(0, config.maxLength);
        }
      }

      return sanitized;
    },
    []
  );

  // Sanitiza múltiplos campos
  const sanitizeObject = useCallback(
    <T extends Record<string, any>>(
      obj: T,
      schema: Record<keyof T, { type: SanitizationType; config?: SanitizationConfig }>
    ): T => {
      const sanitized = { ...obj };

      Object.keys(schema).forEach((key) => {
        const field = key as keyof T;
        const { type, config } = schema[field];
        
        if (typeof sanitized[field] === 'string') {
          sanitized[field] = sanitize(sanitized[field] as string, type, config) as T[keyof T];
        }
      });

      return sanitized;
    },
    [sanitize]
  );

  // Valida se um valor é seguro após sanitização
  const isSafe = useCallback(
    (original: string, sanitized: string, threshold = 0.8): boolean => {
      if (!original || !sanitized) return true;
      
      const similarity = sanitized.length / original.length;
      return similarity >= threshold;
    },
    []
  );

  // Sanitizadores específicos pré-configurados
  const sanitizers_presets = {
    // Para campos de busca
    search: (value: string) => sanitize(value, 'xss', { maxLength: 100, trim: true }),
    
    // Para nomes de usuário
    username: (value: string) => sanitize(value, 'alphanumeric', { 
      maxLength: 50, 
      toLowerCase: true 
    }),
    
    // Para senhas (apenas remove caracteres perigosos)
    password: (value: string) => sanitize(value, 'text', { maxLength: 128 }),
    
    // Para URLs
    url: (value: string) => {
      const sanitized = sanitize(value, 'text', { trim: true, maxLength: 2048 });
      // Validação básica de URL
      try {
        new URL(sanitized);
        return sanitized;
      } catch {
        return '';
      }
    },
    
    // Para comentários e textos longos
    comment: (value: string) => sanitize(value, 'xss', { 
      maxLength: 1000, 
      trim: true 
    }),
    
    // Para códigos (permite mais caracteres)
    code: (value: string) => sanitize(value, 'text', { 
      maxLength: 10000,
      removeChars: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g // Remove apenas caracteres de controle perigosos
    }),
  };

  return {
    sanitize,
    sanitizeObject,
    isSafe,
    presets: sanitizers_presets,
  };
};

// Hook para sanitização em tempo real em inputs
export const useSanitizedInput = (
  initialValue: string = '',
  type: SanitizationType,
  config?: SanitizationConfig
) => {
  const { sanitize } = useInputSanitization();
  const [value, setValue] = React.useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = React.useState(
    sanitize(initialValue, type, config)
  );

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      const sanitized = sanitize(newValue, type, config);
      setSanitizedValue(sanitized);
    },
    [sanitize, type, config]
  );

  return {
    value,
    sanitizedValue,
    onChange: handleChange,
    isDirty: value !== sanitizedValue,
  };
};

// Utilitários para validação de segurança
export const securityUtils = {
  // Detecta possíveis tentativas de XSS
  detectXSS: (input: string): boolean => {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  },

  // Detecta possíveis tentativas de SQL injection
  detectSQLInjection: (input: string): boolean => {
    const sqlPatterns = [
      /('|(\-\-)|(;)|(\||\|)|(\*|\*))/gi,
      /\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\b/gi,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  },

  // Detecta caracteres suspeitos
  detectSuspiciousChars: (input: string): boolean => {
    const suspiciousChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
    return suspiciousChars.test(input);
  },

  // Gera hash simples para comparação
  simpleHash: (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  },
};

export default useInputSanitization;