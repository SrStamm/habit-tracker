import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const modalId = useId();
  const closedByPopstate = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const state = { ...(window.history.state ?? {}), __modal: modalId };
    window.history.pushState(state, "");

    const handlePopState = () => {
      if (window.history.state?.__modal !== modalId) {
        closedByPopstate.current = true;
        onClose();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (!closedByPopstate.current && window.history.state?.__modal === modalId) {
        window.history.back();
      }
      closedByPopstate.current = false;
    };
  }, [isOpen, modalId, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl bg-white p-6 shadow-lg",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <h2 className="mb-4 text-xl font-bold text-text">{title}</h2>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
