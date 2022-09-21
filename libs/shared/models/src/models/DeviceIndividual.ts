/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface DeviceIndividual {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  /**
   * Date time when attached to the individual
   */
  attached: string;
  /**
   * Id for the device
   */
  deviceID: string;
  /**
   * Id for the individual
   */
  individualID: string;
  /**
   * Date time when removed from to the individua
   */
  removed?: string;
}
