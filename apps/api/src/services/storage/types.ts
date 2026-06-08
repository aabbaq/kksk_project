export type StorageDriver = 'local' | 'oss'

export interface StorageUploadResult {
  picture: string
  url: string
  driver: StorageDriver
}

export interface StorageProvider {
  upload (file: Express.Multer.File): Promise<StorageUploadResult>
}
