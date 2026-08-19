import { 
  CallHandler, ExecutionContext, Injectable, NestInterceptor 
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in success-enveloped format, bypass rewriting
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: true,
          data: data === undefined || data === null ? {} as T : data,
          message: 'Operation completed successfully.',
        };
      })
    );
  }
}
