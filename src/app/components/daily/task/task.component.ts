import {AfterViewInit, Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {Daily} from '../../../models/daily';
import {BehaviorSubject, Observable} from 'rxjs';
import {DataService} from '../../../services/data.service';
import {NGXLogger} from 'ngx-logger';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSelectionList} from '@angular/material';
import {map, tap} from 'rxjs/operators';

export interface DialogData {
  task: string;
}

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit, AfterViewInit {

  @Input() userId: number;

  @ViewChild(MatSelectionList, {static: false})
  matSelectionList: MatSelectionList;

  dailies$: BehaviorSubject<Daily[]> = new BehaviorSubject<Daily[]>(null);

  visible = false;

  timeToTarget$: Observable<any>;

  arrivalTime$: BehaviorSubject<Date> = new BehaviorSubject<Date>(null);

  constructor(private dataService: DataService,
              private logger: NGXLogger,
              public dialog: MatDialog) {
  }

  deleteTask(id: number) {
    this.logger.info(`Deleting task of id: ${id}`);
    this.dataService.deleteDaily(id).subscribe(
      source => {
        this.downloadData();
      }, error => {
        this.logger.error('Error deleting task', error);
      }
    );
  }

  resetTasks() {
    this.visible = true;
    this.matSelectionList.selectedOptions.clear();
  }

  downloadData() {
    this.dataService.getDailyForUser(this.userId)
      .subscribe(
        value => {
          this.resetTasks();
          this.dailies$.next(value.sort((a, b) => a.id > b.id ? 1 : -1));
        },
        error => this.logger.error(`Error downloading dailies`, error)
      );
  }

  ngOnInit() {
    this.downloadData();
    this.timeToTarget$ = this.getTimeToTarget();
  }

  editTask(daily: Daily) {
    this.openDialog(daily.task).subscribe((result: string) => {
      if (!result) {
        return;
      }
      this.dataService.editDaily({id: daily.id, task: result, userId: this.userId})
        .subscribe(value => {
            this.logger.info(`Updated task: id: ${daily.id}, task: ${result}`);
            this.downloadData();
          },
          error => this.logger.error('Error updating daily', error));
    });
  }

  getTimeToTarget() {
    return this.dataService.getTimeToTarget('Warszawa, kasprowicza 107').pipe(
      map(value => Math.floor(value / 60))
    ).pipe(
      tap(x => {
          const date = new Date(Date.now());
          date.setMinutes(date.getMinutes() + x);
          this.arrivalTime$.next(date);
        }
      )
    );
  }

  openDialog(task: string) {
    const dialogRef = this.dialog.open(DialogForTaskComponent, {
      width: '250px',
      data: {task}
    });
    return dialogRef.afterClosed();
  }

  checkSelected(task: string) {
    return this.matSelectionList.selectedOptions.selected.map( value => value.value ).includes(task);
  }

  ngAfterViewInit(): void {
    this.matSelectionList.registerOnChange( (items) => {
      if (items.length === this.dailies$.getValue().length) {
        this.visible = false;
      }
    } );
  }
}

@Component({
  selector: 'app-dialog-for-task',
  template: `
    <mat-form-field>
      <input matInput [(ngModel)]="data.task">
    </mat-form-field>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data.task" cdkFocusInitial>Ok</button>
    </div>`
})
export class DialogForTaskComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogForTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
