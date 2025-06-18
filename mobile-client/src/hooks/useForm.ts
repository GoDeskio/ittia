import {useState, useCallback} from 'react';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
}

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) => {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isDirty: false,
  });

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setState(prev => {
        const newValues = {...prev.values, [field]: value};
        const newErrors = validate ? validate(newValues) : {};
        const hasErrors = Object.keys(newErrors).length > 0;

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          isValid: !hasErrors,
          isDirty: true,
        };
      });
    },
    [validate],
  );

  const setFieldTouched = useCallback((field: keyof T) => {
    setState(prev => ({
      ...prev,
      touched: {...prev.touched, [field]: true},
    }));
  }, []);

  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setFieldValue(field, value);
    },
    [setFieldValue],
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setFieldTouched(field);
    },
    [setFieldTouched],
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      const errors = validate ? validate(state.values) : {};
      const hasErrors = Object.keys(errors).length > 0;

      setState(prev => ({
        ...prev,
        errors,
        isValid: !hasErrors,
        touched: Object.keys(prev.values).reduce(
          (acc, key) => ({...acc, [key]: true}),
          {},
        ),
      }));

      if (!hasErrors) {
        await onSubmit(state.values);
      }
    },
    [state.values, validate, onSubmit],
  );

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false,
    });
  }, [initialValues]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isDirty: state.isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldTouched,
  };
}; 