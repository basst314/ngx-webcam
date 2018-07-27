import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {WebcamInitError} from "../domain/webcam-init-error";
import {WebcamImage} from "../domain/webcam-image";
import {Observable, Subscription} from "rxjs";
import {WebcamUtil} from "../util/webcam.util";

@Component({
  selector: 'webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent implements AfterViewInit, OnDestroy {
  private static DEFAULT_VIDEO_OPTIONS: MediaTrackConstraints = {facingMode: 'environment'};

  /** Defines the max width of the webcam area in px */
  @Input() public width: number = 640;
  /** Defines the max height of the webcam area in px */
  @Input() public height: number = 480;
  /** If the Observable represented by this subscription emits, an image will be captured and emitted through
   * the 'imageCapture' EventEmitter */
  private triggerSubscription: Subscription;
  /** Defines base constraints to apply when requesting video track from UserMedia */
  @Input() public videoOptions: MediaTrackConstraints = WebcamComponent.DEFAULT_VIDEO_OPTIONS;
  /** Flag to enable/disable camera switch. If enabled, a switch icon will be displayed if multiple cameras were found */
  @Input() public allowCameraSwitch: boolean = true;

  /** Subscription to switchCamera events */
  private switchCameraSubscription: Subscription;

  /** MediaStream object in use for streaming UserMedia data */
  private mediaStream: MediaStream = null;

  /** available video devices */
  public availableVideoInputs: MediaDeviceInfo[] = [];
  /** Index of active video in availableVideoInputs */
  private activeVideoInputIndex: number = -1;
  /** Indicates whether the video device is ready to be switched */
  public videoInitialized: boolean = false;

  /** EventEmitter which fires when an image has been captured */
  @Output() public imageCapture: EventEmitter<WebcamImage> = new EventEmitter<WebcamImage>();
  /** Emits a mediaError if webcam cannot be initialized (e.g. missing user permissions) */
  @Output() public initError: EventEmitter<WebcamInitError> = new EventEmitter<WebcamInitError>();
  /** Emits when the webcam video was clicked */
  @Output() public imageClick: EventEmitter<void> = new EventEmitter<void>();
  /** Emits the active deviceId after the active video device was switched */
  @Output() public cameraSwitched: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('video') private video: any;
  // Canvas for Video Snapshots
  @ViewChild('canvas') private canvas: any;

  // width and height of the active video stream
  private activeVideoSettings: MediaTrackSettings = null;

  public ngAfterViewInit(): void {
    this.detectAvailableDevices()
      .then((devices: MediaDeviceInfo[]) => {
        // start first device
        this.switchToVideoInput(devices.length > 0 ? devices[0].deviceId : null);
      })
      .catch((err: string) => {
        this.initError.next(<WebcamInitError>{message: err});
        // fallback: still try to load webcam, even if device enumeration failed
        this.switchToVideoInput(null);
      });
  }

  public ngOnDestroy(): void {
    this.stopMediaTracks();
    this.unsubscribeFromSubscriptions();
  }

  /**
   * If the given Observable emits, an image will be captured and emitted through 'imageCapture' EventEmitter
   */
  @Input()
  public set trigger(trigger: Observable<void>) {
    if (this.triggerSubscription) {
      this.triggerSubscription.unsubscribe();
    }

    // Subscribe to events from this Observable to take snapshots
    this.triggerSubscription = trigger.subscribe(() => {
      this.takeSnapshot();
    });
  }

  @Input()
  public set switchCamera(switchCamera: Observable<boolean | string>) {
    if (this.switchCameraSubscription) {
      this.switchCameraSubscription.unsubscribe();
    }

    // Subscribe to events from this Observable to switch video device
    this.switchCameraSubscription = switchCamera.subscribe((value: boolean | string) => {
      if (typeof value === 'string') {
        // deviceId was specified
        this.switchToVideoInput(value);
      } else {
        // direction was specified
        this.rotateVideoInput(value !== false);
      }
    })
  }

  /**
   * Get MediaTrackConstraints to request streaming the given device
   * @param {string} deviceId
   * @param baseMediaTrackConstraints base constraints to merge deviceId-constraint into
   * @returns {MediaTrackConstraints}
   */
  private static getMediaConstraintsForDevice(deviceId: string, baseMediaTrackConstraints: MediaTrackConstraints): MediaTrackConstraints {
    let result: MediaTrackConstraints = baseMediaTrackConstraints ? baseMediaTrackConstraints : this.DEFAULT_VIDEO_OPTIONS;
    if (deviceId) {
      result.deviceId = {exact: deviceId};
    }

    return result;
  }

  /**
   * Takes a snapshot of the current webcam's view and emits the image as an event
   */
  public takeSnapshot(): void {
    // set canvas size to actual video size
    let _video = this.video.nativeElement;
    let dimensions = {width: this.width, height: this.height};
    if (_video.videoWidth) {
      dimensions.width = _video.videoWidth;
      dimensions.height = _video.videoHeight;
    }

    let _canvas = this.canvas.nativeElement;
    _canvas.width = dimensions.width;
    _canvas.height = dimensions.height;

    // paint snapshot image to canvas
    _canvas.getContext('2d').drawImage(this.video.nativeElement, 0, 0);

    // read canvas content as image
    // TODO allow mimeType options as Input()
    let mimeType: string = "image/jpeg";
    let dataUrl: string = _canvas.toDataURL(mimeType);

    this.imageCapture.next(new WebcamImage(dataUrl, mimeType));
  }

  /**
   * Switches to the next/previous video device
   * @param {boolean} forward
   */
  public rotateVideoInput(forward: boolean) {
    if (this.availableVideoInputs && this.availableVideoInputs.length > 1) {
      let increment: number = forward ? 1 : (this.availableVideoInputs.length - 1);
      this.switchToVideoInput(this.availableVideoInputs[(this.activeVideoInputIndex + increment) % this.availableVideoInputs.length].deviceId)
    }
  }

  /**
   * Switches the camera-view to the specified video device
   */
  public switchToVideoInput(deviceId: string): void {
    this.videoInitialized = false;
    this.stopMediaTracks();
    this.initWebcam(deviceId, this.videoOptions);
  }

  public get videoWidth() {
    let videoRatio = this.activeVideoSettings ? this.activeVideoSettings.aspectRatio : (this.width / this.height);
    if (videoRatio > 1) return Math.min(this.width, this.height / videoRatio);
    return Math.min(this.width, this.height * videoRatio);
  }

  public get videoHeight() {
    let videoRatio = this.activeVideoSettings ? this.activeVideoSettings.aspectRatio : (this.width / this.height);
    if (videoRatio > 1) return Math.min(this.height, this.width * videoRatio);
    return Math.min(this.height, this.width / videoRatio);
  }

  /**
   * Init webcam live view
   */
  private initWebcam(deviceId: string, userVideoTrackConstraints: MediaTrackConstraints) {
    let _video = this.video.nativeElement;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      // merge deviceId -> userVideoTrackConstraints
      let videoTrackConstraints = WebcamComponent.getMediaConstraintsForDevice(deviceId, userVideoTrackConstraints);

      navigator.mediaDevices.getUserMedia(<MediaStreamConstraints>{video: videoTrackConstraints})
        .then((stream: MediaStream) => {
          this.mediaStream = stream;
          _video.srcObject = stream;
          _video.play();

          this.activeVideoSettings = stream.getVideoTracks()[0].getSettings();
          let activeDeviceId: string = stream.getVideoTracks()[0].getSettings().deviceId;
          this.activeVideoInputIndex = activeDeviceId ? this.availableVideoInputs
            .findIndex((mediaDeviceInfo: MediaDeviceInfo) => mediaDeviceInfo.deviceId === activeDeviceId) : -1;
          this.videoInitialized = true;

          this.cameraSwitched.next(activeDeviceId);
        })
        .catch((err: MediaStreamError) => {
          this.initError.next(<WebcamInitError>{message: err.message, mediaStreamError: err});
        });
    } else {
      this.initError.next(<WebcamInitError> {message: "Cannot read UserMedia from MediaDevices."});
    }
  }

  /**
   * Stops all active media tracks.
   * This prevents the webcam from being indicated as active,
   * even if it is no longer used by this component.
   */
  private stopMediaTracks() {
    if (this.mediaStream && this.mediaStream.getTracks) {
      // getTracks() returns all media tracks (video+audio)
      this.mediaStream.getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    }
  }

  /**
   * Unsubscribe from all open subscriptions
   */
  private unsubscribeFromSubscriptions() {
    if (this.triggerSubscription) {
      this.triggerSubscription.unsubscribe();
    }
    if (this.switchCameraSubscription) {
      this.switchCameraSubscription.unsubscribe();
    }
  }

  /**
   * Reads available input devices
   */
  private detectAvailableDevices(): Promise<MediaDeviceInfo[]> {
    return new Promise((resolve, reject) => {
      WebcamUtil.getAvailableVideoInputs()
        .then((devices: MediaDeviceInfo[]) => {
          this.availableVideoInputs = devices;
          resolve(devices);
        })
        .catch(err => {
          this.availableVideoInputs = [];
          reject(err);
        });
    });
  }

}
