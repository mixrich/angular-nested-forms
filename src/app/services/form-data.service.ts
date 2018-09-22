import {Injectable} from '@angular/core';
import {ProfileInterface} from '../interfaces/profile.interface';

const filledWithNotesProfile: ProfileInterface = {
  name: 'Joe',
  birthday: '12.01.1990',
  email: 'joe@email.com',
  phone: '+7 (999) 999 99 99',
  photoUrl: '',
  favouriteWords: ['field', `doesn't`, 'has', 'UI'],
  address: {
    index: '',
    city: '',
  },
  notes: [{
    title: 'My First Article',
    content: 'I have to write second note',
  }, {
    title: 'My Second Article',
    content: 'Remove the first Note',
  }]
};

@Injectable()
export class FormDataService {
  getFilledWithNotes(): ProfileInterface {
    return filledWithNotesProfile;
  }
}
