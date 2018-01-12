import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TestHeaderComponent} from './test-header/test-header.component';

const COMPONENTS = [
  TestHeaderComponent
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
export class HeaderModule {
}
