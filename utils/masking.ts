/**
 * Masks a name, keeping only the first and last characters visible.
 * Example: "Amery" -> "A***y"
 */
export const maskName = (name: string): string => {
  if (!name) return '你的名字';
  if (name.length <= 2) return name;
  return `${name[0]}***${name[name.length - 1]}`;
};

/**
 * Masks an email address.
 * Example: "example@gmail.com" -> "ex****@gmail.com"
 */
export const maskEmail = (email: string): string => {
  if (!email) return '紧急联系人邮箱';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  
  const [local, domain] = parts;
  if (local.length <= 2) return `${local}****@${domain}`;
  
  return `${local.substring(0, 2)}****@${domain}`;
};