import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Document } from '@kotka/shared/models'
import { EsClientService } from '@kotka/api/elasticsearch';
import { SpecimenExtractorService } from '@kotka/api/specimen-search';

@Injectable()
export class SpecimenIndexerInterceptor implements NestInterceptor {
  constructor(
    private readonly elasticClient: EsClientService,
    private readonly specimenExtractorService: SpecimenExtractorService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (data: any) => {
        const req = context.switchToHttp().getRequest();

        if (!((req.method === 'POST' && !req.path?.includes('_search')) || req.method === 'PUT')) {
          return;
        }

        try {
          await this.elasticClient.indexSingle(data as Document, this.specimenExtractorService);
        } catch (error) {
          console.error('Error indexing specimen:', error);
        }
      })
    );
  }
}
