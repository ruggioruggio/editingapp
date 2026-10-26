// Dove si scaricano le app. Di base i file dell'ultima Release su GitHub
// (li crea il workflow .github/workflows/apps.yml con un tag v*).
// Per ospitarli altrove basta impostare NEXT_PUBLIC_DOWNLOAD_BASE
// (es. https://download.squeakedit.app) con dentro gli stessi nomi di file.

const base = (process.env.NEXT_PUBLIC_DOWNLOAD_BASE || "https://github.com/ruggioruggio/editingapp/releases/latest/download").replace(/\/$/, "");

export const DOWNLOADS = {
  windowsSetup: `${base}/SqueakEdit-Windows-setup.exe`,
  windowsPortable: `${base}/SqueakEdit-Windows-portable.exe`,
  macArm: `${base}/SqueakEdit-Mac-arm64.dmg`,
  macIntel: `${base}/SqueakEdit-Mac-x64.dmg`,
  linux: `${base}/SqueakEdit-Linux.AppImage`,
  android: `${base}/SqueakEdit-Android.apk`,
};
