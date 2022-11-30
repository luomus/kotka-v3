import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { UserInterceptor } from './user.interceptor';

describe('UserInterceptor', () => {
  let userInterceptor: UserInterceptor;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [UserInterceptor],
    }).compile();

    userInterceptor = moduleRef.get<UserInterceptor>(UserInterceptor);
  });

  it('User is set correctly when using POST, route handler is called', () => {
    const mockBody = {};
    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        user: {profile: { id: 'MA.1' }},
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    userInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'POST', user: {profile: { id: 'MA.1' }}, body: { creator: 'MA.1', editor: 'MA.1' }});
    expect(mockNext).toBeCalledTimes(1);
  });

  it('User is set correctly when using PUT, route handler is called', () => {
    const mockBody = {
      id: 'GX.1',
      creator: 'MA.2',
      editor: 'MA.2'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'PUT',
        params: { id: 'GX.1' },
        user: {profile: { id: 'MA.1' }},
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    userInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'PUT', params: { id: 'GX.1' }, user: {profile: { id: 'MA.1' }}, body: { id: 'GX.1', creator: 'MA.2', editor: 'MA.1' }});
    expect(mockNext).toBeCalledTimes(1);
  });

  it('GET-request will pass trough without modification to request or error, route handler is called', () => {
    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        params: { id: 'GX.1' },
      })
    })});

    const mockNext = createMock<CallHandler>();

    userInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({ method: 'GET', params: { id: 'GX.1' }});
    expect(mockNext).toBeCalledTimes(1);
  });

  it('DELETE-request will pass trough without modification to request or error, route handler is called', () => {
    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'DELETE',
        params: { id: 'GX.1' },
      })
    })});

    const mockNext = createMock<CallHandler>();

    userInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({ method: 'DELETE', params: { id: 'GX.1' }});
    expect(mockNext).toBeCalledTimes(1);
  });
});