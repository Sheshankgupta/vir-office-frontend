import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../services/image-upload.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { Success } from '../models/success';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-images',
  templateUrl: './images.page.html',
  styleUrls: ['./images.page.scss'],
})
export class ImagesPage implements OnInit {

  imageForm: FormGroup;
  selectedImages: any = [];
  isImageModalOpen: boolean = false;
  isPreviewModalOpen: boolean = false;
  uploadSucces: boolean = false;
  len: number = 0;
  uploadData: any;

  constructor(private formBuilder: FormBuilder, private imgUpl: ImageUploadService, private http: HttpClient, private toastCtrl: ToastController) {
    this.imageForm = this.formBuilder.group({
      images: [null, Validators.required],
    });
  }

  ngOnInit() { }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
    });

    await toast.present();
  }

  setOpen(val: boolean){
    this.normailzeView()
    this.isImageModalOpen = val
  }

  setPreviewOpen(val: boolean){
    this.normailzeView()
    if(!this.selectedImages.length){
      this.showToast('Please choose some image before preview')
      return
    }
    this.isPreviewModalOpen = val
  }

  getImages(){
    this.normailzeView()
    const takePicture = async () => {
      const perm = await Camera.checkPermissions()
      if(!perm){
        const gotPerm = await Camera.requestPermissions()
        if(!gotPerm){
          this.showToast('Please allow permissions to access camera')
          return;
        }
      }
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
      });

      this.selectedImages.push(image.dataUrl)
    };
    takePicture()
  }

  pickImages(){
    this.normailzeView()
    const pickPicture = async () => {
      const perm = await Camera.checkPermissions()
      if(!perm){
        const gotPerm = await Camera.requestPermissions()
        if(!gotPerm){
          this.showToast('Please allow media permission for this feature')
          return;
        }
      }
      const image = await Camera.pickImages({
        quality: 90,
        limit: 0,
      });
      console.log(image)
      image.photos.forEach((img)=>{
        let base64String = this.fetchContentFromURL(img.webPath)
            .then((blob) => this.blobToBase64(blob))
            .then((base64String) => {
              console.log('Base64 String:', base64String);
              this.selectedImages.push(`data:image/png;base64, ${base64String}`)
            })
            .catch((error) => {
              console.error('Error:', error);
            });
      })
    };
    pickPicture()
  }

  fetchContentFromURL(url: string): Promise<Blob | undefined> {
    return this.http.get(url, { responseType: 'blob' }).toPromise();
  }

  blobToBase64(blob: Blob | undefined): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject('Failed to convert Blob to Base64.');
        }
      };
      if(!blob){
        return
      }
      reader.readAsDataURL(blob);
    });
  }

  submitAllImages(){
    if (this.selectedImages.length === 0) {
      this.showToast('Please choose some image before submitting')
      return;
    }
    this.len = this.selectedImages.length
    this.imgUpl.uploadImage(this.selectedImages).subscribe((res: Success)=>{
      if(res.success){
        this.selectedImages=[];
        this.uploadSucces=true
        this.uploadData = res
        console.log(res)
      }
    });
  }

  normailzeView(){
    this.uploadSucces=false
    this.len=0
  }
}
