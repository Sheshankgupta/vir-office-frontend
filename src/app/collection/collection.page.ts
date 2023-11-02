import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../services/image-upload.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.page.html',
  styleUrls: ['./collection.page.scss'],
})
export class CollectionPage  {
  selectedImages: string[] | undefined;
  len: number | undefined;
  showLoader: boolean = true
  results: any[] = [];
  showLoaderForRes: boolean[] = [];


  constructor(private imgUpl: ImageUploadService, private toastCtrl: ToastController) { }

  ionViewWillEnter(){
    this.results=[];
    this.selectedImages=[];
    this.showLoaderForRes=[];
    this.showLoader = true
    this.selectedImages = this.imgUpl.getImages()
    this.len = this.selectedImages.length
    this.showLoader = false
  }

  uploadThis(index: any){
    this.showLoaderForRes[index] = true;
    this.imgUpl.uploadImage(index).subscribe((res)=>{
      this.showLoaderForRes[index] = false;
      this.results[index] = res.text
      return res.text
    })
  }

  removeThis(index: any){
    this.selectedImages?.splice(index, 1)
    this.imgUpl.setImages(this.selectedImages)
  }

  uploadAll(){
    this.selectedImages?.forEach((img, i)=>{
      if(!this.results[i]){
        this.showLoaderForRes[i] = true;
        let timetoshowalert = 120000+(i*3000)
        window.setTimeout(()=>{
          if(this.showLoaderForRes[i]){
            this.showLoaderForRes[i] = false;
            let imageId = i+1
            this.showToast(`Some error occured while loading, please retry submitting Image`+imageId+`.`)
          }
        }, timetoshowalert)
        let res = this.uploadThis(i)
        this.results[i] = res
        if(this.results[i]){
          this.showLoaderForRes[i] = false;
        }
      }
    });
  }

  removeAll(){
    this.selectedImages = [];
    this.imgUpl.setImages([]);
    this.len = 0
  }

  ionViewDidLeave(){
    this.results=[];
    this.selectedImages=[]
    this.showLoaderForRes = [];
    this.imgUpl.setImages([]);
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
    });

    await toast.present();
  }
}
