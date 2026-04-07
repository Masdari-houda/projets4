export interface ImageResult {
  preview: string | ArrayBuffer | null;
  filename: string;
  birads: string;
  report: string;
  description: string;
  localization?: string;
}
