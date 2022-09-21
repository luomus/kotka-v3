/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface FormNamedPlaceOptions {
  "@context"?: string;
  id?: string;
  "@type"?: string;
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
}
