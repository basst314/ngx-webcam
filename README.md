<img src="https://img.shields.io/badge/Development-In%20Progress-orange.svg" /> This project is currently under development and **cannot** be used yet. This banner will be removed as soon as possible. Please show your interest in this project by starring it.


# Ngx-Webcam
A simple Angular 4+ Webcam-Component - pure &amp; minimal, no Flash-Fallback.

If you're looking for a simple to use, minimized version of an Angular webcam-component, this library is just right for you.

**Plug-and-play.** This library contains a single webcam-module which can be imported into nearly every existing Angular 4+ project.

**Simple to use.** One component gives you full control over the your webcam and lets you take screenshots via actions / event bindings.

**Minimal.** No unnecessary Flash-fallbacks, no bundle-size bloating.

## Prerequisites
Runtime Dependencies:
* Angular 2.x, 4.x or 5.x 
* RxJs (Observables, Subjects)

Client:
* Current Browser w/ HTML5 support (Chrome, Safari, Firefox, Edge, IE)
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
