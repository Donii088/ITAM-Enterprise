/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_DEFAULT_PAGE_SIZE: string;
  readonly VITE_MAX_UPLOAD_SIZE_BYTES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
