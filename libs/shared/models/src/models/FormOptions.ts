/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface FormOptions {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  about?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Form admin can lock documents. Locked documents can't be edited
   */
  adminLockable?: boolean;
  /**
   * Form users can create new named places for the form
   */
  allowAddingPublicNamedPlaces?: boolean;
  /**
   * Allows usage in spreadsheet upload component
   */
  allowExcel?: boolean;
  /**
   * Allows creating templates from documents
   */
  allowTemplate?: boolean;
  /**
   * Label for the cancel button at the form footer
   */
  cancelLabel?: string;
  /**
   * The latest document is copied to named place's prepopulatedDocument. if documents date is same or after the current prepopulated document's date, or if prepopulated document doesn't have date. Date is checked from gatheringEvent or from gatherings
   */
  copyLatestDocumentToNamedPlace?: boolean;
  /**
   * Has dataset about page
   */
  dataset?: boolean;
  /**
   * Theme form introduction page doesn't show description for the form permission request button
   */
  disableRequestDescription?: boolean;
  /**
   * Prevent sending documents & named places
   */
  disabled?: boolean;
  /**
   * Only if has named places. All documents for admin
   */
  displayOwnSubmissions?: boolean;
  /**
   * The users can see all the documents with the form's collection ID instead of just their own
   */
  documentsViewableForAll?: boolean;
  /**
   * Label for the draft button at the form footer
   */
  draftLabel?: string;
  editLabel?: string;
  /**
   * Units without count aren't considered in laji.fi viewer (including document viewers and datatables)
   */
  emptyOnNoCount?: boolean;
  /**
   * Excludes from the Vihko excel tools
   */
  excludeFromGlobalExcel?: boolean;
  /**
   * The named place UI allows filtering by bird association area
   */
  filterNamedPlacesByBirdAssociationArea?: boolean;
  /**
   * The named place UI allows filtering by municipality
   */
  filterNamedPlacesByMunicipality?: boolean;
  /**
   * The named place UI allows filtering by tags
   */
  filterNamedPlacesByTags?: boolean;
  /**
   * Options for footer of the observation form
   */
  footer?: {
    /**
     * Text to show for footer
     */
    footerDescription?: string;
    /**
     * Key is an image URI, value is the URI of the page clicking the image opens
     */
    footerLogos?: {
      [k: string]: unknown | undefined;
    };
  };
  /**
   * Label for the own submissions list at the header of document form
   */
  formOwnSubmissionsLabel?: string;
  /**
   * Shown at form permission intro page. Allows HTML
   */
  formPermissionDescription?: string;
  forms?: string[];
  /**
   * The form has administrators. Administrators can handle user access permissions and admin roles for all forms with the collectionID of the form.
   */
  hasAdmins?: boolean;
  /**
   * Hides the cancel button at form footer
   */
  hideCancelButton?: boolean;
  hideDraftButton?: boolean;
  /**
   * Hides the save/edit button at form footer
   */
  hideSaveButton?: boolean;
  /**
   * Terms of Service is hidden at the header of observation form
   */
  hideTES?: boolean;
  /**
   * Hides the draft button at form footer
   */
  hideTempButton?: boolean;
  instructions?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Form UI has a greeting page for convenient mobile usage
   */
  mobile?: boolean;
  namedPlaceOptions?: {
    /**
     * Named place viewer shows button to copy the URL for the named place viewer
     */
    adminShowCopyLink?: boolean;
    /**
     * Form users can create new named places for the form
     */
    allowAddingPublic?: boolean;
    /**
     * Help text for bird association filter
     */
    birdAssociationAreaHelp?: string;
    /**
     * Description shown at named place choose page. Allows HTML.
     */
    chooseDescription?: string;
    /**
     * The latest document is copied to named place's prepopulatedDocument. if documents date is same or after the current prepopulated document's date, or if prepopulated document doesn't have date. Date is checked from gatheringEvent or from gatherings
     */
    copyLatestDocumentToNamedPlace?: boolean;
    /**
     * Description shown above named place form when creating new named place. Allows HTML.
     */
    createDescription?: string;
    /**
     * Label for new named place creation button at named place choose page
     */
    createNewButtonLabel?: string;
    /**
     * Label for text before new named place creation button at named place choose page
     */
    createNewButtonPrependingTextLabel?: string;
    /**
     * Theme own submissions page uses local document viewer (that shows more accurate data)
     */
    documentListUseLocalDocumentViewer?: boolean;
    /**
     * Forces local document viewer to show these fields
     */
    documentViewerForcedFields?: string[];
    /**
     * The path of geometry that document viewer should show
     */
    documentViewerGatheringGeometryJSONPath?: string[];
    /**
     * Document viewer zooms to data instead of locked zoom level
     */
    documentViewerZoomToData?: boolean;
    /**
     * Admin label for named place viewer's document list
     */
    earlierLabel?: string;
    /**
     * Description shown at top of page when editing named place
     */
    editDescription?: string;
    /**
     * The named place UI allows filtering by bird association area
     */
    filterByBirdAssociationArea?: boolean;
    /**
     * The named place UI allows filtering by municipality
     */
    filterByMunicipality?: boolean;
    /**
     * The named place UI allows filtering by tags
     */
    filterByTags?: boolean;
    /**
     * When recording a document for a named place, the named place's data of these fields will be shown at the top of the page (defaults to ["alternativeIDs", "name", "municipality"]
     */
    headerFields?: string[];
    /**
     * On named place chooser view, map tab is hidden
     */
    hideMapTab?: boolean;
    /**
     * Named places will be fetched with units included (hard coded to work only for HR.2049)
     */
    includeUnits?: boolean;
    /**
     * Fields that named place viewer shows (if not defined will be digged from uiSchema["ui:options"].fieldsScopes[form collectionID])
     */
    infoFields?: string[];
    /**
     * Label for named place viewer last census
     */
    lastCensusLabel?: string;
    /**
     * Overrides labels for named place list column headers
     */
    listColumnNameMapping?: {
      [k: string]: string | undefined;
    };
    /**
     * List of columns visible in the list view
     */
    listColumns?: string[];
    listColumnsMultisort?: boolean;
    /**
     * Label for named place chooser list tab
     */
    listLabel?: string;
    mapCluster?: boolean;
    /**
     * Overlays that named place chooser map should show
     */
    mapOverlayNames?: string[];
    /**
     * Tilelayer name that named place chooser map should show
     */
    mapTileLayerName?: string;
    /**
     * User label for named place viewer's document list
     */
    myEarlierLabel?: string;
    /**
     * Form ID of named place form (defaults to MHL.36)
     */
    namedPlaceFormID?: string;
    /**
     * Fields that named places list shows.
     */
    namedPlaceList?: string[];
    /**
     * When a new named place is created, the prepopulatedDocument will be populated according to this.
     */
    prepopulatedDocumentFields?: {
      [k: string]: unknown | undefined;
    };
    /**
     * Label for print button of named place viewer
     */
    printLabel?: string;
    releaseLabel?: string;
    reservableLabel?: string;
    /**
     * Places are reservable if defined. Value defines when the reservation should expire in ISO-8601. Example: ${year}-10-12
     */
    reservationUntil?: string;
    reservedLabel?: string;
    /**
     * Named place list shows legend for the row colors
     */
    showLegendList?: boolean;
    /**
     * Named place chooser view starts with map tab instead of list
     */
    startWithMap?: boolean;
    /**
     * Instead of populating observation form with prepopulatedDocument, it is populated with acceptedDocument. Admin can change the acceptedDocument from observation list
     */
    useAcceptedDocument?: boolean;
    /**
     * Named place viewer label for button for recording new observation
     */
    useLabel?: string;
    /**
     * Named place chooser map is initialized with data fitted in view.
     */
    zoomToData?: boolean;
  };
  /**
   * The title label for theme form sidebar
   */
  navigationTitle?: string;
  /**
   * Available actions for own submissions (only on the own submissions page). Defaults to ['edit', 'view', 'download', 'stats', 'delete']
   */
  ownSubmissionsActions?: string[];
  /**
   * Shown at sidebar link and title of all submissions page
   */
  ownSubmissionsAdminTitle?: string;
  /**
   * Columns for own submissions (only on the own submissions page). Defaults to ['dateEdited', 'dateObserved', 'taxon', 'namedPlaceName', 'observer', 'id']
   */
  ownSubmissionsColumns?: string[];
  /**
   * Shown at sidebar link and title of all submissions page
   */
  ownSubmissionsTitle?: string;
  /**
   * Periods that the "NoExistingGatheringsInNamedPlace" validation uses
   */
  periods?: string[];
  prepopulateWithInformalTaxonGroups?: string[];
  /**
   * Initial document data
   */
  prepopulatedDocument?: {
    id?: string;
    "@type"?: string;
    "@context"?: string;
    /**
     * Secure level (salaus-/karkeistustaso) for the data
     */
    secureLevel?:
      | ""
      | "MX.secureLevelNone"
      | "MX.secureLevelKM1"
      | "MX.secureLevelKM5"
      | "MX.secureLevelKM10"
      | "MX.secureLevelKM25"
      | "MX.secureLevelKM50"
      | "MX.secureLevelKM100"
      | "MX.secureLevelHighest"
      | "MX.secureLevelNoShow";
    /**
     * Leave empty if no sample taken, or if the sample is recorded separately
     */
    DNASampleLocation?: string;
    /**
     * IPEN Number for the accession
     */
    IPEN?: string;
    /**
     * URL where more information is available about the specimen
     */
    URL?: string;
    acknowledgedWarnings?: {
      [k: string]: unknown | undefined;
    }[];
    /**
     * From who/where the specimen was acquired (if not recorded as a transaction)
     */
    acquiredFrom?: string;
    /**
     * Organization where the accession was acquired from. If the organization is not on the list, add it first.
     */
    acquiredFromOrganization?: string;
    /**
     * Date (d.m.yyyy) or year (yyyy) on which the specimen was acquired to the collection. Empty means an old specimen acquired on an unknown date.
     */
    acquisitionDate?: string;
    /**
     * Other identifiers this specimen has, in format 'type:identifier'. For example: 'mzhtypes:123' (old MAZ-type number)
     */
    additionalIDs?: string[];
    /**
     * BOLD identifier, usually BOLD Sample ID. You can include additonal comment by separating them with colon, e.g. "AY123456:comments here"
     */
    bold?: string[];
    caption?: string;
    /**
     * Clad book id number or such
     */
    cladBookID?: string;
    /**
     * Clad specimen id: usually color description and a number
     */
    cladSpecimenID?: string;
    /**
     * Verbatim specimen data from clad book
     */
    cladVerbatim?: string;
    /**
     * The collection which this specimen belongs to
     */
    collectionID?: string;
    /**
     * Notes on the defects of the specimen (missing parts or such). Empty value means same as "good" or "hyvä" - that there is nothing special to mention about the condition.
     */
    condition?: string;
    /**
     * Annuality/perenniality or other specialities about cultivation in our conditions.
     */
    cultivationInformation?: string;
    dataOrigin?: ("" | "MY.dataOriginPaperForm" | "MY.dataOriginWebForm" | "MY.dataOriginSpreadsheetFile")[];
    /**
     * Where the data about this specimen is from, in addition to labels. Eg. Field notes, expedition journals.
     */
    dataSource?: string;
    /**
     * The dataset(s) this specimen belongs to
     */
    datasetID?: string[];
    datatype?: string;
    deviceID?: string;
    /**
     * Location of the specimen so that museum personnel can find it. E.g. taxon under which it is stored (if not clear from the identification), or shelf number
     */
    documentLocation?: string;
    /**
     * Description where duplicates (specimens of the same individual) are located or have been sent to and by which ID's.
     */
    duplicatesIn?: string;
    /**
     * Reason for this edit or notes about it.
     */
    editNotes?: string;
    editor?: string;
    /**
     * Date the data was first transcribed into electronic format or paper registry
     */
    entered?: string;
    /**
     * Free-text diary-style information about what has been done to the specimen and when.
     */
    event?: string[];
    /**
     * Name of the exsiccatum this specimen belongs to and possible exsiccatum number.
     */
    exsiccatum?: string;
    /**
     * Id of the form that was used for the document
     */
    formID?: string;
    gatheringEvent?: {
      id?: string;
      "@type"?: string;
      "@context"?: string;
      acknowledgeNoUnitsInCensus?: boolean;
      artificialLight?:
        | ""
        | "MY.artificialLightEnum1"
        | "MY.artificialLightEnum2"
        | "MY.artificialLightEnum3"
        | "MY.artificialLightEnum4"
        | "MY.artificialLightEnum5";
      breaksDuringCensusInMinutes?: number;
      censusHinderedByEnviromentalFactors?: boolean;
      censusHinderedByFog?: boolean;
      censusHinderedByRain?: boolean;
      censusHinderedByWind?: boolean;
      censusPrematurelyAborted?: boolean;
      cloudCover?:
        | ""
        | "MY.cloudCoverOktaEnumUnknown"
        | "MY.cloudCoverOktaEnum0"
        | "MY.cloudCoverOktaEnum1"
        | "MY.cloudCoverOktaEnum2"
        | "MY.cloudCoverOktaEnum3"
        | "MY.cloudCoverOktaEnum4"
        | "MY.cloudCoverOktaEnum5"
        | "MY.cloudCoverOktaEnum6"
        | "MY.cloudCoverOktaEnum7"
        | "MY.cloudCoverOktaEnum8";
      cloudCoverEnd?:
        | ""
        | "MY.cloudCoverOktaEnumUnknown"
        | "MY.cloudCoverOktaEnum0"
        | "MY.cloudCoverOktaEnum1"
        | "MY.cloudCoverOktaEnum2"
        | "MY.cloudCoverOktaEnum3"
        | "MY.cloudCoverOktaEnum4"
        | "MY.cloudCoverOktaEnum5"
        | "MY.cloudCoverOktaEnum6"
        | "MY.cloudCoverOktaEnum7"
        | "MY.cloudCoverOktaEnum8";
      cloudCoverStart?:
        | ""
        | "MY.cloudCoverOktaEnumUnknown"
        | "MY.cloudCoverOktaEnum0"
        | "MY.cloudCoverOktaEnum1"
        | "MY.cloudCoverOktaEnum2"
        | "MY.cloudCoverOktaEnum3"
        | "MY.cloudCoverOktaEnum4"
        | "MY.cloudCoverOktaEnum5"
        | "MY.cloudCoverOktaEnum6"
        | "MY.cloudCoverOktaEnum7"
        | "MY.cloudCoverOktaEnum8";
      completeList?: {
        completeListTaxonID?: string;
        completeListType?:
          | ""
          | "MY.completeListTypeCompleteWithBreedingStatus"
          | "MY.completeListTypeComplete"
          | "MY.completeListTypeIncomplete";
      };
      dateBegin?: string;
      dateEnd?: string;
      gatheringFact?: {
        batCollector?:
          | ""
          | "MY.batCollectorAlone"
          | "MY.batCollectorWithProjectGroupMember"
          | "MY.batCollectorSomeoneElse";
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
      geometry?: {
        [k: string]: unknown | undefined;
      };
      gpsUsed?: boolean;
      /**
       * Name of the collector(s), in format 'Lastname, Firstname; Lastname Firstname'
       */
      leg?: string[];
      legPublic?: boolean;
      /**
       * Alkuperäislähteen käyttäjätunnus
       */
      legUserID?: string[];
      namedPlaceNotes?: string;
      /**
       * Additional information to the data in each section.
       */
      notes?: string;
      rainIntensity?:
        | ""
        | "MY.rainIntensityEnumNoRain"
        | "MY.rainIntensityEnumLightRain"
        | "MY.rainIntensityEnumModerateRain"
        | "MY.rainIntensityEnumHeavyRain"
        | "MY.rainIntensityEnumTorrentialRain";
      routeDirectionAdhered?: boolean;
      spottingScopeUsed?: boolean;
      startDistanceFromNECorner?: string;
      startPointDeviation?: number;
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
      temperatureEnd?: number;
      temperatureStart?: number;
      timeEnd?: string;
      timeStart?: string;
    };
    /**
     * Genbank identifier. You can include additonal comment by separating them with colon, e.g. "AY123456:comments here"
     */
    genbank?: string[];
    hasGathering?: string[];
    isTemplate?: boolean;
    keywords?: string[];
    /**
     * All text from labels word-for-word, including spelling errors. Separate each label on its own row, starting from topmost label.
     */
    labelsVerbatim?: string;
    /**
     * Language the data is (mainly) written in, if applicable.
     */
    language?: string;
    /**
     * Collector's identifier (field identifier, keruunumero) for the specimen
     */
    legID?: string;
    locked?: boolean;
    namedPlaceID?: string;
    /**
     * Additional information to the data in each section.
     */
    notes?: string;
    /**
     * Original catalogue number or other  original identifier of the specimen. E.g. H9000000
     */
    originalSpecimenID?: string;
    /**
     * Garden area where this accession is planned to be located.
     */
    plannedLocation?: string;
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
     * Location of the primary data if not Kotka.
     */
    primaryDataLocation?: string;
    /**
     * Notes shown within the system for users signed in but not shown publicly anywhere. Use only for notes that absolutely need to be hidden from public view.
     */
    privateNotes?: string;
    /**
     * Publication references or doi's that refer to this specimen
     */
    publication?: string[];
    /**
     * Relationship to another taxon OR specimen. Choose relationship type as prefix and give taxon name or specimen identifier thereafter, e.g. "parasite: Parasiticus specius" OR "host:http://tun.fi/JAA.123"
     */
    relationship?: string[];
    /**
     * The history of the specimen, for example how it was acquired or in which museums it has been before.
     */
    sampleHistory?: string;
    /**
     * ID of the specimen from which this has been separated
     */
    separatedFrom?: string;
    /**
     * ID's of those new specimens that have been separated from this specimen
     */
    separatedTo?: string[];
    serialNumber?: string;
    sourceID?: string;
    /**
     * Empty value means same as "ok" - that there is not anything special about the status of the specimen.
     */
    status?:
      | ""
      | "MY.statusOk"
      | "MY.statusMissing"
      | "MY.statusUnrecoverable"
      | "MY.statusLost"
      | "MY.statusDonated"
      | "MY.statusDeposited"
      | "MY.statusDeaccessioned"
      | "MY.statusDiscarded"
      | "MY.statusSpent"
      | "MY.statusDestroyed"
      | "MY.statusUndefined"
      | "MY.statusAxenic"
      | "MY.statusNonAxenic"
      | "MY.statusNotAvailable"
      | "MY.statusDead"
      | "MY.statusNoVoucherRetained";
    temp?: boolean;
    templateDescription?: string;
    templateName?: string;
    /**
     * Additional information regarding the data entry or transcription process, e.g. unclarities, explanations for interpretations,
     */
    transcriberNotes?: string;
    /**
     * Common name of agreement concerning the transfer, if any.
     */
    transferAgreement?: string;
    /**
     * List of those fields that contain unreliable data. The list is created automatically.
     */
    unreliableFields?: string;
    /**
     * Information about the quality of the specimen data. Possible to select several. Empty value means same as OK.
     */
    verificationStatus?: (
      | ""
      | "MY.verificationStatusOk"
      | "MY.verificationStatusVerify"
      | "MY.verificationStatusComplete"
      | "MY.verificationStatusGeoreference"
      | "MY.verificationStatusDet"
      | "MY.verificationStatusCheckID"
      | "MY.verificationStatusVerifyCoordinates"
    )[];
    /**
     * Identifier of the herbarium voucher specimen or information about it if the identifier is unknown.
     */
    voucherSpecimenID?: string;
    creator?: string;
    dateCreated?: string;
    dateEdited?: string;
    editors?: string[];
    images?: string[];
    /**
     * Team or organisation that owns the record and can edit it.
     */
    owner?: string;
    /**
     * PUBLIC: all data can be published; PROTECTED: exact locality is hidden (100*100km square); PRIVATE: most of the data is hidden. Empty value means same as public.
     */
    publicityRestrictions?:
      | ""
      | "MZ.publicityRestrictionsPublic"
      | "MZ.publicityRestrictionsProtected"
      | "MZ.publicityRestrictionsPrivate";
    scheduledForDeletion?: boolean;
    gatherings: [
      {
        id?: string;
        "@type"?: string;
        "@context"?: string;
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
          batCollector?:
            | ""
            | "MY.batCollectorAlone"
            | "MY.batCollectorWithProjectGroupMember"
            | "MY.batCollectorSomeoneElse";
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
          smell?:
            | ""
            | "MY.smellNotSmelled"
            | "MY.smellNoSmelled"
            | "MY.smellWeak"
            | "MY.smellModerate"
            | "MY.smellStrong";
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
          taxonConfidence?:
            | ""
            | "MY.taxonConfidenceSure"
            | "MY.taxonConfidenceUnsure"
            | "MY.taxonConfidenceSubspeciesUnsure";
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
            lineTransectRouteFieldType?:
              | ""
              | "MY.lineTransectRouteFieldTypeInner"
              | "MY.lineTransectRouteFieldTypeOuter";
            lolifeDroppingsCount?:
              | ""
              | "MY.lolifeDroppingsCount1"
              | "MY.lolifeDroppingsCount2"
              | "MY.lolifeDroppingsCount3";
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
      },
      ...{
        id?: string;
        "@type"?: string;
        "@context"?: string;
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
          batCollector?:
            | ""
            | "MY.batCollectorAlone"
            | "MY.batCollectorWithProjectGroupMember"
            | "MY.batCollectorSomeoneElse";
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
          smell?:
            | ""
            | "MY.smellNotSmelled"
            | "MY.smellNoSmelled"
            | "MY.smellWeak"
            | "MY.smellModerate"
            | "MY.smellStrong";
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
          taxonConfidence?:
            | ""
            | "MY.taxonConfidenceSure"
            | "MY.taxonConfidenceUnsure"
            | "MY.taxonConfidenceSubspeciesUnsure";
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
            lineTransectRouteFieldType?:
              | ""
              | "MY.lineTransectRouteFieldTypeInner"
              | "MY.lineTransectRouteFieldTypeOuter";
            lolifeDroppingsCount?:
              | ""
              | "MY.lolifeDroppingsCount1"
              | "MY.lolifeDroppingsCount2"
              | "MY.lolifeDroppingsCount3";
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
      }[]
    ];
  };
  printType?: "" | "MHL.printTypeLineTransect";
  /**
   * Users need to have permission to access the form
   */
  restrictAccess?: "" | "MHL.restrictAccessStrict" | "MHL.restrictAccessLoose";
  resultServiceType?:
    | ""
    | "MHL.resultServiceTypeLineTransect"
    | "MHL.resultServiceTypeNafi"
    | "MHL.resultServiceTypeBirdPointCount"
    | "MHL.resultServiceTypeWinterBirdCount"
    | "MHL.resultServiceTypeSykeInsectProjects";
  /**
   * Message shown when document save failed
   */
  saveErrorMessage?: string;
  /**
   * Label for the save button at the form footer
   */
  saveLabel?: string;
  /**
   * Message shown when document was successfully saved
   */
  saveSuccessMessage?: string;
  /**
   * Message shown when document draft was successfully saved
   */
  saveTempSuccessMessage?: string;
  /**
   * Named places page shows the places as done if they have observation inside the season
   */
  season?: {
    /**
     * End of season
     */
    end?: string;
    /**
     * Start of season
     */
    start?: string;
  };
  /**
   * Makes the documents reported with the form secondary
   */
  secondaryCopy?: boolean;
  /**
   * Overrides MHL.shortTitle usage
   */
  shortTitleFromCollectionName?: boolean;
  /**
   * Sub forms are shown only if they have this property
   */
  sidebarFormLabel?: string;
  /**
   * Has only a form page, no sidebar
   */
  simple?: boolean;
  /**
   * Documents can't have data not defined in form fields.
   */
  strict?: boolean;
  /**
   * Label for the draft button at the form footer
   */
  tempLabel?: string;
  /**
   * Makes the form use named places
   */
  useNamedPlaces?: boolean;
  viewerType?: "" | "MHL.viewerTypeLineTransect" | "MHL.viewerTypeBirdPointCount";
  warnEditingOldDocument?: boolean;
  /**
   * Duration in ISO 8601 duration format. Defaults to P1W (one week)
   */
  warnEditingOldDocumentDuration?: boolean;
}
