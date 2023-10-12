import { ApiServicesModule, LajiStoreService } from '@kotka/api-services';
import { MappersModule } from '@kotka/mappers';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { HttpModule } from '@nestjs/axios';
import { Reflector } from '@nestjs/core';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OrganizationGuard } from './organization.guard';

describe('InUseGuard', () => {
  let organizationGuard: OrganizationGuard;
  let lajiStoreService: LajiStoreService;
  let reflector: Reflector;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiServicesModule, HttpModule, MappersModule],
      controllers: [],
      providers: [OrganizationGuard, Reflector],
    }).compile();

    lajiStoreService = moduleRef.get<LajiStoreService>(LajiStoreService);
    organizationGuard = moduleRef.get<OrganizationGuard>(OrganizationGuard);
    reflector = moduleRef.get<Reflector>(Reflector);

    jest.useFakeTimers();
  });

  it('GET-requests are granted access', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'GET', user: { profile: { role: ['MA.admin'] }}});

    const canActivate = await organizationGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
  });

  it('User with admin rights is granted access', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', user: { profile: { role: ['MA.admin'] }}});

    const canActivate = await organizationGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
  });

  it('POST request with body with same organization as user results in access granted and no call to lajiStore', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: {}, status: 200, statusText: '', headers: {}, config: {}}));
    
    const canActivate = await organizationGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(0);
  });

  it('POST request with body with different organization from user results in access denied with error and no call to lajiStore', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ method: 'POST', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.2' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: {}, status: 200, statusText: '', headers: {}, config: {}}));
    
    await expect(organizationGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(0);
  });

  it('PUT request with id pointing to document with same organization as user results in access granted and a call to lajiStore and correct params', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'PUT', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { id: 'GX.1', owner: 'MOS.1' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    const canActivate = await organizationGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('PUT request with id pointing to document with different organization than user results in access denied with error and a call to lajiStore and correct params', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'PUT', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { id: 'GX.1', owner: 'MOS.2' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    await expect(organizationGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('DELETE request with id pointing to document with same organization as user results in access granted and a call to lajiStore and correct params', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'DELETE', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { id: 'GX.1', owner: 'MOS.1' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    const canActivate = await organizationGuard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });

  it('DELETE request with id pointing to document with different organization than user results in access denied with error and a call to lajiStore and correct params', async () => {
    const mockReflectorGet = jest.spyOn(reflector, 'get').mockImplementation((key, target) => 'GX.dataset');
    const mockContext = createMock<ExecutionContext>();

    mockContext.switchToHttp().getRequest.mockReturnValue({ params: { id: 'GX.1' }, method: 'DELETE', user: { profile: { organisation: ['MOS.1'] }}, body: { owner: 'MOS.1' }});
    const mockLajistoreGet = jest.spyOn(lajiStoreService, 'get').mockImplementation((type, id) => of({ data: { id: 'GX.1', owner: 'MOS.2' }, status: 200, statusText: '', headers: {}, config: {}}));
    
    await expect(organizationGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    expect(mockLajistoreGet).toBeCalledTimes(1);
    expect(mockLajistoreGet.mock.calls[0][0]).toBe('GX.dataset');
    expect(mockLajistoreGet.mock.calls[0][1]).toBe('GX.1');
  });
});