import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, computed, effect,
  OnDestroy,
  OnInit, signal, Signal, ViewChild
} from '@angular/core';
import { KotkaDocumentObjectType, Document, Gathering } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent } from '@kotka/ui/form-view';
import { FormViewComponent } from '@kotka/ui/form-view';
import {
  DialogService,
  navigationEnd$,
  UserService,
} from '@kotka/ui/services';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  getRequiredFields,
  LajiFormComponent,
  LajiFormFieldChooserService
} from '@kotka/ui/laji-form';
import { LocalStorageService } from 'ngx-webstorage';
import { isEqual } from 'lodash-es';
import { convertCoordinatesToWGS84 } from '@kotka/shared/utils';
import { MYCoordinateSystems } from '@luomus/laji-schema';

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
  imports: [FormViewComponent, NgTemplateOutlet, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenFormComponent
  extends FormViewContainerComponent
  implements OnInit, OnDestroy
{
  formId = globals.specimenFormId;
  dataType: KotkaDocumentObjectType.specimen = KotkaDocumentObjectType.specimen;

  prefilledFormData?: Partial<Document>;

  markAdvancedFieldsActive: Signal<boolean>;
  advancedFields = signal<string[]|undefined>([]);
  showOnlyBasicFields = signal(true);
  hiddenFields: Signal<string[]|undefined>;

  markUnreliableFieldsActive: Signal<boolean>;
  unreliableFieldPointers = signal<string[]|undefined>([]);

  lastPressedMarkFieldsBtnType = signal<'advancedFields'|'unreliableFields'>('advancedFields');

  lajiForm?: LajiFormComponent;

  @ViewChild(FormViewComponent, { static: true }) formView!: FormViewComponent<KotkaDocumentObjectType.specimen>;

  private formData?: Document | Partial<Document>;
  private coordinates?: PointCoordinatesWithSystem;
  private mapCoordinates?: PointCoordinates;

  private advancedFieldsStorageKey= signal<string|undefined>(undefined);
  private routerSub?: Subscription;

  constructor(
    dialogService: DialogService,
    private userService: UserService,
    private router: Router,
    private lajiFormFieldChooserService: LajiFormFieldChooserService,
    private storage: LocalStorageService,
    private cdr: ChangeDetectorRef,
  ) {
    super(dialogService);

    this.prefilledFormData = this.getPrefilledFormDataFromCurrentUrl();

    this.markAdvancedFieldsActive = computed(() =>
      this.lastPressedMarkFieldsBtnType() === 'advancedFields' && this.lajiFormFieldChooserService.isActive()
    );

    this.markUnreliableFieldsActive = computed(() =>
      this.lastPressedMarkFieldsBtnType() === 'unreliableFields' && this.lajiFormFieldChooserService.isActive()
    );

    this.hiddenFields = computed(() =>
      this.showOnlyBasicFields() && !this.markAdvancedFieldsActive()
        ? this.advancedFields()
        : [],
    );

    this.userService.getCurrentLoggedInUser().pipe(
      map(user => `${this.dataType}-form-${user.id}-advanced-fields`)
    ).subscribe(key => {
      this.advancedFieldsStorageKey.set(key);
      this.advancedFields.set(this.storage.retrieve(key) || defaultAdvancedFields);
    });

    effect(() => {
      const key = this.advancedFieldsStorageKey();
      if (key) {
        this.storage.store(key, this.advancedFields());
      }
    });
  }

  ngOnInit() {
    this.routerSub = navigationEnd$(this.router).subscribe(() => {
      this.prefilledFormData = this.getPrefilledFormDataFromCurrentUrl();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  onFormInit(lajiForm: LajiFormComponent) {
    this.lajiForm = lajiForm;
  }

  onFormDataChange(formData?: Partial<Document>) {
    this.formData = formData;

    const gathering = formData?.gatherings?.[0];

    if (gathering) {
      this.checkGatheringCoordinates(gathering);
    }
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

      this.lajiFormFieldChooserService.startFieldChooser(
        this.lajiForm,
        {
          selected: this.advancedFields(),
          ignoreFields: classFields,
          unselectableFields: getRequiredFields(schema),
          unselectableFieldsErrorMsg: 'Can\'t mark required field as advanced field!'
        }
      );
    }
  }

  toggleMarkUnreliableFields() {
    this.lastPressedMarkFieldsBtnType.set('unreliableFields');

    if (!this.lajiForm) {
      return;
    }

    if (this.markUnreliableFieldsActive()) {
      this.unreliableFieldPointers.set(
        this.lajiFormFieldChooserService.stopFieldChooser()
      );
    } else {
      this.lajiFormFieldChooserService.startFieldChooser(
        this.lajiForm,
        {
          mode: 'jsonPointerSelect',
          ignoreFields: classFields,
          colorTheme: 'yellow'
        }
      );
    }
  }

  toggleShowOnlyBasicFields() {
    this.showOnlyBasicFields.update(value => !value);
  }

  private getPrefilledFormDataFromCurrentUrl(): Partial<Document> | undefined {
    const dataType = this.getDataTypeFromCurrentUrl();

    if (dataType) {
      return { datatype: dataType };
    }

    return undefined;
  }

  private getDataTypeFromCurrentUrl(): DataType | undefined {
    const urlParts: string[] = this.router.routerState.snapshot.url
      .split('/')
      .filter((part) => !!part);
    const firstPart = urlParts[0];

    if (Object.keys(urlToDataTypeMap).includes(firstPart)) {
      return urlToDataTypeMap[firstPart as UrlDataType];
    }

    return undefined;
  }

  private checkGatheringCoordinates(gathering: Gathering) {
    let newCoordinates: PointCoordinatesWithSystem | undefined = undefined;

    if (gathering.latitude && gathering.longitude && gathering.coordinateSystem) {
      newCoordinates = { latitude: gathering.latitude, longitude: gathering.longitude, coordinateSystem: gathering.coordinateSystem };
    }

    if (!isEqual(newCoordinates, this.coordinates)) {
      this.coordinates = newCoordinates;

      if (this.coordinates) {
        const { latitude, longitude, coordinateSystem } = this.coordinates;
        const result = convertCoordinatesToWGS84(latitude, longitude, coordinateSystem);

        if (result) {
          this.mapCoordinates = { latitude: '' + result[0], longitude: '' + result[1] };
          this.updateGatheringData({ wgs84Latitude: this.mapCoordinates.latitude, wgs84Longitude: this.mapCoordinates.longitude });
        }
      }
    } else {
      let newMapCoordinates: PointCoordinates | undefined = undefined;

      if (gathering.wgs84Latitude && gathering.wgs84Longitude) {
        newMapCoordinates = { latitude: gathering.wgs84Latitude, longitude: gathering.wgs84Longitude };
      }

      if (!isEqual(newMapCoordinates, this.mapCoordinates)) {
        this.mapCoordinates = newMapCoordinates;

        if (this.mapCoordinates) {
          this.coordinates = { latitude: this.mapCoordinates.latitude, longitude: this.mapCoordinates.longitude, coordinateSystem: 'MY.coordinateSystemWgs84' };
          this.updateGatheringData(this.coordinates);
        }
      }
    }
  }

  private updateGatheringData(updateObject: Partial<Gathering>) {
    const [first, ...rest] = this.formData?.gatherings || [];
    const gathering = { ...(first || {}), ...updateObject };
    const gatherings: [Gathering, ...Gathering[]] = [gathering, ...rest];
    const formData: Partial<Document> = { ...(this.formData || {}), gatherings };

    this.formView.setFormData(formData);
  }
}
