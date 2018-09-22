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
    this.init();
  }

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
}
