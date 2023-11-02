import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CollectionPageRoutingModule } from './collection-routing.module';

import { CollectionPage } from './collection.page';
import { ImageUploadService } from '../services/image-upload.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CollectionPageRoutingModule,
    HttpClientModule
  ],
  declarations: [CollectionPage],
  providers: []
})
export class CollectionPageModule {}
