<img src="https://img.shields.io/badge/Development-In%20Progress-orange.svg" /> This project is currently under heavy development and is still in a pre-release phase. Please show your interest in this project by starring it.


# Ngx-Webcam
A simple Angular 4+ Webcam-Component - pure &amp; minimal, no Flash-Fallback. <a href="https://basst314.github.io/ngx-webcam/?" target="_blank">Demo</a>

**Plug-and-play.** This library contains a single webcam-module which can be imported into nearly every Angular 4+ project.

**Simple to use.** The one component gives you full control and lets you take screenshots via actions and event bindings.

**Minimal.** No unnecessary Flash-fallbacks, no bundle-size bloating.

## Demo
Try out the online <a href="https://basst314.github.io/ngx-webcam/?" target="_blank">Demo</a>.

## Features
* Webcam live view
* Photo capturing (Feature in progress)
* Smartphone compatibility (OS must support WebRTC/UserMedia access, like it does on iOS 11.x and Android ??)
* Access to front- and back-camera, if multiple cameras exist (Feature in progress)

More features coming soon.

## Prerequisites
Runtime Dependencies:
* Angular 2.x, 4.x or 5.x 
* RxJs (Observables, Subjects)

Client:
* Current Browser w/ HTML5 and WebRTC/UserMedia support (Chrome >53, Safari >11, Firefox >38, Edge)
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
Find options and events here soon... // development in progress

## Development
Here you can find instructions on how to start developing this library.

### Build

Run `npm run packagr` to build the library. The build artifacts will be stored in the `dist/` directory.

### Running Unit Tests
Will follow soon.
