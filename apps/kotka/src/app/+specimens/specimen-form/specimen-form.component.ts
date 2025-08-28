import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, computed, effect, Inject,
  signal, Signal, ViewChild
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
  LajiFormComponent,
  LajiFormFieldChooserService
} from '@kotka/ui/laji-form';
import { LocalStorageService } from 'ngx-webstorage';
import { isEqual, invert } from 'lodash';
import { convertCoordinatesToWGS84 } from '@kotka/shared/utils';
import { MYCoordinateSystems } from '@luomus/laji-schema';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { SpecimenFormNavComponent } from '../specimen-form-nav/specimen-form-nav';

type UrlDataType = 'botany'|'zoo'|'palaeontology'|'accession'|'culture';

type DataType = 'botanyspecimen'|'zoospecimen'|'palaeontology'|'accession'|'culture';

interface PointCoordinates {
  latitude: string;
  longitude: string;
}

interface PointCoordinatesWithSystem extends PointCoordinates {
  coordinateSystem: MYCoordinateSystems;
}

const urlToDataTypeMap: Record<UrlDataType, DataType> = {
  botany: 'botanyspecimen',
  zoo: 'zoospecimen',
  palaeontology: 'palaeontology',
  accession: 'accession',
  culture: 'culture',
};

const dataTypeToNameMap: Record<DataType, string> = {
  botanyspecimen: 'botany',
  zoospecimen: 'zoo',
  palaeontology: 'palaeontology',
  accession: 'accession',
  culture: 'culture',
};

const classFields = [
  '/gatherings',
  '/gatherings/units',
  '/gatherings/units/identifications',
  '/gatherings/units/typeSpecimens',
  '/gatherings/units/samples'
];

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

  markAdvancedFieldsActive: Signal<boolean>;
  advancedFields = signal<string[] | undefined>([]);
  showOnlyBasicFields = signal(true);
  hiddenFields: Signal<string[] | undefined>;

  markUnreliableFieldsActive: Signal<boolean>;
  unreliableFieldPointers = signal<string[] | undefined>([]);

  lastPressedMarkFieldsBtnType = signal<'advancedFields' | 'unreliableFields'>(
    'advancedFields',
  );

  lajiForm?: LajiFormComponent;
  formData?: KotkaDocument | Partial<KotkaDocument>;

  @ViewChild(FormViewComponent, { static: true })
  formView!: FormViewComponent<KotkaDocumentObjectType.specimen>;

  private coordinates?: PointCoordinatesWithSystem;
  private mapCoordinates?: PointCoordinates;

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
      (): Partial<KotkaDocument> | undefined => ({
        datatype: this.dataType(),
        gatherings: [{ units: [{}] }],
      }),
    );

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
  }

  onFormInit(lajiForm: LajiFormComponent) {
    this.lajiForm = lajiForm;
  }

  onFormDataChange(formData?: Partial<KotkaDocument>) {
    this.formData = formData;

    if (formData?.datatype && this.dataType() !== formData.datatype) {
      const urlDataType = this.getUrlDataTypeFromDataType(formData.datatype);
      this.router.navigate(
        [urlDataType, 'specimens', this.editMode() ? 'edit' : 'add'],
        { replaceUrl: true, queryParamsHandling: 'preserve' },
      );
    }

    const gathering = formData?.gatherings?.[0];
    this.checkGatheringCoordinates(gathering);
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
      const schema = this.lajiForm.form?.schema;
      if (!schema) {
        throw new Error('Form is undefined');
      }

      this.lajiFormFieldChooserService.startFieldChooser(this.lajiForm, {
        selected: this.advancedFields(),
        ignoreFields: classFields,
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
      this.unreliableFieldPointers.set(
        this.lajiFormFieldChooserService.stopFieldChooser(),
      );
    } else {
      this.lajiFormFieldChooserService.startFieldChooser(this.lajiForm, {
        mode: 'jsonPointerSelect',
        ignoreFields: classFields,
        colorTheme: 'yellow',
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

  private checkGatheringCoordinates(gathering?: Gathering) {
    let newCoordinates: PointCoordinatesWithSystem | undefined = undefined;

    if (
      gathering?.latitude !== undefined &&
      gathering?.longitude !== undefined &&
      gathering?.coordinateSystem
    ) {
      newCoordinates = {
        latitude: gathering.latitude,
        longitude: gathering.longitude,
        coordinateSystem: gathering.coordinateSystem,
      };
    }

    if (!isEqual(newCoordinates, this.coordinates)) {
      this.coordinates = newCoordinates;

      if (this.coordinates) {
        const { latitude, longitude, coordinateSystem } = this.coordinates;
        const result = convertCoordinatesToWGS84(
          latitude,
          longitude,
          coordinateSystem,
        );

        if (result) {
          this.mapCoordinates = {
            latitude: '' + result[0],
            longitude: '' + result[1],
          };
          this.updateGatheringData({
            wgs84Latitude: this.mapCoordinates.latitude,
            wgs84Longitude: this.mapCoordinates.longitude,
          });
        } else {
          this.mapCoordinates = undefined;
          this.updateGatheringData({
            wgs84Latitude: undefined,
            wgs84Longitude: undefined,
          });
        }
      }
    } else {
      let newMapCoordinates: PointCoordinates | undefined = undefined;

      if (
        gathering?.wgs84Latitude !== undefined &&
        gathering?.wgs84Longitude !== undefined
      ) {
        newMapCoordinates = {
          latitude: gathering.wgs84Latitude,
          longitude: gathering.wgs84Longitude,
        };
      }

      if (!isEqual(newMapCoordinates, this.mapCoordinates)) {
        this.mapCoordinates = newMapCoordinates;

        if (this.mapCoordinates) {
          this.coordinates = {
            latitude: this.mapCoordinates.latitude,
            longitude: this.mapCoordinates.longitude,
            coordinateSystem: 'MY.coordinateSystemWgs84',
          };
          this.updateGatheringData(this.coordinates);
        }
      }
    }
  }

  private updateGatheringData(updateObject: Partial<Gathering>) {
    const [first, ...rest] = this.formData?.gatherings || [];
    const gathering = { ...(first || {}), ...updateObject };
    const gatherings: [Gathering, ...Gathering[]] = [gathering, ...rest];
    const formData: Partial<KotkaDocument> = {
      ...(this.formData || {}),
      gatherings,
    };

    this.formView.setFormData(formData);
  }
}
