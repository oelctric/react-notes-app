import { useEffect } from "react";
import "./RegisterModal.css";
import ModalWithForm from "../ModalWithForm/ModalWithForm";
import { useForm } from "../../hooks/useForm";
import { REGISTER_INITIAL_VALUES } from "../../utils/constants";


function RegisterModal({ isOpen, onClose, onRegister, onSwitch, isSubmitting, serverError, notice }) {
  const { values, errors, isValid, handleChange, resetForm } = useForm(REGISTER_INITIAL_VALUES);

  useEffect(() => {
    if (isOpen) resetForm(REGISTER_INITIAL_VALUES);
  }, [isOpen, resetForm]);

  const passwordsMatch = values.password === values.confirmPassword;
  const confirmError =
    errors.confirmPassword ||
    (values.confirmPassword && !passwordsMatch ? "Passwords do not match" : "");

  function handleSubmit(evt) {
    evt.preventDefault();
    if (!passwordsMatch) return;
    onRegister({
      name: values.name.trim(),
      email: values.email,
      password: values.password,
    });
  }

  const fields = [
    { name: "name", type: "text", placeholder: "Name", autoComplete: "name", minLength: 2, maxLength: 30 },
    { name: "email", type: "email", placeholder: "Email", autoComplete: "email" },
    { name: "password", type: "password", placeholder: "Password", autoComplete: "new-password", minLength: 8 },
    { name: "confirmPassword", type: "password", placeholder: "Confirm password", autoComplete: "new-password", minLength: 8 },
  ];

  return (
    <ModalWithForm
      title="Create account"
      name="register"
      buttonText="Create account"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isValid={isValid && passwordsMatch}
      isSubmitting={isSubmitting}
      serverError={serverError}
      notice={notice}
      footer={
        <p>
          Already have an account?{" "}
          <button className="modal__switch" type="button" onClick={onSwitch}>
            Log in
          </button>
        </p>
      }
    >
      {fields.map((field) => {
        const error = field.name === "confirmPassword" ? confirmError : errors[field.name];
        return (
          <label className="modal__field" key={field.name}>
            <input
              {...field}
              className={`modal__input${error ? " modal__input_invalid" : ""}`}
              required
              value={values[field.name]}
              onChange={handleChange}
            />
            <span className="modal__error">{error}</span>
          </label>
        );
      })}
    </ModalWithForm>
  );
}

export default RegisterModal;
