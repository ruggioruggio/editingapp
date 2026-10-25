// File multimediali dei simulatori: una libreria di esempio (video "finti" ma
// animati, disegnati al volo) più i file veri che l'utente importa dal suo
// computer, salvati in IndexedDB così restano anche dopo aver ricaricato.

export type Subject = "person" | "city" | "cup" | "sea" | "sunset" | "greenscreen" | "title" | "logo" | "music" | "whoosh" | "applause";

export type MediaKind =
  | "video" // filmato con o senza audio
  | "audio"
  | "image"
  | "black" // Video nero
  | "adjustment" // Livello di regolazione
  | "matte" // Mascherino colore
  | "bars" // Barre e tono
  | "countdown" // Contatore universale
  | "graphic"; // titolo / grafica

export interface Media {
  id: string;
  name: string;
  kind: MediaKind;
  /** secondi; le immagini e gli elementi sintetici hanno una durata predefinita ma si possono allungare */
  duration: number;
  width: number;
  height: number;
  fps: number;
  hasVideo: boolean;
  hasAudio: boolean;
  /** clip sintetica disegnata dal simulatore */
  subject?: Subject;
  hue?: number;
  text?: string;
  color?: string;
  /** file importato dal computer */
  file?: { mime: string; size: number };
  /** elemento senza limite di durata (immagini, mascherini…) */
  still?: boolean;
}

export const SAMPLE_LIBRARY: (Media & { folder: string })[] = [
  { id: "s-intervista", folder: "Video", name: "A001_Intervista.mp4", kind: "video", duration: 14, width: 1920, height: 1080, fps: 25, hasVideo: true, hasAudio: true, subject: "person", hue: 215 },
  { id: "s-tramonto", folder: "Video", name: "Ocean_Sunset.mp4", kind: "video", duration: 12, width: 1920, height: 1080, fps: 25, hasVideo: true, hasAudio: true, subject: "sunset", hue: 280 },
  { id: "s-citta", folder: "Video", name: "B-roll_Citta.mp4", kind: "video", duration: 8, width: 1920, height: 1080, fps: 25, hasVideo: true, hasAudio: true, subject: "city", hue: 28 },
  { id: "s-caffe", folder: "Video", name: "B-roll_Caffe.mp4", kind: "video", duration: 6, width: 1920, height: 1080, fps: 25, hasVideo: true, hasAudio: false, subject: "cup", hue: 20 },
  { id: "s-drone", folder: "Video", name: "Drone_Mare.mp4", kind: "video", duration: 10, width: 1920, height: 1080, fps: 25, hasVideo: true, hasAudio: false, subject: "sea", hue: 195 },
  { id: "s-green", folder: "Video", name: "Greenscreen_Squeak.mp4", kind: "video", duration: 9, width: 1920, height: 1080, fps: 25, hasVideo: true, hasAudio: true, subject: "greenscreen", hue: 140 },
  { id: "s-musica", folder: "Audio", name: "Musica_Lofi.wav", kind: "audio", duration: 60, width: 0, height: 0, fps: 25, hasVideo: false, hasAudio: true, subject: "music", hue: 140 },
  { id: "s-whoosh", folder: "Audio", name: "Whoosh.wav", kind: "audio", duration: 2, width: 0, height: 0, fps: 25, hasVideo: false, hasAudio: true, subject: "whoosh", hue: 140 },
  { id: "s-applausi", folder: "Audio", name: "Applausi.wav", kind: "audio", duration: 6, width: 0, height: 0, fps: 25, hasVideo: false, hasAudio: true, subject: "applause", hue: 140 },
  { id: "s-logo", folder: "Grafica", name: "Logo_Squeak.png", kind: "image", duration: 5, width: 800, height: 800, fps: 25, hasVideo: true, hasAudio: false, subject: "logo", hue: 45, text: "SqueakEdit", still: true },
  { id: "s-titolo", folder: "Grafica", name: "Titolo_Intro.png", kind: "image", duration: 5, width: 1920, height: 1080, fps: 25, hasVideo: true, hasAudio: false, subject: "title", hue: 260, text: "Il mio video", still: true },
];

export const isStill = (m: Media) => !!m.still || m.kind === "black" || m.kind === "adjustment" || m.kind === "matte" || m.kind === "bars" || m.kind === "graphic";

// ---- file importati ----------------------------------------------------------

const urls = new Map<string, string>();
export const fileUrl = (id: string) => urls.get(id);

const DB = "squeakedit-studio";
function db(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore("files");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveBlob(id: string, blob: Blob) {
  const d = await db();
  if (!d) return;
  try {
    d.transaction("files", "readwrite").objectStore("files").put(blob, id);
  } catch {
    /* spazio esaurito o accesso negato: il file resta solo in questa sessione */
  }
}

/** Ricollega i file importati in una sessione precedente (altrimenti risultano "Media offline"). */
export async function restoreFiles(ids: string[]) {
  const d = await db();
  if (!d) return;
  await Promise.all(
    ids
      .filter((id) => !urls.has(id))
      .map(
        (id) =>
          new Promise<void>((res) => {
            try {
              const r = d.transaction("files").objectStore("files").get(id);
              r.onsuccess = () => {
                if (r.result instanceof Blob) urls.set(id, URL.createObjectURL(r.result));
                res();
              };
              r.onerror = () => res();
            } catch {
              res();
            }
          }),
      ),
  );
}

/** Legge un file scelto dall'utente e ne ricava durata e dimensioni. */
export async function importFile(file: File, id: string): Promise<Media | null> {
  const url = URL.createObjectURL(file);
  const base = { id, name: file.name, fps: 30, file: { mime: file.type, size: file.size } };
  try {
    if (file.type.startsWith("image/")) {
      const img = new Image();
      img.src = url;
      await img.decode();
      urls.set(id, url);
      void saveBlob(id, file);
      return { ...base, kind: "image", duration: 5, width: img.naturalWidth, height: img.naturalHeight, hasVideo: true, hasAudio: false, still: true };
    }
    if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
      const el = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
      el.preload = "metadata";
      el.src = url;
      await new Promise<void>((res, rej) => {
        el.onloadedmetadata = () => res();
        el.onerror = () => rej(new Error("formato non supportato"));
      });
      const v = el as HTMLVideoElement;
      const isVideo = file.type.startsWith("video/") && v.videoWidth > 0;
      urls.set(id, url);
      void saveBlob(id, file);
      return {
        ...base,
        kind: isVideo ? "video" : "audio",
        duration: Number.isFinite(el.duration) ? el.duration : 10,
        width: isVideo ? v.videoWidth : 0,
        height: isVideo ? v.videoHeight : 0,
        hasVideo: isVideo,
        hasAudio: true,
      };
    }
  } catch {
    URL.revokeObjectURL(url);
  }
  return null;
}

export const fmtSize = (b: number) => (b > 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);
