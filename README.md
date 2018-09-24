# Angular Nested Forms Example
First of all, sorry for my English, if it hurts you.

## Demo
See the [Demo at https://mixrich.github.io/angular-nested-forms/](https://mixrich.github.io/angular-nested-forms/)

## The Task
In my last project, forms became the main part of application. Users creates and managing a lot of entities with forms to reach their goal.

There are a lot of forms and many of them have the same functionality but different layouts. For example, you can go to entity view page, click Edit button, open the Edit page and see a big and complex form with dynamical parts (you can add or remove some parts of forms). But in the same time you can edit or create the same entity in the other part of application by just opening modal window, where the same form has a little different layout (for example, some parts are listed inside accordions inside modal, but listed flat on edit page). What makes this forms more complex is that many of parts have their own local logic, for example, show or hide some content, based on one field value of recalculating some values from fields values.

The problem I tried to resolve is how I can create nested parts of forms without need to declare the fields manually and repeat the logic, validators and layout of the same nested parts in different forms.

## About results
In this example you can see not just how to create view for nested form, but how to specify the fields and logic inside it without need to to declare them in parent forms.
In this exaplme you see how:
* Restore the whole FormGroup instance of form from JSON value. For example, when you click Edit button, you do not need to specify the whole FormGroup structure - it will be created automatically from passed form value and fully patched regardless the equivalense of Form structure and value structure .
* Build the whole FormGroup from nested forms parts. It is means, that if some fields is part of Nested form, you do not need to specify them in your parent form, because nested form will create them for you. This two points means, that if the field is not specified in parent form FormGroup, but specified in JSON value of form - it will be automatically generated with valid AbstractControl type (Group, Array or Control). If field is not specified in parent form, but declared in nested form - it will be added to parent form. If field specified in parent form, it will be patched with value from JSON and merged with nested form field rules(for example, if nested form field has validators, they will be added to control).
* How to handle removing nested forms array both from parent form and nested form itself without emitting the event to parent form.
* How to specify field validators and any other logic inside nested form and stay parent form clean of it.

## Process
### Restore FormGroup structure from JSON value.
Let's create some entities:
_base-form_ - it's the main class for out parent forms, which incapsulating the functionality of restoring FormGroup structure from value and other parent forms will be extends this base form.
Every form has it's FormGroup instance. So let's create some
```typescript
export class BaseFormComponent {
  form: FormGroup = new FormGroup({});
}
```
We need to add the method for restoring form structure from JSON value:
```typescript
/**
 * restore FormGroup structure from plain object value
 * (for example JSON value from API)
 */
protected setFormValues(values: object, group: FormGroup = this.form) {
  Object.keys(values).forEach(key => {
    if (values[key] instanceof Array) {
      this.setArrayValueToGroup(group, values[key], key);
      return;
    }

    if (values[key] instanceof Object) {
      this.setGroupValueToGroup(group, values[key], key);
      return;
    }

    this.setControlValueToGroup(group, values[key], key);
  });
}

/**
 * Restore value array as FormArray of FormGroup[]
 */
private setArrayValueToGroup(group: FormGroup, value: any[], name: string) {
  if (!value || !value.length) {
    return;
  }

  /**
   * If value is array of plain value of Array of plain values, just handle it as simple control value
   * (let's deal that nobody will pass Array of Arrays of Objects)
   */
  if (!(value[0] instanceof Object) || value[0] instanceof Array) {
    this.setControlValueToGroup(group, value, name);
    return;
  }

  /**
   * If has not control with this name, added it as FormArray
   */
  if (!group.contains(name)) {
    group.addControl(name, new FormArray([]));
  }

  /**
   * Here we know, that value is Array of Objects, so restore them as Array of FormGroups[]
   */
  const array = <FormArray>group.get(name);
  value.forEach(object => {
    const newArrayGroup = new FormGroup({});
    this.setFormValues(object, newArrayGroup);
    array.push(newArrayGroup);
  });
}

/**
 * Restore value as FormGroup inside provided FormGroup
 */
private setGroupValueToGroup(group: FormGroup, value: any, name: string) {
  if (!group.contains(name)) {
    group.addControl(name, new FormGroup({}));
  }

  const newSubGroup = <FormGroup>group.get(name);
  this.setFormValues(value, newSubGroup);
}
```
So, the main idea of restoring is to go recursive through JSON value and, if current value is Array - create the FormArray control for this value and add it to out form. If the current value is object, add control as another nested FormGroup inside out form and recursivelly restore the structure for nested FormGroup. And last, if the value is plain value, just create a control for it and patching it with this value.

Imagine, that you have service or resolver, which will get form value from API and pass it to Profile Edit page. To simplify, let's create the following service:
```typescript
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
```
This service passed to our profile form some common information and nested fields such as Address Group and Notes Array.

let's create the Profile form for editing this values:
```typescript
import {Component, OnInit} from '@angular/core';
import {BaseFormComponent} from './base-form.component';
import {FormDataService} from '../services/form-data.service';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-profile-form',
  template: `
    <form class="row" [formGroup]="form">

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
}
```
As you can mention, we don't specify the full structure for Profile Form, because it will be automatically generated, but we specify something interesting:
*  `lastName: new FormControl('')` - this field is not represented in value, but we can add it to our form, if we need. It helps us to add new fields during app development and user can fill it in the next time he will be edit profile form.
*  `email: new FormControl('', [Validators.email])` - here we created the field, which will be created inside the nested form part, but we cpecify field with validators. This approach allow us to use different validators for nested form fields in different parent forms.
*  `notes: new FormArray([])` - the array for nested Notes forms.


So, we need to patch our form with values from service. Let's do it:
```typescript
  constructor(
    private formDataService: FormDataService
  ) {
    super();
  }

  ngOnInit() {
    const value = this.formDataService.getFilledWithNotes();
    this.setFormValues(value);
  }
