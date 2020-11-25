export class WebcamUtil {

  private static availableVideoInputs: MediaDeviceInfo[] = [];

  /**
   * Lists available videoInput devices
   * @returns a list of media device info.
   */
  public static async getAvailableVideoInputs(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('enumerateDevices() not supported.');
    }

    if (!WebcamUtil.availableVideoInputs.length) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      WebcamUtil.availableVideoInputs = devices.filter((device: MediaDeviceInfo) => device.kind === 'videoinput');
    }

    return WebcamUtil.availableVideoInputs;
  }
}
