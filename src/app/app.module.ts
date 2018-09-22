import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {FormDataService} from './services/form-data.service';
import {NoteComponent} from './nestedforms/note/note.component';
import {ReactiveFormsModule} from '@angular/forms';
import {ProfileComponent} from './forms/profile.component';
import {CommonModule} from '@angular/common';
import {ProfileCommonComponent} from './nestedforms/profile-common/profile-common.component';

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    NoteComponent,
    ProfileCommonComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  providers: [
    FormDataService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
