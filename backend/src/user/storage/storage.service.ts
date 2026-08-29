import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { withRetry } from '../../common/utils/retry.util';

@Injectable()
export class StorageService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
    this.bucket = this.configService.get<string>('SUPABASE_STORAGE_BUCKET', 'payment-proofs');
  }

  async uploadPaymentProof(userId: string, bookingId: string, file: Express.Multer.File): Promise<string> {
    return withRetry(() => this.uploadPaymentProofOnce(userId, bookingId, file), {
      attempts: 3,
      delayMs: 600,
      backoff: 2,
    });
  }

  private async uploadPaymentProofOnce(
    userId: string,
    bookingId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const extension = file.originalname.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${userId}/${bookingId}/${randomUUID()}.${extension}`;

    const { error } = await this.supabase.storage.from(this.bucket).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
