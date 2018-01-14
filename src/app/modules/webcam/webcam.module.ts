import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WebcamComponent} from './webcam/webcam.component';

const COMPONENTS = [
  WebcamComponent
];

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    COMPONENTS
  ],
  exports: [
    COMPONENTS
  ]
})
export class WebcamModule {
}
