
const base = (process.env.NEXT_PUBLIC_DOWNLOAD_BASE || "https://github.com/ruggioruggio/editingapp/releases/latest/download").replace(/\/$/, "");

export const DOWNLOADS = {
  windowsSetup: `${base}/SqueakEdit-Windows-setup.exe`,
  macArm: `${base}/SqueakEdit-Mac-arm64.dmg`,
  macIntel: `${base}/SqueakEdit-Mac-x64.dmg`,
  linux: `${base}/SqueakEdit-Linux.AppImage`,
  android: `${base}/SqueakEdit-Android.apk`,
};
