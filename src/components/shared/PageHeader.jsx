import { motion } from "framer-motion";

export default function PageHeader({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        {subtitle && (
          <p className="text-text-sub text-sm mt-1">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </motion.div>
  );
}
