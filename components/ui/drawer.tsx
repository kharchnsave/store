"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons";

/**
 * Side drawer built on the native modal <dialog>: the browser handles the
 * focus trap, Escape key and inert background. Focus returns to whatever
 * opened the drawer when it closes.
 */
export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  titleId,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title: React.ReactNode;
  titleId: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Close if the component unmounts while open (e.g. on a hidden route).
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => dialog?.close();
  }, []);

  function handleClose() {
    onClose();
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target?.isConnected) target.focus();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`drawer ${side === "right" ? "drawer-right" : ""}`}
      onClose={handleClose}
      onClick={(event) => {
        // Clicks on the backdrop land on the <dialog> element itself.
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="text-base font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="-mr-1 rounded-md p-2 text-ink hover:bg-cream"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer ? (
          <div className="border-t border-line px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </dialog>
  );
}
