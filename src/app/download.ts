// src/app/download.ts
export interface DownloadFile {
  filename: string;
  mime: string;
  data: Uint8Array;
}

export function saveFile(file: DownloadFile): void {
  const blob = new Blob([new Uint8Array(file.data)], { type: file.mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}
