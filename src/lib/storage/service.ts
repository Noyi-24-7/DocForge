import { createServiceClient } from '../supabase/server'
import { StorageError } from '../errors'

const BUCKETS = {
  documents: {
    name: 'documents',
    public: false,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['application/pdf', 'text/markdown', 'text/plain'],
  },
  assets: {
    name: 'assets',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  },
  repositories: {
    name: 'repositories',
    public: false,
    fileSizeLimit: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: ['application/zip', 'application/x-tar'],
  },
  temp: {
    name: 'temp',
    public: false,
    fileSizeLimit: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: ['*/*'],
  },
}

export interface UploadOptions {
  bucket: string
  path: string
  file: File | Buffer
  metadata?: Record<string, string>
  upsert?: boolean
  cacheControl?: string
}

export interface UploadResult {
  path: string
  url: string
  size: number
  type: string
}

export class SupabaseStorageService {
  private async getSupabase() {
    return await createServiceClient()
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    const { bucket, path, file, metadata, upsert = false, cacheControl } = options
    const supabase = await this.getSupabase()

    this.validateFile(file, bucket)

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert,
        cacheControl: cacheControl || '3600',
        contentType: this.getContentType(file),
        metadata,
      })

    if (error) {
      throw new StorageError(`Upload failed: ${error.message}`, 'UPLOAD_FAILED')
    }

    const url = this.getFileUrl(bucket, data.path, supabase)

    return {
      path: data.path,
      url,
      size: this.getFileSize(file),
      type: this.getContentType(file),
    }
  }

  async download(bucket: string, path: string): Promise<Blob> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase.storage.from(bucket).download(path)

    if (error) {
      throw new StorageError(`Download failed: ${error.message}`, 'DOWNLOAD_FAILED')
    }

    return data
  }

  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw new StorageError(
        `Failed to create signed URL: ${error.message}`,
        'SIGNED_URL_FAILED'
      )
    }

    return data.signedUrl
  }

  async delete(bucket: string, paths: string[]): Promise<void> {
    const supabase = await this.getSupabase()
    const { error } = await supabase.storage.from(bucket).remove(paths)

    if (error) {
      throw new StorageError(`Delete failed: ${error.message}`, 'DELETE_FAILED')
    }
  }

  private validateFile(file: File | Buffer, bucket: string): void {
    const config = BUCKETS[bucket as keyof typeof BUCKETS]
    if (!config) {
      throw new StorageError('Invalid bucket', 'INVALID_BUCKET')
    }

    const size = this.getFileSize(file)
    if (size > config.fileSizeLimit) {
      throw new StorageError(
        `File too large. Max size: ${config.fileSizeLimit} bytes`,
        'FILE_TOO_LARGE'
      )
    }
  }

  private getFileSize(file: File | Buffer): number {
    if (file instanceof Buffer) {
      return file.length
    }
    // File object from browser
    return (file as any).size || 0
  }

  private getContentType(file: File | Buffer): string {
    if (file instanceof Buffer) {
      return 'application/octet-stream'
    }
    // File object from browser
    return (file as any).type || 'application/octet-stream'
  }

  private getFileUrl(bucket: string, path: string, supabase: any): string {
    const config = BUCKETS[bucket as keyof typeof BUCKETS]
    
    if (config?.public) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    }

    return path
  }
}