```
After setting form values, we will get the following FormGroup Structure for our profile form even without declaring all of fields. It's obtained by merging current FormStrucrure with form values:
```typescript
{ // FormGroup
  "lastName": "", // FormControl declared in structure, but not in value
  "email": "joe@email.com", // FormControl
  "notes": [ // FormArray of FormGroups[]
    { // FormGroup
      "title": "My First Article", // FormControl
      "content": "I have to write second note" // FormControl
    },
    { // FormGroup
      "title": "My Second Article", // FormControl
      "content": "Remove the first Note" // FormControl
    }
  ],
  "name": "Joe", // FormControl
  "birthday": "12.01.1990", // FormControl
  "phone": "+7 (999) 999 99 99", // FormControl
  "photoUrl": "", // FormControl
  "favouriteWords": [ // FormControl with plain array value
    "field",  // string
    "doesn't",
    "has",
    "UI"
  ],
  "address": { // FormGroup
    "index": "",  // FormControl
    "city": "" // FormControl
  },
}
```
Even if we don't have any controls for some values - they will be created (favouriteWords control as an example).

### Creating nested FormGroup for Profile common fields
Let's create the nested form for Profile common fields, such as name, birthday, email, phone and photoUrl.

First of all, before creating concrete nested form we have to create base class for nested form
```typescript
import {Input, OnInit} from '@angular/core';
import {FormArray, FormGroup} from '@angular/forms';

export class BaseNestedform implements OnInit {

  /**
   * Parent form for which @this will be a nested
   */
  @Input() formGroup: FormGroup;

  /**
   * Nested (self) control group
   */
  public nestedFormGroup: FormGroup;

  constructor() {}

  ngOnInit() {

  }

}
```
It will has two attributes:
* `@Input() formGroup: FormGroup;` - the parent FormGroup instance for which our form will be nested
* `public nestedFormGroup: FormGroup;` - The formGroup instance of nested form itself.

As obvious, we have to add method for merging parent FormGroup and nested FormTemplate to join result fields together. Don't forget, that we have restored parent form stucture and declaredin nested form field can be already exists in parent form.
```typescript
ngOnInit() {
  this.init();
}

