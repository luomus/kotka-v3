import { Feature, Point } from 'geojson';

export interface Circle extends Point {
  radius: number;
}

export function isCircleFeature(feature: Feature): feature is Feature<Circle> {
  return (
    feature.geometry.type === 'Point' &&
    'radius' in feature.geometry &&
    typeof feature.geometry.radius === 'number'
  );
}
