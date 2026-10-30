import { useEffect } from "react";
import "./LoginModal.css";
import ModalWithForm from "../ModalWithForm/ModalWithForm";
import { useForm } from "../../hooks/useForm";
import { LOGIN_INITIAL_VALUES } from "../../utils/constants";


function LoginModal({ isOpen, onClose, onLogin, onSwitch, isSubmitting, serverError, notice }) {
  const { values, errors, isValid, handleChange, resetForm } = useForm(LOGIN_INITIAL_VALUES);

  useEffect(() => {
    if (isOpen) resetForm(LOGIN_INITIAL_VALUES);
  }, [isOpen, resetForm]);

  function handleSubmit(evt) {
    evt.preventDefault();
    onLogin(values);
  }

  return (
    <ModalWithForm
      title="Log in"
      name="login"
      buttonText="Login"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isValid={isValid}
      isSubmitting={isSubmitting}
      serverError={serverError}
      notice={notice}
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <button className="modal__switch" type="button" onClick={onSwitch}>
            Sign up
          </button>
        </p>
      }
    >
      <label className="modal__field">
        <input
          className={`modal__input${errors.email ? " modal__input_invalid" : ""}`}
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          required
          value={values.email}
          onChange={handleChange}
        />
        <span className="modal__error">{errors.email}</span>
      </label>
      <label className="modal__field">
        <input
          className={`modal__input${errors.password ? " modal__input_invalid" : ""}`}
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          minLength={8}
          required
          value={values.password}
          onChange={handleChange}
        />
        <span className="modal__error">{errors.password}</span>
      </label>
    </ModalWithForm>
  );
}

export default LoginModal;
