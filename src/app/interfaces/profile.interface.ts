import {NoteInterface} from './note.interface';

export interface ProfileInterface {
  name: string;
  birthday: string;
  photoUrl: string;
  email: string;
  phone: string;
  favouriteWords?: string[];
  notes?: NoteInterface[];
  address?: {
    index: string,
    city: string,
  };
}
