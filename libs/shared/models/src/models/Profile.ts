/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Profile {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  birdSongRecognitionSkillLevels?: {
    birdSongRecognitionArea: string;
    birdSongRecognitionSkillLevel:
      | "MA.birdSongRecognitionSkillLevelEnum1"
      | "MA.birdSongRecognitionSkillLevelEnum2"
      | "MA.birdSongRecognitionSkillLevelEnum3"
      | "MA.birdSongRecognitionSkillLevelEnum4";
  }[];
  birdwatchingActivityLevel?:
    | ""
    | "MA.birdwatchingActivityLevelEnum1"
    | "MA.birdwatchingActivityLevelEnum2"
    | "MA.birdwatchingActivityLevelEnum3"
    | "MA.birdwatchingActivityLevelEnum4";
  blocked?: string[];
  finnishBirdSongRecognitionSkillLevel?:
    | ""
    | "MA.finnishBirdSongRecognitionSkillLevelEnum1"
    | "MA.finnishBirdSongRecognitionSkillLevelEnum2"
    | "MA.finnishBirdSongRecognitionSkillLevelEnum3"
    | "MA.finnishBirdSongRecognitionSkillLevelEnum4";
  friendRequests?: string[];
  friends?: string[];
  image?: string;
  nameVisibleInKerttu?: boolean;
  personalCollectionIdentifier?: string;
  profileDescription?: string;
  settings?: {
    [k: string]: unknown | undefined;
  };
  taxonExpertise?: string[];
  taxonExpertiseNotes?: string;
  userID: string;
  profileKey?: string;
}
