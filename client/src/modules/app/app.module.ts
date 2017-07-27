import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: require('./components/app/app.component.html'),
  styles: [require('./components/app/app.component.css')]
})
export class AppComponent {
  title = 'app works!';
}