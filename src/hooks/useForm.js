import { useCallback, useState } from "react";

export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  function handleChange(evt) {
    const { name, value, validationMessage, form } = evt.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validationMessage }));
    setIsValid(form.checkValidity());
  }

  const resetForm = useCallback(
    (newValues = initialValues, newErrors = {}, newIsValid = false) => {
      setValues(newValues);
      setErrors(newErrors);
      setIsValid(newIsValid);
    },
    // initialValues is a fresh object each render; callers reset with explicit values
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { values, errors, isValid, handleChange, setErrors, setIsValid, resetForm };
}
