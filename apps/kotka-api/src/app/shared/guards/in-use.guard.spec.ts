import { ApiServicesModule, TriplestoreService } from '@kotka/api-services';
import { MappersModule } from '@kotka/mappers';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { HttpModule } from '@nestjs/axios';
import { InUseGuard } from './in-use.guard';
import { Reflector } from '@nestjs/core';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('InUseGuard', () => {
  let inUseGuard: InUseGuard;
  let triplestoreService: TriplestoreService;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiServicesModule, HttpModule, MappersModule],
      controllers: [],
      providers: [InUseGuard, Reflector],
    }).compile();

    triplestoreService = moduleRef.get<TriplestoreService>(TriplestoreService);
    inUseGuard = moduleRef.get<InUseGuard>(InUseGuard);
    reflector = moduleRef.get<Reflector>(Reflector);

    jest.useFakeTimers();
  });

  it('Using any other request methods that DELETE grants access, no calls to reflector', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation(() => []);
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'GET' });
    let canActivate = await inUseGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockReflectorGet).toBeCalledTimes(0);

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST' });
    canActivate = await inUseGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockReflectorGet).toBeCalledTimes(0);

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'PUT' });
    canActivate = await inUseGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockReflectorGet).toBeCalledTimes(0);

  });

  it('Request method of DELETE continues to reflector getting called twice for correct keys, and missing inUseTypes results in granted access', async () => {
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'DELETE' });
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation(() => []);

    const canActivate = await inUseGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockReflectorGet).toBeCalledTimes(2);
    expect(mockReflectorGet.mock.calls[0][0]).toBe('controllerType');
    expect(mockReflectorGet.mock.calls[1][0]).toBe('inUseTypes');
  });

  it('Request method of DELETE and found inUseTypes results in call to triplestore, found documents and organizations result into denied access with forbidden error', async () => {
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'DELETE', params: { id: 'GX.1' } });
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key) => {
      if (key === 'controllerType') {
        return 'GX.dataset';
      } else if (key === 'inUseTypes') {
        return [
          'MOS.organization',
          'MY.document'
        ];
      }
    });
    const mockTriplestoreServiceSearch = jest.spyOn(triplestoreService, 'search').mockImplementation(() => of({
      data: {
        'rdf:RDF': {
          'xmlns':	'http://tun.fi/',
          'MY.document': [],
          'MOS.organization': {},
        }
      },
      status: 200,
      statusText: '',
      headers: {},
      config: {}
    }));

    await expect(inUseGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockReflectorGet).toBeCalledTimes(2);
    expect(mockTriplestoreServiceSearch).toBeCalled();
    expect(mockTriplestoreServiceSearch.mock.calls[0][0]).toEqual({ object: 'GX.1' });
  });

  it('Request method of DELETE and found inUseTypes results in call to triplestore, no found documents and organizations result into granted access', async () => {
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'DELETE', params: { id: 'GX.1' } });
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key) => {
      if (key === 'controllerType') {
        return 'GX.dataset';
      } else if (key === 'inUseTypes') {
        return [
          'MOS.organization',
          'MY.document'
        ];
      }
    });
    const mockTriplestoreServiceSearch = jest.spyOn(triplestoreService, 'search').mockImplementation(() => of({
      data: {
        'rdf:RDF': {
          'xmlns':	'http://tun.fi/'
        }
      },
      status: 200,
      statusText: '',
      headers: {},
      config: {}
    }));

    const canActivate = await inUseGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockReflectorGet).toBeCalledTimes(2);
    expect(mockTriplestoreServiceSearch).toBeCalled();
    expect(mockTriplestoreServiceSearch.mock.calls[0][0]).toEqual({ object: 'GX.1' });
  });
});
