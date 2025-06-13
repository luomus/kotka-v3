import { convertLatLng } from '@luomus/laji-map/lib/utils';
import { MYCoordinateSystems } from '@luomus/laji-schema';

export function convertCoordinatesToWGS84(latitude: string | number, longitude: string | number, coordinateSystem: MYCoordinateSystems): [number, number] | undefined {
  let lat: number | undefined;
  let lng: number | undefined;

  if (coordinateSystem === 'MY.coordinateSystemYkj') {
    return convertYkjToWGS84(latitude, longitude);
  } else if (coordinateSystem === 'MY.coordinateSystemWgs84') {
    lat = +latitude;
    lng = +longitude;
  } else if (coordinateSystem === 'MY.coordinateSystemWgs84dms') {
    lat = dmsToDegrees(latitude);
    lng = dmsToDegrees(longitude);
  } else if (coordinateSystem === 'MY.coordinateSystemEtrs-tm35fin') {
    return convertEtrsTm35FinToWGS84(latitude, longitude);
  }

  if (isNumber(lat) && isNumber(lng)) {
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [lat, lng];
    }
  }

  return undefined;
}

function convertYkjToWGS84<T extends string | number>(lat: T, lng: T): [number, number] | undefined {
  const latPadded = padYkj(lat);
  const lngPadded = padYkj(lng);

  try {
    return convertLatLng([latPadded, lngPadded], 'EPSG:2393', 'WGS84');
  } catch (e: any) {
    return undefined;
  }
}

function convertEtrsTm35FinToWGS84<T extends string | number>(lat: T, lng: T): [number, number] | undefined {
  try {
    return convertLatLng([+lat, +lng], 'EPSG:3067', 'WGS84');
  } catch (e: any) {
    return undefined;
  }
}

function dmsToDegrees(dms: string | number): number | undefined {
  dms = ('' + dms).trim().replace(',', '.');

  const parts = dms.split(/[^0-9.]+/).filter(p => p !== '');

  if (parts.length === 0) {
    return undefined;
  }

  const flip = dms.startsWith('-') ? -1 : 1;

  const deg = parts[0] !== undefined ? parseFloat(parts[0]) : 0;
  const min = parts[1] !== undefined ? parseFloat(parts[1]) : 0;
  const sec = parts[2] !== undefined ? parseFloat(parts[2]) : 0;

  return flip * (deg + ((min * 60 + sec) / 3600));
}

function padYkj(value: string | number): number {
  value = '' + value;
  return +(value + '0000000'.slice(value.length));
}

function isNumber(value?: number): value is number {
  return value !== undefined && !isNaN(value);
}
