# Ngx-Webcam [![npm version](https://badge.fury.io/js/ngx-webcam.svg)](https://badge.fury.io/js/ngx-webcam) [![Build Status](https://travis-ci.org/basst314/ngx-webcam.svg?branch=master)](https://travis-ci.org/basst314/ngx-webcam)

A simple Angular 4+ Webcam-Component. Pure &amp; minimal, no Flash-Fallback. <a href="https://basst314.github.io/ngx-webcam/?" target="_blank">See the Demo!</a>

**Plug-and-play.** This library contains a single webcam-module which can be imported into nearly every Angular 4+ project.

**Simple to use.** The one component gives you full control and lets you take snapshots via actions and event bindings.

**Minimal.** No unnecessary Flash-fallbacks, no bundle-size bloating.

## Demo
Try out the <a href="https://basst314.github.io/ngx-webcam/?" target="_blank">Live-Demo</a> or see the <a href="https://github.com/basst314/ngx-webcam-demo" target="_blank">Demo-Project</a>.

## Features
* Webcam live view
* Photo capturing
* Video capturing ((Re)Play, Finish, Pause / Resume Function)
* Smartphone compatibility for modern OS's (OS must support WebRTC/UserMedia API)
* Access to front- and back-camera, if multiple cameras exist
* Portrait & Landscape mode on smartphones
* Mirrored view for user-facing cameras, to enhance user experience (e.g. on smartphones)
* Capturing of lossless pixel image data for better post-processing.


## Prerequisites

### Runtime Dependencies
* Angular: `^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0`
* RxJs: `^5.0.0 || ^6.0.0`
* App must be served on a secure context (https or localhost)

### Client
* [Current Browser](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Browser_compatibility) w/ HTML5 and WebRTC/UserMedia support (Chrome >53, Safari >11, Firefox >38, Edge)
* Webcam :)
* User permissions to access the webcam

## Usage
1) Install the library via standard npm command:

`npm install --save ngx-webcam`

2) Import the `WebcamModule` into your Angular module:

```typescript
import {WebcamModule} from 'ngx-webcam';

@NgModule({
  imports: [
    WebcamModule,
    ...
  ],
  ...
})
export class AppModule { }
```

3) Use the `WebcamComponent` on your pages:

`<webcam></webcam>`

4) Optionally for WebM video captuing support you need to add this to your `angular.json`:

```
...
"scripts": [
  "node_modules/whammy/whammy.js"
]
...
```

As simple as that. 

For more examples, see the code in the <a href="https://github.com/basst314/ngx-webcam-demo" target="_blank">Demo-Project</a>.

## Options and Events
This section describes the basic inputs/outputs of the component. All inputs are optional.
### Inputs
* `trigger: Observable<void>`: An `Observable` to trigger image capturing. When it fires, an image will be captured and emitted (see Outputs).
* `triggerStart: Observable<void>`: An `Observable` to trigger video capturing. When it fires, a video will be captured any captured video will be removed.
* `triggerStop: Observable<void>`: An `Observable` to trigger video finish. When it fires, the started video will be finished and emitted (see Outputs).
* `triggerPause: Observable<void>`: An `Observable` to trigger pausing / resuming video capturing. When it fires, the video will be put on hold or resumed.
* `width: number`: The maximal video width of the webcam live view.
* `height: number`: The maximal video height of the webcam live view. The actual view will be placed within these boundaries, respecting the aspect ratio of the video stream.
* `videoOptions: MediaTrackConstraints`: Defines constraints ([MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)) to apply when requesting the video track. 
Note: You can request a framerate (default : 16 fps) here which will be tried to reach. Since rendering takes some time the requested framerate is possibly not reached on some devices.
* `mirrorImage: string | WebcamMirrorProperties`: Flag to control image mirroring. If the attribute is missing or `null` and a webcam claims to be user-facing, the image will be mirrored (x-axis) to provide a better user experience. A string value of `"never"` will prevent mirroring, whereas a value of `"always"` will mirror every webcam stream, even if the webcam cannot be detected as user-facing. For future extensions, the `WebcamMirrorProperties` object can also be used to set these values.
* `allowCameraSwitch: boolean`: Flag to enable/disable camera switch. If enabled, a switch icon will be displayed if multiple cameras are found.
* `switchCamera: Observable<boolean|string>`: Can be used to cycle through available cameras (true=forward, false=backwards), or to switch to a specific device by deviceId (string).
* `captureImageData: boolean = false`: Flag to enable/disable capturing of a lossless pixel ImageData object when a snapshot is taken. ImageData will be included in the emitted `WebcamImage` object.
* `imageType: string = 'image/jpeg'`: [Image type](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) to use when capturing snapshots. Default is 'image/jpeg'.
* `frameType: string = 'image/webp'`: [Image type](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) to use when capturing video frames. Default is 'image/webp' (only supported currently).
* `imageQuality: number = 0.92`: [Image quality](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) to use when capturing snapshots. Must be a number between 0..1. Default is 0.92.
* `frameQuality: number = 0.92`: [Image quality](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) to use when capturing video frames. Must be a number between 0..1. Default is 0.92.

### Outputs
* `imageCapture: EventEmitter<WebcamImage>`: Whenever an image is captured (i.e. triggered by `[trigger]`), the image is emitted via this `EventEmitter`. The image data is contained in the `WebcamImage` data structure as both, plain Base64 string and data-url.
* `videoCapture: EventEmitter<WebcamVideo>`: Whenever a video is captured (i.e. triggered by `[triggerStop]`), the video is emitted via this `EventEmitter`. The video data is contained in the `WebcamVideo` data structure as both, plain Base64 string and Blob.
* `imageClick: EventEmitter<void>`: An `EventEmitter` to signal clicks on the webcam area.
* `initError: EventEmitter<WebcamInitError>`: An `EventEmitter` to signal errors during the webcam initialization.
* `cameraSwitched: EventEmitter<string>`: Emits the active deviceId after the active video device has been switched.

## Good To Know
### How to determine if the user denied camera access
When camera initialization fails for some reason, the component emits a `WebcamInitError` via the `initError` EventEmitter. If provided by the browser, this object contains a field `mediaStreamError: MediaStreamError` which contains information about why UserMedia initialization failed. According to [Mozilla API docs](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), this object contains a `name` attribute which gives insight about the reason.
> If the user denies permission, or matching media is not available, then the promise is rejected with NotAllowedError or NotFoundError respectively.

In case a user denied permissions this can be determined like this:
```
  <webcam (initError)="handleInitError($event)"></webcam>
```
```
  public handleInitError(error: WebcamInitError): void {
    if (error.mediaStreamError && error.mediaStreamError.name === "NotAllowedError") {
      console.warn("Camera access was not allowed by user!");
    }
  }
```

## Development
Here you can find instructions on how to start developing this library.

### Build
Run `npm run packagr` to build the library. The build artifacts will be stored in the `dist/` directory.

### Start
Run `npm start` to build and run the surrounding webapp with the `WebcamModule`. Essential for live-developing.

### Generate docs/
Run `npm run docs` to generate the live-demo documentation pages in the `docs/` directory.

### Running Unit Tests
Run `npm run test` to run unit-tests.
