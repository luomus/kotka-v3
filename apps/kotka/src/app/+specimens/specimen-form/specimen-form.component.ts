import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, computed, effect, Inject,
  signal, Signal, untracked, ViewChild
} from '@angular/core';
import { KotkaDocumentObjectType, Document as KotkaDocument, Gathering} from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent } from '@kotka/ui/form-view';
import { FormViewComponent } from '@kotka/ui/form-view';
import {
  DialogService,
  UserService
} from '@kotka/ui/services';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { DOCUMENT, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  getRequiredFields,
  formDataItemsAreEqual,
  LajiFormComponent,
  LajiFormFieldChooserService, FormMediaMetadata
} from '@kotka/ui/laji-form';
import { LocalStorageService } from 'ngx-webstorage';
import { isEqual, invert } from 'lodash';
import { convertCoordinatesToWGS84, parseJSONPointer } from '@kotka/shared/utils';
import { MYCoordinateSystems } from '@luomus/laji-schema';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { SpecimenFormNavComponent } from '../specimen-form-nav/specimen-form-nav';
import {
SpecimenDataType as DataType,
SpecimenUrlDataType as UrlDataType,
specimenDataTypeToNameMap as dataTypeToNameMap,
specimenUrlToDataTypeMap as urlToDataTypeMap,
} from '@kotka/shared/models';

interface PointCoordinates {
  latitude: string;
  longitude: string;
}

interface PointCoordinatesWithSystem extends PointCoordinates {
  coordinateSystem: MYCoordinateSystems;
}

type FormData = KotkaDocument | Partial<KotkaDocument> | undefined;

const defaultAdvancedFields = [
  '/publicityRestrictions','/legID','/additionalIDs','/dataSource','/publication','/separatedFrom','/separatedTo','/duplicatesIn','/acquiredFrom','/acquisitionDate','/exsiccatum','/preservation','/URL','/language',
  '/gatherings/coordinateRadius','/gatherings/alt','/gatherings/depth','/gatherings/AFEQuadrat','/gatherings/UTMQuadrat', '/gatherings/units/coordinateNotes',
  '/gatherings/substrate','/gatherings/localityID','/gatherings/localityDescription','/gatherings/habitatDescription','/gatherings/habitatClassification','/gatherings/notes',
  '/gatherings/units/sex','/gatherings/units/age','/gatherings/units/count','/gatherings/units/populationAbundance', '/gatherings/units/DBH','/gatherings/units/decayStage',
  '/gatherings/units/chemistry','/gatherings/units/microscopy','/gatherings/units/macroscopy','/gatherings/units/ring','/gatherings/units/preparations','/gatherings/units/notes',
  '/gatherings/units/identifications/genusQualifier','/gatherings/units/identifications/speciesQualifier','/gatherings/units/identifications/taxonID','/gatherings/units/identifications/identificationNotes'
];

