import {Component, Inject, Input, OnInit} from '@angular/core';
import {Daily} from '../../../models/daily';
import {BehaviorSubject} from 'rxjs';
import {DataService} from '../../../services/data.service';
import {NGXLogger} from 'ngx-logger';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';

export interface DialogData {
  task: string;
}

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {

  @Input() userId: number;

  dailies$: BehaviorSubject<Daily[]> = new BehaviorSubject<Daily[]>(null);

  length: number;

  selectedValues: number[] = [];

  visible = true;

  constructor(private dataService: DataService,
              private logger: NGXLogger,
              public dialog: MatDialog) {
  }

  onChange(event, id: number) {
    const targetClassList = event.target.parentElement.classList;
    if (targetClassList.contains('checked')) {
      targetClassList.remove('checked');
    } else {
      targetClassList.add('checked');
    }
    if (this.selectedValues.includes(id)) {
      this.selectedValues.splice(this.selectedValues.indexOf(id), 1);
    } else {
      this.selectedValues.push(id);
    }
    if (this.selectedValues.length === this.length) {
      this.visible = false;
    }
  }

  deleteTask(event, id: number) {
    this.logger.info(`Deleting task of id: ${id}`);
    this.dataService.deleteDaily(id).subscribe(
      source => {
        this.downloadData();
      }, error => {
        this.logger.error('Error deleting task', error);
      }
    );
  }

  setVisible() {
    this.visible = true;
  }

  downloadData() {
    this.dataService.getDailyForUser(this.userId)
      .subscribe(
        value => {
          this.selectedValues = [];
          this.length = value.length;
          this.dailies$.next(value.sort( (a, b) => a.id > b.id ? 1 : -1 ));
        },
        error => this.logger.error(`Error downloading dailies`, error)
      );
  }

  ngOnInit() {
    this.downloadData();
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

  openDialog(task: string) {
    const dialogRef = this.dialog.open(DialogForTaskComponent, {
      width: '250px',
      data: {task}
    });
    return dialogRef.afterClosed();
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
