import {Component, OnInit} from '@angular/core';
import {DataService} from 'src/app/services/data.service';
import {BehaviorSubject} from 'rxjs';
import {User} from '../../models/user';
import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'app-daily',
  templateUrl: './daily.component.html',
  styleUrls: ['./daily.component.scss']
})
export class DailyComponent implements OnInit {

  users$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>(null);

  constructor(public data: DataService,
              private logger: NGXLogger) {
  }

  getData() {
    this.data.downloadData();
  }

  ngOnInit() {
    this.data.getUsers().subscribe(
      value => this.users$.next(value),
      error => this.logger.error(`error downloading users`, error)
    );
  }

}
