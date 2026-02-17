import {
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FieldType,
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


@Component({
  selector: 'kui-label-designer',
  templateUrl: './label-designer.component.html',
  styleUrl: './label-designer.component.scss',
  imports: [LabelDesignerModule],
})
export class LabelDesignerComponent {
  private storage = inject(LocalStorageService);

  defaultAvailableFields = input<ILabelField[]>([]);
  setupStorageKey = input<string>();
  data = input<any[]>();
  templates = input<PresetSetup[]>();

  downloading = false;
  viewSettings: IViewSettings = { magnification: 2 };
  fileColumnMap = {};

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
  }

  htmlToPdf(data: ILabelPdf) {
    console.log(data);
  }

  changeAvailableFields(event: ILabelField[]) {
    console.log(event);
  }
}
