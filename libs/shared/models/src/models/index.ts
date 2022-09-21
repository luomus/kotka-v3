export * from './list-response';
import { BibliographicResource } from './BibliographicResource'
export type { BibliographicResource }
import { Concept } from './Concept'
export type { Concept }
import { Pinkka } from './Pinkka'
export type { Pinkka }
import { AdministrativeStatus } from './AdministrativeStatus'
export type { AdministrativeStatus }
import { Agent } from './Agent'
export type { Agent }
import { Annotation } from './Annotation'
export type { Annotation }
import { AnnotationOccurrence } from './AnnotationOccurrence'
export type { AnnotationOccurrence }
import { Area } from './Area'
export type { Area }
import { Audio } from './Audio'
export type { Audio }
import { BirdSongRecognitionSkillLevel } from './BirdSongRecognitionSkillLevel'
export type { BirdSongRecognitionSkillLevel }
import { Branch } from './Branch'
export type { Branch }
import { Checklist } from './Checklist'
export type { Checklist }
import { ChecklistVersion } from './ChecklistVersion'
export type { ChecklistVersion }
import { Collection } from './Collection'
export type { Collection }
import { CompleteList } from './CompleteList'
export type { CompleteList }
import { ContentContextDescription } from './ContentContextDescription'
export type { ContentContextDescription }
import { Dataset } from './Dataset'
export type { Dataset }
import { DateRange } from './DateRange'
export type { DateRange }
import { Device } from './Device'
export type { Device }
import { DeviceIndividual } from './DeviceIndividual'
export type { DeviceIndividual }
import { Document } from './Document'
export type { Document }
import { DownloadRequest } from './DownloadRequest'
export type { DownloadRequest }
import { Endangerment } from './Endangerment'
export type { Endangerment }
import { Event } from './Event'
export type { Event }
import { Field } from './Field'
export type { Field }
import { Fieldset } from './Fieldset'
export type { Fieldset }
import { Form } from './Form'
export type { Form }
import { FormFooter } from './FormFooter'
export type { FormFooter }
import { FormInstructions } from './FormInstructions'
export type { FormInstructions }
import { FormNamedPlaceOptions } from './FormNamedPlaceOptions'
export type { FormNamedPlaceOptions }
import { FormOptions } from './FormOptions'
export type { FormOptions }
import { FormPermission } from './FormPermission'
export type { FormPermission }
import { FormPermissionPerson } from './FormPermissionPerson'
export type { FormPermissionPerson }
import { FormPermissionSingle } from './FormPermissionSingle'
export type { FormPermissionSingle }
import { FormSeason } from './FormSeason'
export type { FormSeason }
import { Gathering } from './Gathering'
export type { Gathering }
import { GatheringEvent } from './GatheringEvent'
export type { GatheringEvent }
import { GatheringFact } from './GatheringFact'
export type { GatheringFact }
import { Habitat } from './Habitat'
export type { Habitat }
import { Identification } from './Identification'
export type { Identification }
import { Image } from './Image'
export type { Image }
import { Individual } from './Individual'
export type { Individual }
import { InformalTaxonGroup } from './InformalTaxonGroup'
export type { InformalTaxonGroup }
import { InformationSystem } from './InformationSystem'
export type { InformationSystem }
import { IucnRedListEvaluation } from './IucnRedListEvaluation'
export type { IucnRedListEvaluation }
import { IucnRedListEvaluationYear } from './IucnRedListEvaluationYear'
export type { IucnRedListEvaluationYear }
import { IucnRedListTaxonGroup } from './IucnRedListTaxonGroup'
export type { IucnRedListTaxonGroup }
import { Measurement } from './Measurement'
export type { Measurement }
import { Multimedia } from './Multimedia'
export type { Multimedia }
import { NamedPlace } from './NamedPlace'
export type { NamedPlace }
import { News } from './News'
export type { News }
import { Notification } from './Notification'
export type { Notification }
import { Occurrence } from './Occurrence'
export type { Occurrence }
import { Organization } from './Organization'
export type { Organization }
import { Permit } from './Permit'
export type { Permit }
import { Person } from './Person'
export type { Person }
import { Preparation } from './Preparation'
export type { Preparation }
import { Profile } from './Profile'
export type { Profile }
import { Publication } from './Publication'
export type { Publication }
import { RegionalStatus } from './RegionalStatus'
export type { RegionalStatus }
import { Reserve } from './Reserve'
export type { Reserve }
import { Sample } from './Sample'
export type { Sample }
import { SubUnit } from './SubUnit'
export type { SubUnit }
import { Tag } from './Tag'
export type { Tag }
import { Taxon } from './Taxon'
export type { Taxon }
import { TaxonCensus } from './TaxonCensus'
export type { TaxonCensus }
import { TaxonConcept } from './TaxonConcept'
export type { TaxonConcept }
import { TaxonGroupIucnEditors } from './TaxonGroupIucnEditors'
export type { TaxonGroupIucnEditors }
import { TaxonInteraction } from './TaxonInteraction'
export type { TaxonInteraction }
import { TaxonSet } from './TaxonSet'
export type { TaxonSet }
import { Transaction } from './Transaction'
export type { Transaction }
import { TransactionEvent } from './TransactionEvent'
export type { TransactionEvent }
import { TransactionItem } from './TransactionItem'
export type { TransactionItem }
import { Translation } from './Translation'
export type { Translation }
import { TypeSpecimen } from './TypeSpecimen'
export type { TypeSpecimen }
import { Unit } from './Unit'
export type { Unit }
import { UnitFact } from './UnitFact'
export type { UnitFact }
import { UnitGathering } from './UnitGathering'
export type { UnitGathering }
import { Validator } from './Validator'
export type { Validator }
import { Video } from './Video'
export type { Video }

