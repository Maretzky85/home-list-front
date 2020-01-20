import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {User} from '../models/user';
import {Daily} from '../models/daily';
import {DistanceCall} from '../models/distanceCall';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(environment.backend + 'users/');
  }

  getDailyForUser(id: number): Observable<Daily[]> {
    return this.http.get<Daily[]>(environment.backend + 'users/' + id + '/daily');
  }

  deleteDaily(id: number): Observable<any> {
    return this.http.delete(environment.backend + 'daily/' + id);
  }

  addDaily(daily: Daily): Observable<any> {
    return this.http.post(environment.backend + 'daily', daily);
  }

  editDaily(daily: Daily): Observable<any> {
    return this.http.put(environment.backend + `daily/` + daily.id, daily);
  }

  getTimeToTarget(adress: string): Observable<number> {
    // Get time to target in minutes
    const distance: DistanceCall = {
      origins: ['Łomianki, równoległa 1'],
      destinations: [adress]
    };
    return this.http.post<number>(environment.backend + 'distance', distance);
  }
}
