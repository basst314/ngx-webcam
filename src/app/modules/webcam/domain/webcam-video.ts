import { WebcamImage } from './webcam-image';
import { Inject } from '@angular/core';
declare var Whammy: any;

/**
 * Container class for a captured webcam video (no audio)
 * @author Reda1000
 */
export class WebcamVideo {

  public constructor(frameRate: number, mimeType: string) {
    this._frameRate = frameRate;
    this._mimeType = mimeType;
    this._encoder = new Whammy.Video(this._frameRate);
  }

  private readonly _frameRate: number = 1;
  private readonly _mimeType: string = null;
  private readonly _encoder: any = null;
  private _count: number = 0;

  /**
   * Get the base64 encoded video data
   * @returns base64 data of the video
   */
  public get videoAsBase64(): Promise<string> {
    return new Promise((success, fail) => {
      const blob = this._encoder.compile(false);
      const reader = new FileReader();
      reader.onload = (event: any) => {
        success(
          event.target.result.replace(`data:${this._mimeType};base64,`, '')
        ); // event.target.results contains the base64 code to create the image.
      };
      reader.readAsDataURL(blob); // Convert the blob from clipboard to base64
    });
  }

  /**
   * Get the encoded video as dataUrl
   * @returns the dataUrl of the video
   */
  public get videoAsBlob(): Blob {
    return this._encoder.compile(false);
  }

  public addFrame(frame: CanvasRenderingContext2D) {
    this._encoder.add(frame);
    this._count++;
  }

  public get frameRate(): number {
    return this._frameRate;
  }

  public get recordedFrames(): number {
    return this._count;
  }
}
