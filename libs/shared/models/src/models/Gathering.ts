/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Gathering {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  /**
   * AFE grid name
   */
  AFEQuadrat?: string;
  /**
   * UTM grid name
   */
  UTMQuadrat?: string;
  acknowledgeNoUnitsInCensus?: boolean;
  /**
   * Regions, rayons, provinces and other administrative areas. Separate multiple names with commas, from generic to specific. (E.g. Etelä-Suomen lääni, Uusimaa)
   */
  administrativeProvince?: string;
  /**
   * Altitude form sea level in meters, single value or range (E.g. 90, or 80-100). No GPS altitude here.
   */
  alt?: string;
  areaDetail?: string;
  /**
   * Write associated observation taxa names here, separated by a semicolon (;). E.g.: "Betula pendula; Betula pubescens; Poaceae". These will form their own units of the type observation.
   */
  associatedObservationTaxa?: string;
  /**
   * Write associated specimen taxa names here, separated by a semicolon (;). E.g.: "Betula pendula; Betula pubescens; Poaceae". These will form their own units of the type Preserved specimen.
   */
  associatedSpecimenTaxa?: string;
  /**
   * Bat habitat
   */
  batHabitat?: (
    | ""
    | "MY.batHabitatYardCityCentre"
    | "MY.batHabitatYardSuburbs"
    | "MY.batHabitatYardRural"
    | "MY.batHabitatRoadSide"
    | "MY.batHabitatStandOfTreesCloseToBuildings"
    | "MY.batHabitatParkWIthFewTrees"
    | "MY.batHabitatParkAbundantInTrees"
    | "MY.batHabitatSparseForest"
    | "MY.batHabitatDenseForest"
    | "MY.batHabitatEdgeOfShoreCoppice"
    | "MY.batHabitatLakeShore"
    | "MY.batHabitatSeaShore"
    | "MY.batHabitatArchipelago"
    | "MY.batHabitatStreamOrRiverBank"
    | "MY.batHabitatOldBuildingOrRuins"
    | "MY.batHabitatCountryside"
  )[];
  binocularsUsed?: boolean;
  /**
   * Formal abbreviation. For Finnish eliömaakunnat, use Finnish abbreviation.
   */
  biologicalProvince?: string;
  censusHinderedByEnviromentalFactors?: boolean;
  censusHinderedByFog?: boolean;
  censusHinderedByRain?: boolean;
  censusHinderedByWind?: boolean;
  /**
   * Name of an expedition or such.
   */
  collectingEventName?: string;
  controlActivitiesNotes?: string;
  /**
   * Free-text notes about the coordinates.
   */
  coordinateNotes?: string;
  /**
   * Maximum error of coordinates in meters
   */
  coordinateRadius?: string;
  /**
   * Use for NEW SPECIMENS: Where the coordinates have been acquired
   */
  coordinateSource?:
    | ""
    | "MY.coordinateSourceGps"
    | "MY.coordinateSourcePeruskartta"
    | "MY.coordinateSourcePapermap"
    | "MY.coordinateSourceKotkamap"
    | "MY.coordinateSourceKarttapaikka"
    | "MY.coordinateSourceRetkikartta"
    | "MY.coordinateSourceGoogle"
    | "MY.coordinateSourceOther"
    | "MY.coordinateSourceUnknown";
  /**
   * More information about the coordinate systems: https://wiki.helsinki.fi/display/digit/Entering+specimen+data
   */
  coordinateSystem?:
    | ""
    | "MY.coordinateSystemYkj"
    | "MY.coordinateSystemWgs84"
    | "MY.coordinateSystemWgs84dms"
    | "MY.coordinateSystemKkj"
    | "MY.coordinateSystemEtrs-tm35fin"
    | "MY.coordinateSystemDd"
    | "MY.coordinateSystemDms";
  coordinatesGridYKJ?: string;
  /**
   * Coordinates, possible coordinate system and error radius word-to-word as they appear on the label or other original source, errors and all.
   */
  coordinatesVerbatim?: string;
  /**
   * Country name in English, or 2-letter country code, or name from label
   */
  country?: string;
  /**
   * County (piirikunta, kreivikunta etc.)
   */
  county?: string;
  dateBegin?: string;
  dateEnd?: string;
  /**
   * Date just as it appears on the label or other original source, no interpretation, errors and all
   */
  dateVerbatim?: string;
  /**
   * Depth in meters, single value or range (E.g. 0.9, or 0.8-1.0)
   */
  depth?: string;
  dynamicProperties?: string;
  eventDate?: string;
  /**
   * Finnish forest vegetation zone
   */
  forestVegetationZone?:
    | ""
    | "MY.forestVegetationZone1a"
    | "MY.forestVegetationZone1b"
    | "MY.forestVegetationZone2a"
    | "MY.forestVegetationZone2b"
    | "MY.forestVegetationZone3a"
    | "MY.forestVegetationZone3b"
    | "MY.forestVegetationZone3c"
    | "MY.forestVegetationZone4a"
    | "MY.forestVegetationZone4b"
    | "MY.forestVegetationZone4c"
    | "MY.forestVegetationZone4d";
  gatheringFact?: {
    batCollector?: "" | "MY.batCollectorAlone" | "MY.batCollectorWithProjectGroupMember" | "MY.batCollectorSomeoneElse";
    binocularsUsed?: boolean;
    censusAreaHectares?: number;
    invasiveControlOtherExpensesInEuros?: number;
    invasiveControlWorkHours?: number;
    lineTransectSegmentCounted?: boolean;
    lineTransectSegmentMetersEnd?: number;
    lineTransectSegmentMetersStart?: number;
    observedAreaHectares?: number;
    pointCountHabitat?:
      | ""
      | "MY.pointCountHabitat0"
      | "MY.pointCountHabitat1"
      | "MY.pointCountHabitat2"
      | "MY.pointCountHabitat3"
      | "MY.pointCountHabitat4"
      | "MY.pointCountHabitat5"
      | "MY.pointCountHabitat6"
      | "MY.pointCountHabitat7"
      | "MY.pointCountHabitat8"
      | "MY.pointCountHabitat9"
      | "MY.pointCountHabitat10"
      | "MY.pointCountHabitat11"
      | "MY.pointCountHabitat12"
      | "MY.pointCountHabitat13"
      | "MY.pointCountHabitat14"
      | "MY.pointCountHabitat15"
      | "MY.pointCountHabitat16"
      | "MY.pointCountHabitat17";
    shorelineLengthMeters?: number;
    spottingScopeUsed?: boolean;
    sunniness?: number;
    sykeButterFlyCensusWind?:
      | ""
      | "MY.sykeButterFlyCensusWindEnumUnknown"
      | "MY.sykeButterFlyCensusWindEnum0"
      | "MY.sykeButterFlyCensusWindEnum1"
      | "MY.sykeButterFlyCensusWindEnum2"
      | "MY.sykeButterFlyCensusWindEnum3"
      | "MY.sykeButterFlyCensusWindEnum4"
      | "MY.sykeButterFlyCensusWindEnum5"
      | "MY.sykeButterFlyCensusWindEnum6";
    sykeButterFlyCensusWindEnd?:
      | ""
      | "MY.sykeButterFlyCensusWindEnumUnknown"
      | "MY.sykeButterFlyCensusWindEnum0"
      | "MY.sykeButterFlyCensusWindEnum1"
      | "MY.sykeButterFlyCensusWindEnum2"
      | "MY.sykeButterFlyCensusWindEnum3"
      | "MY.sykeButterFlyCensusWindEnum4"
      | "MY.sykeButterFlyCensusWindEnum5"
      | "MY.sykeButterFlyCensusWindEnum6";
    sykeButterFlyCensusWindStart?:
      | ""
      | "MY.sykeButterFlyCensusWindEnumUnknown"
      | "MY.sykeButterFlyCensusWindEnum0"
      | "MY.sykeButterFlyCensusWindEnum1"
      | "MY.sykeButterFlyCensusWindEnum2"
      | "MY.sykeButterFlyCensusWindEnum3"
      | "MY.sykeButterFlyCensusWindEnum4"
      | "MY.sykeButterFlyCensusWindEnum5"
      | "MY.sykeButterFlyCensusWindEnum6";
    waterbirdCensusPeriod?:
      | ""
      | "MY.waterbirdCensusPeriodEnum1"
      | "MY.waterbirdCensusPeriodEnum2"
      | "MY.waterbirdCensusPeriodEnumJuvenile"
      | "MY.waterbirdCensusPeriodEnumAdditional"
      | "MY.waterbirdCensusPeriodEnumCombined";
    waterbirdHabitat?:
      | ""
      | "MY.waterbirdHabitatEnum1"
      | "MY.waterbirdHabitatEnum2"
      | "MY.waterbirdHabitatEnum3"
      | "MY.waterbirdHabitatEnum4"
      | "MY.waterbirdHabitatEnum5"
      | "MY.waterbirdHabitatEnum6"
      | "MY.waterbirdHabitatEnum7"
      | "MY.waterbirdHabitatEnum8"
      | "MY.waterbirdHabitatEnum9"
      | "MY.waterbirdHabitatEnum10";
    ACAFLAonAlder?: number;
    ACAFLAonBirch?: number;
    ACAFLAonGround?: number;
    ACAFLAonPine?: number;
    ACAFLAonSpruce?: number;
    CARSPIonAlder?: number;
    CARSPIonBirch?: number;
    CARSPIonGround?: number;
    CARSPIonPine?: number;
    CARSPIonSpruce?: number;
    LOXIAonAlder?: number;
    LOXIAonBirch?: number;
    LOXIAonGround?: number;
    LOXIAonPine?: number;
    LOXIAonSpruce?: number;
    abundanceBOMGAR?:
      | ""
      | "WBC.speciesAbundanceEnum0"
      | "WBC.speciesAbundanceEnum1"
      | "WBC.speciesAbundanceEnum2"
      | "WBC.speciesAbundanceEnum3";
    abundancePINENU?:
      | ""
      | "WBC.speciesAbundanceEnum0"
      | "WBC.speciesAbundanceEnum1"
      | "WBC.speciesAbundanceEnum2"
      | "WBC.speciesAbundanceEnum3";
    abundanceTURPIL?:
      | ""
      | "WBC.speciesAbundanceEnum0"
      | "WBC.speciesAbundanceEnum1"
      | "WBC.speciesAbundanceEnum2"
      | "WBC.speciesAbundanceEnum3";
    birdFeederCount?: number;
    birdFeederCountBiotopeA?: number;
    birdFeederCountBiotopeB?: number;
    birdFeederCountBiotopeC?: number;
    birdFeederCountBiotopeD?: number;
    birdFeederCountBiotopeE?: number;
    birdFeederCountBiotopeF?: number;
    birdFeederCountBiotopeG?: number;
    birdFeederCountBiotopeH?: number;
    cloudAndRain?:
      | ""
      | "WBC.cloudAndRainEnum0"
      | "WBC.cloudAndRainEnum1"
      | "WBC.cloudAndRainEnum2"
      | "WBC.cloudAndRainEnum3"
      | "WBC.cloudAndRainEnum4";
    descriptionBiotopeF?: string;
    feedingStationCount?: number;
    feedingStationCountBiotopeA?: number;
    feedingStationCountBiotopeB?: number;
    feedingStationCountBiotopeC?: number;
    feedingStationCountBiotopeD?: number;
    feedingStationCountBiotopeE?: number;
    feedingStationCountBiotopeF?: number;
    feedingStationCountBiotopeG?: number;
    feedingStationCountBiotopeH?: number;
    iceCover?:
      | ""
      | "WBC.iceCoverEnum0"
      | "WBC.iceCoverEnum1"
      | "WBC.iceCoverEnum2"
      | "WBC.iceCoverEnum3"
      | "WBC.iceCoverEnum4";
    meanTemperature?: number;
    observerCount?: number;
    observerID?: number;
    pineConesAtCensus?:
      | ""
      | "WBC.berriesAndConesEnum0"
      | "WBC.berriesAndConesEnum1"
      | "WBC.berriesAndConesEnum2"
      | "WBC.berriesAndConesEnum3"
      | "WBC.berriesAndConesEnum4"
      | "WBC.berriesAndConesEnum5"
      | "WBC.berriesAndConesEnum6";
    routeID?: number;
    routeLength?: number;
    routeLengthBiotopeA?: number;
    routeLengthBiotopeB?: number;
    routeLengthBiotopeC?: number;
    routeLengthBiotopeD?: number;
    routeLengthBiotopeE?: number;
    routeLengthBiotopeF?: number;
    routeLengthBiotopeG?: number;
    routeLengthBiotopeH?: number;
    routeLengthChange?: number;
    routeLengthChangeBiotopeA?: number;
    routeLengthChangeBiotopeB?: number;
    routeLengthChangeBiotopeC?: number;
    routeLengthChangeBiotopeD?: number;
    routeLengthChangeBiotopeE?: number;
    routeLengthChangeBiotopeF?: number;
    routeLengthChangeBiotopeG?: number;
    routeLengthChangeBiotopeH?: number;
    snowAndIceOnTrees?:
      | ""
      | "WBC.snowAndIceOnTreesEnum0"
      | "WBC.snowAndIceOnTreesEnum1"
      | "WBC.snowAndIceOnTreesEnum2"
      | "WBC.snowAndIceOnTreesEnum3";
    snowCover?:
      | ""
      | "WBC.snowCoverEnum0"
      | "WBC.snowCoverEnum1"
      | "WBC.snowCoverEnum2"
      | "WBC.snowCoverEnum3"
      | "WBC.snowCoverEnum4"
      | "WBC.snowCoverEnum5"
      | "WBC.snowCoverEnum6"
      | "WBC.snowCoverEnum7"
      | "WBC.snowCoverEnum8";
    sorbusBerriesAtCensus?:
      | ""
      | "WBC.berriesAndConesEnum0"
      | "WBC.berriesAndConesEnum1"
      | "WBC.berriesAndConesEnum2"
      | "WBC.berriesAndConesEnum3"
      | "WBC.berriesAndConesEnum4"
      | "WBC.berriesAndConesEnum5"
      | "WBC.berriesAndConesEnum6";
    sorbusBerriesEarlyFall?:
      | ""
      | "WBC.berriesAndConesEnum0"
      | "WBC.berriesAndConesEnum1"
      | "WBC.berriesAndConesEnum2"
      | "WBC.berriesAndConesEnum3"
      | "WBC.berriesAndConesEnum4"
      | "WBC.berriesAndConesEnum5"
      | "WBC.berriesAndConesEnum6";
    spruceConesAtCensus?:
      | ""
      | "WBC.berriesAndConesEnum0"
      | "WBC.berriesAndConesEnum1"
      | "WBC.berriesAndConesEnum2"
      | "WBC.berriesAndConesEnum3"
      | "WBC.berriesAndConesEnum4"
      | "WBC.berriesAndConesEnum5"
      | "WBC.berriesAndConesEnum6";
    typeOfSnowCover?: "" | "WBC.typeOfSnowCoverEnum0" | "WBC.typeOfSnowCoverEnum1" | "WBC.typeOfSnowCoverEnum2";
    visibility?:
      | ""
      | "WBC.visibilityEnum0"
      | "WBC.visibilityEnum1"
      | "WBC.visibilityEnum2"
      | "WBC.visibilityEnum3"
      | "WBC.visibilityEnum4";
    waterbodies?:
      | ""
      | "WBC.waterbodiesEnum0"
      | "WBC.waterbodiesEnum1"
      | "WBC.waterbodiesEnum2"
      | "WBC.waterbodiesEnum3"
      | "WBC.waterbodiesEnum4"
      | "WBC.waterbodiesEnum5";
    wayOfTravel?:
      | ""
      | "WBC.wayOfTravelEnum0"
      | "WBC.wayOfTravelEnum1"
      | "WBC.wayOfTravelEnum2"
      | "WBC.wayOfTravelEnum3"
      | "WBC.wayOfTravelEnum9";
    wayOfTravelNotes?: string;
    wind?: "" | "WBC.windEnum0" | "WBC.windEnum1" | "WBC.windEnum2" | "WBC.windEnum3" | "WBC.windEnum4";
  };
  gatheringType?:
    | ""
    | "MY.gatheringTypeForagingArea"
    | "MY.gatheringTypeBreedingAndRestingArea"
    | "MY.gatheringTypeCavityTree"
    | "MY.gatheringTypeDroppingsTree"
    | "MY.gatheringTypeNestTree"
    | "MY.gatheringTypeLolifeAccess"
    | "MY.gatheringTypeLolifeCoreZone"
    | "MY.gatheringTypeLolifeHabitatZone"
    | "MY.gatheringTypeLolifeApplicableZone"
    | "MY.gatheringTypeWaterbirdPoint"
    | "MY.gatheringTypeWaterbirdRound";
  geometry?: {
    [k: string]: unknown | undefined;
  };
  /**
   * Use for OLD SPECIMENS: What source was used to get coordinates based on locality names
   */
  georeferenceSource?:
    | ""
    | "MY.georeferenceSourceKotka"
    | "MY.georeferenceSourceKarttapaikka"
    | "MY.georeferenceSourcePaikkatietoikkuna"
    | "MY.georeferenceSourceKarjalankartat"
    | "MY.georeferenceSourceRetkikartta"
    | "MY.georeferenceSourceGoogle"
    | "MY.georeferenceSourcePeruskartta"
    | "MY.georeferenceSourcePapermap"
    | "MY.georeferenceSourceOtherpaper"
    | "MY.georeferenceSourceOtherweb"
    | "MY.georeferenceSourceCatalogue"
    | "MY.georeferenceSourceBiogeomancer"
    | "MY.georeferenceSourceGeolocate"
    | "MY.georeferenceSourceOther"
    | "MY.georeferenceSourceUnknown";
  habitat?: (
    | ""
    | "MY.habitatEnumValue1"
    | "MY.habitatEnumValue2"
    | "MY.habitatEnumValue3"
    | "MY.habitatEnumValue4"
    | "MY.habitatEnumValue5"
    | "MY.habitatEnumValue6"
    | "MY.habitatEnumValue7"
    | "MY.habitatEnumValue8"
    | "MY.habitatEnumValue9"
    | "MY.habitatEnumValue10"
    | "MY.habitatEnumValue11"
    | "MY.habitatEnumValue12"
    | "MY.habitatEnumValue13"
    | "MY.habitatEnumValue14"
    | "MY.habitatEnumValue15"
    | "MY.habitatEnumValue16"
    | "MY.habitatEnumValue17"
    | "MY.habitatEnumValue18"
    | "MY.habitatEnumValue19"
    | "MY.habitatEnumValue20"
    | "MY.habitatEnumValue21"
    | "MY.habitatEnumValue22"
    | "MY.habitatEnumValue23"
    | "MY.habitatEnumValue24"
    | "MY.habitatEnumValue25"
    | "MY.habitatEnumValue26"
    | "MY.habitatEnumValue27"
    | "MY.habitatEnumValue28"
    | "MY.habitatEnumValue29"
    | "MY.habitatEnumValue30"
    | "MY.habitatEnumValue31"
    | "MY.habitatEnumValue32"
    | "MY.habitatEnumValue33"
    | "MY.habitatEnumValue34"
    | "MY.habitatEnumValue35"
    | "MY.habitatEnumValue36"
    | "MY.habitatEnumValue87"
    | "MY.habitatEnumValue37"
    | "MY.habitatEnumValue38"
    | "MY.habitatEnumValue39"
    | "MY.habitatEnumValue40"
    | "MY.habitatEnumValue41"
    | "MY.habitatEnumValue42"
    | "MY.habitatEnumValue43"
    | "MY.habitatEnumValue44"
    | "MY.habitatEnumValue45"
    | "MY.habitatEnumValue46"
    | "MY.habitatEnumValue47"
    | "MY.habitatEnumValue48"
    | "MY.habitatEnumValue49"
    | "MY.habitatEnumValue50"
    | "MY.habitatEnumValue51"
    | "MY.habitatEnumValue52"
    | "MY.habitatEnumValue53"
    | "MY.habitatEnumValue54"
    | "MY.habitatEnumValue55"
    | "MY.habitatEnumValue56"
    | "MY.habitatEnumValue57"
    | "MY.habitatEnumValue58"
    | "MY.habitatEnumValue59"
    | "MY.habitatEnumValue60"
    | "MY.habitatEnumValue61"
    | "MY.habitatEnumValue62"
    | "MY.habitatEnumValue63"
    | "MY.habitatEnumValue64"
    | "MY.habitatEnumValue65"
    | "MY.habitatEnumValue66"
    | "MY.habitatEnumValue67"
    | "MY.habitatEnumValue68"
    | "MY.habitatEnumValue69"
    | "MY.habitatEnumValue70"
    | "MY.habitatEnumValue71"
    | "MY.habitatEnumValue72"
    | "MY.habitatEnumValue73"
    | "MY.habitatEnumValue74"
    | "MY.habitatEnumValue75"
    | "MY.habitatEnumValue76"
    | "MY.habitatEnumValue77"
    | "MY.habitatEnumValue78"
    | "MY.habitatEnumValue79"
    | "MY.habitatEnumValue80"
    | "MY.habitatEnumValue81"
    | "MY.habitatEnumValue82"
    | "MY.habitatEnumValue83"
    | "MY.habitatEnumValue84"
    | "MY.habitatEnumValue85"
    | "MY.habitatEnumValue86"
  )[];
  habitatAttributes?: (
    | ""
    | "MY.habitatAttributesEnumValue1"
    | "MY.habitatAttributesEnumValue2"
    | "MY.habitatAttributesEnumValue3"
    | "MY.habitatAttributesEnumValue4"
    | "MY.habitatAttributesEnumValue5"
    | "MY.habitatAttributesEnumValue6"
    | "MY.habitatAttributesEnumValue7"
    | "MY.habitatAttributesEnumValue8"
    | "MY.habitatAttributesEnumValue9"
    | "MY.habitatAttributesEnumValue10"
    | "MY.habitatAttributesEnumValue11"
    | "MY.habitatAttributesEnumValue12"
    | "MY.habitatAttributesEnumValue13"
    | "MY.habitatAttributesEnumValue14"
    | "MY.habitatAttributesEnumValue15"
    | "MY.habitatAttributesEnumValue16"
    | "MY.habitatAttributesEnumValue17"
    | "MY.habitatAttributesEnumValue18"
    | "MY.habitatAttributesEnumValue19"
    | "MY.habitatAttributesEnumValue20"
    | "MY.habitatAttributesEnumValue21"
    | "MY.habitatAttributesEnumValue22"
  )[];
  /**
   * Formal habitat name or abbreviation. If several, separate with semicolons (E.g. 'OMT; OMaT').
   */
  habitatClassification?: string;
  /**
   * Informal description of the habitat.
   */
  habitatDescription?: string;
  hasUnit?: string[];
  /**
   * If country is not known or not applicable, for example continent, ocean or large island
   */
  higherGeography?: string;
  invasiveControlAreaKnown?: boolean;
  invasiveControlDangerous?: boolean;
  invasiveControlDangerousDescription?: string;
  invasiveControlEffectiveness?:
    | ""
    | "MY.invasiveControlEffectivenessFull"
    | "MY.invasiveControlEffectivenessPartial"
    | "MY.invasiveControlEffectivenessNone"
    | "MY.invasiveControlEffectivenessNotFound";
  invasiveControlEffectivenessNotes?: string;
  invasiveControlMethods?: (
    | ""
    | "MY.invasiveControlMethodsMechanical"
    | "MY.invasiveControlMethodsChemical"
    | "MY.invasiveControlMethodsBiological"
    | "MY.invasiveControlMethodsOther"
  )[];
  invasiveControlMethodsDescription?: string;
  invasiveControlOpen?: boolean;
  invasiveControlOpenDescription?: string;
  invasiveControlOtherExpensesInEuros?: number;
  invasiveControlTaxon?: string[];
  /**
   * Which parent or larger collection this is part of.
   */
  isPartOf?: string;
  keywords?: string[];
  /**
   * Latitude. For southern latitudes, use negative value.
   */
  latitude?: string;
  /**
   * Name of the collector(s), in format 'Lastname, Firstname; Lastname Firstname'
   */
  leg?: string[];
  /**
   * Alkuperäislähteen käyttäjätunnus
   */
  legUserID?: string[];
  /**
   * Leg just as it appears in the label or other original source, no interpretation, errors and all.
   */
  legVerbatim?: string;
  /**
   * Official name of the locality in basic form. Separate multiple names with commas, from generic to specific. No informal description here.
   */
  locality?: string;
  /**
   * Informal description of the exact locality, e.g. '5 km NE of city X, under stone bridge'
   */
  localityDescription?: string;
  /**
   * An unique identifier or code for the locality, if the locality has one (e.g. from SAPO-ontology).
   */
  localityID?: string;
  /**
   * Locality word-to-word as it appears on the label or other original source, errors and all
   */
  localityVerbatim?: string;
  /**
   * Longitude. For western longitudes, use negative value.
   */
  longitude?: string;
  /**
   * Municipality, commune, town, city or civil parish
   */
  municipality?: string;
  namedPlaceID?: string;
  /**
   * Additional information to the data in each section.
   */
  notes?: string;
  /**
   * For garden accessions/seed bank, number of individuals from which seeds were collected
   */
  numberOfSampledIndividuals?: string;
  observationDays?: number;
  observationMinutes?: number;
  /**
   * For garden accessions/seed bank, what proportion of the population sampled was giving seeds
   */
  percentageGivingSeeds?: number;
  predominantTree?:
    | ""
    | "MX.37819"
    | "MX.37812"
    | "MX.37992"
    | "MX.38004"
    | "MX.38590"
    | "MX.38686"
    | "MX.38563"
    | "MX.38527"
    | "MX.41344"
    | "MX.38016"
    | "MX.39331"
    | "MX.37990"
    | "MX.38008"
    | "MX.38010"
    | "MX.37975"
    | "MX.37976"
    | "MX.39122"
    | "MX.37815";
  projectTitle?: string;
  province?: string;
  /**
   * Relative humidity %
   */
  relativeHumidity?: number;
  /**
   * For garden accessions/seed bank, estimated size of the area sampled, in square meters
   */
  samplingAreaSizeInSquareMeters?: number;
  /**
   * Main method for (usually intentional) sampling
   */
  samplingMethod?:
    | ""
    | "MY.samplingMethodLight"
    | "MY.samplingMethodLightTrap"
    | "MY.samplingMethodTrap"
    | "MY.samplingMethodMalaise"
    | "MY.samplingMethodPitfall"
    | "MY.samplingMethodWindowtrap"
    | "MY.samplingMethodYellowWindowTrap"
    | "MY.samplingMethodPantrap"
    | "MY.samplingMethodYellowpan"
    | "MY.samplingMethodYellowtrap"
    | "MY.samplingMethodFeromonetrap"
    | "MY.samplingMethodBaittrap"
    | "MY.samplingMethodBait"
    | "MY.samplingMethodNet"
    | "MY.samplingMethodSweeping"
    | "MY.samplingMethodCarnet"
    | "MY.samplingMethodMistnet"
    | "MY.samplingMethodBoard"
    | "MY.samplingMethodReared"
    | "MY.samplingMethodExovo"
    | "MY.samplingMethodElarva"
    | "MY.samplingMethodEpupa"
    | "MY.samplingMethodEclectortrap"
    | "MY.samplingMethodHand"
    | "MY.samplingMethodSifting"
    | "MY.samplingMethodSoilsample"
    | "MY.samplingMethodDropping"
    | "MY.samplingMethodWashing"
    | "MY.samplingMethodDigging"
    | "MY.samplingMethodDiving"
    | "MY.samplingMethodDrag"
    | "MY.samplingMethodTriangleDrag"
    | "MY.samplingMethodFishNet"
    | "MY.samplingMethodElectrofishing"
    | "MY.samplingMethodAngleFishing"
    | "MY.samplingMethodFishTrap"
    | "MY.samplingMethodSeine"
    | "MY.samplingMethodTrawling"
    | "MY.samplingMethodBeamTrawl"
    | "MY.samplingMethodDungTrap"
    | "MY.samplingMethodTrunkWindowTrap"
    | "MY.samplingMethodDiverInsectTrap"
    | "MY.samplingMethodAquaticEmergenceTrap"
    | "MY.samplingMethodWaterBucket"
    | "MY.samplingMethodTrampling"
    | "MY.samplingMethodWaterSieve"
    | "MY.samplingMethodOther";
  samplingMethodNotes?: string;
  section?: number;
  skipped?: boolean;
  spottingScopeUsed?: boolean;
  /**
   * Type of substrate or name of substrate species.
   */
  substrate?: string;
  taxonCensus?: {
    censusTaxonID?: string;
    censusTaxonSetID?:
      | ""
      | "MX.taxonSetSykeButterflyCensusPapilionoidea"
      | "MX.taxonSetSykeButterflyCensusOther"
      | "MX.taxonSetWaterbirdWaterbirds"
      | "MX.taxonSetWaterbirdWaders"
      | "MX.taxonSetWaterbirdGulls"
      | "MX.taxonSetWaterbirdPasserines"
      | "MX.taxonSetWaterbirdAmphibia"
      | "MX.taxonSetSykeBumblebee"
      | "MVL.1201"
      | "MX.taxonSetSykeBumblebeeOther"
      | "MX.taxonSetBirdAtlasCommon";
    taxonCensusType: "MY.taxonCensusTypeCounted" | "MY.taxonCensusTypeEstimated" | "MY.taxonCensusTypeNotCounted";
  }[];
  temperature?: number;
  timeEnd?: string;
  timeStart?: string;
  trapCount?: number;
  weather?: string;
  wgs84Latitude?: string;
  wgs84Longitude?: string;
  images?: string[];
  /**
   * PUBLIC: all data can be published; PROTECTED: exact locality is hidden (100*100km square); PRIVATE: most of the data is hidden. Empty value means same as public.
   */
  publicityRestrictions?:
    | ""
    | "MZ.publicityRestrictionsPublic"
    | "MZ.publicityRestrictionsProtected"
    | "MZ.publicityRestrictionsPrivate";
  units?: {
    id?: string;
    "@type"?: string;
    "@context"?: string;
    /**
     * Diameter at breast height, in centimeters
     */
    DBH?: string;
    /**
     * Leave empty if no sample taken, or if the sample is recorded separately
     */
    DNASampleLocation?: string;
    abundanceString?: string;
    abundanceUnit?:
      | ""
      | "MY.abundanceUnitIndividualCount"
      | "MY.abundanceUnitPairCount"
      | "MY.abundanceUnitNest"
      | "MY.abundanceUnitBreedingSite"
      | "MY.abundanceUnitColony"
      | "MY.abundanceUnitQueen"
      | "MY.abundanceUnitFruitbody"
      | "MY.abundanceUnitSprout"
      | "MY.abundanceUnitHummock"
      | "MY.abundanceUnitThallus"
      | "MY.abundanceUnitFlower"
      | "MY.abundanceUnitSpot"
      | "MY.abundanceUnitTrunk"
      | "MY.abundanceUnitShell"
      | "MY.abundanceUnitDroppings"
      | "MY.abundanceUnitMarks"
      | "MY.abundanceUnitIndirect"
      | "MY.abundanceUnitSquareDM"
      | "MY.abundanceUnitSquareM"
      | "MY.abundanceUnitOccursDoesNotOccur";
    /**
     * Other identifiers this specimen has, in format 'type:identifier'. For example: 'mzhtypes:123' (old MAZ-type number)
     */
    additionalIDs?: string[];
    adultIndividualCount?: number;
    /**
     * Estimated or known age in calendar years, years, days or other relevant unit.
     */
    age?: string;
    /**
     * E.g. how age was determined, by whom and when.
     */
    ageNotes?: string;
    alive?: boolean;
    ankleInMillimeters?: string[];
    areaInSquareMeters?: number;
    atlasCode?:
      | ""
      | "MY.atlasCodeEnum1"
      | "MY.atlasCodeEnum2"
      | "MY.atlasCodeEnum3"
      | "MY.atlasCodeEnum4"
      | "MY.atlasCodeEnum5"
      | "MY.atlasCodeEnum6"
      | "MY.atlasCodeEnum61"
      | "MY.atlasCodeEnum62"
      | "MY.atlasCodeEnum63"
      | "MY.atlasCodeEnum64"
      | "MY.atlasCodeEnum65"
      | "MY.atlasCodeEnum66"
      | "MY.atlasCodeEnum7"
      | "MY.atlasCodeEnum71"
      | "MY.atlasCodeEnum72"
      | "MY.atlasCodeEnum73"
      | "MY.atlasCodeEnum74"
      | "MY.atlasCodeEnum75"
      | "MY.atlasCodeEnum8"
      | "MY.atlasCodeEnum81"
      | "MY.atlasCodeEnum82";
    batBehavior?:
      | ""
      | "MY.batBehaviorHibernating"
      | "MY.batBehaviorRoosting"
      | "MY.batBehaviorHunting"
      | "MY.batBehaviorDead";
    beakInMillimeters?: string[];
    birdAge?:
      | ""
      | "MY.birdAgePp"
      | "MY.birdAgePm"
      | "MY.birdAgeFl"
      | "MY.birdAgePlus1kv"
      | "MY.birdAge1Kv"
      | "MY.birdAgePlus2Kv"
      | "MY.birdAge2kv"
      | "MY.birdAgePlus3Kv"
      | "MY.birdAge3Kv"
      | "MY.birdAgePlus4Kv"
      | "MY.birdAge4Kv"
      | "MY.birdAgePlus5Kv"
      | "MY.birdAge5Kv"
      | "MY.birdAgePlus6Kv"
      | "MY.birdAge6Kv"
      | "MY.birdAgePlus7Kv"
      | "MY.birdAge7Kv"
      | "MY.birdAgePlus8Kv"
      | "MY.birdAge8Kv";
    birdBehavior?: string[];
    birdPlumage?:
      | ""
      | "MY.birdPlumageAd"
      | "MY.birdPlumageEijp"
      | "MY.birdPlumageImm"
      | "MY.birdPlumageJp"
      | "MY.birdPlumageJuv"
      | "MY.birdPlumageNpuk"
      | "MY.birdPlumagePull"
      | "MY.birdPlumageSubad"
      | "MY.birdPlumageTp"
      | "MY.birdPlumageVp"
      | "MY.birdPlumagePep"
      | "MY.birdPlumageSs";
    breeding?: boolean;
    broodSize?: number;
    /**
     * Cause of death, if not intentionally trapped on sampled
     */
    causeOfDeath?: string;
    checklistID?: string;
    /**
     * Results of chemical reaction tests etc.
     */
    chemistry?: string;
    /**
     * Numeric or other description on the amount of individuals (or sprouts, fruiting bodies or such) in the specimen. Sexes and juveniles can be specified like so: 1m2f3j (=1 male, 2 females, 3 juveniles)
     */
    count?: string;
    /**
     * Estimation of decay stage (lahoaste in Finnish) on the scale of 1 to 5 and/or description
     */
    decayStage?: string;
    distance?:
      | ""
      | "MY.distanceOverFlight"
      | "MY.distanceNear"
      | "MY.distanceQuiteFar"
      | "MY.distanceFar"
      | "MY.distanceVeryFar";
    /**
     * For palaeontological specimens, earliest possible geochronologic epoch or lowest chronostratigraphic series attributable to the stratigraphic horizon from which the specimen was collected
     */
    earliestEpochOrLowestSeries?:
      | ""
      | "MY.epochOrSeriesCambrian"
      | "MY.epochOrSeriesCarboniferous"
      | "MY.epochOrSeriesCretaceous"
      | "MY.epochOrSeriesDevonian"
      | "MY.epochOrSeriesEdiacaran"
      | "MY.epochOrSeriesJurassic"
      | "MY.epochOrSeriesOrdovician"
      | "MY.epochOrSeriesPermian"
      | "MY.epochOrSeriesQuaternary"
      | "MY.epochOrSeriesRecent"
      | "MY.epochOrSeriesSilurian"
      | "MY.epochOrSeriesTertiary"
      | "MY.epochOrSeriesTriassic";
    femaleIndividualCount?: number;
    /**
     * Fruit type of the collected fruits, used for botanical garden accessions/seed bank.
     */
    fruitType?:
      | ""
      | "MY.fruitTypeAchene"
      | "MY.fruitTypeBerry"
      | "MY.fruitTypeCapsule"
      | "MY.fruitTypeCaryopsis"
      | "MY.fruitTypeCone"
      | "MY.fruitTypeDrupe"
      | "MY.fruitTypeFollicle"
      | "MY.fruitTypeLegume"
      | "MY.fruitTypeNut"
      | "MY.fruitTypeOther"
      | "MY.fruitTypePome"
      | "MY.fruitTypeSchizocarp"
      | "MY.fruitTypeSiliqua";
    /**
     * Genotype of the microbial strain
     */
    genotype?: string;
    gonadInMillimeters?: string[];
    /**
     * Microbial culture growth medium name, usually from a standard
     */
    growthMediumName?: string;
    /**
     * Other growth conditions for the microbial culture, light etc.
     */
    growthOtherConditions?: string;
    /**
     * Microbial culture growth temperature
     */
    growthTemperature?: string;
    hasIdentification?: string[];
    hasSubUnit?: string[];
    hostID?: string;
    hostInformalNameString?: string;
    indirectObservationType?:
      | ""
      | "MY.indirectObservationTypeFeces"
      | "MY.indirectObservationTypeSnowTracks"
      | "MY.indirectObservationTypeUrine"
      | "MY.indirectObservationTypeFeasting"
      | "MY.indirectObservationTypeFoodStock";
    individualCount?: number;
    /**
     * Description of the infestation status of the collected seeds, used for botanical garden accessions/seed bank.
     */
    infestation?: string;
    informalNameString?: string;
    informalTaxonGroup?: string;
    /**
     * Valitut muotoryhmät
     */
    informalTaxonGroups?: string[];
    /**
     * Pathovars, serovars and other infrasubspecific subdivisions of microbes.
     */
    infrasubspecificSubdivision?: string;
    /**
     * Which parent or larger collection this is part of.
     */
    isPartOf?: string;
    juvenileIndividualCount?: number;
    keywords?: string[];
    larvaIndividualCount?: number;
    /**
     * For palaeontological specimens, latest possible geochronologic epoch or highest chronostratigraphic series attributable to the stratigraphic horizon from which the specimen was collected.
     */
    latestEpochOrHighestSeries?:
      | ""
      | "MY.epochOrSeriesCambrian"
      | "MY.epochOrSeriesCarboniferous"
      | "MY.epochOrSeriesCretaceous"
      | "MY.epochOrSeriesDevonian"
      | "MY.epochOrSeriesEdiacaran"
      | "MY.epochOrSeriesJurassic"
      | "MY.epochOrSeriesOrdovician"
      | "MY.epochOrSeriesPermian"
      | "MY.epochOrSeriesQuaternary"
      | "MY.epochOrSeriesRecent"
      | "MY.epochOrSeriesSilurian"
      | "MY.epochOrSeriesTertiary"
      | "MY.epochOrSeriesTriassic";
    lengthInMillimeters?: string[];
    /**
     * Life stage of the specimen
     */
    lifeStage?:
      | ""
      | "MY.lifeStageEgg"
      | "MY.lifeStageLarva"
      | "MY.lifeStagePupa"
      | "MY.lifeStageJuvenile"
      | "MY.lifeStageNymph"
      | "MY.lifeStageSubimago"
      | "MY.lifeStageImmature"
      | "MY.lifeStageAdult"
      | "MY.lifeStageFertile"
      | "MY.lifeStageSterile"
      | "MY.lifeStageTadpole"
      | "MY.lifeStageDead"
      | "MY.lifeStageAlive"
      | "MY.lifeStageEmbryo"
      | "MY.lifeStageSubadult"
      | "MY.lifeStageMature"
      | "MY.lifeStagePullus"
      | "MY.lifeStageHatchedEgg"
      | "MY.lifeStageHatchedPupa"
      | "MY.lifeStageGall"
      | "MY.lifeStageMarks";
    /**
     * Free-text notes or addtional information about the life stage
     */
    lifeStageDescription?: string;
    likelyMigrant?: boolean;
    /**
     * Macroscopic features and measurements, if not recorded separately into measurement fields.
     */
    macroscopy?: string;
    maleIndividualCount?: number;
    /**
     * For measurements taken from the preparation/sample, use the measurement field in the preparation/sample section. For measurements taken from the specimen, use the measurements field on unit level.
     */
    measurement?: {
      DNAConcentrationNgPerMicroliter?: number[];
      DNARatioOfAbsorbance260And280?: number[];
      DNAVolumeMicroliters?: number[];
      beakMillimeters?: number[];
      bodyCentimeters?: number[];
      bodyMillimeters?: number[];
      earLengthMillimeters?: number[];
      embryoCount?: number[];
      follicleDiameterMillimeters?: number[];
      footLengthMillimeters?: number[];
      forearmMillimeters?: number[];
      gonadMillimeters?: number[];
      /**
       * Which parent or larger collection this is part of.
       */
      isPartOf?: string;
      tailCentimeters?: number[];
      tailMillimeters?: number[];
      tarsusLengthMillimeters?: number[];
      totalLengthCentimeters?: number[];
      totalLengthMillimeters?: number[];
      uterineScarCount?: number[];
      weightGrams?: number[];
      weightKilograms?: number[];
      wingMaxMillimeters?: number[];
      wingMillimeters?: number[];
      wingMinMillimeters?: number[];
    };
    /**
     * According to German TRBA August 2015, which is more comprehensive than the EU or Finnish list for bacterial risk groups
     */
    microbiologicalRiskGroup?:
      | ""
      | "MY.microbiologicalRiskGroup1"
      | "MY.microbiologicalRiskGroup2"
      | "MY.microbiologicalRiskGroup3"
      | "MY.microbiologicalRiskGroup4";
    /**
     * Microscopic features and measurements, if not recorded separately into measurement fields.
     */
    microscopy?: string;
    movingDirection?:
      | ""
      | "MY.movingDirectionN"
      | "MY.movingDirectionNNE"
      | "MY.movingDirectionNE"
      | "MY.movingDirectionENE"
      | "MY.movingDirectionE"
      | "MY.movingDirectionESE"
      | "MY.movingDirectionSE"
      | "MY.movingDirectionSSE"
      | "MY.MovingDirectionS"
      | "MY.movingDirectionSSW"
      | "MY.movingDirectionSW"
      | "MY.movingDirectionWSW"
      | "MY.movingDirectionW"
      | "MY.movingDirectionWNW"
      | "MY.movingDirectionNW"
      | "MY.movingDirectionNNW";
    movingStatus?: string[];
    /**
     * Information on mutant microbial strain.
     */
    mutant?: string;
    nativeStatus?: "" | "MY.native" | "MY.nonNative";
    nestCount?: number;
    nestNotes?: string;
    nestType?:
      | ""
      | "MY.nestTypeTreeCavity"
      | "MY.nestTypeTwig"
      | "MY.nestTypeNestBox"
      | "MY.nestTypeBuilding"
      | "MY.nestTypeGroundCavity"
      | "MY.nestTypeOther";
    /**
     * Additional information to the data in each section.
     */
    notes?: string;
    pairCount?: number;
    pairCountOpinion?: number;
    plantLifeStage?:
      | ""
      | "MY.plantLifeStageSterile"
      | "MY.plantLifeStageFertile"
      | "MY.plantLifeStageSeed"
      | "MY.plantLifeStageSprout"
      | "MY.plantLifeStageBud"
      | "MY.plantLifeStageFlower"
      | "MY.plantLifeStageWitheredFlower"
      | "MY.plantLifeStageRipeningFruit"
      | "MY.plantLifeStageRipeFruit"
      | "MY.plantLifeStageDeadSprout"
      | "MY.plantLifeStageSubterranean"
      | "MY.plantLifeStageLivingPlant"
      | "MY.plantLifeStageDeadPlant";
    /**
     * Status code for the plant (wild, alien etc.)
     */
    plantStatusCode?:
      | ""
      | "MY.plantStatusCodeL"
      | "MY.plantStatusCodeA"
      | "MY.plantStatusCodeAV"
      | "MY.plantStatusCodeAOV"
      | "MY.plantStatusCodeAN"
      | "MY.plantStatusCodeANV"
      | "MY.plantStatusCodeANS"
      | "MY.plantStatusCodeT"
      | "MY.plantStatusCodeTV"
      | "MY.plantStatusCodeTOV"
      | "MY.plantStatusCodeTNV"
      | "MY.plantStatusCodeTNS"
      | "MY.plantStatusCodeV"
      | "MY.plantStatusCodeOV"
      | "MY.plantStatusCodeN"
      | "MY.plantStatusCodeNV"
      | "MY.plantStatusCodeNS"
      | "MY.plantStatusCodeE"
      | "MY.plantStatusCodeTE"
      | "MY.plantStatusCodeTVE"
      | "MY.plantStatusCodeTOVE"
      | "MY.plantStatusCodeTNVE"
      | "MY.plantStatusCodeTNSE"
      | "MY.plantStatusCodeTN"
      | "MY.plantStatusCodeTNE"
      | "MY.plantStatusCodeR"
      | "MY.plantStatusCodeC"
      | "MY.plantStatusCodeH"
      | "MY.plantStatusCodeG"
      | "MY.plantStatusCodeF";
    /**
     * Abundance of the taxon in the field
     */
    populationAbundance?: string;
    /**
     * Preparations/preparates made from the specimen, if not recorded as separate Preparations/samples in the designated section
     */
    preparations?: string;
    /**
     * Main method of preservation. If parts of the specimen are preserved in different ways, you can choose several methods.
     */
    preservation?: (
      | ""
      | "MY.preservationPressed"
      | "MY.preservationDry"
      | "MY.preservationCriticalPointDrying"
      | "MY.preservationPinned"
      | "MY.preservationGlued"
      | "MY.preservationLiquid"
      | "MY.preservationEthanol"
      | "MY.preservationEthanolPure"
      | "MY.preservationEthanol70"
      | "MY.preservationEthanol80"
      | "MY.preservationEthanol80Pure"
      | "MY.preservationEthanol96"
      | "MY.preservationEthanolDenatured"
      | "MY.preservationEthanolFormalin"
      | "MY.preservationEthanolExFormalin"
      | "MY.preservationFormalin"
      | "MY.preservationBouinSolution"
      | "MY.preservationPampelsFluid"
      | "MY.preservationGlycerol"
      | "MY.preservationParaffin"
      | "MY.preservationMercuricChloride"
      | "MY.preservationCryopreserved"
      | "MY.preservationFrozen"
      | "MY.preservationFrozenMinus80C"
      | "MY.preservationFreezeDried"
      | "MY.preservationGoldPlated"
      | "MY.preservationActiveCulture"
      | "MY.preservationLiving"
      | "MY.preservationSlide"
      | "MY.preservationSlideCanadaBalsam"
      | "MY.preservationSlideEuparal"
      | "MY.preservationSlidePolyviol"
      | "MY.preservationStuffed"
      | "MY.preservationCast"
      | "MY.preservationPlastinated"
      | "MY.preservationFrozenMinus80CAndEthanolMinus20C"
    )[];
    /**
     * Origin or source of the garden accession
     */
    provenance?:
      | ""
      | "MY.provenanceUnknown"
      | "MY.provenanceCultivated"
      | "MY.provenanceCultivatedUnsure"
      | "MY.provenanceCultivatedPropagatedFromWildSource"
      | "MY.provenanceWildSource"
      | "MY.provenanceWildSourceUnsure"
      | "MY.provenanceEscapedCultivated"
      | "MY.provenancePropagule";
    /**
     * Type of record, most commonly preserved specimen for museum specimens and observation for associated observations ("seuralaislajihavainto").
     */
    recordBasis?:
      | ""
      | "MY.recordBasisPreservedSpecimen"
      | "MY.recordBasisHumanObservation"
      | "MY.recordBasisHumanObservationSeen"
      | "MY.recordBasisHumanObservationHeard"
      | "MY.recordBasisHumanObservationHandled"
      | "MY.recordBasisHumanObservationPhoto"
      | "MY.recordBasisHumanObservationAudio"
      | "MY.recordBasisHumanObservationVideo"
      | "MY.recordBasisHumanObservationIndirect"
      | "MY.recordBasisMachineObservation"
      | "MY.recordBasisMachineObservationVideo"
      | "MY.recordBasisMachineObservationAudio"
      | "MY.recordBasisMachineObservationGeologger"
      | "MY.recordBasisMachineObservationSatelliteTransmitter"
      | "MY.recordBasisFossilSpecimen"
      | "MY.recordBasisSubfossilSpecimen"
      | "MY.recordBasisLivingSpecimen"
      | "MY.recordBasisMicrobialSpecimen"
      | "MY.recordBasisLiterature"
      | "MY.recordBasisMaterialSample"
      | "MY.recordBasisSubfossilSpecimenAmberInclusion";
    /**
     * What parts of the record are / have been in storage.
     */
    recordParts?: (
      | ""
      | "MY.recordPartsBones"
      | "MY.recordPartsAntler"
      | "MY.recordPartsHead"
      | "MY.recordPartsSkull"
      | "MY.recordPartsSkin"
      | "MY.recordPartsWing"
      | "MY.recordPartsTail"
      | "MY.recordPartsTissue"
      | "MY.recordPartsFeather"
      | "MY.recordPartsEgg"
      | "MY.recordPartsIntestine"
      | "MY.recordPartsGonad"
      | "MY.recordPartsSeed"
      | "MY.recordPartsNest"
      | "MY.recordPartsFaeces"
      | "MY.recordPartsFeedingMarks"
      | "MY.recordPartsTracks"
      | "MY.recordPartsScale"
      | "MY.recordPartsFin"
      | "MY.recordPartsFull"
      | "MY.recordPartsPart"
      | "MY.recordPartsActiveCulture"
      | "MY.recordPartsCutting"
      | "MY.recordPartsVegetativePart"
      | "MY.recordPartsFreezeDried"
      | "MY.recordPartsDryIce"
      | "MY.recordPartsDNA"
      | "MY.recordPartsShell"
      | "MY.recordPartsWholePlant"
      | "MY.recordPartsTissueCulture"
      | "MY.recordPartsMount"
      | "My.recordPartsSkullAndBones"
    )[];
    /**
     * Bird or bat ring number, code, colour code or such
     */
    ring?: string;
    /**
     * Main method for (usually intentional) sampling
     */
    samplingMethod?:
      | ""
      | "MY.samplingMethodLight"
      | "MY.samplingMethodLightTrap"
      | "MY.samplingMethodTrap"
      | "MY.samplingMethodMalaise"
      | "MY.samplingMethodPitfall"
      | "MY.samplingMethodWindowtrap"
      | "MY.samplingMethodYellowWindowTrap"
      | "MY.samplingMethodPantrap"
      | "MY.samplingMethodYellowpan"
      | "MY.samplingMethodYellowtrap"
      | "MY.samplingMethodFeromonetrap"
      | "MY.samplingMethodBaittrap"
      | "MY.samplingMethodBait"
      | "MY.samplingMethodNet"
      | "MY.samplingMethodSweeping"
      | "MY.samplingMethodCarnet"
      | "MY.samplingMethodMistnet"
      | "MY.samplingMethodBoard"
      | "MY.samplingMethodReared"
      | "MY.samplingMethodExovo"
      | "MY.samplingMethodElarva"
      | "MY.samplingMethodEpupa"
      | "MY.samplingMethodEclectortrap"
      | "MY.samplingMethodHand"
      | "MY.samplingMethodSifting"
      | "MY.samplingMethodSoilsample"
      | "MY.samplingMethodDropping"
      | "MY.samplingMethodWashing"
      | "MY.samplingMethodDigging"
      | "MY.samplingMethodDiving"
      | "MY.samplingMethodDrag"
      | "MY.samplingMethodTriangleDrag"
      | "MY.samplingMethodFishNet"
      | "MY.samplingMethodElectrofishing"
      | "MY.samplingMethodAngleFishing"
      | "MY.samplingMethodFishTrap"
      | "MY.samplingMethodSeine"
      | "MY.samplingMethodTrawling"
      | "MY.samplingMethodBeamTrawl"
      | "MY.samplingMethodDungTrap"
      | "MY.samplingMethodTrunkWindowTrap"
      | "MY.samplingMethodDiverInsectTrap"
      | "MY.samplingMethodAquaticEmergenceTrap"
      | "MY.samplingMethodWaterBucket"
      | "MY.samplingMethodTrampling"
      | "MY.samplingMethodWaterSieve"
      | "MY.samplingMethodOther";
    samplingMethodNotes?: string;
    /**
     * Maturity of the collected seeds, used for botanical garden accessions/seed bank.
     */
    seedMaturity?: "" | "MY.seedMaturityImmature" | "MY.seedMaturityMature" | "MY.seedMaturityMixed";
    /**
     * Seed morphology of the collected seeds, used for botanical garden accessions/seed bank.
     */
    seedMorphology?:
      | ""
      | "MY.seedMorphologyBent"
      | "MY.seedMorphologyBroad"
      | "MY.seedMorphologyCapitate"
      | "MY.seedMorphologyFolded"
      | "MY.seedMorphologyLateral"
      | "MY.seedMorphologyLinearFullyDeveloped"
      | "MY.seedMorphologyLinearUnderdeveloped"
      | "MY.seedMorphologyPeripheral"
      | "MY.seedMorphologyRudimentary"
      | "MY.seedMorphologySpatulateFullyDeveloped"
      | "MY.seedMorphologySpatulateUnderdeveloped"
      | "MY.seedMorphologyUndifferentiated";
    /**
     * Sex of the individual(s)
     */
    sex?: "" | "MY.sexM" | "MY.sexF" | "MY.sexW" | "MY.sexU" | "MY.sexN" | "MY.sexX" | "MY.sexE" | "MY.sexC";
    /**
     * E.g. how sex was determined, by whom and when.
     */
    sexNotes?: string;
    shortHandText?: string;
    smell?: "" | "MY.smellNotSmelled" | "MY.smellNoSmelled" | "MY.smellWeak" | "MY.smellModerate" | "MY.smellStrong";
    smellNotes?: string;
    stratigraphyVerbatim?: string;
    substrateClassification?:
      | ""
      | "MY.substrateGround"
      | "MY.substrateGroundLowShrubs"
      | "MY.substrateGroundLichens"
      | "MY.substrateGroundHerbs"
      | "MY.substrateGroundMosses"
      | "MY.substrateGroundSphagnum"
      | "MY.substrateGroundGrassy"
      | "MY.substrateGroundNeedleLitter"
      | "MY.substrateGroundLeafLitter"
      | "MY.substrateGroundMixedLitter"
      | "MY.substrateGroundSandySoil"
      | "MY.substrateGroundGravelSoil"
      | "MY.substrateGroundClayeySoil"
      | "MY.substrateGroundHeathHumus"
      | "MY.substrateGroundMull"
      | "MY.substrateGroundPeat"
      | "MY.substrateGroundBurnedSoil"
      | "MY.substrateLivingTree"
      | "MY.substrateLivingTreeTrunk"
      | "MY.substrateLivingTreeBase"
      | "MY.substrateLivingTreeRoots"
      | "MY.substrateLivingTreeBranch"
      | "MY.substrateLivingTreeDeadBranch"
      | "MY.substrateLivingTreeDeadLimb"
      | "MY.substrateLivingTreeLeaf"
      | "MY.substrateLivingTreeNeedle"
      | "MY.substrateDeadWood"
      | "MY.substrateDeadWoodStandingTreeTrunk"
      | "MY.substrateDeadWoodStandingTreeBranch"
      | "MY.substrateDeadWoodStandingTreeBase"
      | "MY.substrateDeadWoodFallenTreeTrunk"
      | "MY.substrateDeadWoodFallenTreeBranch"
      | "MY.substrateDeadWoodUpturnedRoots"
      | "MY.substrateDeadWoodDeadRoots"
      | "MY.substrateDeadWoodStump"
      | "MY.substrateDeadWoodFallenBranch"
      | "MY.substrateDeadWoodCone"
      | "MY.substrateDeadWoodTwigs"
      | "MY.substrateDeadWoodBark"
      | "MY.substrateDeadWoodSawdust"
      | "MY.substrateDeadWoodPieceOfWood"
      | "MY.substrateDeadWoodLoggingResidue"
      | "MY.substrateDeadWoodLog"
      | "MY.substrateDeadWoodDriftwood"
      | "MY.substrateDeadWoodConstructionWood"
      | "MY.substrateDung"
      | "MY.substrateCompost"
      | "MY.substrateLivingShoot"
      | "MY.substrateDeadShoot"
      | "MY.substrateLivingFungus"
      | "MY.substrateDeadFungus"
      | "MY.substrateLivingAnimal"
      | "MY.substrateDeadAnimal"
      | "MY.substrateRockSurface"
      | "MY.substrateDeadNeedle"
      | "MY.substrateDeadLeaf";
    substrateDecayStage?:
      | ""
      | "MY.substrateDecayStageEnum1"
      | "MY.substrateDecayStageEnum2"
      | "MY.substrateDecayStageEnum3"
      | "MY.substrateDecayStageEnum4"
      | "MY.substrateDecayStageEnum5";
    substrateNotes?: string;
    substrateSpecies?: string;
    substrateSpeciesID?: string;
    substrateSpeciesInformalNameString?: string;
    substrateTreeClassification?: (
      | ""
      | "MY.substrateTreeClassificationEnum1"
      | "MY.substrateTreeClassificationEnum2"
      | "MY.substrateTreeClassificationEnum3"
      | "MY.substrateTreeClassificationEnum4"
      | "MY.substrateTreeClassificationEnum5"
      | "MY.substrateTreeClassificationEnum6"
    )[];
    tailInMillimeters?: string[];
    taste?: "" | "MY.tasteNotTasted" | "MY.tasteNoTaste" | "MY.tasteWeak" | "MY.tasteModerate" | "MY.tasteStrong";
    tasteNotes?: string;
    taxonConfidence?: "" | "MY.taxonConfidenceSure" | "MY.taxonConfidenceUnsure" | "MY.taxonConfidenceSubspeciesUnsure";
    twitched?: boolean;
    unitFact?: {
      adultIndividualCount?: number;
      autocompleteSelectedTaxonID?: string;
      glowWormMicrohabitat?:
        | ""
        | "MY.glowWormMicrohabitatEnum1"
        | "MY.glowWormMicrohabitatEnum2"
        | "MY.glowWormMicrohabitatEnum3"
        | "MY.glowWormMicrohabitatEnum4"
        | "MY.glowWormMicrohabitatEnum5"
        | "MY.glowWormMicrohabitatEnum6"
        | "MY.glowWormMicrohabitatEnumOther";
      individualCountFlock?: number;
      individualCountInner?: number;
      individualCountOuter?: number;
      juvenileIndividualCount?: number;
      lineTransectObsType?:
        | ""
        | "MY.lineTransectObsTypeSong"
        | "MY.lineTransectObsTypeOtherSound"
        | "MY.lineTransectObsTypeSeen"
        | "MY.lineTransectObsTypeSeenMale"
        | "MY.lineTransectObsTypeSeenFemale"
        | "MY.lineTransectObsTypeFlyingOverhead"
        | "MY.lineTransectObsTypeFlock"
        | "MY.lineTransectObsTypeFlockFlyingOverhead"
        | "MY.lineTransectObsTypeSeenPair"
        | "MY.lineTransectObsTypeSeenBrood"
        | "MY.lineTransectObsTypeSeenNest"
        | "MY.lineTransectObsTypeUnknown";
      lineTransectRouteFieldType?: "" | "MY.lineTransectRouteFieldTypeInner" | "MY.lineTransectRouteFieldTypeOuter";
      lolifeDroppingsCount?: "" | "MY.lolifeDroppingsCount1" | "MY.lolifeDroppingsCount2" | "MY.lolifeDroppingsCount3";
      lolifeDroppingsQuality?: "" | "MY.lolifeDroppingsQuality1" | "MY.lolifeDroppingsQuality2";
      lolifeDroppingsType?:
        | ""
        | "MY.lolifeDroppingsTypeRock"
        | "MY.lolifeDroppingsTypeTree"
        | "MY.lolifeDroppingsTypeTreeGroup"
        | "MY.lolifeDroppingsTypeOther";
      lolifeNestTree?:
        | ""
        | "MX.38590"
        | "MX.37812"
        | "MX.37999"
        | "MX.37993"
        | "MX.38010"
        | "MX.38008"
        | "MY.lolifeNestTreeOther";
      pairCountInner?: number;
      pairCountOuter?: number;
      pointCountFlock?: string;
      runningWaterInVicinity?: boolean;
      waterbirdFemale?:
        | ""
        | "MY.waterbirdFemaleEnumYes"
        | "MY.waterbirdFemaleEnumNo"
        | "MY.waterbirdFemaleEnumLonelyPanicking";
      waterbirdJuvenileAgeClass?:
        | ""
        | "MY.waterbirdJuvenileAgeClassIa"
        | "MY.waterbirdJuvenileAgeClassIb"
        | "MY.waterbirdJuvenileAgeClassIc"
        | "MY.waterbirdJuvenileAgeClassIIa"
        | "MY.waterbirdJuvenileAgeClassIIb"
        | "MY.waterbirdJuvenileAgeClassIIc"
        | "MY.waterbirdJuvenileAgeClassIIIa"
        | "MY.waterbirdJuvenileAgeClassUnknown";
      waterbirdJuvenileCountAccurate?: boolean;
      waterbirdObserverOpinionSelectedCensus?: boolean;
      waterbirdPairCountOpinionReasoning?:
        | ""
        | "MY.waterbirdPairCountOpinionReasoningEnum1"
        | "MY.waterbirdPairCountOpinionReasoningEnum2"
        | "MY.waterbirdPairCountOpinionReasoningEnum3"
        | "MY.waterbirdPairCountOpinionReasoningEnumOther";
      individualCountBiotopeA?: number;
      individualCountBiotopeB?: number;
      individualCountBiotopeC?: number;
      individualCountBiotopeD?: number;
      individualCountBiotopeE?: number;
      individualCountBiotopeF?: number;
      individualCountBiotopeG?: number;
      individualCountBiotopeH?: number;
    };
    unitGathering?: {
      id?: string;
      "@type"?: string;
      "@context"?: string;
      dateBegin?: string;
      dateEnd?: string;
      geometry?: {
        [k: string]: unknown | undefined;
      };
      /**
       * Informal description of the habitat.
       */
      habitatDescription?: string;
      habitatIUCN?: string;
      /**
       * Type of substrate or name of substrate species.
       */
      substrate?: string;
    };
    unitType?: string[];
    weightInGrams?: string[];
    wild?: "" | "MY.wildWild" | "MY.wildUnknown" | "MY.wildNonWild";
    wingInMillimeters?: string[];
    audio?: string[];
    images?: string[];
    /**
     * PUBLIC: all data can be published; PROTECTED: exact locality is hidden (100*100km square); PRIVATE: most of the data is hidden. Empty value means same as public.
     */
    publicityRestrictions?:
      | ""
      | "MZ.publicityRestrictionsPublic"
      | "MZ.publicityRestrictionsProtected"
      | "MZ.publicityRestrictionsPrivate";
    identifications?: {
      id?: string;
      "@type"?: string;
      "@context"?: string;
      "herbo:sortOrder"?: number;
      /**
       * Write associated observation taxa names here, separated by a semicolon (;). E.g.: "Betula pendula; Betula pubescens; Poaceae". These will form their own units of the type observation.
       */
      associatedObservationTaxa?: string;
      /**
       * Author for the taxon
       */
      author?: string;
      /**
       * Name of the identifier (person) preferably in format "lastname, firstname"
       */
      det?: string;
      /**
       * Date or year when the identification was done, preferably in format "d.m.Y" or  "Y"
       */
      detDate?: string;
      detMethod?: "" | "MY.detMethodFreshSample" | "MY.detMethodMicroscopy" | "MY.detMethodPhoto";
      /**
       * Name of the identifier and date of identification in original format (e.g. from the label), errors and all
       */
      detVerbatim?: string;
      /**
       * Additional qualifier or specifier at genus level (e.g. aff., cf.)
       */
      genusQualifier?: string;
      identificationBasis?: (
        | ""
        | "MY.identificationBasisSeen"
        | "MY.identificationBasisHeard"
        | "MY.identificationBasisHandled"
        | "MY.identificationBasisMedia"
        | "MY.identificationBasisFreshSpecimen"
        | "MY.identificationBasisPreservedSpecimen"
        | "MY.identificationBasisMicroscope"
        | "MY.identificationBasisSpores"
        | "MY.identificationBasisChemical"
        | "MY.identificationBasisGenitals"
        | "MY.identificationBasisGenitalPreparate"
        | "MY.identificationBasisDNA"
      )[];
      /**
       * Additional information on the identification, basis or such
       */
      identificationNotes?: string;
      /**
       * Author for the taxon below species level/infra epithet
       */
      infraAuthor?: string;
      /**
       * Taxon name for the epithet below species level
       */
      infraEpithet?: string;
      /**
       * Taxonomic level of the epithet below species level
       */
      infraRank?:
        | ""
        | "MY.infraRankSsp"
        | "MY.infraRankVar"
        | "MY.infraRankBeta"
        | "MY.infraRankB"
        | "MY.infraRankForma"
        | "MY.infraRankHybrid"
        | "MY.infraRankAnamorph"
        | "MY.infraRankAggregate"
        | "MY.infraRankAberration"
        | "MY.infraRankCultivar"
        | "MY.infraRankMorpha"
        | "MY.infraRankUnknown"
        | "MY.infraRankNothosubspecies"
        | "MY.infraRankCultivarGroup";
      /**
       * Pathovars, serovars and other infrasubspecific subdivisions of microbes.
       */
      infrasubspecificSubdivision?: string;
      /**
       * Which parent or larger collection this is part of.
       */
      isPartOf?: string;
      isTaxonGroup?: boolean;
      /**
       * This can be used to select one of the identifications as 'recommended', which is the used as default when displaying information about the specimen.
       */
      preferredIdentification?: string;
      /**
       * Publication reference for the taxon concept, that was used in identification
       */
      sec?: string;
      /**
       * Additional qualifier at species level (e.g. aff., cf., sp. n., coll.)
       */
      speciesQualifier?: string;
      /**
       * Taxon name
       */
      taxon?: string;
      /**
       * ID for the taxon if has some other than an MX code
       */
      taxonID?: string;
      /**
       * Taxonomic level for the identification
       */
      taxonRank?:
        | ""
        | "MX.superdomain"
        | "MX.domain"
        | "MX.kingdom"
        | "MX.subkingdom"
        | "MX.infrakingdom"
        | "MX.superphylum"
        | "MX.phylum"
        | "MX.subphylum"
        | "MX.infraphylum"
        | "MX.superdivision"
        | "MX.division"
        | "MX.subdivision"
        | "MX.infradivision"
        | "MX.superclass"
        | "MX.class"
        | "MX.subclass"
        | "MX.infraclass"
        | "MX.parvclass"
        | "MX.superorder"
        | "MX.order"
        | "MX.suborder"
        | "MX.infraorder"
        | "MX.parvorder"
        | "MX.superfamily"
        | "MX.family"
        | "MX.subfamily"
        | "MX.tribe"
        | "MX.subtribe"
        | "MX.supergenus"
        | "MX.genus"
        | "MX.nothogenus"
        | "MX.subgenus"
        | "MX.section"
        | "MX.subsection"
        | "MX.series"
        | "MX.subseries"
        | "MX.infragenericTaxon"
        | "MX.aggregate"
        | "MX.speciesAggregate"
        | "MX.species"
        | "MX.nothospecies"
        | "MX.infraspecificTaxon"
        | "MX.subspecificAggregate"
        | "MX.subspecies"
        | "MX.nothosubspecies"
        | "MX.variety"
        | "MX.subvariety"
        | "MX.form"
        | "MX.subform"
        | "MX.hybrid"
        | "MX.anamorph"
        | "MX.ecotype"
        | "MX.populationGroup"
        | "MX.intergenericHybrid"
        | "MX.infragenericHybrid"
        | "MX.cultivar"
        | "MX.group"
        | "MX.grex";
      taxonSpecifier?: string;
      taxonURI?: string;
      /**
       * Taxon name in original format (e.g. from the label), errors and all
       */
      taxonVerbatim?: string;
      /**
       * PUBLIC: all data can be published; PROTECTED: exact locality is hidden (100*100km square); PRIVATE: most of the data is hidden. Empty value means same as public.
       */
      publicityRestrictions?:
        | ""
        | "MZ.publicityRestrictionsPublic"
        | "MZ.publicityRestrictionsProtected"
        | "MZ.publicityRestrictionsPrivate";
      sortOrder?: number;
    }[];
    typeSpecimens?: {
      id?: string;
      "@type"?: string;
      "@context"?: string;
      /**
       * Which parent or larger collection this is part of.
       */
      isPartOf?: string;
      /**
       * Author of the type species
       */
      typeAuthor?: string;
      /**
       * Publication reference for original description or basionyme
       */
      typeBasionymePubl?: string;
      /**
       * Additional information on the type
       */
      typeNotes?: string;
      /**
       * Publication reference for type publication
       */
      typePubl?: string;
      /**
       * ID for the type series, if part of one
       */
      typeSeriesID?: string;
      /**
       * Name of the type species
       */
      typeSpecies?: string;
      /**
       * Is this holotype, paratype, syntype etc...
       */
      typeStatus?:
        | ""
        | "MY.typeStatusType"
        | "MY.typeStatusHolotype"
        | "MY.typeStatusSyntype"
        | "MY.typeStatusParatype"
        | "MY.typeStatusLectotype"
        | "MY.typeStatusParalectotype"
        | "MY.typeStatusNeotype"
        | "MY.typeStatusAllotype"
        | "MY.typeStatusNeoallotype"
        | "MY.typeStatusIsotype"
        | "MY.typeStatusEpitype"
        | "MY.typeStatusIsolectotype"
        | "MY.typeStatusIsoepitype"
        | "MY.typeStatusIsoneotype"
        | "MY.typeStatusIsoparatype"
        | "MY.typeStatusIsosyntype"
        | "MY.typeStatusOriginalMaterial"
        | "MY.typeStatusCotype"
        | "MY.typeStatusTopotype"
        | "MY.typeStatusHomotype"
        | "MY.typeStatusNo"
        | "MY.typeStatusPossible"
        | "MY.typeStatusObscure"
        | "MY.typeStatusTypeStrain"
        | "MY.typeStatusPathovarReferenceStrain";
      /**
       * Name of the type subspecies
       */
      typeSubspecies?: string;
      /**
       * Author of the type subspecies
       */
      typeSubspeciesAuthor?: string;
      /**
       * Verification whether this really is a type?
       */
      typeVerification?:
        | ""
        | "MY.typeVerificationVerified"
        | "MY.typeVerificationUnverified"
        | "MY.typeVerificationProbable"
        | "MY.typeVerificationDoubtful";
      /**
       * Name of the person who chose the type, preferably in the format "Lastname, firstname"
       */
      typif?: string;
      /**
       * Date when the specimen was chosen as a type
       */
      typifDate?: string;
      /**
       * PUBLIC: all data can be published; PROTECTED: exact locality is hidden (100*100km square); PRIVATE: most of the data is hidden. Empty value means same as public.
       */
      publicityRestrictions?:
        | ""
        | "MZ.publicityRestrictionsPublic"
        | "MZ.publicityRestrictionsProtected"
        | "MZ.publicityRestrictionsPrivate";
    }[];
  }[];
}
