import { useEffect } from "react";
import "./ModalWithForm.css";

function ModalWithForm({
  title,
  name,
  isOpen,
  onClose,
  onSubmit,
  buttonText,
  isValid = true,
  isSubmitting = false,
  serverError = "",
  notice = "",
  footer,
  children,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`modal modal_type_${name}`} onClick={onClose}>
      <div className="modal__container">
        <span className="modal__handle" aria-hidden="true" />
        <div
          className="modal__content"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${name}-title`}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal__close" type="button" aria-label="Close" onClick={onClose} />
          <h3 className="modal__title" id={`${name}-title`}>
            {title}
          </h3>
          {notice && <p className="modal__notice">{notice}</p>}
          <form className="modal__form" name={name} onSubmit={onSubmit} noValidate>
            {children}
            {serverError && <p className="modal__server-error">{serverError}</p>}
            <button
              className="modal__submit"
              type="submit"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Please wait..." : buttonText}
            </button>
          </form>
          {footer && <div className="modal__footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export default ModalWithForm;
