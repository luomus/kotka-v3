/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Dataset {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  /**
   * What monetary or non-monetary benefits arised from the project and how they were shared. (Related to the monitoring of the utilisation of genetic resources and Nagoya compliance).
   */
  benefitsDerivedAndShared?: string;
  /**
   * Name of the dataset. This must be unique.
   */
  datasetName: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Type of the dataset. Usually basic, project type is generally used only to give information on project Nagoya compliance.
   */
  datasetType?: "" | "GX.datasetTypeProject";
  /**
   * Description of the dataset, so that other people understand what it is about.
   */
  description?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Person(s) responsible for the dataset.
   */
  personsResponsible: string;
  /**
   * Institutions or persons collaborating in the project.
   */
  researchCollaborator?: string;
  /**
   * Duration of the project funding (dates from and to). (related to the monitoring of the utilisation of genetic resources and Nagoya compliance).
   */
  researchFundingDuration?: string;
  /**
   * Which person or institution received the project funding (related to the monitoring of the utilisation of genetic resources and Nagoya compliance).
   */
  researchFundingRecipient?: string;
  /**
   * Who funded the project (related to the monitoring of the utilisation of genetic resources and Nagoya compliance).
   */
  researchFundingSource?: string;
  creator?: string;
  dateCreated?: string;
  dateEdited?: string;
  editor?: string;
  /**
   * Team or organisation that owns the record and can edit it.
   */
  owner?: string;
}
