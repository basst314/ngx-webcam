import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {WebcamInitError} from "../domain/webcam-init-error";
import {WebcamImage} from "../domain/webcam-image";

@Component({
  selector: 'webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})
export class WebcamComponent implements AfterViewInit {

  /** Defines the max width of the webcam area in px */
  @Input() public width: number = 640;
  /** Defines the max height of the webcam area in px */
  @Input() public height: number = 480;

  /** EventEmitter which fires when an image has been captured */
  @Output() public imageCapture: EventEmitter<WebcamImage> = new EventEmitter<WebcamImage>();
  /** Emits a mediaError if webcam cannot be initialized (e.g. missing user permissions) */
  @Output() public initError: EventEmitter<WebcamInitError> = new EventEmitter<WebcamInitError>();

  @ViewChild('video') private video: any;
  // Canvas for Video Snapshots
  @ViewChild('canvas') private canvas: any;


  public ngAfterViewInit(): void {
    let _video = this.video.nativeElement;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // TODO allow video options as Input()
      navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}})
        .then(stream => {
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

}
