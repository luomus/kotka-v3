import { ComponentRef, Injectable } from '@angular/core';
import {
  LajiFormComponent,
  LajiFormComponentEmbedderService,
  LajiFormEmbedService,
  LajiFormEventListenerEmbedderService
} from '@kotka/ui/laji-form';
import { SpecimenTransaction } from '@kotka/shared/models';
import { OrganizationAddressEmbedComponent } from './organization-address-embed';
import { PermitsInfoEmbedComponent } from './permits-info-embed';
import { SpecimenRangeSelectEmbedComponent } from './specimen-range-select-embed';
import { Observable } from 'rxjs';

@Injectable()
export class TransactionFormEmbedService {
  specimenRangeClick$?: Observable<string>;

  private organizationAddressRef?: ComponentRef<OrganizationAddressEmbedComponent>;
  private permitsInfoRef?: ComponentRef<PermitsInfoEmbedComponent>;
  private specimenRangeSelectRef?: ComponentRef<SpecimenRangeSelectEmbedComponent>;

  constructor(
    private lajiFormComponentEmbedderService: LajiFormComponentEmbedderService,
    private lajiFormEventListenerEmbedderService: LajiFormEventListenerEmbedderService
  ) {}


  initEmbeddedComponents(lajiFormComponent: LajiFormComponent, formData: Partial<SpecimenTransaction>, transactionEventAddListener?: (event: MouseEvent) => void) {
    const lajiFormEmbedService = new LajiFormEmbedService(
      this.lajiFormComponentEmbedderService,
      this.lajiFormEventListenerEmbedderService,
      lajiFormComponent
    );

    this.organizationAddressRef = lajiFormEmbedService.embedComponent(OrganizationAddressEmbedComponent, {
      anchorClassName: 'correspondent-organization',
      positionToAnchor: 'nextSibling'
    });
    this.organizationAddressRef.instance.organization = formData.correspondentOrganization;

    this.permitsInfoRef = lajiFormEmbedService.embedComponent(PermitsInfoEmbedComponent, {
      anchorClassName: 'nagoya-fields',
      positionToAnchor: 'parentNextSibling'
    });
    this.permitsInfoRef.instance.country = formData.geneticResourceAcquisitionCountry;

    this.specimenRangeSelectRef = lajiFormEmbedService.embedComponent(SpecimenRangeSelectEmbedComponent, {
      anchorClassName: 'specimen-id-fields',
      positionToAnchor: 'firstChild'
    });
    this.specimenRangeClick$ = this.specimenRangeSelectRef.instance.specimenRangeClick;

    if (transactionEventAddListener) {
      lajiFormEmbedService.addOnClickEventListener('root_transactionEvents-add', transactionEventAddListener);
    }
  }


  updateEmbeddedComponents(formData: Partial<SpecimenTransaction>) {
    const correspondentOrganization = this.getValidOrganizationId(formData.correspondentOrganization);
    if (this.organizationAddressRef) {
      this.organizationAddressRef.instance.organization = correspondentOrganization;
    }

    const geneticResourceAcquisitionCountry = formData.geneticResourceAcquisitionCountry;
    if (this.permitsInfoRef) {
      this.permitsInfoRef.instance.country = geneticResourceAcquisitionCountry;
    }
  }

  setEmbeddedComponentsDisabled(disabled: boolean) {
    if (this.specimenRangeSelectRef) {
      this.specimenRangeSelectRef.instance.setDisabled(disabled);
    }
  }

  clearSpecimenRangeSelect() {
    this.specimenRangeSelectRef?.instance.clearSpecimenRangeInput();
  }

  private getValidOrganizationId(organizationId?: string): string|undefined {
    return organizationId && /^MOS\.\d+/.test(organizationId) ? organizationId : undefined;
  }
}
