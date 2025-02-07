import { ApiServicesModule, LajiStoreService } from '@kotka/api-services';
import { MappersModule } from '@kotka/mappers';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { HttpModule } from '@nestjs/axios';
import { Reflector } from '@nestjs/core';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ApiMethodAccessGuard } from './api-method-access.guard';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';

describe('ApiMethodAccessGuard', () => {
  let apiMethodAccessGuard: ApiMethodAccessGuard;
  let lajiStoreService: LajiStoreService;
  let reflector: Reflector;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiServicesModule, HttpModule, MappersModule],
      controllers: [],
      providers: [ApiMethodAccessGuard, Reflector],
    }).compile();

    lajiStoreService = moduleRef.get<LajiStoreService>(LajiStoreService);
    apiMethodAccessGuard = moduleRef.get<ApiMethodAccessGuard>(ApiMethodAccessGuard);
    reflector = moduleRef.get<Reflector>(Reflector);

    jest.useFakeTimers();
  });

  it('GET-requests are granted access', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'GET', user: { profile: { role: ['MA.admin'] }}});

    const canActivate = await apiMethodAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
  });

  it('User with admin rights is granted access to POST', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', user: { profile: { role: ['MA.admin'] }}});

    const canActivate = await apiMethodAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
  });

  it('POST request with body with same organization as user results in access granted and no call to lajiStore', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: {}, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    const canActivate = await apiMethodAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(0);
  });

  it('POST request with body with different organization from user results in access denied with error and no call to lajiStore', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.2' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: {}, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    await expect(apiMethodAccessGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(0);
  });

  it('POST request with body without owner results in access denied with error and no call to lajiStore', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.2' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: {}, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    await expect(apiMethodAccessGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(0);
  });

  it('POST request for organization with body without owner results in access granted and no call to lajiStore', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', user: { profile: { organisation: ['MOS.1'] }}, body: { '@type': 'MOS.organization' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: {}, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    const canActivate = await apiMethodAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(0);
  });

  it('User with admin rights is granted access to PUT and a call to lajiStore and correct params is made', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'PUT', user: { profile: { role: ['MA.admin'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { id: 'GX.1', owner: 'MOS.2' }, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    const canActivate = await apiMethodAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('PUT request with id pointing to document with same organization as user results in access granted and a call to lajiStore and correct params', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'PUT', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { id: 'GX.1', owner: 'MOS.1' }, status: 200, statusText: '', headers: {}, config: {}}  as AxiosResponse));

    const canActivate = await apiMethodAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('PUT request with id pointing to document with different organization than user results in access denied with error and a call to lajiStore and correct params', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'PUT', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { id: 'GX.1', owner: 'MOS.2' }, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    await expect(apiMethodAccessGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('PUT request with id pointing to document with no owner results in access granted and a call to lajiStore and correct params', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'PUT', user: { profile: { organisation: ['MOS.1'] }}, body: { '@type': 'GX.dataset' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { id: 'GX.1', '@type': 'GX.dataset' }, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    const canActivate = await apiMethodAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('PUT request with id pointing to document with no owner and type organization results in access granted and a call to lajiStore and correct params', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'PUT', user: { profile: { organisation: ['MOS.1'] }}, body: { '@type': 'MOS.organization' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { id: 'GX.1', '@type': 'MOS.organization'  }, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    const canActivate = await apiMethodAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('DELETE request with admin user results in access granted and a call to lajiStore and correct params', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'DELETE',  user: { profile: { role: ['MA.admin'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { '@type': 'GX.dataset', id: 'GX.1', owner: 'MOS.1' }, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    const canActivate = await apiMethodAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('DELETE request with admin user but no @type parameter in document results in access denied and calls to lajistore', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'DELETE',  user: { profile: { role: ['MA.admin'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { id: 'GX.1', owner: 'MOS.1' }, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    await expect(apiMethodAccessGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('DELETE request with admin user but unacceptable @type parameter in document results in access denied and calls to lajistore', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'DELETE',  user: { profile: { role: ['MA.admin'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { '@type': 'MY.document', id: 'GX.1', owner: 'MOS.1' }, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    await expect(apiMethodAccessGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('DELETE request with id pointing to document with same organization as user but too old edit date results in access denied and a call to lajiStore and correct params', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'DELETE', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { '@type': 'GX.dataset', id: 'GX.1', owner: 'MOS.1', dateCreated: '2022-11-22T12:00:00.000Z', dateEdited: '2022-11-22T12:00:00.000Z' }, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    await expect(apiMethodAccessGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });
  
  it('DELETE request with id pointing to document with same organization as user and valid date results in access granted and a call to lajiStore and correct params', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'DELETE', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { '@type': 'GX.dataset', id: 'GX.1', owner: 'MOS.1', dateCreated: new Date().toISOString(), dateEdited: new Date().toISOString() }, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    const canActivate = await apiMethodAccessGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('DELETE request with id pointing to document with different organization than user and valid date results in access denied with error and a call to lajiStore and correct params', async () => {
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'DELETE', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ data: { '@type': 'GX.dataset', id: 'GX.1', owner: 'MOS.2', dateCreated: new Date().toISOString(), dateEdited: new Date().toISOString() }, status: 200, statusText: '', headers: {}, config: {}} as AxiosResponse));

    await expect(apiMethodAccessGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });
});