@Component({
  selector: 'kotka-specimen-form',
  templateUrl: './specimen-form.component.html',
  styleUrls: ['./specimen-form.component.scss'],
  imports: [
    FormViewComponent,
    NgTemplateOutlet,
    NgClass,
    SpecimenFormNavComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenFormComponent extends FormViewContainerComponent<KotkaDocumentObjectType.specimen> {
  formId = globals.specimenFormId;
  formDataType: KotkaDocumentObjectType.specimen =
    KotkaDocumentObjectType.specimen;

  dataType: Signal<DataType | undefined>;
  title: Signal<string>;
  prefilledFormData: Signal<Partial<KotkaDocument> | undefined>;
  mediaMetadata: Signal<FormMediaMetadata>;

  markAdvancedFieldsActive: Signal<boolean>;
  advancedFields = signal<string[] | undefined>([]);
  showOnlyBasicFields = signal(true);
  hiddenFields: Signal<string[] | undefined>;
  additionalClassNames: Signal<Record<string, string>>;

  markUnreliableFieldsActive: Signal<boolean>;

  lastPressedMarkFieldsBtnType = signal<'advancedFields' | 'unreliableFields'>(
    'advancedFields',
  );

  lajiForm?: LajiFormComponent;
  formData = signal<FormData>(undefined);
  prevFormData = signal<FormData>(undefined);

  @ViewChild(FormViewComponent, { static: true })
  formView!: FormViewComponent<KotkaDocumentObjectType.specimen>;

  private formDataDataType: Signal<string | undefined>;
  private unreliableFields: Signal<string[]>;
  private coordinates: Signal<PointCoordinatesWithSystem | undefined>;
  private mapCoordinates: Signal<PointCoordinates | undefined>;

  private arrayFieldsToMonitorForDeletions: Signal<string[]>;

  private showOnlyBasicFieldsStorageKey = signal<string | undefined>(undefined);
  private advancedFieldsStorageKey = signal<string | undefined>(undefined);

  constructor(
    dialogService: DialogService,
    activeRoute: ActivatedRoute,
    router: Router,
    cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    private userService: UserService,
    private lajiFormFieldChooserService: LajiFormFieldChooserService,
    private storage: LocalStorageService
  ) {
    super(dialogService, activeRoute, router, cdr);

    this.dataType = toSignal(
      this.activeRoute.paramMap.pipe(
        map((paramMap) => this.getDataTypeFromParamMap(paramMap)),
      ),
    );

    this.title = computed(() =>
      this.getTitle(this.dataType(), this.editMode(), this.dataURI()),
    );

    this.prefilledFormData = computed(
      (): Partial<KotkaDocument> => ({
        datatype: this.dataType(),
        gatherings: [{ units: [{}] }],
      }),
    );

    this.mediaMetadata = computed(() => ({
      documentURI: this.dataURI() ? [this.dataURI()] : undefined,
      intellectualRights: 'MZ.intellectualRightsCC-BY-SA-4.0',
      intellectualOwner: 'Luomus',
      publicityRestrictions: 'MZ.publicityRestrictionsPublic'
    }));

    this.markAdvancedFieldsActive = computed(
      () =>
        this.lastPressedMarkFieldsBtnType() === 'advancedFields' &&
        this.lajiFormFieldChooserService.isActive(),
    );

    this.markUnreliableFieldsActive = computed(
      () =>
        this.lastPressedMarkFieldsBtnType() === 'unreliableFields' &&
        this.lajiFormFieldChooserService.isActive(),
    );

    this.hiddenFields = computed(() =>
      this.showOnlyBasicFields() && !this.markAdvancedFieldsActive()
        ? this.advancedFields()
        : [],
    );

    this.additionalClassNames = computed(() => (
      this.markUnreliableFieldsActive()
        ? {}
        : this.unreliableFields().reduce((result, field) => {
          result[field] = 'unreliable-field';
          return result;
        }, {} as Record<string, string>)
    ));

    this.formDataDataType = computed(() => this.formData()?.datatype);
    // @ts-ignore TODO remove after specimen schema changes (remove ts-ignore)
    this.unreliableFields = computed(() => this.formData()?.unreliableFields || [], {equal: isEqual});
    this.coordinates = computed(() => this.getCoordinates(this.formData()), {equal: isEqual});
    this.mapCoordinates = computed(() => this.getMapCoordinates(this.formData()), {equal: isEqual});

    this.arrayFieldsToMonitorForDeletions = computed(() => this.getArrayFieldsToMonitorForDeletions(this.unreliableFields()));

    this.initEffects();
  }

  initEffects() {
    this.userService.getCurrentLoggedInUser().subscribe((user) => {
      const showOnlyBasicFieldsKey = `specimen-form-${user.id}-show-only-basic-fields`;
      const advancedFieldsKey = `specimen-form-${user.id}-advanced-fields`;

      this.showOnlyBasicFieldsStorageKey.set(showOnlyBasicFieldsKey);
      this.showOnlyBasicFields.set(
        this.storage.retrieve(showOnlyBasicFieldsKey) ?? true,
      );

      this.advancedFieldsStorageKey.set(advancedFieldsKey);
      this.advancedFields.set(
        this.storage.retrieve(advancedFieldsKey) ?? defaultAdvancedFields,
      );
    });

    effect(() => {
      const key = this.showOnlyBasicFieldsStorageKey();
      if (key) {
        this.storage.store(key, this.showOnlyBasicFields());
      }
    });

    effect(() => {
      const key = this.advancedFieldsStorageKey();
      if (key) {
        this.storage.store(key, this.advancedFields());
      }
    });

    effect(() => {
      if (this.formDataDataType() && this.dataType() !== this.formDataDataType()) {
        const urlDataType = this.getUrlDataTypeFromDataType(this.formDataDataType()!);
        this.router.navigate(
          [urlDataType, 'specimens', this.editMode() ? 'edit' : 'add'],
          { replaceUrl: true, queryParamsHandling: 'preserve' },
        );
      }
    });

    effect(() => {
      this.onCoordinatesChange(this.coordinates(), untracked(this.mapCoordinates), untracked(this.formData));
    });

    effect(() => {
      this.onMapCoordinatesChange(this.mapCoordinates(), untracked(this.coordinates), untracked(this.formData));
    });

    effect(() => {
      if (!this.arrayFieldsToMonitorForDeletions().length) {
        return;
      }
      this.updateUnreliableFieldsAfterFormDataChange(
        untracked(this.unreliableFields),
        this.arrayFieldsToMonitorForDeletions(),
        this.formData(),
        untracked(this.prevFormData)
      );
    });
  }

  onFormInit(lajiForm: LajiFormComponent) {
    this.lajiForm = lajiForm;
  }

  onFormDataChange(formData: FormData) {
    this.prevFormData.set(this.formData());
    this.formData.set(formData);
  }

  toggleMarkAdvancedFields() {
    this.lastPressedMarkFieldsBtnType.set('advancedFields');

    if (!this.lajiForm) {
      return;
    }

    if (this.markAdvancedFieldsActive()) {
      this.advancedFields.set(
        this.lajiFormFieldChooserService.stopFieldChooser(),
      );
    } else {
      const schema = this.lajiForm.form()?.schema;
      if (!schema) {
        throw new Error('Form is undefined');
      }

      this.lajiFormFieldChooserService.startFieldChooser(this.lajiForm, {
        selected: this.advancedFields(),
        ignoreFieldsOfType: ['objectArray'],
        unselectableFields: getRequiredFields(schema),
        unselectableFieldsErrorMsg:
          'Can\'t mark required field as advanced field!',
      });
    }
  }

  toggleMarkUnreliableFields() {
    this.lastPressedMarkFieldsBtnType.set('unreliableFields');

    if (!this.lajiForm) {
      return;
    }

    if (this.markUnreliableFieldsActive()) {
      const unreliableFields = this.lajiFormFieldChooserService.stopFieldChooser();
      // @ts-ignore TODO remove after specimen schema changes (remove ts-ignore)
      this.formView.setFormData({...this.formData(), unreliableFields});
    } else {
      const schema = this.lajiForm.form()?.schema;
      if (!schema) {
        throw new Error('Form is undefined');
      }

      this.lajiFormFieldChooserService.startFieldChooser(this.lajiForm, {
        selected: this.unreliableFields(),
        mode: 'jsonPointerSelect',
        ignoreFieldsOfType: ['array', 'object'],
        colorTheme: 'orange',
        unselectableFields: ['/namespaceID', '/objectID'].concat(getRequiredFields(schema)),
        unselectableFieldsErrorMsg:
          'This field can\'t be marked as unreliable!',
      });
    }
  }

  toggleShowOnlyBasicFields() {
    this.showOnlyBasicFields.update((value) => !value);
  }

  expandAll() {
    this.formView.lajiForm?.openAllMultiActiveArrays();
  }

  collapseAll() {
    this.formView.lajiForm?.closeAllMultiActiveArrays();
  }

  scrollToId(id: string) {
    this.document.getElementById(id)?.scrollIntoView();
  }

  scrollToField(field: string) {
    this.formView.lajiForm?.focusField(field);
  }

  override onCopyData(formData: Partial<KotkaDocument>) {
    if (!formData.datatype) {
      throw new Error('Missing a datatype');
    }

    const urlDataType = this.getUrlDataTypeFromDataType(formData.datatype);

    from(
      this.router.navigate([urlDataType, 'specimens', 'add'], {
        state: { routeReuseStrategy: 'urlMatch' },
      }),
    ).subscribe(() => {
      this.copyData.set(formData);
      this.cdr.markForCheck();
    });
  }

  private getDataTypeFromParamMap(paramMap: ParamMap): DataType | undefined {
    const urlDataType = paramMap.get('specimenDataType') || '';

    if (Object.keys(urlToDataTypeMap).includes(urlDataType)) {
      return urlToDataTypeMap[urlDataType as UrlDataType];
    }

    return undefined;
  }

  private getUrlDataTypeFromDataType(dataType: string): UrlDataType {
    const dataTypeToUrlMap = invert(urlToDataTypeMap);

    if (!Object.keys(dataTypeToUrlMap).includes(dataType)) {
      throw new Error('Invalid datatype');
    }

    return dataTypeToUrlMap[dataType] as UrlDataType;
  }

  private getTitle(
    dataType?: DataType,
    editMode?: boolean,
    dataURI?: string,
  ): string {
    const dataTypeName = dataType
      ? dataTypeToNameMap[dataType] + ' specimen'
      : 'specimen';
    if (!editMode) {
      return 'Create new ' + dataTypeName;
    } else {
      return 'Edit ' + dataTypeName + (dataURI ? ' ' + dataURI : '');
    }
  }

  private getCoordinates(formData: FormData): PointCoordinatesWithSystem | undefined {
    const gathering = formData?.gatherings?.[0];
    if (
      gathering?.latitude !== undefined &&
      gathering?.longitude !== undefined &&
      gathering?.coordinateSystem
    ) {
      return  {
        latitude: gathering.latitude,
        longitude: gathering.longitude,
        coordinateSystem: gathering.coordinateSystem,
      };
    }

    return undefined;
  }

  private getMapCoordinates(formData: FormData): PointCoordinates | undefined {
    const gathering = formData?.gatherings?.[0];
    if (
      gathering?.wgs84Latitude !== undefined &&
      gathering?.wgs84Longitude !== undefined
    ) {
      return  {
        latitude: gathering.wgs84Latitude,
        longitude: gathering.wgs84Longitude,
      };
    }

    return undefined;
  }

  private getArrayFieldsToMonitorForDeletions(unreliableFields: string[]): string[] {
    const result: string[] = [];

    unreliableFields.forEach(field => {
      let path: string | undefined = field;
      const re = /(.*)\/\d+.*/;

      while (path) {
        path = path.match(re)?.[1];
        if (path && !result.includes(path)) {
          result.push(path);
        }
      }
    });

    return result;
  }

  private onCoordinatesChange(coordinates: PointCoordinatesWithSystem | undefined, currentMapCoordinates: PointCoordinates | undefined, formData: FormData) {
    if (coordinates) {
      const { latitude, longitude, coordinateSystem } = coordinates;
      const result = convertCoordinatesToWGS84(
        latitude,
        longitude,
        coordinateSystem,
      );

      let mapCoordinates: PointCoordinates | undefined = undefined;
      if (result) {
        mapCoordinates = {
          latitude: '' + result[0],
          longitude: '' + result[1],
        };
      }

      if (!isEqual(mapCoordinates, currentMapCoordinates)) {
        this.updateGatheringData(formData, {
          wgs84Latitude: mapCoordinates?.latitude,
          wgs84Longitude: mapCoordinates?.longitude,
        });
      }
    }
  }

  private onMapCoordinatesChange(mapCoordinates: PointCoordinates | undefined, currentCoordinates: PointCoordinatesWithSystem | undefined, formData: FormData) {
    if (mapCoordinates) {
      const coordinates: PointCoordinatesWithSystem = {
        latitude: mapCoordinates.latitude,
        longitude: mapCoordinates.longitude,
        coordinateSystem: 'MY.coordinateSystemWgs84',
      };

      const converted = currentCoordinates ? convertCoordinatesToWGS84(currentCoordinates.latitude, currentCoordinates.longitude, currentCoordinates.coordinateSystem) : undefined;

      if (coordinates.latitude !== '' + converted?.[0] || coordinates.longitude !== '' + converted?.[1]) {
        this.updateGatheringData(formData, coordinates);
      }
    }
  }

  private updateUnreliableFieldsAfterFormDataChange(unreliableFields: string[], arrayFieldsToMonitor: string[], formData: FormData, prevFormData: FormData) {
    let newUnreliableFields = unreliableFields;
    let hasChanges = false;

    arrayFieldsToMonitor.forEach(field => {
      const array: any[] | undefined = parseJSONPointer(formData || {}, field);
      if (!array?.length) {
        newUnreliableFields = this.getUnreliableFieldsAfterArrayDeletion(newUnreliableFields, field);
        hasChanges = true;
      } else {
        const prevArray: any[] | undefined = parseJSONPointer(prevFormData || {}, field);
        if (prevArray && (array.length < prevArray.length)) {
          newUnreliableFields = this.getUnreliableFieldsAfterArrayItemDeletion(newUnreliableFields, field, array, prevArray);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      // @ts-ignore TODO remove after specimen schema changes (remove ts-ignore)
      this.formView.setFormData({...formData, unreliableFields: newUnreliableFields});
    }
  }

  private getUnreliableFieldsAfterArrayDeletion(unreliableFields: string[], arrayField: string): string[] {
    return unreliableFields.filter(f => !f.startsWith(arrayField + '/'));
  }

  private getUnreliableFieldsAfterArrayItemDeletion(unreliableFields: string[], arrayField: string, array: any[], prevArray: any[]): string[] {
    const result: string[] = [];

    // it is not always possible to determine which field has been removed (with string arrays for example), in that case remove all possible fields from unreliable fields
    let possibleDeletedIndex = prevArray.length - 1;
    for (let i = 0; i < array.length; i++) {
      if (!formDataItemsAreEqual(prevArray[i], array[i])) {
        possibleDeletedIndex = i;
        break;
      }
    }

    const otherPossibleDeletedIndexes: number[] = [];
    for (let i = possibleDeletedIndex - 1; i >= 0; i--) {
      if (formDataItemsAreEqual(prevArray[i], prevArray[possibleDeletedIndex])) {
        otherPossibleDeletedIndexes.push(i);
      } else {
        break;
      }
    }

    unreliableFields.forEach(field => {
      const startPath = arrayField + '/';
      if (field.startsWith(startPath)) {
        const [idxString, ...parts] = field.replace(startPath, '').split('/');
        const idx = parseInt(idxString, 10);
        if (idx === possibleDeletedIndex || otherPossibleDeletedIndexes.includes(idx)) {
          return;
        } else if (idx > possibleDeletedIndex) {
          field = startPath + (idx - 1) + parts.join('/');
        }
      }
      result.push(field);
    });

    return result;
  }

  private updateGatheringData(formData: FormData, updateObject: Partial<Gathering>) {
    const [first, ...rest] = formData?.gatherings || [];
    const gathering = { ...(first || {}), ...updateObject };
    const gatherings: [Gathering, ...Gathering[]] = [gathering, ...rest];

    this.formView.setFormData({
      ...(formData || {}),
      gatherings,
    });
  }
}
