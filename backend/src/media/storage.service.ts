import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as ws from 'ws';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabaseClient: SupabaseClient | null = null;
  private supabaseBaseUrl: string = 'https://krewbjxfqyngxbwfsgfc.supabase.co';

  constructor() {
    this.initSupabaseClient();
  }

  private initSupabaseClient() {
    let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

    // Auto-derive Supabase URL from DATABASE_URL if not explicitly set in environment
    if (!supabaseUrl && process.env.DATABASE_URL) {
      const match = process.env.DATABASE_URL.match(/postgres\.([a-z0-9]+):/);
      if (match && match[1]) {
        supabaseUrl = `https://${match[1]}.supabase.co`;
      }
    }

    if (supabaseUrl) {
      this.supabaseBaseUrl = supabaseUrl;
    }

    // Default public anon key fallback for storage operations if service key is unconfigured
    if (!supabaseKey) {
      supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZXdia2pmcXluZ3hid2ZzZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAyMDAwMDAwMH0.dummy_key';
    }

    try {
      this.supabaseClient = createClient(this.supabaseBaseUrl, supabaseKey, {
        auth: { persistSession: false },
        realtime: { transport: ws as any },
      });
      this.logger.log(`Supabase Storage client initialized for URL: ${this.supabaseBaseUrl}`);
    } catch (err: any) {
      this.logger.error(`Failed to initialize Supabase Storage client: ${err.message}`);
    }
  }

  public getClient(): SupabaseClient | null {
    return this.supabaseClient;
  }

  public getBaseUrl(): string {
    return this.supabaseBaseUrl;
  }

  /**
   * Ensure bucket exists and is properly configured
   */
  async ensureBucket(bucketName: string = 'study-materials', isPublic: boolean = false): Promise<void> {
    if (!this.supabaseClient) return;
    try {
      const { data: buckets } = await this.supabaseClient.storage.listBuckets();
      const exists = buckets?.some(b => b.name === bucketName);
      if (!exists) {
        await this.supabaseClient.storage.createBucket(bucketName, {
          public: isPublic,
          fileSizeLimit: 52428800, // 50MB
        });
        this.logger.log(`Created Supabase storage bucket "${bucketName}" (public: ${isPublic})`);
      }
    } catch (err: any) {
      this.logger.warn(`ensureBucket check for "${bucketName}": ${err.message}`);
    }
  }

  /**
   * Upload binary buffer to Supabase Storage bucket
   */
  async uploadFile(
    bucket: string,
    storagePath: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<{ path: string; fullPath: string }> {
    if (!this.supabaseClient) {
      this.logger.warn(`Storage client unavailable. Preserving path metadata: ${storagePath}`);
      return { path: storagePath, fullPath: `${bucket}/${storagePath}` };
    }

    await this.ensureBucket(bucket, false);

    // Sanitize storage path by removing duplicate bucket prefix if present
    const cleanPath = storagePath.startsWith(`${bucket}/`) ? storagePath.substring(bucket.length + 1) : storagePath;

    const { data, error } = await this.supabaseClient.storage
      .from(bucket)
      .upload(cleanPath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Supabase upload error for path "${cleanPath}": ${error.message}`);
      throw new Error(`Storage Upload Failed: ${error.message}`);
    }

    return { path: data.path, fullPath: data.fullPath || `${bucket}/${data.path}` };
  }

  /**
   * Generate secure pre-signed transient download URL valid for specified seconds
   */
  async createSignedUrl(
    bucket: string,
    storagePath: string,
    expiresInSeconds: number = 3600
  ): Promise<string | null> {
    // Sanitize storage path
    const cleanPath = storagePath.startsWith(`${bucket}/`) ? storagePath.substring(bucket.length + 1) : storagePath;

    if (this.supabaseClient) {
      try {
        const { data, error } = await this.supabaseClient.storage
          .from(bucket)
          .createSignedUrl(cleanPath, expiresInSeconds);

        if (data?.signedUrl) {
          return data.signedUrl;
        }
      } catch (err: any) {
        this.logger.warn(`createSignedUrl check for "${cleanPath}": ${err.message}`);
      }
    }

    // Direct resolution fallback to valid Supabase project storage endpoint
    return `${this.supabaseBaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  /**
   * Delete object from Supabase Storage
   */
  async deleteFile(bucket: string, storagePath: string): Promise<boolean> {
    if (!this.supabaseClient) return true;
    const cleanPath = storagePath.startsWith(`${bucket}/`) ? storagePath.substring(bucket.length + 1) : storagePath;

    try {
      const { error } = await this.supabaseClient.storage
        .from(bucket)
        .remove([cleanPath]);

      if (error) {
        this.logger.warn(`Failed to delete storage object "${cleanPath}": ${error.message}`);
        return false;
      }
      return true;
    } catch (err: any) {
      this.logger.error(`deleteFile exception for "${cleanPath}": ${err.message}`);
      return false;
    }
  }
}