export type StoreObject = BibliographicResource
   | Concept
   | Pinkka
   | AdministrativeStatus
   | Agent
   | Annotation
   | AnnotationOccurrence
   | Area
   | Audio
   | BirdSongRecognitionSkillLevel
   | Branch
   | Checklist
   | ChecklistVersion
   | Collection
   | CompleteList
   | ContentContextDescription
   | Dataset
   | DateRange
   | Device
   | DeviceIndividual
   | Document
   | DownloadRequest
   | Endangerment
   | Event
   | Field
   | Fieldset
   | Form
   | FormFooter
   | FormInstructions
   | FormNamedPlaceOptions
   | FormOptions
   | FormPermission
   | FormPermissionPerson
   | FormPermissionSingle
   | FormSeason
   | Gathering
   | GatheringEvent
   | GatheringFact
   | Habitat
   | Identification
   | Image
   | Individual
   | InformalTaxonGroup
   | InformationSystem
   | IucnRedListEvaluation
   | IucnRedListEvaluationYear
   | IucnRedListTaxonGroup
   | Measurement
   | Multimedia
   | NamedPlace
   | News
   | Notification
   | Occurrence
   | Organization
   | Permit
   | Person
   | Preparation
   | Profile
   | Publication
   | RegionalStatus
   | Reserve
   | Sample
   | SubUnit
   | Tag
   | Taxon
   | TaxonCensus
   | TaxonConcept
   | TaxonGroupIucnEditors
   | TaxonInteraction
   | TaxonSet
   | Transaction
   | TransactionEvent
   | TransactionItem
   | Translation
   | TypeSpecimen
   | Unit
   | UnitFact
   | UnitGathering
   | Validator
   | Video;

export type KeyOfUnion<K extends StoreObject> = K extends keyof K ? K : never;

export type Lang = 'en' | 'fi' | 'sv';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && ['en', 'fi', 'sv'].includes(value);
}

export function isLangObject<T>(value: unknown): value is Record<Lang, T> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value || {}).every((lang) => isLang(lang));
  }
  return false;
}

