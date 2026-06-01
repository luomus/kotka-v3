/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Document } from '@kotka/shared/models';
import { convertCoordinatesToWGS84 } from '@kotka/shared/utils';

const COORDINATE_DELTA = 0.01;

@Injectable()
export class CoordinateMatchInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<Document> {
    const req = context.switchToHttp().getRequest();
    const body: Document = req.body;

    if (!((req.method === 'POST' && context.getHandler().name !== 'search') || req.method === 'PUT')) {
      return next.handle();
    }

    const originalLatitude = body.gatherings[0].latitude;
    const originalLongitude = body.gatherings[0].longitude;
    const coordinateSystem = body.gatherings[0].coordinateSystem;
    const wgs84Latitude = body.gatherings[0].wgs84Latitude;
    const wgs84Longitude = body.gatherings[0].wgs84Longitude;

    if (
      !originalLatitude
      && !originalLongitude
      && !coordinateSystem
      && !wgs84Latitude
      && !wgs84Longitude
    ) {
      return next.handle();
    } else if (
      !originalLatitude
      || !originalLongitude
      || !coordinateSystem
      || !wgs84Latitude
      || !wgs84Longitude
    ) {
      throw new HttpException('Missing expected coordinate data', HttpStatus.BAD_REQUEST);
    }

    const convertedCoordinates = convertCoordinatesToWGS84(originalLatitude!, originalLongitude!, coordinateSystem!);

    if (!convertedCoordinates) {
      throw new HttpException('Unable to convert original coordinate data', HttpStatus.BAD_REQUEST);
    }

    if (Math.abs(convertedCoordinates[0] - Number(wgs84Latitude)) > COORDINATE_DELTA || Math.abs(convertedCoordinates[1] - Number(wgs84Longitude)) > COORDINATE_DELTA) {
      throw new HttpException('Provided WGS84 coordinates do not match original coordinates', HttpStatus.BAD_REQUEST);
    }

    return next.handle();
  }
}
