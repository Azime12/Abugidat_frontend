import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdWarning, MdDelete, MdInfo } from "react-icons/md";

const variantConfig = {
  danger: {
    icon: MdDelete,
    iconColor: "text-red-500",
    iconBg: "bg-red-100",
    confirmClass:
      "bg-red-500 hover:bg-red-600 focus:ring-red-200",
  },
  warning: {
    icon: MdWarning,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-100",
    confirmClass:
      "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-200",
  },
  info: {
    icon: MdInfo,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100",
    confirmClass:
      "bg-primary hover:bg-primary-dark focus:ring-primary/30",
  },
};

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "info",
  onConfirm,
  onCancel,
}) {
  const config = variantConfig[variant] || variantConfig.info;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden relative z-10"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <div className={`flex items-center gap-3 ${config.iconBg} px-3 py-2 rounded-xl`}>
                <Icon size={22} className={config.iconColor} />
                <h3 className="text-base font-semibold text-text-main">{title}</h3>
              </div>
              <button
                onClick={onCancel}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MdClose size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <p className="text-sm text-text-sub leading-relaxed">{message}</p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-5 pb-5 pt-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-text-sub bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`px-5 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${config.confirmClass}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
