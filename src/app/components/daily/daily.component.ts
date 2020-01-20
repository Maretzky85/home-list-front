import {Component, OnInit} from '@angular/core';
import {DataService} from 'src/app/services/data.service';
import {BehaviorSubject} from 'rxjs';
import {User} from '../../models/user';
import {NGXLogger} from 'ngx-logger';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-daily',
  templateUrl: './daily.component.html',
  styleUrls: ['./daily.component.scss']
})
export class DailyComponent implements OnInit {

  users$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  constructor(public data: DataService,
              private logger: NGXLogger) {
  }

  getUsers() {
    this.data.getUsers().subscribe(
      value => {
        if (!isEqual(value, this.users$.getValue())) {
          this.users$.next(value);
          this.logger.info(`Users updated`);
        }
      },
      error => this.logger.error(`error downloading users`, error)
    );
  }


  ngOnInit() {
    this.getUsers();
    setInterval( () => {
      this.logger.debug('Users change check');
      this.getUsers();
    }, 60000 );
  }

}
