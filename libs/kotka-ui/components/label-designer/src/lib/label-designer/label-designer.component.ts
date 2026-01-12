import { Component, computed, input, Signal } from '@angular/core';
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
import { botanical, fungi, genericLabel, insectaDet, vertebrate } from './label-templates';

@Component({
  selector: 'kui-label-designer',
  templateUrl: './label-designer.component.html',
  styleUrl: './label-designer.component.scss',
  imports: [LabelDesignerModule],
})
export class LabelDesignerComponent {
  generic = input<boolean>(true);

  data?: any[];
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
  setup = JSON.parse(JSON.stringify(this.defaultSetup));

  allowLabelItemsRepeat = true;

  defaultAvailableFields = [];
  availableFields = [];

  templates: Signal<PresetSetup[]>;

  constructor() {
    this.templates = computed(() => (
      [...(this.generic() ? [genericLabel] : []), fungi, insectaDet, vertebrate, botanical]
    ));
  }

  htmlToPdf(data: ILabelPdf) {
    console.log(data);
  }

  changeAvailableFields(event: ILabelField[]) {
    console.log(event);
  }
}
