import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FieldType,
  IColumnMap,
  ILabelField,
  ILabelPdf,
  ISetup,
  IViewSettings,
  LabelDesignerModule,
  Presets,
  PresetSetup,
} from '@luomus/label-designer';
import { LocalStorageService } from 'ngx-webstorage';
import { cloneDeep } from 'lodash';
import { ApiClient, DialogService } from '@kotka/ui/core';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'kui-label-designer',
  templateUrl: './label-designer.component.html',
  styleUrl: './label-designer.component.scss',
  imports: [LabelDesignerModule],
})
export class LabelDesignerComponent {
  private apiClient = inject(ApiClient);
  private storage = inject(LocalStorageService);
  private dialogService = inject(DialogService);
  private cd = inject(ChangeDetectorRef);

  defaultAvailableFields = input<ILabelField[]>([]);
  setupStorageKey = input<string>();
  columnMapStorageKey = input<string>();
  data = input<any[]>();
  templates = input<PresetSetup[]>();

  downloading = false;
  viewSettings: IViewSettings = { magnification: 2 };
  fileColumnMap = signal<IColumnMap>({});

  defaultSetup: ISetup = {
    page: {
      ...Presets.A4,
      'paddingTop.mm': 10,
      'paddingLeft.mm': 10,
      'paddingBottom.mm': 10,
      'paddingRight.mm': 10,
    },
    label: {
      'height.mm': 20,
      'width.mm': 50,
      'marginTop.mm': 1.5,
      'marginLeft.mm': 1.5,
      'marginBottom.mm': 1.5,
      'marginRight.mm': 1.5,
      'font-family': 'Open Sans',
      'font-size.pt': 6,
    },
    border: Presets.Border.solid,
    labelItems: [
      {
        type: 'field',
        style: {
          'width.mm': 10,
          'height.mm': 10,
        },
        x: 0,
        y: 0,
        fields: [
          {
            field: 'uri',
            content: 'http://tun.fi/ID',
            label: 'URI - QRCode',
            type: FieldType.qrCode,
          },
        ],
      },
      {
        type: 'field',
        style: {
          'width.mm': 25,
          'height.mm': 5,
        },
        x: 11,
        y: 0,
        fields: [
          {
            field: 'uri',
            content: 'http://tun.fi/ID',
            label: 'URI',
            type: FieldType.uri,
          },
        ],
      },
    ],
  };
  setup = signal<ISetup>(cloneDeep(this.defaultSetup));

  availableFields = signal<ILabelField[]>([]);

  allowLabelItemsRepeat = true;

  constructor() {
    effect(() => {
      this.availableFields.set(this.defaultAvailableFields());
    });

    effect(() => {
      const key = this.setupStorageKey();
      if (key) {
        const setup = this.storage.retrieve(key);
        if (setup) {
          this.setup.set(setup);
        }
      }
    });

    effect(() => {
      const key = this.setupStorageKey();
      if (key) {
        this.storage.store(key, this.setup());
      }
    });

    effect(() => {
      const key = this.columnMapStorageKey();
      if (key) {
        const colMap = this.storage.retrieve(key);
        if (colMap) {
          this.fileColumnMap.set(colMap);
        }
      }
    });

    effect(() => {
      const key = this.columnMapStorageKey();
      if (key) {
        this.storage.store(key, this.fileColumnMap());
      }
    });
  }

  htmlToPdf(data: ILabelPdf) {
    this.apiClient.htmlToPdf(data.html).subscribe({
      next: (response) => {
        this.downloading = false;
        FileSaver.saveAs(response, data.filename || 'labels.pdf');
        this.cd.markForCheck();
      },
      error: (err) => {
        if (err.status === 413) {
          this.dialogService.alert(
            'There were too many labels to print. Try making labels in a smaller batches and try again.',
          );
        } else {
          this.dialogService.alert(
            'Failed to create labels. Please try again in a few moments. If the error doesn\'t go away, please contact support.',
          );
        }
        this.downloading = false;
        this.cd.markForCheck();
      },
    });
  }

  onFileColumnMapChange(event: IColumnMap) {
    this.fileColumnMap.set(event);
  }

  onAvailableFieldsChange(event: ILabelField[]) {
    this.availableFields.set(event);
  }

  onSetupChange(event: ISetup) {
    this.setup.set(event);
  }
}
