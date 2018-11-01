/**
 * Container class for a captured webcam image
 * @author basst314, davidshen84
 */
export class WebcamImage {
  private _mimeType: string = null;
  private _imageAsBase64: string = null;
  private _imageAsDataUrl: string = null;
  private _imageData: ImageData = null;

  public constructor(imageAsDataUrl: string, mimeType: string, imageData: ImageData) {
    this._mimeType = mimeType;
    this._imageAsDataUrl = imageAsDataUrl;
    this._imageData = imageData;
  }

  /**
   * Get the base64 encoded image data
   * @returns {string} base64 data of the image
   */
  public get imageAsBase64(): string {
    return this._imageAsBase64 ?
      this._imageAsBase64 : this._imageAsBase64 = this.getDataFromDataUrl(this._imageAsDataUrl);
  }

  /**
   * Get the encoded image as dataUrl
   * @returns {string} the dataUrl of the image
   */
  public get imageAsDataUrl(): string {
    return this._imageAsDataUrl;
  }

  /**
   * Get the ImageData object associated with the canvas' 2d context.
   * @returns {ImageData} the ImageData of the canvas's 2d context.
   */
  public get imageData(): ImageData {
    return this._imageData;
  }

  /**
   * Extracts the Base64 data out of the given dataUrl.
   * @param {string} dataUrl the given dataUrl
   */
  private getDataFromDataUrl(dataUrl: string) {
    return dataUrl.replace("data:" + this._mimeType + ";base64,", "");
  }
}
