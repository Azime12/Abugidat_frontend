import { useState, useCallback, useRef } from "react";
import ConfirmDialog from "../components/shared/ConfirmDialog";

/**
 * Promise-based confirm dialog hook.
 * Drop-in replacement for `window.confirm()`.
 *
 * Usage:
 * ```jsx
 * const [confirmDialog, confirm] = useConfirm();
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: "Delete?",
 *     message: "Are you sure?",
 *     confirmLabel: "Delete",
 *     variant: "danger",
 *   });
 *   if (ok) { doDelete(); }
 * };
 *
 * return (
 *   <>
 *     {confirmDialog}
 *     /* rest of your JSX *\/
 *   </>
 * );
 * ```
 */
export default function useConfirm() {
  const [state, setState] = useState({
    open: false,
    config: {},
  });
  const resolveRef = useRef(null);

  const confirm = useCallback((config = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        open: true,
        config: {
          title: config.title || "Confirm",
          message: config.message || "Are you sure?",
          confirmLabel: config.confirmLabel || "Confirm",
          cancelLabel: config.cancelLabel || "Cancel",
          variant: config.variant || "info",
        },
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
  }, []);

  const dialog = state.open ? (
    <ConfirmDialog
      open={state.open}
      {...state.config}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return [dialog, confirm];
}
