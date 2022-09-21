/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface TaxonInteraction {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  interactionType:
    | "MI.taxonInteractionNeutralism"
    | "MI.taxonInteractionAntagonism"
    | "MI.taxonInteractionCommensalism"
    | "MI.taxonInteractionCompetition"
    | "MI.taxonInteractionAmensalism"
    | "MI.taxonInteractionMutualism"
    | "MI.taxonInteractionPredation"
    | "MI.taxonInteractionParasitism"
    | "MI.taxonInteractionEctoparasitism"
    | "MI.taxonInteractionEndoparasitism";
  objectLifeStage?:
    | ""
    | "MY.lifeStageEgg"
    | "MY.lifeStageLarva"
    | "MY.lifeStagePupa"
    | "MY.lifeStageJuvenile"
    | "MY.lifeStageNymph"
    | "MY.lifeStageSubimago"
    | "MY.lifeStageImmature"
    | "MY.lifeStageAdult"
    | "MY.lifeStageFertile"
    | "MY.lifeStageSterile"
    | "MY.lifeStageTadpole"
    | "MY.lifeStageDead"
    | "MY.lifeStageAlive"
    | "MY.lifeStageEmbryo"
    | "MY.lifeStageSubadult"
    | "MY.lifeStageMature"
    | "MY.lifeStagePullus"
    | "MY.lifeStageHatchedEgg"
    | "MY.lifeStageHatchedPupa"
    | "MY.lifeStageGall"
    | "MY.lifeStageMarks";
  objectTaxon: string;
  originalPublication?: string[];
  subjectLifeStage?:
    | ""
    | "MY.lifeStageEgg"
    | "MY.lifeStageLarva"
    | "MY.lifeStagePupa"
    | "MY.lifeStageJuvenile"
    | "MY.lifeStageNymph"
    | "MY.lifeStageSubimago"
    | "MY.lifeStageImmature"
    | "MY.lifeStageAdult"
    | "MY.lifeStageFertile"
    | "MY.lifeStageSterile"
    | "MY.lifeStageTadpole"
    | "MY.lifeStageDead"
    | "MY.lifeStageAlive"
    | "MY.lifeStageEmbryo"
    | "MY.lifeStageSubadult"
    | "MY.lifeStageMature"
    | "MY.lifeStagePullus"
    | "MY.lifeStageHatchedEgg"
    | "MY.lifeStageHatchedPupa"
    | "MY.lifeStageGall"
    | "MY.lifeStageMarks";
  subjectTaxon: string;
}
