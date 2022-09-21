/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface FormFooter {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  /**
   * Text to show for footer
   */
  footerDescription?: string;
  /**
   * Key is an image URI, value is the URI of the page clicking the image opens
   */
  footerLogos?: {
    [k: string]: unknown | undefined;
  };
}
