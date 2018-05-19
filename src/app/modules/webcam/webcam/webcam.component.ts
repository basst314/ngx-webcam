import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {WebcamInitError} from "../domain/webcam-init-error";
import {WebcamImage} from "../domain/webcam-image";
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent implements AfterViewInit, OnDestroy {

  /** Defines the max width of the webcam area in px */
  @Input() public width: number = 640;
  /** Defines the max height of the webcam area in px */
  @Input() public height: number = 480;
  /** If this Observable emits, an image will be captured and emitted through 'imageCapture' EventEmitter */
  private _trigger: Observable<void>;
  private triggerSubscription: Subscription;

  /** MediaStream object in use for streaming UserMedia data */
  private mediaStream: MediaStream = null;

  /** EventEmitter which fires when an image has been captured */
  @Output() public imageCapture: EventEmitter<WebcamImage> = new EventEmitter<WebcamImage>();
  /** Emits a mediaError if webcam cannot be initialized (e.g. missing user permissions) */
  @Output() public initError: EventEmitter<WebcamInitError> = new EventEmitter<WebcamInitError>();

  /** Emits when the webcam video was clicked */
  @Output() public imageClick: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('video') private video: any;
  // Canvas for Video Snapshots
  @ViewChild('canvas') private canvas: any;


  public ngAfterViewInit(): void {
    this.initWebcam();
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
    this._trigger = trigger;

    // Subscribe on events from this Observable to take snapshots
    this.triggerSubscription = this._trigger.subscribe(() => {
      this.takeSnapshot();
    });
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
   * Init webcam live view
   */
  private initWebcam() {
    let _video = this.video.nativeElement;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // TODO allow video options as Input()
      navigator.mediaDevices.getUserMedia(<MediaStreamConstraints>{video: {facingMode: "environment"}})
        .then((stream: MediaStream) => {
          this.mediaStream = stream;
          _video.srcObject = stream;
          _video.play();
        })
        .catch((err: MediaStreamError) => {
          this.initError.next(<WebcamInitError>{message: err.message, mediaStreamError: err});
          console.warn("Error initializing webcam", err);
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
  }
}
