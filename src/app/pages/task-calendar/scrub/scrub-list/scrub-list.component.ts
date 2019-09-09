import { Component } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { RestService } from '../../../../services';
import { TaskService } from '../../../../services/';
import * as cronParser from 'cron-parser';
import { Moment } from 'moment';
import { TaskScheduleListComponent } from '../../components/task-schedule-list/task-schedule-list.component';


@Component({
  selector: 'app-scrub-list',
  template: `<entity-table [title]="title" [conf]="this"></entity-table>`,
  providers: [TaskService]
})
export class ScrubListComponent {

  public title = "Scrub Tasks";
  protected resource_name = 'storage/scrub';
  protected route_add: string[] = ['tasks', 'scrub', 'add'];
  protected route_add_tooltip = "Add Scrub Task";
  protected route_edit: string[] = ['tasks', 'scrub', 'edit'];
  protected entityList: any;

  public columns: Array < any > = [
    { name: 'Pool', prop: 'scrub_volume' },
    { name: 'Threshold days', prop: 'scrub_threshold' },
    { name: 'Description', prop: 'scrub_description' },
    { name: 'Schedule', prop: 'scrub_schedule', widget: { icon: 'calendar-range', component: 'TaskScheduleListComponent' } },
    { name: 'Next Run', prop: 'scrub_next_run' },
    { name: 'Enabled', prop: 'scrub_enabled' },
  ];
  public config: any = {
    paging: true,
    sorting: { columns: this.columns },
    deleteMsg: {
      title: 'Scrub Task',
      key_props: ['scrub_volume']
    },
  };

  constructor(protected router: Router,
    protected rest: RestService,
    protected taskService: TaskService) {}

  resourceTransformIncomingRestData(data: any): any {
    for (const task of data) {
      task.scrub_schedule = `${task.scrub_minute} ${task.scrub_hour} ${task.scrub_daymonth} ${task.scrub_month} ${
        task.scrub_dayweek
      }`;

      /* Weird type assertions are due to a type definition error in the cron-parser library */
      task.scrub_next_run = ((cronParser
        .parseExpression(task.scrub_schedule, { iterator: true })
        .next() as unknown) as {
        value: { _date: Moment };
      }).value._date.fromNow();
    }
    return data;
  }
}
