import {FormArray, FormControl, FormGroup} from '@angular/forms';

export class BaseFormComponent {
  form: FormGroup = new FormGroup({});

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
   * Just patch formControl with value
   */
  private setControlValueToGroup(group: FormGroup, value: any, name: string) {
    if (!group.contains(name)) {
      group.addControl(name, new FormControl(''));
    }

    group.get(name).patchValue(value);
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
}
