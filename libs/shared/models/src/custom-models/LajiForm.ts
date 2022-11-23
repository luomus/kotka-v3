/**
 * Form interface
 */
import { Document } from '../models/Document';
import { Annotation } from '../models/Annotation';

export namespace LajiForm {
  export enum PrintType {
    lineTransect = 'MHL.printTypeLineTransect',
  }
  export enum ViewerType {
    lineTransect = 'MHL.viewerTypeLineTransect',
    birdPointCount = 'MHL.viewerTypeBirdPointCount',
  }
  export enum ResultServiceType {
    lineTransect = 'MHL.resultServiceTypeLineTransect',
    winterbirdCount = 'MHL.resultServiceTypeWinterBirdCount',
    nafi = 'MHL.resultServiceTypeNafi',
    sykeInsect = 'MHL.resultServiceTypeSykeInsectProjects'
  }
  export enum RestrictAccess {
    restrictAccessStrict = 'MHL.restrictAccessStrict',
    restrictAccessLoose = 'MHL.restrictAccessLoose'
  }
  export interface List {
    id: string;
    title: string;
    shortTitle: string;
    description: string;
    shortDescription?: string;
    supportedLanguage: string[];
    logo?: string;
    category?: string;
    collectionID?: string;
    baseFormID?: string;
    options: ListOptions;
  }

  export interface IEnum {
    enum: string[];
    enumNames: string[];
  }

  export interface IAnnotationMap {
    [targetID: string]: Annotation[];
  }

  export interface IUISchemaContext {
    defaultPersonsResponsible?: string;
    creator?: string;
    municipalityEnum?: IEnum;
    biogeographicalProvinceEnum?: IEnum;
    annotations?: IAnnotationMap;
    isAdmin?: boolean;
    isEdit?: boolean;
    placeholderGeometry?: any;
  }

  interface ListOptions {
    prepopulateWithInformalTaxonGroups?: string[];
    emptyOnNoCount?: boolean;
    allowExcel?: boolean;
    excludeFromGlobalExcel?: boolean;
    allowTemplate?: boolean;
    forms?: string[];
    secondaryCopy?: boolean;
    sidebarFormLabel?: string;
    useNamedPlaces?: boolean;
    restrictAccess?: RestrictAccess;
    hasAdmins?: boolean;
    dataset?: boolean;
    viewerType?: ViewerType;
    disabled?: boolean;
  }

  export interface FormOptions extends ListOptions {
    documentsViewableForAll?: boolean;
    adminLockable?: boolean;
    warnEditingOldDocument?: boolean;
    mobile?: boolean;
    saveSuccessMessage?: string;
    saveDraftSuccessMessage?: string;
    saveErrorMessage?: string;
    season?: {
      start: string;
      end: string;
    };
    disableRequestDescription?: boolean;
    warnEditingOldDocumentDuration?: string;
    ownSubmissionsColumns?: string[];
    ownSubmissionsActions?: string[];
    prepopulatedDocument?: Document;
    instructions?: {
      en?: string;
      fi?: string;
      sv?: string;
    };
    about?: {
      en?: string;
      fi?: string;
      sv?: string;
    };
    saveLabel?: string;
    cancelLabel?: string;
    draftLabel?: string;
    editLabel?: string;
    hideSaveButton?: boolean;
    hideCancelButton?: boolean;
    hideDraftButton?: boolean;
    printType?: PrintType;
    resultServiceType?: ResultServiceType;
    footer?: {
      footerDescription?: string;
      footerLogos?: {
        [imageURL: string]: string;
      };
    };
    formPermissionDescription?: string;
    formOwnSubmissionsLabel?: string;
    hideTES?: boolean;
    ownSubmissionsTitle?: string;
    ownSubmissionsAdminTitle?: string;
    shortTitleFromCollectionName?: boolean;
    displayOwnSubmissions?: boolean;
    simple?: boolean;
    namedPlaceOptions?: {
      copyLatestDocumentToNamedPlace?: boolean;
      filterByMunicipality?: boolean;
      filterByBirdAssociationArea?: boolean;
      filterByTags?: boolean;
      allowAddingPublic?: boolean;
      namedPlaceFormID?: string;
      useLabel?: string;
      createNewButtonLabel?: string;
      createNewButtonPrependingTextLabel?: string;
      includeUnits?: boolean;
      startWithMap?: boolean;
      hideMapTab?: boolean;
      zoomToData: boolean;
      mapTileLayerName: string;
      mapOverlayNames: string[];
      listLabel?: string;
      listColumnNameMapping?: {[key: string]: string};
      printLabel?: string;
      reservationUntil?: string;
      showLegendList?: boolean;
      infoFields?: string[];
      headerFields?: string[];
      documentListUseLocalDocumentViewer?: string;
      documentViewerGatheringGeometryJSONPath?: string | string[];
      documentViewerForcedFields?: string[];
      listColumns?: string[];
      prepopulatedDocumentFields?: any;
      lastCensusLabel?: string;
      reservedLabel?: string;
      reservableLabel?: string;
      releaseLabel?: string;
      adminShowCopyLink?: boolean;
      earlierLabel?: string;
      myEarlierLabel?: string;
      editDescription?: string;
      createDescription?: string;
      chooseDescription?: string;
      birdAssociationAreaHelp?: string;
      documentViewerZoomToData?: boolean;
      listColumnsMultisort?: boolean;
      mapCluster?: boolean;
    };
  }

  export interface SchemaForm extends List {
    options: FormOptions;
    schema: any;
    uiSchema: any;
    uiSchemaContext?: IUISchemaContext;
    excludeFromCopy?: string[];
    language?: string;
    attributes?: {[key: string]: string};
    validators?: any;
    warnings?: any;
  }

  export interface JsonForm extends List {
    options: FormOptions;
    uiSchema: any;
    fields: any[];
  }
}
