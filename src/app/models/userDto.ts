import { User } from './user';
import { Daily } from './daily';

export interface UserDto {
    user: User;
    tasks: Daily[];
}
