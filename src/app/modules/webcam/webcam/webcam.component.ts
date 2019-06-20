import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {WebcamInitError} from '../domain/webcam-init-error';
import {WebcamImage} from '../domain/webcam-image';
import {Observable, Subscription, timer, interval} from 'rxjs';
import {WebcamUtil} from '../util/webcam.util';
import {WebcamMirrorProperties} from '../domain/webcam-mirror-properties';
import { WebcamVideo } from '../domain/webcam-video';

@Component({
  selector: 'webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent implements AfterViewInit, OnDestroy {
  private static DEFAULT_VIDEO_OPTIONS: MediaTrackConstraints = {facingMode: 'environment', frameRate: {ideal: 16}};
  private static DEFAULT_IMAGE_TYPE: string = 'image/jpeg';
  private static DEFAULT_FRAME_TYPE: string = 'image/webp';
  private static DEFAULT_IMAGE_QUALITY: number = 0.92;
  private static DEFAULT_FRAME_QUALITY: number = 0.92;

  /** Defines the max width of the webcam area in px */
  @Input() public width: number = 640;
  /** Defines the max height of the webcam area in px */
  @Input() public height: number = 480;
  /** Defines base constraints to apply when requesting video track from UserMedia */
  @Input() public videoOptions: MediaTrackConstraints = WebcamComponent.DEFAULT_VIDEO_OPTIONS;
  /** Flag to enable/disable camera switch. If enabled, a switch icon will be displayed if multiple cameras were found */
  @Input() public allowCameraSwitch: boolean = true;
  /** Parameter to control image mirroring (i.e. for user-facing camera). ["auto", "always", "never"] */
  @Input() public mirrorImage: string | WebcamMirrorProperties;
  /** Flag to control whether an ImageData object is stored into the WebcamImage object. */
  @Input() public captureImageData: boolean = false;
  /** The image type to use when capturing snapshots */
  @Input() public imageType: string = WebcamComponent.DEFAULT_IMAGE_TYPE;
  /** The video frame type to use when recording video */
  @Input() public frameType: string = WebcamComponent.DEFAULT_FRAME_TYPE;
  /** The image quality to use when capturing snapshots (number between 0 and 1) */
  @Input() public imageQuality: number = WebcamComponent.DEFAULT_IMAGE_QUALITY;
  /** The image quality to use when capturing snapshots (number between 0 and 1) */
  @Input() public frameQuality: number = WebcamComponent.DEFAULT_FRAME_QUALITY;

  /** EventEmitter which fires when an image has been captured */
  @Output() public imageCapture: EventEmitter<WebcamImage> = new EventEmitter<WebcamImage>();
  /** EventEmitter which fires when a video has been captured */
  @Output() public videoCapture: EventEmitter<WebcamVideo> = new EventEmitter<WebcamVideo>();
  /** Emits a mediaError if webcam cannot be initialized (e.g. missing user permissions) */
  @Output() public initError: EventEmitter<WebcamInitError> = new EventEmitter<WebcamInitError>();
  /** Emits when the webcam video was clicked */
  @Output() public imageClick: EventEmitter<void> = new EventEmitter<void>();
  /** Emits the active deviceId after the active video device was switched */
  @Output() public cameraSwitched: EventEmitter<string> = new EventEmitter<string>();

  /** available video devices */
  public availableVideoInputs: MediaDeviceInfo[] = [];

  /** Indicates whether the video device is ready to be switched */
  public videoInitialized: boolean = false;
  /** Holds the instance of the currently recorded video */
  public videoCaptured: WebcamVideo = undefined;
  /** Holds the instance of the currently recorded video interval */
  public videoCapturedTimeoutRef: any = undefined;

  /** If the Observable represented by this subscription emits, an image will be captured and emitted through
   * the 'imageCapture' EventEmitter */
  private triggerSubscription: Subscription;
  /** If the Observable represented by this subscription emits, a video will be captured. Once stopped the video will be emitted through
   * the 'videoCapture' EventEmitter */
  private triggerStartSubscription: Subscription;
  /** If the Observable represented by this subscription emits, the captured video will be finished and emitted through
   * the 'videoCapture' EventEmitter */
  private triggerStopSubscription: Subscription;
  /** If the Observable represented by this subscription emits, the captured video will be paused */
  private triggerPauseSubscription: Subscription;
  /** Index of active video in availableVideoInputs */
  private activeVideoInputIndex: number = -1;
  /** Subscription to switchCamera events */
  private switchCameraSubscription: Subscription;
  /** MediaStream object in use for streaming UserMedia data */
  private mediaStream: MediaStream = null;
  @ViewChild('video', { static: true }) private video: any;
  /** Canvas for Video Snapshots */
  @ViewChild('canvas', { static: true }) private canvas: any;

  /** width and height of the active video stream */
  private activeVideoSettings: MediaTrackSettings = null;

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

  /**
   * If the given Observable emits, a video will be captured. Once finished video will be emitted through 'videoCapture' EventEmitter
   */
  @Input()
  public set triggerStart(trigger: Observable<void>) {
    if (this.triggerStartSubscription) {
      this.triggerStartSubscription.unsubscribe();
    }

    // Subscribe to events from this Observable to take snapshots
    this.triggerStartSubscription = trigger.subscribe(() => {
      this.startRecording();
    });
  }

  /**
   * If the given Observable emits, a video will be captured. Once finished video will be emitted through 'videoCapture' EventEmitter
   */
  @Input()
  public set triggerStop(trigger: Observable<void>) {
    if (this.triggerStopSubscription) {
      this.triggerStopSubscription.unsubscribe();
    }

    // Subscribe to events from this Observable to take snapshots
    this.triggerStopSubscription = trigger.subscribe(() => {
      this.stopRecording();
    });
  }

  /**
   * If the given Observable emits, a video will be captured. Once finished video will be emitted through 'videoCapture' EventEmitter
   */
  @Input()
  public set triggerPause(trigger: Observable<void>) {
    if (this.triggerPauseSubscription) {
      this.triggerPauseSubscription.unsubscribe();
    }

    // Subscribe to events from this Observable to take snapshots
    this.triggerPauseSubscription = trigger.subscribe(() => {
      this.pauseRecording();
    });
  }

  /**
   * If the given Observable emits, the active webcam will be switched to the one indicated by the emitted value.
   * @param switchCamera Indicates which webcam to switch to
   *   true: cycle forwards through available webcams
   *   false: cycle backwards through available webcams
   *   string: activate the webcam with the given id
   */
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
    });
  }

  /**
   * Get MediaTrackConstraints to request streaming the given device
   * @param deviceId
   * @param baseMediaTrackConstraints base constraints to merge deviceId-constraint into
   * @returns
   */
  private static getMediaConstraintsForDevice(deviceId: string, baseMediaTrackConstraints: MediaTrackConstraints): MediaTrackConstraints {
    const result: MediaTrackConstraints = baseMediaTrackConstraints ? baseMediaTrackConstraints : this.DEFAULT_VIDEO_OPTIONS;
    if (deviceId) {
      result.deviceId = {exact: deviceId};
    }

    return result;
  }

  /**
   * Tries to harvest the deviceId from the given mediaStreamTrack object.
   * Browsers populate this object differently; this method tries some different approaches
   * to read the id.
   * @param mediaStreamTrack
   * @returns deviceId if found in the mediaStreamTrack
   */
  private static getDeviceIdFromMediaStreamTrack(mediaStreamTrack: MediaStreamTrack): string {
    if (mediaStreamTrack.getSettings && mediaStreamTrack.getSettings() && mediaStreamTrack.getSettings().deviceId) {
      return mediaStreamTrack.getSettings().deviceId;
    } else if (mediaStreamTrack.getConstraints && mediaStreamTrack.getConstraints() && mediaStreamTrack.getConstraints().deviceId) {
      const deviceIdObj: ConstrainDOMString = mediaStreamTrack.getConstraints().deviceId;
      return WebcamComponent.getValueFromConstrainDOMString(deviceIdObj);
    }
  }

  /**
   * Tries to harvest the facingMode from the given mediaStreamTrack object.
   * Browsers populate this object differently; this method tries some different approaches
   * to read the value.
   * @param mediaStreamTrack
   * @returns facingMode if found in the mediaStreamTrack
   */
  private static getFacingModeFromMediaStreamTrack(mediaStreamTrack: MediaStreamTrack): string {
    if (mediaStreamTrack) {
      if (mediaStreamTrack.getSettings && mediaStreamTrack.getSettings() && mediaStreamTrack.getSettings().facingMode) {
        return mediaStreamTrack.getSettings().facingMode;
      } else if (mediaStreamTrack.getConstraints && mediaStreamTrack.getConstraints() && mediaStreamTrack.getConstraints().facingMode) {
        const facingModeConstraint: ConstrainDOMString = mediaStreamTrack.getConstraints().facingMode;
        return WebcamComponent.getValueFromConstrainDOMString(facingModeConstraint);
      }
    }
  }

  /**
   * Determines whether the given mediaStreamTrack claims itself as user facing
   * @param mediaStreamTrack
   */
  private static isUserFacing(mediaStreamTrack: MediaStreamTrack): boolean {
    const facingMode: string = WebcamComponent.getFacingModeFromMediaStreamTrack(mediaStreamTrack);
    return facingMode ? 'user' === facingMode.toLowerCase() : false;
  }

  /**
   * Extracts the value from the given ConstrainDOMString
   * @param constrainDOMString
   */
  private static getValueFromConstrainDOMString(constrainDOMString: ConstrainDOMString): string {
    if (constrainDOMString) {
      if (constrainDOMString instanceof String) {
        return String(constrainDOMString);
      } else if (Array.isArray(constrainDOMString) && Array(constrainDOMString).length > 0) {
        return String(constrainDOMString[0]);
      } else if (typeof constrainDOMString === 'object') {
        if (constrainDOMString['exact']) {
          return String(constrainDOMString['exact']);
        } else if (constrainDOMString['ideal']) {
          return String(constrainDOMString['ideal']);
        }
      }
    }

    return null;
  }

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

  public startRecording() {
    const frameRate = typeof this.videoOptions.frameRate === 'number' ? this.videoOptions.frameRate : this.videoOptions.frameRate.ideal;

    this.videoCaptured = new WebcamVideo(frameRate, 'video/webm');

    this.takeFrames(0, frameRate);
  }

  public stopRecording() {
    if(this.videoCapturedTimeoutRef) {
      clearTimeout(this.videoCapturedTimeoutRef);
      this.videoCapturedTimeoutRef = undefined;
    }

    if(this.videoCaptured) {
      this.videoCapture.next(this.videoCaptured);
    }
  }

  public pauseRecording() {
    if(this.videoCapturedTimeoutRef) {
      clearTimeout(this.videoCapturedTimeoutRef);
      this.videoCapturedTimeoutRef = undefined;
    } else {
      this.takeFrames(0, this.videoCaptured.frameRate);
    }
  }

  /**
   * Takes a snapshot of the current webcam's view and emits the image as an event
   */
  public takeSnapshot(): void {
    const canvas = this.take();

    // read canvas content as image
    const mimeType: string = this.imageType ? this.imageType : WebcamComponent.DEFAULT_IMAGE_TYPE;
    const quality: number = this.imageQuality ? this.imageQuality : WebcamComponent.DEFAULT_IMAGE_QUALITY;
    const dataUrl: string = canvas.getContext('2d').canvas.toDataURL(mimeType, quality);

    // get the ImageData object from the canvas' context.
    let imageData: ImageData = null;

    if (this.captureImageData) {
      imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    }

    this.imageCapture.next(new WebcamImage(dataUrl, mimeType, imageData, canvas.getContext('2d')));
  }

  /**
   * Switches to the next/previous video device
   * @param forward
   */
  public rotateVideoInput(forward: boolean) {
    if (this.availableVideoInputs && this.availableVideoInputs.length > 1) {
      const increment: number = forward ? 1 : (this.availableVideoInputs.length - 1);
      const nextInputIndex = (this.activeVideoInputIndex + increment) % this.availableVideoInputs.length;
      this.switchToVideoInput(this.availableVideoInputs[nextInputIndex].deviceId);
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


  /**
   * Event-handler for video resize event.
   * Triggers Angular change detection so that new video dimensions get applied
   */
  public videoResize(): void {
    // here to trigger Angular change detection
  }

  public get videoWidth() {
    const videoRatio = this.getVideoAspectRatio();
    return Math.min(this.width, this.height * videoRatio);
  }

  public get videoHeight() {
    const videoRatio = this.getVideoAspectRatio();
    return Math.min(this.height, this.width / videoRatio);
  }

  public get videoStyleClasses() {
    let classes: string = '';

    if (this.isMirrorImage()) {
      classes += 'mirrored ';
    }

    return classes.trim();
  }

  public get nativeVideoElement() {
    return this.video.nativeElement;
  }

  private takeFrames(delay, frameRate) {
    this.videoCapturedTimeoutRef = setTimeout(() => {
      const start = Date.now();
      const canvas = this.take();

      // get the ImageData object from the canvas' context.
      let imageData: ImageData = null;
  
      if (this.captureImageData) {
        imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      }
      this.videoCaptured.addFrame(canvas.getContext('2d'));

      this.takeFrames(1000 / frameRate - (Date.now() - start), frameRate);
    }, delay)
  }

  /**
   * Returns the video aspect ratio of the active video stream
   */
  private getVideoAspectRatio(): number {
    // calculate ratio from video element dimensions if present
    const videoElement = this.nativeVideoElement;
    if (videoElement.videoWidth && videoElement.videoWidth > 0 &&
      videoElement.videoHeight && videoElement.videoHeight > 0) {

      return videoElement.videoWidth / videoElement.videoHeight;
    }

    // nothing present - calculate ratio based on width/height params
    return this.width / this.height;
  }
  
  private take(): HTMLCanvasElement {
    // set canvas size to actual video size
    const _video = this.nativeVideoElement;
    const dimensions = {width: this.width, height: this.height};
    if (_video.videoWidth) {
      dimensions.width = _video.videoWidth;
      dimensions.height = _video.videoHeight;
    }

    const _canvas = this.canvas.nativeElement;
    _canvas.width = dimensions.width;
    _canvas.height = dimensions.height;

    // paint snapshot image to canvas
    const context2d = _canvas.getContext('2d');
    context2d.drawImage(_video, 0, 0, _video.videoWidth, _video.videoHeight);
    _canvas.toDataURL(this.frameType, this.frameQuality);
    return _canvas;
  }

  /**
   * Init webcam live view
   */
  private initWebcam(deviceId: string, userVideoTrackConstraints: MediaTrackConstraints) {
    const _video = this.nativeVideoElement;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      // merge deviceId -> userVideoTrackConstraints
      const videoTrackConstraints = WebcamComponent.getMediaConstraintsForDevice(deviceId, userVideoTrackConstraints);

      navigator.mediaDevices.getUserMedia(<MediaStreamConstraints>{video: videoTrackConstraints})
        .then((stream: MediaStream) => {
          this.mediaStream = stream;
          _video.srcObject = stream;
          _video.play();

          this.activeVideoSettings = stream.getVideoTracks()[0].getSettings();
          const activeDeviceId: string = WebcamComponent.getDeviceIdFromMediaStreamTrack(stream.getVideoTracks()[0]);
          this.activeVideoInputIndex = activeDeviceId ? this.availableVideoInputs
            .findIndex((mediaDeviceInfo: MediaDeviceInfo) => mediaDeviceInfo.deviceId === activeDeviceId) : -1;
          this.videoInitialized = true;

          this.cameraSwitched.next(activeDeviceId);

          // Initial detect may run before user gave permissions, returning no deviceIds. This prevents later camera switches. (#47)
          // Run detect once again within getUserMedia callback, to make sure this time we have permissions and get deviceIds.
          this.detectAvailableDevices();
        })
        .catch((err: MediaStreamError) => {
          this.initError.next(<WebcamInitError>{message: err.message, mediaStreamError: err});
        });
    } else {
      this.initError.next(<WebcamInitError>{message: 'Cannot read UserMedia from MediaDevices.'});
    }
  }

  private getActiveVideoTrack(): MediaStreamTrack {
    return this.mediaStream ? this.mediaStream.getVideoTracks()[0] : null;
  }

  private isMirrorImage(): boolean {
    if (!this.getActiveVideoTrack()) {
      return false;
    }

    // check for explicit mirror override parameter
    {
      let mirror: string = 'auto';
      if (this.mirrorImage) {
        if (typeof this.mirrorImage === 'string') {
          mirror = String(this.mirrorImage).toLowerCase();
        } else {
          // WebcamMirrorProperties
          if (this.mirrorImage.x) {
            mirror = this.mirrorImage.x.toLowerCase();
          }
        }
      }

      switch (mirror) {
        case 'always':
          return true;
        case 'never':
          return false;
      }
    }

    // default: enable mirroring if webcam is user facing
    return WebcamComponent.isUserFacing(this.getActiveVideoTrack());
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
    if (this.videoCapturedTimeoutRef) {
      clearTimeout(this.videoCapturedTimeoutRef);
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
