import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from '../app-routing/app-routing.module';
import { AppComponent } from '../../components/app/app.component';
import { TaskViewComponent } from '../../components/task-view/task-view.component';
import { AssigneeViewComponent } from '../../components/assignee-view/assignee-view.component';
import { FetchDataService } from '../../services/fetch-data/fetch-data.service';

@NgModule({
  declarations: [
    AppComponent,
    AssigneeViewComponent,
    TaskViewComponent
  ],
  imports: [
        BrowserModule,
        AppRoutingModule
    ],
  providers: [
    FetchDataService,
    {provide: 'window', useValue: window}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
