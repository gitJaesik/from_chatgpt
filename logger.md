## logger middleware

```ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Writable } from 'stream';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body: reqBody } = req;
    const startTime = Date.now();
    let responseBody = '';

    // Custom writable stream to capture response body
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        responseBody += chunk.toString(); // Accumulate response chunks
        originalWrite(chunk, encoding, callback); // Pass through original write
      },
    });

    res.write = writableStream.write.bind(writableStream);
    res.end = (...args) => {
      if (args[0]) {
        responseBody += args[0].toString();
      }
      originalEnd.apply(res, args);
    };

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength || 0} - ${responseTime}ms`,
      );

      this.logger.debug({
        method,
        originalUrl,
        statusCode,
        contentLength: contentLength || 0,
        responseTime: `${responseTime}ms`,
        reqBody,
        resBody: responseBody,
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
