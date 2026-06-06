/** Parte visível do e-mail na interface (antes do @). */
export function emailDisplayLabel(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return email.trim();
  return email.slice(0, at).trim();
}
