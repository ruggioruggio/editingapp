import { Preferences } from "@capacitor/preferences";

/**
 * Storage adapter asincrono per Supabase che usa @capacitor/preferences
 * (SharedPreferences su Android). Supabase accetta getItem che ritorna
 * una Promise — niente cache in memoria, niente idratazione al boot.
 */
export const capacitorStorage = {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  },
  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key });
  },
};
