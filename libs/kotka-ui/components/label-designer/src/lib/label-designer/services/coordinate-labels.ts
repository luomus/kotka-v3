import { convertYkjToWGS84, addSuffixToWGS84, getYkjAccuracy, degreesToDms } from '@kotka/shared/utils';

type CoordinateType = 'short' | 'long' | 'new' | 'turku';

const COORDINATE_FORMATS: Record<CoordinateType, Record<string, string>> = {
  short: {
    ykj: 'ykj: %lat%:%lon%',
    wgs84: '%lat%, %lon%',
    default: '%system%: %lat%, %lon%',
  },
  long: {
    ykj: 'YKJ: %lat%:%lon% (Grid 27° E)<br />WGS84: %wgsN%, %wgsE%%accuracy%"',
    default: 'Coordinates: %lat%, %lon%%accuracy% (%system%)',
  },
  new: {
    ykj: '%lat%:%lon% (YKJ)<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;%wgsN%, %wgsE% (wgs84%accuracy%)',
    default: 'Coordinates: %lat%, %lon%%accuracy% (%system%)',
  },
  turku: {
    ykj: 'Finnish uniform grid (YKJ): %lat%:%lon%',
    default: 'Coordinates (%system%): %lat%, %lon%%accuracy% ',
  },
};

const AUGMENT_RULES: Record<string, Record<string, string>> = {
  long: { accuracy: ', accuracy ± %accuracy% m' },
  new: { accuracy: ', accuracy %accuracy% m' },
  turku: { accuracy: ', accuracy ± %accuracy% m' },
};

const COORDINATE_VARIABLES = [
  'system',
  'lat',
  'lon',
  'wgsN',
  'wgsE',
  'radius',
  'accuracy',
];

export function formatCoordinates(
  system?: string,
  lat?: string,
  lon?: string,
  wgsN?: string,
  wgsE?: string,
  radius?: string,
  type: CoordinateType = 'long'
): string {
  if (!system) {
    return '';
  }

  system = system
    .replace('MY.coordinateSystem', '')
    .toLowerCase();

  const prepared = prepareCoordinates(system, lat, lon, wgsN, wgsE, radius);

  const coordinateFormats = getCoordinateFormats(type);

  const variables: Record<string, string | undefined> = {
    system: system,
    lat: prepared.lat,
    lon: prepared.lon,
    wgsN: prepared.wgsN,
    wgsE: prepared.wgsE,
    radius: radius,
    accuracy: prepared.accuracy,
  };

  const augmentedVariables = augmentVariables(type, variables);

  const template = coordinateFormats[system] ?? coordinateFormats['default'];

  return formatCoordinateLine(template, augmentedVariables);
}

function prepareCoordinates(
  system: string,
  lat?: string,
  lon?: string,
  wgsN?: string,
  wgsE?: string,
  radius?: string
): { lat?: string; lon?: string; wgsN?: string; wgsE?: string; accuracy?: string } {
  if (!lat || !lon) {
    return { lat, lon, wgsN, wgsE };
  }

  switch (system) {
    case 'wgs84':
    case 'wgs84dms':
      return {...addSuffixToWGS84(lat, lon), wgsN, wgsE};
    case 'ykj':
      const accuracy = getYkjAccuracy(lat, radius);
      const result = convertYkjToWGS84(lat, lon);
      if (result) {
        wgsN = degreesToDms(result[0]);
        wgsE = degreesToDms(result[1]);
      }
      return { lat, lon, wgsN, wgsE, accuracy: '' + accuracy };
    default:
      return { lat, lon, wgsN, wgsE };
  }
}

function augmentVariables(type: CoordinateType, variables: Record<string, string | undefined>): Record<string, string | undefined> {
  const result = { ...variables };
  const rules = AUGMENT_RULES[type];

  if (rules) {
    Object.entries(rules).forEach(([field, augFormat]) => {
      if (result[field]) {
        result[field] = augFormat.replace(`%${field}%`, result[field]);
      }
    });
  }

  return result;
}

function formatCoordinateLine(template: string, variables: Record<string, string | undefined>): string {
  let result = template;

  COORDINATE_VARIABLES.forEach(variable => {
    const value = variables[variable] || '';
    result = result.replace(`%${variable}%`, value);
  });

  return result;
}

function getCoordinateFormats(type: CoordinateType): Record<string, string> {
  if (!COORDINATE_FORMATS[type]) {
    throw new Error(`Invalid coordinate type: ${type}`);
  }
  return COORDINATE_FORMATS[type];
}
