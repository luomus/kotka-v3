import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Document } from '@kotka/shared/models';
import { EsClientService } from '@kotka/api/elasticsearch';
import { SpecimenSearchService } from '@kotka/api/specimen-search';

@Injectable()
export class SpecimenIndexerInterceptor implements NestInterceptor {
  constructor(
    private readonly specimenSearchService: SpecimenSearchService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (data: any) => {
        const req = context.switchToHttp().getRequest();

        if (!((req.method === 'POST' && !req.path?.includes('_search')) || req.method === 'PUT' || req.method === 'DELETE')) {
          return;
        }

        try {
          if (req.method === 'DELETE') {
            return await this.specimenSearchService.deleteByDocumentQNames([data.documentQName]);
          }

          await this.specimenSearchService.indexSingle(data as Document);
        } catch (error) {
          console.error('Error indexing specimen:', error);
        }
      })
    );
  }
}
