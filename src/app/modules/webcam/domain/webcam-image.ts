/**
 * Container class for a captured webcam image
 * @author basst314
 */
export class WebcamImage {
  private _mimeType: string = null;
  private _imageAsBase64: string = null;
  private _imageAsDataUrl: string = null;

  public constructor(imageAsDataUrl: string, mimeType: string) {
    this._mimeType = mimeType;
    this._imageAsDataUrl = imageAsDataUrl;
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
   * Extracts the Base64 data out of the given dataUrl.
   * @param {string} dataUrl the given dataUrl
   */
  private getDataFromDataUrl(dataUrl: string) {
    return dataUrl.replace("data:" + this._mimeType + ";base64,", "");
  }
}
