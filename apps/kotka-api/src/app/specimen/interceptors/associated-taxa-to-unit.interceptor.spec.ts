import { Test } from '@nestjs/testing';
import { cloneDeep } from 'lodash';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AssociatedTaxaToUnitInterceptor } from './associated-taxa-to-unit.interceptor';

describe('AssociatedTaxaToUnitInterceptor', () => {
  let associatedTaxaToUnitInterceptor: AssociatedTaxaToUnitInterceptor;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [Reflector, AssociatedTaxaToUnitInterceptor],
    }).compile();

    associatedTaxaToUnitInterceptor = moduleRef.get<AssociatedTaxaToUnitInterceptor>(AssociatedTaxaToUnitInterceptor);
  });

  it('GET is allowed trough', async () => {
    const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
      })
    })});

    const mockNext = createMock<CallHandler>();

    associatedTaxaToUnitInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
  });

  it('POST search is allowed trough', async () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
        }),
      }),
      getHandler: () => ({ name: 'search' })
    });

    const mockNext = createMock<CallHandler>();

    associatedTaxaToUnitInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
  });

  it('DELETE is allowed trough', async () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'DELETE',
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    associatedTaxaToUnitInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
  });

  it('POST request with no associatedTaxa results in unmodified body', async () => {
    const mockBody = {
      gatherings: [{
        units: [{
          recordBasis: 'MY.recordBasisPreservedSpecimen',
          identifications: [{
            taxon: 'Taxon 1',
          }]
        }]
      }],
    };
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    associatedTaxaToUnitInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockBody).toEqual(cloneDeep(mockBody));
  });

  it('POST request with associatedObservationTaxa results in correct number of new units', async () => {
    const mockBody = {
      gatherings: [{
        associatedObservationTaxa: 'Taxon 2; Taxon 3',
        units: [{
          recordBasis: 'MY.recordBasisPreservedSpecimen',
          identifications: [{
            taxon: 'Taxon 1',
          }]
        }]
      }],
    };
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    associatedTaxaToUnitInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockBody.gatherings[0].units).toHaveLength(3);
    expect(mockBody.gatherings[0].units[1]).toEqual({
      recordBasis: 'MY.recordBasisHumanObservation',
      identifications: [{
        taxon: 'Taxon 2',
      }]
    });
    expect(mockBody.gatherings[0].units[2]).toEqual({
      recordBasis: 'MY.recordBasisHumanObservation',
      identifications: [{
        taxon: 'Taxon 3',
      }]
    });
    expect(mockBody.gatherings[0].associatedObservationTaxa).toBeUndefined();
  });

  it('POST request with associatedSpecimenTaxa results in correct number of new units', async () => {
    const mockBody = {
      gatherings: [{
        associatedSpecimenTaxa: 'Taxon 2; Taxon 3',
        units: [{
          recordBasis: 'MY.recordBasisPreservedSpecimen',
          identifications: [{
            taxon: 'Taxon 1',
          }]
        }]
      }],
    };
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    associatedTaxaToUnitInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockBody.gatherings[0].units).toHaveLength(3);
    expect(mockBody.gatherings[0].units[1]).toEqual({
      recordBasis: 'MY.recordBasisPreservedSpecimen',
      identifications: [{
        taxon: 'Taxon 2',
      }]
    });
    expect(mockBody.gatherings[0].units[2]).toEqual({
      recordBasis: 'MY.recordBasisPreservedSpecimen',
      identifications: [{
        taxon: 'Taxon 3',
      }]
    });
    expect(mockBody.gatherings[0].associatedSpecimenTaxa).toBeUndefined();
  });

  it('POST request with both associated taxa field results in correct number of new units', async () => {
    const mockBody = {
      gatherings: [{
        associatedSpecimenTaxa: 'Taxon 2; Taxon 3',
        associatedObservationTaxa: 'Taxon 4;',
        units: [{
          recordBasis: 'MY.recordBasisPreservedSpecimen',
          identifications: [{
            taxon: 'Taxon 1',
          }]
        }]
      }],
    };
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    associatedTaxaToUnitInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockBody.gatherings[0].units).toHaveLength(4);
    expect(mockBody.gatherings[0].units[1]).toEqual({
      recordBasis: 'MY.recordBasisHumanObservation',
      identifications: [{
        taxon: 'Taxon 4',
      }]
    });
    expect(mockBody.gatherings[0].units[2]).toEqual({
      recordBasis: 'MY.recordBasisPreservedSpecimen',
      identifications: [{
        taxon: 'Taxon 2',
      }]
    });
    expect(mockBody.gatherings[0].units[3]).toEqual({
      recordBasis: 'MY.recordBasisPreservedSpecimen',
      identifications: [{
        taxon: 'Taxon 3',
      }]
    });
    expect(mockBody.gatherings[0].associatedSpecimenTaxa).toBeUndefined();
    expect(mockBody.gatherings[0].associatedObservationTaxa).toBeUndefined();

  });
});
