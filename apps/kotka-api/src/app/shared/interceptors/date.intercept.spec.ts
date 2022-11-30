import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { DateInterceptor } from './date.interceptor';

describe('DateInterceptor', () => {
  let dateInterceptor: DateInterceptor;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [DateInterceptor],
    }).compile();

    dateInterceptor = moduleRef.get<DateInterceptor>(DateInterceptor);

    jest.useFakeTimers().setSystemTime(new Date('2022-11-22T12:00:00.000Z'));
  });

  it('Date is set correctly when using POST', () => {
    const mockBody = {};
    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    dateInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'POST', body: { dateCreated: '2022-11-22T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }});
    expect(mockNext).toBeCalledTimes(1);
  });

  it('Date is set correctly when using PUT', () => {
    const mockBody = {
      id: 'GX.1',
      dateCreated: '2022-11-11T12:00:00.000Z',
      dateEdited: '2022-11-11T12:00:00.000Z'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'PUT',
        params: { id: 'GX.1' },
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    dateInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'PUT', params: { id: 'GX.1' }, body: { id: 'GX.1', dateCreated: '2022-11-11T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }});
    expect(mockNext).toBeCalledTimes(1);
  });


  it('GET-request will pass trough without modification to request or error', () => {
    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        params: { id: 'GX.1' },
      })
    })});

    const mockNext = createMock<CallHandler>();

    dateInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({ method: 'GET', params: { id: 'GX.1' }});
    expect(mockNext).toBeCalledTimes(1);
  });

  it('DELETE-request will pass trough without modification to request or error', () => {
    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'DELETE',
        params: { id: 'GX.1' },
      })
    })});

    const mockNext = createMock<CallHandler>();

    dateInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({ method: 'DELETE', params: { id: 'GX.1' }});
    expect(mockNext).toBeCalledTimes(1);
  });
});