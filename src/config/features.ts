/**
 * Interruttori delle funzioni a pagamento.
 *
 * Per ora SqueakEdit è gratuito: il piano Pro e Squeak AI sono "in arrivo".
 * Quando ci sarà un venditore in regola (editore con P.IVA) basta mettere
 * `true` qui: tornano pagamenti, pagina Prezzi, condizioni di acquisto e AI.
 */
export const features = {
  /** Acquisti del piano Pro e relative condizioni di vendita */
  payments: false,
  /** Squeak AI (chat, analisi dei progetti, editor di prova) */
  squeakAi: false,
} as const;

export const COMING_SOON = "In arrivo";
