export function maxCompletionTokensForProvider(providerId: string, requestedTokens: number): number;
export function nextGroqRetryTokenBudget(currentTokens: number): number | null;
export function isTokenLimitError(message: string): boolean;
