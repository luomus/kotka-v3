import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { MediaApiService, Meta } from '@kotka/api/services';
import { SpecimenImageInterceptor } from './specimen-image.interceptor';
import { lastValueFrom, of } from 'rxjs';
import { HttpService } from '@nestjs/axios';

const mockHttpService = jest.mock<HttpService>;

describe('SpecimenImageIntereptor', () => {
  let specimenImageInterceptor: SpecimenImageInterceptor;
  let mediaApiService: MediaApiService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        SpecimenImageInterceptor,
        MediaApiService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    mediaApiService = moduleRef.get<MediaApiService>(MediaApiService);
    specimenImageInterceptor = moduleRef.get<SpecimenImageInterceptor>(SpecimenImageInterceptor);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('On POST-request document images-field gets removed', async () => {
    const mockBody = {
      id: 'tun:JA.123',
      images: 'MM.123',
      gatherings: []
    };
    const mockRequest = {
      method: 'POST',
      body: mockBody,
      path: '/'
    };

    const mockContext = createMock<ExecutionContext>({
      getHandler: () => ({ name: 'post' }),
      switchToHttp: () => ({
        getRequest: () => (mockRequest),
      }
    )});

    const mockMediaFind = jest.spyOn(mediaApiService, 'findMediaByDocumentId');
    const mockNext = createMock<CallHandler>();

    specimenImageInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'POST', body: { id: 'tun:JA.123', gatherings: [] }, path: '/'});
    expect(mockMediaFind).toHaveBeenCalledTimes(0);
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
  });

  it('On POST-request to _search-endpoint don\'t do anything to request', async () => {
    const mockBody = {
      query: {}
    };
    const mockRequest = {
      method: 'POST',
      body: mockBody,
      path: '/_search'
    };

    const mockContext = createMock<ExecutionContext>({
      getHandler: () => ({ name: 'search' }),
      switchToHttp: () => ({
        getRequest: () => (mockRequest),
      }
    )});

    const mockMediaFind = jest.spyOn(mediaApiService, 'findMediaByDocumentId');
    const mockNext = createMock<CallHandler>();

    specimenImageInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual(mockRequest);
    expect(mockMediaFind).toHaveBeenCalledTimes(0);
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
  });

    it('On PUT-request document images-field gets removed', async () => {
    const mockBody = {
      id: 'tun:JA.123',
      images: 'MM.123',
      gatherings: []
    };
    const mockRequest = {
      method: 'PUT',
      body: mockBody,
      path: '/tun:JA.123'
    };

    const mockContext = createMock<ExecutionContext>({
      getHandler: () => ({ name: 'put' }),
      switchToHttp: () => ({
        getRequest: () => (mockRequest),
      }
    )});

    const mockMediaFind = jest.spyOn(mediaApiService, 'findMediaByDocumentId');
    const mockNext = createMock<CallHandler>();

    specimenImageInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'PUT', body: { id: 'tun:JA.123', gatherings: [] }, path: '/tun:JA.123'});
    expect(mockMediaFind).toHaveBeenCalledTimes(0);
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
  });

  it('On GET-request for document search images from media-api and attach the to images field', async () => {
    const mockRequest = {
      method: 'GET',
      path: '/tun:JA.123'
    };

    const mockContext = createMock<ExecutionContext>({
      getHandler: () => ({ name: 'get' }),
      switchToHttp: () => ({
        getRequest: () => (mockRequest),
      }
    )});

    const mockMediaFind = jest.spyOn(mediaApiService, 'findMediaByDocumentId').mockImplementation(() => of([{id: 'MM.123'}, {id: 'MM.321'}] as Meta[]));
    const mockNext = createMock<CallHandler>({
      handle: () => of({id: 'tun:JA.123', gatherings: []})
    });

    const interceptorRes = await lastValueFrom(specimenImageInterceptor.intercept(mockContext, mockNext));

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual(mockRequest);
    expect(interceptorRes).toEqual({ id: 'tun:JA.123', gatherings: [], images: ['MM.123', 'MM.321'] });
    expect(mockMediaFind.mock.calls[0][0]).toEqual('http://tun.fi/JA.123');
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
  });
});