private init() {
  /**
   * Merge parent form controls with nested form controls to be the same
   */
  Object.keys(this.nestedFormGroup.controls).forEach(key => {
    const nestedControl = this.nestedFormGroup.get(key);

    /**
     * If control not specified yet, just add it to form with all
     * it's validators, default values and so one
     */
    if (!this.formGroup.contains(key)) {
      this.formGroup.addControl(key, this.nestedFormGroup.get(key));
      return;
    }

    const parentControl = this.formGroup.get(key);

    /**
     * Restore validator from our subform rules if parentControl don't has any
     */
    if (!parentControl.validator && nestedControl.validator) {
      parentControl.setValidators(nestedControl.validator);
    }


    /**
     * Restore default value, if it specified in nested control, but not parent control
     */
    if ([null, '', undefined].includes(parentControl.value) && ![null, '', undefined].includes(nestedControl.value)) {
      parentControl.patchValue(nestedControl.value);
    }

  });
}
```
The idea is to add nested formControl to parent form if parent doesn't has it yet and merging validators and values of control, if it exists in both forms.

We are ready now to create out ProfileCommon nested form:
```typescript
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
```
You can see the new field "Age", which also will be added to parent form.
Even if Email field doesn't has validators, their will be added from parent control declaration for email.

We are ready now to declare nested form for Note entity:
```typescript
import {Component} from '@angular/core';
import {BaseNestedform} from '../base.nestedform';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-form-article',
  template: `
    <div class="card" [formGroup]="formGroup">
      <div class="card-header">
        <a href="javascript:;" class="float-right">Remove Note (from inside)</a>
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
```

and add this nested forms to parent profile form:
```typescript
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
            <a href="javasript:;">Remove Note (from profile)</a>
            <hr>
          </div>
        </ng-container>
        <a href="javasript:;">+ Add note</a>
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
}
```

### Handle dynamic Forms Creation
We can add new Note nested form just pushing empty FormGroup to Notes FormArray control and Note Nested form will be create the structure for it automatically.
If we want to remove nested Note form instance, we have two ways to do it:

#### Remove nested form from parent
Just create methods in Profile form for creation and removing nested forms for Notes:
```typescript

<ng-container *ngIf="form.controls['notes'] && form.controls['notes']['controls']">
  <div *ngFor="let group of form.controls['notes']['controls']; let i = index">
    <app-form-article [formGroup]="group"></app-form-article>
    <a href="javasript:;" (click)="removeNote(i)">Remove Note (from profile)</a>
    <hr>
  </div>
</ng-container>
<a href="javasript:;" (click)="addNote()">+ Add note</a>

addNote() {
  const notes = this.form.get('notes') as FormArray;
  notes.push(new FormGroup({}));
}

removeNote(index: number) {
  const notes = this.form.get('notes') as FormArray;
  notes.removeAt(index);
}
```
but in this case you cannot specify remove buttons inside nested form view. You can, of course, but in this case you have to emitting the event from nested view, that remove button is clicked, to handle remove event in parent form. So complicated...

#### Removing nested form from array by itself
of, you can specify the "Remove self" method inside nested form:
```typescript
/**
 * Method to remove nested from itself without emitting events to parent form
 */
public removeSelf() {
  if (!(this.formGroup.parent instanceof FormArray)) {
    alert('Sorry, cannot remove couse it is not an array item');
    return;
  }

  const parentForm = this.formGroup.parent as FormArray;
  parentForm.removeAt(parentForm.controls.indexOf(this.formGroup));
}
```
and call it from Nested view form
``` typescript
 <a href="javascript:;" class="float-right" (click)="removeSelf()">Remove Note (from inside)</a>
```
in this case you don't need to emit event or handling remove from your parent form.


## Thanks
I hope my implementation of nested form will help you in you projects. Thanks for reading.

## Angular CLI
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.3.
Read the [Angular CLI](https://github.com/angular/angular-cli) docs .
