import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TaskViewComponent } from '../../components/task-view/task-view.component';
import { AssigneeViewComponent } from '../../components/assignee-view/assignee-view.component';

const appRoutes: Routes = [
    {
        path: 'assignee',
        component: AssigneeViewComponent
    },
    {
        path: '',
        component: TaskViewComponent,
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {}
