import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'ioredis';


@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(
      process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      },
    );
  }

  async onModuleInit() {
    try {
      await this.redis.connect();
      this.logger.log('Redis connected successfully');
    } catch (error) {
      this.logger.warn('Redis connection failed. Caching is unavailable.');
    }
  }

  async onModuleDestroy() {
    if (this.redis.status === 'ready') {
      await this.redis.quit();
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      if (this.redis.status !== 'ready') return null;

      const value = await this.redis.get(key);

      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Redis GET failed for key: ${key}`);
      return null;
    }
  }

  async set(
    key: string,
    value: any,
    ttl = 60,
  ): Promise<void> {
    try {
      if (this.redis.status !== 'ready') return;

      await this.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        ttl,
      );
    } catch (error) {
      this.logger.error(`Redis SET failed for key: ${key}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.redis.status !== 'ready') return;

      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Redis DELETE failed for key: ${key}`);
    }
  }
}