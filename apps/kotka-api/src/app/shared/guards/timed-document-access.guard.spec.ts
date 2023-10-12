import { ApiServicesModule, LajiStoreService } from '@kotka/api-services';
import { MappersModule } from '@kotka/mappers';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { HttpModule } from '@nestjs/axios';
import { Reflector } from '@nestjs/core';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TimedDocumentAccessGuard } from './timed-document-access.guard';

describe('InUseGuard', () => {
  let timedDocumentAccessGuard: TimedDocumentAccessGuard;
  let lajiStoreService: LajiStoreService;
  let reflector: Reflector;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiServicesModule, HttpModule, MappersModule],
      controllers: [],
      providers: [TimedDocumentAccessGuard, Reflector],
    }).compile();

    lajiStoreService = moduleRef.get<LajiStoreService>(LajiStoreService);
    timedDocumentAccessGuard = moduleRef.get<TimedDocumentAccessGuard>(TimedDocumentAccessGuard);
    reflector = moduleRef.get<Reflector>(Reflector);

    jest.useFakeTimers();
  });

  it('Admins are granted access', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => {
      if (key === 'controllerType') {
        return 'GX.dataset';
      } else if (key === 'timedAccessMetadata') {
        return { get: { 'd': 7 }};
      }
    });
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'GET', user: { profile: { role: ['MA.admin'] }}});

    const canActivate = await timedDocumentAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
  });

  it('Calls to methods using getAll and post result into access granted without calls to lajistore', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => {
      if (key === 'controllerType') {
        return 'GX.dataset';
      } else if (key === 'timedAccessMetadata') {
        return { get: { 'd': 7 }, put: { 'd': 7 }};
      }
    });
    const mockContext = createMock<ExecutionContext>();
    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'GET', user: { profile: { }}});

    mockContext.getHandler.mockReturnValue(function getAll() { return undefined; });
    let canActivate = await timedDocumentAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);

    mockContext.getHandler.mockReturnValue(function post() { return undefined; });
    canActivate = await timedDocumentAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
  });


  it('Calls to methods without the timing set results in access being granted and no calls to lajistore', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => {
      if (key === 'controllerType') {
        return 'GX.dataset';
      } else if (key === 'timedAccessMetadata') {
        return {};
      }
    });
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'GET', params: {id: 'GX.1'}, user: { profile: { organisation: ['MOS.1'] }}, body: {}});
    mockContext.getHandler.mockReturnValue(function get() { return undefined; });
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { dateCreated: '2022-11-22T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    let canActivate = await timedDocumentAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(0);

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'PUT', params: {id: 'GX.1'}, user: { profile: { organisation: ['MOS.1'] }}, body: {}});
    mockContext.getHandler.mockReturnValue(function put() { return undefined; });
    const mockLajistorePut = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { dateCreated: '2022-11-22T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    canActivate = await timedDocumentAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistorePut).toBeCalledTimes(0);

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'DELETE', params: {id: 'GX.1'}, user: { profile: { organisation: ['MOS.1'] }}, body: {}});
    mockContext.getHandler.mockReturnValue(function del() { return undefined; });
    const mockLajistoreDel = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { dateCreated: '2022-11-22T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    canActivate = await timedDocumentAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreDel).toBeCalledTimes(0);
  });

  it('Calls to methods with the timing set results in calls to lajistore and when document creation time is close enough a granted access', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => {
      if (key === 'controllerType') {
        return 'GX.dataset';
      } else if (key === 'timedAccessMetadata') {
        return { get: { 'd': 7 }, put: { 'd': 7 }, del: { 'd': 7 }};
      }
    });
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'GET', params: {id: 'GX.1'}, user: { profile: { organisation: ['MOS.1'] }}, body: {}});
    mockContext.getHandler.mockReturnValue(function get() { return undefined; });
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { dateCreated: '2022-11-22T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    let canActivate = await timedDocumentAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(1);

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'PUT', params: {id: 'GX.1'}, user: { profile: { organisation: ['MOS.1'] }}, body: {}});
    mockContext.getHandler.mockReturnValue(function put() { return undefined; });
    const mockLajistorePut = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { dateCreated: '2022-11-22T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    canActivate = await timedDocumentAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistorePut).toBeCalledTimes(2);

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'DELETE', params: {id: 'GX.1'}, user: { profile: { organisation: ['MOS.1'] }}, body: {}});
    mockContext.getHandler.mockReturnValue(function del() { return undefined; });
    const mockLajistoreDel = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { dateCreated: '2022-11-22T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    canActivate = await timedDocumentAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreDel).toBeCalledTimes(3);
  });

  it('Calls to methods with the timing set results in calls to lajistore and when document creation time is to far a denied access', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => {
      if (key === 'controllerType') {
        return 'GX.dataset';
      } else if (key === 'timedAccessMetadata') {
        return { get: { 'd': 7 }, put: { 'd': 7 }, del: { 'd': 7 }};
      }
    });
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'GET', params: {id: 'GX.1'}, user: { profile: { organisation: ['MOS.1'] }}, body: {}});
    mockContext.getHandler.mockReturnValue(function get() { return undefined; });
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { dateCreated: '2022-11-10T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    await expect(timedDocumentAccessGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(1);

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'PUT', params: {id: 'GX.1'}, user: { profile: { organisation: ['MOS.1'] }}, body: {}});
    mockContext.getHandler.mockReturnValue(function put() { return undefined; });
    const mockLajistorePut = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { dateCreated: '2022-11-10T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    await expect(timedDocumentAccessGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistorePut).toBeCalledTimes(2);

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'DELETE', params: {id: 'GX.1'}, user: { profile: { organisation: ['MOS.1'] }}, body: {}});
    mockContext.getHandler.mockReturnValue(function del() { return undefined; });
    const mockLajistoreDel = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { dateCreated: '2022-11-10T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    await expect(timedDocumentAccessGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreDel).toBeCalledTimes(3);
  });
});