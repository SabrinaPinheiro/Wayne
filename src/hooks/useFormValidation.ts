import { useState, useCallback } from 'react';
import { ValidationResult, FormError } from '@/types';

// Tipos de validação
type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: any) => string | null;
};

type ValidationSchema = Record<string, ValidationRule>;

// Mensagens de erro padrão
const defaultMessages = {
  required: 'Este campo é obrigatório',
  minLength: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  maxLength: (max: number) => `Deve ter no máximo ${max} caracteres`,
  email: 'Digite um email válido',
  pattern: 'Formato inválido',
};

// Validadores específicos
export const validators = {
  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Digite um email válido';
  },
  
  password: (value: string): string | null => {
    if (value.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número';
    }
    return null;
  },
  
  phone: (value: string): string | null => {
    const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
    return phoneRegex.test(value) ? null : 'Digite um telefone válido';
  },
  
  cpf: (value: string): string | null => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length !== 11) {
      return 'CPF deve ter 11 dígitos';
    }
    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(cpf)) {
      return 'CPF inválido';
    }
    return null;
  },
  
  url: (value: string): string | null => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'Digite uma URL válida';
    }
  },
  
  positiveNumber: (value: number): string | null => {
    return value > 0 ? null : 'Deve ser um número positivo';
  },
  
  dateRange: (startDate: Date, endDate: Date): string | null => {
    return startDate <= endDate ? null : 'Data inicial deve ser anterior à data final';
  },
};

// Hook principal de validação
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar um campo específico
  const validateField = useCallback(
    (fieldName: string, value: any): string | null => {
      const rules = validationSchema[fieldName];
      if (!rules) return null;

      // Required
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return defaultMessages.required;
      }

      // Se o campo está vazio e não é obrigatório, não validar outras regras
      if (!value || (typeof value === 'string' && !value.trim())) {
        return null;
      }

      // MinLength
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return defaultMessages.minLength(rules.minLength);
      }

      // MaxLength
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        return defaultMessages.maxLength(rules.maxLength);
      }

      // Email
      if (rules.email && typeof value === 'string') {
        return validators.email(value);
      }

      // Pattern
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return defaultMessages.pattern;
      }

      // Custom validation
      if (rules.custom) {
        return rules.custom(value);
      }

      return null;
    },
    [validationSchema]
  );

  // Validar todos os campos
  const validateAll = useCallback((): ValidationResult => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return {
      isValid,
      errors: Object.entries(newErrors).map(([field, message]) => ({
        field,
        message,
      })),
    };
  }, [values, validateField, validationSchema]);

  // Atualizar valor de um campo
  const setValue = useCallback((fieldName: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    
    // Validar em tempo real se o campo já foi tocado
    if (touched[fieldName as string]) {
      const error = validateField(fieldName as string, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error || undefined,
      }));
    }
  }, [touched, validateField]);

  // Marcar campo como tocado
  const setFieldTouched = useCallback((fieldName: keyof T, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [fieldName]: isTouched }));
    
    if (isTouched) {
      const error = validateField(fieldName as string, values[fieldName]);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error || undefined,
      }));
    }
  }, [values, validateField]);

  // Resetar formulário
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Handler para submit
  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void> | void) => {
      setIsSubmitting(true);
      
      const validation = validateAll();
      if (!validation.isValid) {
        setIsSubmitting(false);
        return false;
      }

      try {
        await onSubmit(values);
        return true;
      } catch (error) {
        console.error('Erro no submit:', error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateAll]
  );

  // Verificar se o formulário é válido
  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    hasErrors,
    setValue,
    setFieldTouched,
    validateField,
    validateAll,
    handleSubmit,
    reset,
  };
};

// Hook simplificado para validação de campo único
export const useFieldValidation = (initialValue: any, rules: ValidationRule) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback((val: any) => {
    // Required
    if (rules.required && (!val || (typeof val === 'string' && !val.trim()))) {
      return defaultMessages.required;
    }

    // Se vazio e não obrigatório, não validar outras regras
    if (!val || (typeof val === 'string' && !val.trim())) {
      return null;
    }

    // Outras validações...
    if (rules.minLength && typeof val === 'string' && val.length < rules.minLength) {
      return defaultMessages.minLength(rules.minLength);
    }

    if (rules.maxLength && typeof val === 'string' && val.length > rules.maxLength) {
      return defaultMessages.maxLength(rules.maxLength);
    }

    if (rules.email && typeof val === 'string') {
      return validators.email(val);
    }

    if (rules.pattern && typeof val === 'string' && !rules.pattern.test(val)) {
      return defaultMessages.pattern;
    }

    if (rules.custom) {
      return rules.custom(val);
    }

    return null;
  }, [rules]);

  const handleChange = useCallback((newValue: any) => {
    setValue(newValue);
    if (touched) {
      setError(validate(newValue));
    }
  }, [touched, validate]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    setError(validate(value));
  }, [value, validate]);

  return {
    value,
    error,
    touched,
    isValid: !error,
    setValue: handleChange,
    onBlur: handleBlur,
    validate: () => validate(value),
  };
};