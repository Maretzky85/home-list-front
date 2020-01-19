import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserDto } from '../models/userDto';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { Daily } from '../models/daily';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  data$: Observable<UserDto[]>;

  downloadData(): void {
    const users: Observable<User[]> = this.http.get<User[]>(environment.backend + 'users');
    const daily: Observable<Daily[]> = this.http.get<Daily[]>(environment.backend + 'daily');
    this.data$ = forkJoin(users, daily).pipe(
      map( ([usersList, dailyList]) => {
        return usersList.map( (user: User) => {
          return {
            user,
            tasks: dailyList.filter( (task) => task.userId === user.id)
          } as UserDto;
        } );
      } )
    );
  }

  getUsers() {
    return this.http.get<User[]>(environment.backend + 'users/');
  }

  getDailyForUser(id: number) {
    return this.http.get<Daily[]>(environment.backend + 'users/' + id + '/daily');
  }

  deleteDaily(id: number) {
    return this.http.delete(environment.backend + 'daily/' + id);
  }

  addDaily(daily: Daily) {
    return this.http.post(environment.backend + 'daily', daily );
  }

  editDaily(daily: Daily) {
    return this.http.put(environment.backend + `daily/` + daily.id, daily);
  }
}
