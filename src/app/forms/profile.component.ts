import {Component, OnInit} from '@angular/core';
import {BaseFormComponent} from './base-form.component';
import {FormDataService} from '../services/form-data.service';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-profile-form',
  template: `
    <form class="row" [formGroup]="form">
      <div class="col-sm">
        <h3>Profile form</h3>
        <div class="form-group">
          <label>LastName <small class="text-info">(field only specified in profile form)</small></label>
          <input class="form-control"  formControlName="lastName">
        </div>
        <app-profile-common [formGroup]="form"></app-profile-common>
        <hr>
        <ng-container *ngIf="form.controls['notes'] && form.controls['notes']['controls']">
          <div *ngFor="let group of form.controls['notes']['controls']; let i = index">
            <app-form-article [formGroup]="group"></app-form-article>
            <a href="javasript:;" (click)="removeNote(i)">Remove Note (from profile)</a>
            <hr>
          </div>
        </ng-container>
        <a href="javasript:;" (click)="addNote()">+ Add note</a>
      </div>
      <div class="col-sm">
        <h3>Profile form value</h3>
        <pre>
          <code>
            {{form.value | json}}
          </code>
        </pre>
      </div>
    </form>`
})

export class ProfileComponent extends BaseFormComponent implements OnInit {

  form = new FormGroup({
    lastName: new FormControl(''), // Field specified only in profile form
    email: new FormControl('', [Validators.email]), // This field will be merged with nested

    /**
     * Don't forget to specify this Array
     */
    notes: new FormArray([])
  });

  constructor(
    private formDataService: FormDataService
  ) {
    super();
  }

  ngOnInit() {
    const value = this.formDataService.getFilledWithNotes();
    this.setFormValues(value);
  }

  addNote() {
    const notes = this.form.get('notes') as FormArray;
    notes.push(new FormGroup({}));
  }

  removeNote(index: number) {
    const notes = this.form.get('notes') as FormArray;
    notes.removeAt(index);
  }
}
