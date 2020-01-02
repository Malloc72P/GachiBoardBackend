import { Document } from 'mongoose';

export interface UserDtoIntf extends Document{
  idToken: string;
  authToken: string;
  userName: string;
  email: string;
}
