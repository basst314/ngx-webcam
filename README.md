# ngx-webcam [![npm version](https://badge.fury.io/js/ngx-webcam.svg)](https://badge.fury.io/js/ngx-webcam) [![Build Status](https://api.travis-ci.com/basst314/ngx-webcam.svg?branch=master)](https://app.travis-ci.com/github/basst314/ngx-webcam)

A simple Angular webcam component. Pure &amp; minimal, no
Flash-fallback. <a href="https://basst314.github.io/ngx-webcam/?" target="_blank">See the Demo!</a>

**Plug-and-play.** This library contains a single module which can be imported into every standard Angular 13+ project.

**Simple to use.** The one component gives you full control and lets you take snapshots via actions and event bindings.

**Minimal.** No unnecessary Flash-fallbacks, no bundle-size bloating.

## Demo

Try out the <a href="https://basst314.github.io/ngx-webcam/?" target="_blank">Live-Demo</a> or see
the <a href="https://github.com/basst314/ngx-webcam-demo" target="_blank">Demo-Project</a>.

## Features

- Webcam live view
- Photo capturing
- Smartphone compatibility for modern OS's (OS must
  support [WebRTC/UserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices))
- Access to front- and back-camera, if multiple cameras exist
- Portrait & Landscape mode on smartphones
- Mirrored live-view for user-facing cameras - "selfie view" on phones
- Capturing of lossless pixel image data for better post-processing.

## Prerequisites

### Runtime Dependencies

**Note:** For older versions of Angular/TypeScript, please use previous releases of this library.

- Angular: `>=13.0.0`
- Typescript: `>=4.4.4`
- RxJs: `>=6.6.0`
- **Important:** Your app must be served on a secure context using `https://` or on localhost, for modern browsers to
  permit WebRTC/UserMedia access.

### Client

- [Current browser](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Browser_compatibility) w/
  HTML5 and WebRTC/UserMedia support (Chrome >53, Safari >11, Firefox >38, Edge)
- Webcam / camera
- User permissions to access the camera

## Usage

1. Install the library via standard npm command:

`npm install --save ngx-webcam`

2. Import the `WebcamModule` into your Angular module:

```typescript
import {WebcamModule} from 'ngx-webcam';

@NgModule({
  imports: [
    WebcamModule,
    ...
  ],
  ...
})
export class AppModule {
}
```

3. Use the `WebcamComponent` on your pages:

`<webcam></webcam>`

As simple as that.

For more examples, see the code in the <a href="https://github.com/basst314/ngx-webcam-demo" target="_blank">
Demo-Project</a>.

## Options and Events

This section describes the basic inputs/outputs of the component. All inputs are optional.

### Inputs

- `trigger: Observable<void>`: An `Observable` to trigger image capturing. When it fires, an image will be captured and
  emitted (see Outputs).
- `width: number`: The maximal video width of the webcam live view.
- `height: number`: The maximal video height of the webcam live view. The actual view will be placed within these
  boundaries, respecting the aspect ratio of the video stream.
- `videoOptions: MediaTrackConstraints`: Defines
  constraints ([MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)) to apply
  when requesting the video track.
- `mirrorImage: string | WebcamMirrorProperties`: Flag to control image mirroring. If the attribute is missing or `null`
  and the camera claims to be user-facing, the image will be mirrored (x-axis) to provide a better user experience ("
  selfie view"). A string value of `"never"` will prevent mirroring, whereas a value of `"always"` will mirror every
  camera stream, even if the camera cannot be detected as user-facing. For future extensions,
  the `WebcamMirrorProperties` object can also be used to set these values.
- `allowCameraSwitch: boolean`: Flag to enable/disable camera switch. If enabled, a switch icon will be displayed if
  multiple cameras are found.
- `switchCamera: Observable<boolean|string>`: Can be used to cycle through available cameras (true=forward,
  false=backwards), or to switch to a specific device by deviceId (string).
- `captureImageData: boolean = false`: Flag to enable/disable capturing of a lossless pixel ImageData object when a
  snapshot is taken. ImageData will be included in the emitted `WebcamImage` object.
- `imageType: string = 'image/jpeg'`: [Image type](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL)
  to use when capturing snapshots. Default is 'image/jpeg'.
- `imageQuality: number = 0.92`: [Image quality](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL)
  to use when capturing snapshots. Must be a number between 0..1. Default is 0.92.

### Outputs

- `imageCapture: EventEmitter<WebcamImage>`: Whenever an image is captured (i.e. triggered by `[trigger]`), the image is
  emitted via this `EventEmitter`. The image data is contained in the `WebcamImage` data structure as both, plain Base64
  string and data-url.
- `imageClick: EventEmitter<void>`: An `EventEmitter` to signal clicks on the webcam area.
- `initError: EventEmitter<WebcamInitError>`: An `EventEmitter` to signal errors during the webcam initialization.
- `cameraSwitched: EventEmitter<string>`: Emits the active deviceId after the active video device has been switched.

## Good To Know

### How to determine if a user has denied camera access

When camera initialization fails for some reason, the component emits a `WebcamInitError` via the `initError`
EventEmitter. If provided by the browser, this object contains a field `mediaStreamError: MediaStreamError` which
contains information about why UserMedia initialization failed. According
to [Mozilla API docs](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), this object contains
a `name` attribute which gives insight about the reason.
> If the user denies permission, or matching media is not available, then the promise is rejected with NotAllowedError or NotFoundError respectively.

Determine if a user has denied permissions:

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

Run `npm start` to build and run the surrounding demo app with the `WebcamModule`. Essential for live-developing.

### Generate docs/

Run `npm run docs` to generate the live-demo documentation pages in the `docs/` directory.

### Running Unit Tests

Run `npm run test` to run unit-tests.
