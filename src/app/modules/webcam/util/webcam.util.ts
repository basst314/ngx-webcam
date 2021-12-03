export class WebcamUtil {

  private static availableVideoInputs: MediaDeviceInfo[] = [];

  static hasVideoInputs() {
    const inputs = WebcamUtil.availableVideoInputs;
    return !!inputs.find(input => !!input.deviceId);
  }

  /**
   * Lists available videoInput devices
   * @returns a list of media device info.
   */
  public static async getAvailableVideoInputs(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('enumerateDevices() not supported.');
    }

    if (!this.hasVideoInputs()) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      WebcamUtil.availableVideoInputs = devices.filter((device: MediaDeviceInfo) => device.kind === 'videoinput');
    }

    return WebcamUtil.availableVideoInputs;
  }
}
