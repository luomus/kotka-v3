import { PostIDExistsInterceptor } from './post-id-exists.interceptor';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, CallHandler, ExecutionContext } from '@nestjs/common';
import { ApiServicesModule, LajiStoreService } from '@kotka/api/services';
import { Reflector } from '@nestjs/core';
import { KotkaDocumentObjectFullType } from '@kotka/shared/models';
import { of } from 'rxjs';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';

describe('PostIDExistsInterceptor', () => {
  let postIDExists: PostIDExistsInterceptor;
  let lajistoreService: LajiStoreService;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiServicesModule],
      controllers: [],
      providers: [PostIDExistsInterceptor, Reflector],
    }).compile();

    lajistoreService = moduleRef.get<LajiStoreService>(LajiStoreService);
    postIDExists = moduleRef.get<PostIDExistsInterceptor>(PostIDExistsInterceptor);
    reflector = moduleRef.get<Reflector>(Reflector);

    jest.useFakeTimers();
  });

  it('If resource with ID exists throw bad request error', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation(() => KotkaDocumentObjectFullType.document);
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', body: { id: 'JA.1' } });
    const mockNext = createMock<CallHandler>();
    const mockLajistoreServiceGet = jest.spyOn(lajistoreService, 'get').mockImplementation(() => of({
      data: {
        '@context': 'test',
        '@type': 'test',
        view: {
          '@id': 'test',
          '@type': 'test',
          itemsPerPage: '10',
          first: 'test',
          last: 'test'
        },
        totalItems: 1,
        pageSize: 10,
        currentPage: 0,
        lastPage: 0,
        member: [{
          '@type': 'something',
          'id': 'JA.1'
        }]
      },
      status: 200,
      statusText: '',
      headers: {},
      config: {}
    } as AxiosResponse));

    await expect(postIDExists.intercept(mockContext, mockNext)).rejects.toThrow(BadRequestException);
    expect(mockReflectorGet).toBeCalledTimes(1);
    expect(mockLajistoreServiceGet).toBeCalledTimes(1);
    expect(mockNext.handle).toBeCalledTimes(0)
    expect(mockLajistoreServiceGet.mock.calls[0]).toEqual([KotkaDocumentObjectFullType.document, 'JA.1'])
    expect(mockReflectorGet.mock.calls[0][0]).toBe('controllerType');
  });

  it('If resource with ID does not exist return true to allow query to continue', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation(() => KotkaDocumentObjectFullType.document);
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', body: { id: 'JA.1' }});
    const mockNext = createMock<CallHandler>();
    const mockLajistoreServiceGet = jest.spyOn(lajistoreService, 'get').mockImplementation(() => {
      throw {
        response: {
          data: {},
          status: 404,
          statusText: '',
          headers: {},
          config: {}
    }}});

    await postIDExists.intercept(mockContext, mockNext);
    expect(mockReflectorGet).toBeCalledTimes(1);
    expect(mockLajistoreServiceGet).toBeCalledTimes(1);
    expect(mockNext.handle).toBeCalledTimes(1)
    expect(mockLajistoreServiceGet.mock.calls[0]).toEqual([KotkaDocumentObjectFullType.document, 'JA.1'])
    expect(mockReflectorGet.mock.calls[0][0]).toBe('controllerType');
  });

  it('If there is no id in the body allow query to go trough', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation(() => KotkaDocumentObjectFullType.document);
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', body: {}});
    const mockNext = createMock<CallHandler>();
    const mockLajistoreServiceGet = jest.spyOn(lajistoreService, 'get').mockImplementation(() => of({} as AxiosResponse));

    await postIDExists.intercept(mockContext, mockNext);
    expect(mockReflectorGet).toBeCalledTimes(0);
    expect(mockNext.handle).toBeCalledTimes(1)
    expect(mockLajistoreServiceGet).toBeCalledTimes(0);
  })
});
