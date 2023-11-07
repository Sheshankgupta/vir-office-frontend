import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../services/image-upload.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { Success } from '../models/success';
import {
  AlertController,
  NavController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-images',
  templateUrl: './images.page.html',
  styleUrls: ['./images.page.scss'],
})
export class ImagesPage {
  imageForm: FormGroup;
  selectedImages: any[] = this.imgUpl.getImages();
  selectedUncompressedImages: any[] = [];
  isImageModalOpen: boolean = false;
  isPreviewModalOpen: boolean = false;
  uploadSucces: boolean = false;
  len: number | undefined = 0;
  uploadData: any;
  uploadtime: any;
  responsetime: any;
  timeDiff: any;
  showLoader: boolean = false;
  showLoaderOnPrev: boolean = false;
  MAX_WIDTH = 700;
  MAX_HEIGHT = 700;

  constructor(
    private formBuilder: FormBuilder,
    private imgUpl: ImageUploadService,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private platform: Platform,
    private navCtrl: NavController
  ) {
    this.imageForm = this.formBuilder.group({
      images: [null, Validators.required],
    });
  }

  ionViewWillEnter() {
    this.selectedImages = this.imgUpl.getImages();
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
    });

    await toast.present();
  }

  async presentAlert(callback: () => void) {
    const alert = await this.alertCtrl
      .create({
        header: 'Alert',
        subHeader: 'Do you want to take more pictures?',
        buttons: [
          {
            text: 'No',
          },
          {
            text: 'Yes!',
            handler: () => {
              callback();
            },
          },
        ],
      })
      .then((res) => {
        res.present();
      });
  }

  setOpen(val: boolean) {
    this.normailzeView();
    this.isImageModalOpen = val;
  }

  async previewSubmit() {
    if (this.selectedImages.length == 0 && this.selectedUncompressedImages.length == 0) {
      console.log(this.selectedUncompressedImages)
      this.showToast('Please select some images before previewing.');
      return;
    }

    this.showLoaderOnPrev = true;
    for(let i=0; i < this.selectedUncompressedImages.length; i++){
      const img = await this.compressImage(this.selectedUncompressedImages[i])
      console.log(this.selectedImages)
      this.selectedImages.push(img)
    }
    this.selectedUncompressedImages.forEach((data)=>{
    })
    this.showLoaderOnPrev = false;

    this.imgUpl.setImages(this.selectedImages);
    this.selectedImages = []
    this.navCtrl.navigateForward('collection');
  }

  async getImages() {
    this.normailzeView();
    if (Capacitor.isNativePlatform()) {
      const takePhoto = async (): Promise<void> => {
        const photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
        })
        this.selectedUncompressedImages?.push(photo.base64String);
        await takePhoto();
      };
      await takePhoto();
    } else {
      const takePicture = async () => {
        const perm = await Camera.checkPermissions();
        if (!perm) {
          const gotPerm = await Camera.requestPermissions();
          if (!gotPerm) {
            this.showToast('Please allow permissions to access camera');
            return;
          }
        }
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
        });
        this.selectedUncompressedImages?.push(image.dataUrl);
      };
      takePicture();
    }
  }

  pickImages() {
    this.normailzeView();
    const pickPicture = async () => {
      const perm = await Camera.checkPermissions();
      if (!perm) {
        const gotPerm = await Camera.requestPermissions();
        if (!gotPerm) {
          this.showToast('Please allow media permission for this feature');
          return;
        }
      }
      const image = await Camera.pickImages({
        quality: 90,
        limit: 0,
      });
      image.photos.forEach((img) => {
        let base64String = this.fetchContentFromURL(img.webPath)
          .then((blob) => this.blobToBase64(blob))
          .then((base64String) => {
            this.compressImage(base64String).then((str) => {
              console.log('compressed: ', str);
              this.selectedImages?.push(str);
            });
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      });
    };
    pickPicture();
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
      if (!blob) {
        return;
      }
      reader.readAsDataURL(blob);
    });
  }

  async compressImage(base64: string) {
    const img = new Image();
    if(base64.includes('data:image/')){
      base64 = base64.split(',')[1]
    }
    img.src = `data:image/jpeg;base64, ${base64}`;
    const loading = new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const [newWidth, newHeight] = this.calculateSize(
          img,
          this.MAX_WIDTH,
          this.MAX_HEIGHT
        );
        canvas.height = newHeight;
        canvas.width = newWidth;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        const str = canvas.toDataURL('image/jpeg', 0.7);
        resolve(str);
      };
    });
    const result = (await loading) as string;
    return result;
  }

  calculateSize(img: any, maxWidth: number, maxHeight: number) {
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }
    return [width, height];
  }

  normailzeView() {
    this.uploadSucces = false;
    this.len = 0;
  }

  ionViewDidLeave() {
    this.normailzeView();
    this.selectedImages = [];
    this.showLoader = false;
    this.isImageModalOpen = false;
    this.isPreviewModalOpen = false;
  }
}
