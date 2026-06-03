const DUPLICATE_EMAIL_MESSAGE =
  'Este e-mail já está cadastrado. Tente entrar com sua senha ou use "Já tenho conta".';

const API_ERROR_MESSAGES: Record<string, string> = {
  'Email already registered': DUPLICATE_EMAIL_MESSAGE,
  'Invalid credentials': 'E-mail ou senha inválidos.',
  'You already cloned this subject': 'Você já clonou esta disciplina.',
  'A pending request already exists': 'Já existe um pedido de amizade pendente com este usuário.',
};

function lookupKnownMessage(message: string): string | undefined {
  const trimmed = message.trim();
  const direct = API_ERROR_MESSAGES[trimmed];
  if (direct) {
    return direct;
  }
  const lower = trimmed.toLowerCase();
  if (lower.includes('email already registered')) {
    return DUPLICATE_EMAIL_MESSAGE;
  }
  return Object.entries(API_ERROR_MESSAGES).find(([key]) => key.toLowerCase() === lower)?.[1];
}

function isRegisterConflict(status: number, path?: string): boolean {
  return status === 409 && (path?.includes('/auth/register') ?? false);
}

export function mapApiErrorMessage(status: number, message: string, path?: string): string {
  const mapped = lookupKnownMessage(message);
  if (mapped) {
    return mapped;
  }
  if (status === 401 || message === 'Unauthorized') {
    return 'E-mail ou senha inválidos.';
  }
  if (status === 403) {
    return 'Sessão expirada. Faça login novamente.';
  }
  if (isRegisterConflict(status, path)) {
    return DUPLICATE_EMAIL_MESSAGE;
  }
  if (status === 409) {
    return 'Não foi possível concluir: essa ação entra em conflito com um registro existente.';
  }
  return message;
}
