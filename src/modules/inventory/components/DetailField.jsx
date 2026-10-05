/** Par etiqueta/valor de los diálogos de detalle (solo lectura) */
export function DetailField({
  label,
  children,
  className = "col-12 md:col-6",
}) {
  return (
    <div className={className}>
      <span className="block text-sm text-color-secondary mb-1">{label}</span>
      <div className="font-medium">{children}</div>
    </div>
  );
}