export function isBibliographicResource(data: unknown): data is BibliographicResource {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'dc:BibliographicResource'
  );
}
export function isConcept(data: unknown): data is Concept {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'skos:Concept'
  );
}
export function isPinkka(data: unknown): data is Pinkka {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'LA.Pinkka'
  );
}
export function isAdministrativeStatus(data: unknown): data is AdministrativeStatus {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MX.administrativeStatus'
  );
}
export function isAgent(data: unknown): data is Agent {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.agent'
  );
}
export function isAnnotation(data: unknown): data is Annotation {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MAN.annotation'
  );
}
export function isAnnotationOccurrence(data: unknown): data is AnnotationOccurrence {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MAN.annotationOccurrenceClass'
  );
}
export function isArea(data: unknown): data is Area {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'ML.area'
  );
}
export function isAudio(data: unknown): data is Audio {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MM.audio'
  );
}
export function isBirdSongRecognitionSkillLevel(data: unknown): data is BirdSongRecognitionSkillLevel {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MA.birdSongRecognitionSkillLevelClass'
  );
}
export function isBranch(data: unknown): data is Branch {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'PUU.branch'
  );
}
export function isChecklist(data: unknown): data is Checklist {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MR.checklist'
  );
}
export function isChecklistVersion(data: unknown): data is ChecklistVersion {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MR.checklistVersion'
  );
}
export function isCollection(data: unknown): data is Collection {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.collection'
  );
}
export function isCompleteList(data: unknown): data is CompleteList {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.completeListClass'
  );
}
export function isContentContextDescription(data: unknown): data is ContentContextDescription {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MX.contentContextDescription'
  );
}
export function isDataset(data: unknown): data is Dataset {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'GX.dataset'
  );
}
export function isDateRange(data: unknown): data is DateRange {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MNP.dateRange'
  );
}
export function isDevice(data: unknown): data is Device {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MXC.device'
  );
}
export function isDeviceIndividual(data: unknown): data is DeviceIndividual {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MXC.deviceIndividual'
  );
}
export function isDocument(data: unknown): data is Document {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.document'
  );
}
export function isDownloadRequest(data: unknown): data is DownloadRequest {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'HBF.downloadRequest'
  );
}
export function isEndangerment(data: unknown): data is Endangerment {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MKV.endangermentObject'
  );
}
export function isEvent(data: unknown): data is Event {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'PUU.event'
  );
}
export function isField(data: unknown): data is Field {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHLA.field'
  );
}
export function isFieldset(data: unknown): data is Fieldset {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHL.fieldset'
  );
}
export function isForm(data: unknown): data is Form {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHL.form'
  );
}
export function isFormFooter(data: unknown): data is FormFooter {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHL.formFooterClass'
  );
}
export function isFormInstructions(data: unknown): data is FormInstructions {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHL.formInstructionsClass'
  );
}
export function isFormNamedPlaceOptions(data: unknown): data is FormNamedPlaceOptions {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHL.formNamedPlaceOptionsClass'
  );
}
export function isFormOptions(data: unknown): data is FormOptions {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHL.formOptionsClass'
  );
}
export function isFormPermission(data: unknown): data is FormPermission {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MFP.formPermission'
  );
}
export function isFormPermissionPerson(data: unknown): data is FormPermissionPerson {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MFP.formPermissionPerson'
  );
}
export function isFormPermissionSingle(data: unknown): data is FormPermissionSingle {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MFP.formPermissionSingle'
  );
}
export function isFormSeason(data: unknown): data is FormSeason {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHL.formSeasonClass'
  );
}
export function isGathering(data: unknown): data is Gathering {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.gathering'
  );
}
export function isGatheringEvent(data: unknown): data is GatheringEvent {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MZ.gatheringEvent'
  );
}
export function isGatheringFact(data: unknown): data is GatheringFact {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.gatheringFactClass'
  );
}
export function isHabitat(data: unknown): data is Habitat {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MKV.habitatObject'
  );
}
export function isIdentification(data: unknown): data is Identification {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.identification'
  );
}
export function isImage(data: unknown): data is Image {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MM.image'
  );
}
export function isIndividual(data: unknown): data is Individual {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MXA.individual'
  );
}
export function isInformalTaxonGroup(data: unknown): data is InformalTaxonGroup {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MVL.informalTaxonGroup'
  );
}
export function isInformationSystem(data: unknown): data is InformationSystem {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'KE.informationSystem'
  );
}
export function isIucnRedListEvaluation(data: unknown): data is IucnRedListEvaluation {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MKV.iucnRedListEvaluation'
  );
}
export function isIucnRedListEvaluationYear(data: unknown): data is IucnRedListEvaluationYear {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MKV.iucnRedListEvaluationYear'
  );
}
export function isIucnRedListTaxonGroup(data: unknown): data is IucnRedListTaxonGroup {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MVL.iucnRedListTaxonGroup'
  );
}
export function isMeasurement(data: unknown): data is Measurement {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.measurementClass'
  );
}
export function isMultimedia(data: unknown): data is Multimedia {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MM.multimediaObject'
  );
}
export function isNamedPlace(data: unknown): data is NamedPlace {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MNP.namedPlace'
  );
}
export function isNews(data: unknown): data is News {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MPO.news'
  );
}
export function isNotification(data: unknown): data is Notification {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHN.notification'
  );
}
export function isOccurrence(data: unknown): data is Occurrence {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MO.occurrence'
  );
}
export function isOrganization(data: unknown): data is Organization {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MOS.organization'
  );
}
export function isPermit(data: unknown): data is Permit {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'HRA.permitClass'
  );
}
export function isPerson(data: unknown): data is Person {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MA.person'
  );
}
export function isPreparation(data: unknown): data is Preparation {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MF.preparationClass'
  );
}
export function isProfile(data: unknown): data is Profile {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MA.profile'
  );
}
export function isPublication(data: unknown): data is Publication {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MP.publication'
  );
}
export function isRegionalStatus(data: unknown): data is RegionalStatus {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MKV.regionalStatus'
  );
}
export function isReserve(data: unknown): data is Reserve {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MNP.reserveClass'
  );
}
export function isSample(data: unknown): data is Sample {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MF.sample'
  );
}
export function isSubUnit(data: unknown): data is SubUnit {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.subUnit'
  );
}
export function isTag(data: unknown): data is Tag {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MMAN.tagClass'
  );
}
export function isTaxon(data: unknown): data is Taxon {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MX.taxon'
  );
}
export function isTaxonCensus(data: unknown): data is TaxonCensus {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.taxonCensusClass'
  );
}
export function isTaxonConcept(data: unknown): data is TaxonConcept {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MC.taxonConcept'
  );
}
export function isTaxonGroupIucnEditors(data: unknown): data is TaxonGroupIucnEditors {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MKV.taxonGroupIucnEditors'
  );
}
export function isTaxonInteraction(data: unknown): data is TaxonInteraction {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MI.taxonInteraction'
  );
}
export function isTaxonSet(data: unknown): data is TaxonSet {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MX.taxonSet'
  );
}
export function isTransaction(data: unknown): data is Transaction {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'HRA.transaction'
  );
}
export function isTransactionEvent(data: unknown): data is TransactionEvent {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'HRAA.transactionEventClass'
  );
}
export function isTransactionItem(data: unknown): data is TransactionItem {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'HRAB.transactionItemClass'
  );
}
export function isTranslation(data: unknown): data is Translation {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHL.translation'
  );
}
export function isTypeSpecimen(data: unknown): data is TypeSpecimen {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.typeSpecimen'
  );
}
export function isUnit(data: unknown): data is Unit {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.unit'
  );
}
export function isUnitFact(data: unknown): data is UnitFact {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MY.unitFactClass'
  );
}
export function isUnitGathering(data: unknown): data is UnitGathering {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MZ.unitGathering'
  );
}
export function isValidator(data: unknown): data is Validator {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MHL.validator'
  );
}
export function isVideo(data: unknown): data is Video {
  return !!(
    data && typeof data === 'object' && '@type' in data && (data as StoreObject)['@type'] === 'MM.video'
  );
}