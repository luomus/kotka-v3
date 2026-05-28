import { CoordinateMatchInterceptor } from './coordinate-match.interceptor';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('CoordinateMatchInterceptor', () => {
  let coordinateMatchInterceptor: CoordinateMatchInterceptor;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [Reflector, CoordinateMatchInterceptor],
    }).compile();

    coordinateMatchInterceptor = moduleRef.get<CoordinateMatchInterceptor>(CoordinateMatchInterceptor);
  });

  describe('Coordinate component presence', () => {
    it('If no coordinates are set throw no error', async () => {
      const mockBody = {
        gatherings: [{}]
      };
      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })});

      const mockNext = createMock<CallHandler>();

      coordinateMatchInterceptor.intercept(mockContext, mockNext);
      expect(mockNext.handle).toHaveBeenCalledTimes(1);
    });

    it('If not all coordinateFields are set throw error 1', async () => {
      const mockBody = {
        gatherings: [{
          longitude: 24.945831,
          coordinateSystem: 'MY.coordinateSystemWgs84',
          wgs84Longitude: 24.945831
        }]
      };
      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })});

      const mockNext = createMock<CallHandler>();

      expect.assertions(2);
      try {
        coordinateMatchInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(e.message).toEqual('Missing expected coordinate data');
        expect(mockNext.handle).toHaveBeenCalledTimes(0);
      }
    });

    it('If not all coordinateFields are set throw error 2', async () => {
      const mockBody = {
        gatherings: [{
          latitude: 60.16952,
          wgs84Longitude: 24.945831,
          wgs84Latitude: 60.16952
        }]
      };
      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })});

      const mockNext = createMock<CallHandler>();

      expect.assertions(2);
      try {
        coordinateMatchInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(e.message).toEqual('Missing expected coordinate data');
        expect(mockNext.handle).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('Coordinate matching', () => {
    it('If provided WGS84 coordinates do not match converted coordinates throw error', async () => {
      const mockBody = {
        gatherings: [{
          latitude: 6686357,
          longitude: 381191,
          coordinateSystem: 'MY.coordinateSystemEtrs-tm35fin',
          wgs84Longitude: 24.83830372,
          wgs84Latitude: 60.20638293
        }]
      };
      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })});

      const mockNext = createMock<CallHandler>();

      expect.assertions(2);
      try {
        coordinateMatchInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(e.message).toEqual('Provided WGS84 coordinates do not match original coordinates');
        expect(mockNext.handle).toHaveBeenCalledTimes(0);
      }
    });

  it('If provided WGS84 coordinates match converted coordinates don\'t throw error', async () => {
      const mockBody = {
        gatherings: [{
          latitude: 6676357,
          longitude: 380191,
          coordinateSystem: 'MY.coordinateSystemEtrs-tm35fin',
          wgs84Longitude: 24.83830372,
          wgs84Latitude: 60.20638293
        }]
      };
      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })});

      const mockNext = createMock<CallHandler>();

      coordinateMatchInterceptor.intercept(mockContext, mockNext);
      expect(mockNext.handle).toHaveBeenCalledTimes(1);
    });
  });
});
