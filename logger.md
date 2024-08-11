## logger middleware

```ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${responseTime}ms`,
      );

      this.logger.debug({
        method,
        originalUrl,
        statusCode,
        contentLength,
        responseTime: `${responseTime}ms`,
        queryParams: req.query,
        body: req.body,
      });
    });

    next();
  }
}
```

## app module

```ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggingMiddleware } from './logging.middleware'; // 경로를 적절히 설정하세요

@Module({
  // 다른 모듈들
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
```
