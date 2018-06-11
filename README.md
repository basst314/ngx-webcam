# Ngx-Webcam
A simple Angular 4+ Webcam-Component. Pure &amp; minimal, no Flash-Fallback. <a href="https://basst314.github.io/ngx-webcam/?" target="_blank">See the Demo!</a>

**Plug-and-play.** This library contains a single webcam-module which can be imported into nearly every Angular 4+ project.

**Simple to use.** The one component gives you full control and lets you take snapshots via actions and event bindings.

**Minimal.** No unnecessary Flash-fallbacks, no bundle-size bloating.

## Demo
Try out the <a href="https://basst314.github.io/ngx-webcam/?" target="_blank">Live-Demo</a> or see the <a href="https://github.com/basst314/ngx-webcam-demo" target="_blank">Demo-Project</a>.

## Features
* Webcam live view
* Photo capturing
* Smartphone compatibility for modern OS's (OS must support WebRTC/UserMedia access)
* Access to front- and back-camera, if multiple cameras exist
* Portrait & Landscape mode on smartphones


## Prerequisites
Runtime Dependencies:
* Angular: `^4.0.0 || ^5.0.0 || ^6.0.0`
* RxJs: `^5.0.0 || ^6.0.0`

Client:
* [Current Browser](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Browser_compatibility) w/ HTML5 and WebRTC/UserMedia support (Chrome >53, Safari >11, Firefox >38, Edge)
* Webcam :)
* User permissions to access the webcam

## Usage
1) Install the library via standard npm command:

`npm install --save ngx-webcam`

2) Import the `WebcamModule` into your Angular module:

```
import {WebcamModule} from 'ngx-webcam';

@NgModule({
  imports: [
    WebcamModule
    ...
  ],
  ...
})
export class AppModule { }
```

3) Use the `WebcamComponent` on your pages:

`<webcam></webcam>`

As simple as that.

## Options and Events
This section describes the basic Inputs/Outputs of the component.
### Inputs
* `trigger: Observable<void>`: An `Observable` to trigger image capturing. When it fires, an image will be captured and emitted (see Outputs).
* `width: number`: The maximal video width of the webcam live view
* `height: number`: The maximal video height of the webcam live view
* `videoOptions: MediaTrackConstraints`: Defines base constraints to apply when requesting video track from UserMedia
* `allowCameraSwitch: boolean`: Flag to enable/disable camera switch. If enabled, a switch icon will be displayed if multiple cameras were found
* `switchCamera: Observable<boolean|string>`: Can be used to cycle through available cameras (true=forward, false=backwards), or to switch to a specific device by deviceId (string).

### Outputs
* `imageCapture: EventEmitter<WebcamImage>`: Whenever an image is captured (e.g. triggered by `[trigger]`), the image is emitted via this `EventEmitter`. The image data is contained in the `WebcamImage` data structure.
* `imageClick: EventEmitter<void>`: An `EventEmitter` to signal clicks on the webcam area.
* `initError: EventEmitter<WebcamInitError>`: An `EventEmitter` to signal errors during the webcam initialization.
* `cameraSwitched: EventEmitter<string>`: Emits the active deviceId after the active video device was switched

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
