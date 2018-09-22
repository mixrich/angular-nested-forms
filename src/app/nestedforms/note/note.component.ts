import {Component} from '@angular/core';
import {BaseNestedform} from '../base.nestedform';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-form-article',
  template: `
    <div class="card" [formGroup]="formGroup">
      <div class="card-header">
        <a href="javascript:;" class="float-right" (click)="removeSelf()">Remove Note (from inside)</a>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>Title</label>
          <input class="form-control" formControlName="title" [class.is-invalid]="formGroup.get('title').errors">
          <div *ngIf="formGroup.get('title').errors" class="invalid-feedback">
            Title must be filled
          </div>
        </div>
        <div class="form-group">
          <label>Content</label>
          <textarea class="form-control" rows="3" formControlName="content" [class.is-invalid]="formGroup.get('content').errors"></textarea>
          <div *ngIf="formGroup.get('content').errors" class="invalid-feedback">
            Note cannot be without content, please fill it
          </div>
        </div>
      </div>
    </div>
  `
})

export class NoteComponent extends BaseNestedform {
  nestedFormGroup = new FormGroup({
    title: new FormControl('My note', [Validators.required]),
    content: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
}
