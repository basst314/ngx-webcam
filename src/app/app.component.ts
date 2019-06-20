import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {WebcamImage} from './modules/webcam/domain/webcam-image';
import {WebcamUtil} from './modules/webcam/util/webcam.util';
import {WebcamInitError} from './modules/webcam/domain/webcam-init-error';
import { WebcamVideo } from './modules/webcam/domain/webcam-video';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'appRoot',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    frameRate: 16
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: WebcamImage = null;
  // latest snapshot
  public webcamVideo: WebcamVideo = null;
  public videoBlob: any = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // webcam snapshot trigger
  private triggerStart: Subject<void> = new Subject<void>();
  // webcam snapshot trigger
  private triggerStop: Subject<void> = new Subject<void>();
  // webcam snapshot trigger
  private triggerPause: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  constructor(private sanitizer: DomSanitizer, private change: ChangeDetectorRef) {}

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public triggerStartSnapshot(): void {
    this.triggerStart.next();
  }

  public triggerStopSnapshot(): void {
    this.triggerStop.next();
  }

  public triggerPauseSnapshot(): void {
    this.triggerPause.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    if (error.mediaStreamError && error.mediaStreamError.name === "NotAllowedError") {
      console.warn("Camera access was not allowed by user!");
    }
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }

  public handleVideo(webcamVideo: WebcamVideo): void {
    this.webcamVideo = webcamVideo;
    this.videoBlob = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(webcamVideo.videoAsBlob));
    this.change.markForCheck();
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get triggerStartObservable(): Observable<void> {
    return this.triggerStart.asObservable();
  }

  public get triggerStopObservable(): Observable<void> {
    return this.triggerStop.asObservable();
  }

  public get triggerPauseObservable(): Observable<void> {
    return this.triggerPause.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }
}
