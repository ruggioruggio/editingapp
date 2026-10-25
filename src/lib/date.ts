const pad = (n: number) => String(n).padStart(2, "0");

const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Giorno locale dell'utente (YYYY-MM-DD): il limite giornaliero si azzera a mezzanotte locale. */
export const todayKey = () => dayKey(new Date());

export const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
};
