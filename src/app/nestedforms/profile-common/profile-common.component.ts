import {Component} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BaseNestedform} from '../base.nestedform';

@Component({
  selector: 'app-profile-common',
  template: `
    <div [formGroup]="formGroup">
      <div class="form-group">
        <label>Name</label>
        <input class="form-control"  formControlName="name">
      </div>
      <div class="form-group">
        <label>Birthday</label>
        <input class="form-control"  formControlName="birthday">
      </div>
      <div class="form-group">
        <label>Email</label>
        <input class="form-control" formControlName="email" [class.is-invalid]="formGroup.get('email').errors">
        <div *ngIf="formGroup.get('email').errors" class="invalid-feedback">
          Add valid email
        </div>
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input class="form-control"  formControlName="phone">
      </div>
      <div class="form-group">
        <label>PhotoUrl</label>
        <input class="form-control"  formControlName="photoUrl">
      </div>
      <div class="form-group">
        <label>Age <small class="text-info">(specified in nested form, but not restored from value)</small></label>
        <input class="form-control"  formControlName="age">
      </div>
    </div>
  `
})

export class ProfileCommonComponent extends BaseNestedform {
  nestedFormGroup = new FormGroup({
    name: new FormControl(''),
    birthday: new FormControl(''),
    email: new FormControl('', ),
    phone: new FormControl(''),
    photoUrl: new FormControl(''),

    /**
     * Field not from API data
     */
    age: new FormControl(20),
  });
}
