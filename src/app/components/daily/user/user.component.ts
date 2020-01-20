import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {UserDto} from '../../../models/userDto';
import {DataService} from '../../../services/data.service';
import {Daily} from '../../../models/daily';
import {TaskComponent} from '../task/task.component';
import {NGXLogger} from 'ngx-logger';
import {User} from '../../../models/user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  @Input() user: User;

  @ViewChild(TaskComponent, {static: false}) child: TaskComponent;

  add = false;

  daily: Daily;

  constructor(private dataService: DataService,
              private logger: NGXLogger) {
  }

  buttonHandler(event) {
    if (event.key === 'Enter') {
      this.logger.info(`creating new event: ${this.daily.task}`);
      this.dataService.addDaily(this.daily)
        .subscribe(
        value => {
          this.child.getDailies();
        }, error => this.logger.error(`error downloading data`, error)
      );
    }
  }

  ngOnInit() {
    this.daily = {
      task: '',
      userId: this.user.id
    };
  }

}
