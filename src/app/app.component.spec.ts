import {TestBed, waitForAsync} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {WebcamComponent} from './modules/webcam/webcam/webcam.component';
import {FormsModule} from '@angular/forms';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        WebcamComponent
      ],
      imports: [
        FormsModule
      ]
    }).compileComponents();
  }));

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should render title in a h1 tag', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('ngx-webcam Demo');
  }));

  it('closing camera connection when turning off camera', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app.deviceId = '111';
    app.showWebcam = true;
    const compiled = fixture.debugElement.nativeElement;

    app.turnOffCamera();

    expect(app.deviceId).toBeNull();
    expect(app.showWebcam).toBeFalse();
    expect(compiled.querySelector('webcam')).toBeNull();
  }));

});
