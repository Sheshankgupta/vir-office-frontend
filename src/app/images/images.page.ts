import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../services/image-upload.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { Success } from '../models/success';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-images',
  templateUrl: './images.page.html',
  styleUrls: ['./images.page.scss'],
})
export class ImagesPage implements OnInit {

  imageForm: FormGroup;
  selectedImages: any[] | undefined = [];
  isImageModalOpen: boolean = false;
  isPreviewModalOpen: boolean = false;
  uploadSucces: boolean = false;
  len: number | undefined = 0;
  uploadData: any;
  uploadtime: any;
  responsetime: any;
  timeDiff: any;
  showLoader: boolean = false;


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

  ngOnInit() { }

  ionViewWillEnter(){
    this.selectedImages = this.imgUpl.getImages()
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
    });

    await toast.present();
  }

  async presentAlert(callback: () => void) {
    const alert = await this.alertCtrl.create({
      header: 'Alert',
      subHeader: 'Do you want to take more pictures?',
      buttons: [
        {
          text: 'No',
        },
        {
          text: 'Yes!',
          handler: () => {
            callback()
          }
        }
      ]
    }).then(res => {
      res.present();
    });
  }

  setOpen(val: boolean) {
    this.normailzeView()
    this.isImageModalOpen = val
  }

  previewSubmit() {
    if(!this.selectedImages || !this.selectedImages.length){
      this.showToast('Please select some images before previewing.')
      return;
    }
    this.imgUpl.setImages(this.selectedImages)
    this.navCtrl.navigateForward('collection')
  }

  async getImages() {
    this.normailzeView()
    if (Capacitor.isNativePlatform()) {
      const takePhoto = async (): Promise<void> => {
        const photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera
        });
        this.selectedImages?.push(photo.dataUrl)
        await takePhoto();
      };
      await takePhoto();
    } else {
      const takePicture = async () => {
        const perm = await Camera.checkPermissions()
        if (!perm) {
          const gotPerm = await Camera.requestPermissions()
          if (!gotPerm) {
            this.showToast('Please allow permissions to access camera')
            return;
          }
        }
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
        });
        this.selectedImages?.push(image.dataUrl)
      };
      takePicture()
    }
  }

  pickImages() {
    this.normailzeView()
    const pickPicture = async () => {
      const perm = await Camera.checkPermissions()
      if (!perm) {
        const gotPerm = await Camera.requestPermissions()
        if (!gotPerm) {
          this.showToast('Please allow media permission for this feature')
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
            this.selectedImages?.push(`data:image/png;base64, ${base64String}`)
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
      if (!blob) {
        return
      }
      reader.readAsDataURL(blob);
    });
  }

  normailzeView() {
    this.uploadSucces = false
    this.len = 0
  }

  ionViewDidLeave(){
    this.normailzeView()
    this.selectedImages = []
    this.showLoader = false
    this.isImageModalOpen = false;
    this.isPreviewModalOpen = false;
  }
}
