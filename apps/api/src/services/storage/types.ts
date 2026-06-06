export type StorageDriver = 'local' | 's3'

export interface StorageUploadResult {
  /** Value stored in text.picture */
  picture: string
  /** Resolved URL for immediate preview */
  url: string
  driver: StorageDriver
}

export interface StorageProvider {
  upload (file: Express.Multer.File): Promise<StorageUploadResult>
}
