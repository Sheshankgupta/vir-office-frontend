import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../services/image-upload.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { Success } from '../models/success';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

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
    private platform: Platform
  ) {
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

  async presentAlert(callback: () => void) {
    const alert = await this.alertCtrl.create({
      header: 'Alert',
      subHeader: 'Do you want to take more pictures?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Let me think');
          }
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

  setPreviewOpen(val: boolean) {
    this.normailzeView()
    if (!this.selectedImages.length) {
      this.showToast('Please choose some image before preview')
      return
    }
    this.isPreviewModalOpen = val
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
        this.selectedImages.push(photo.dataUrl)
        // Ask the user if they want to take another photo
        this.presentAlert(takePhoto);
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
          allowEditing: true,
          resultType: CameraResultType.DataUrl,
        });
        this.selectedImages.push(image.dataUrl)
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
      console.log(image)
      image.photos.forEach((img) => {
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
      if (!blob) {
        return
      }
      reader.readAsDataURL(blob);
    });
  }

  submitAllImages() {
    this.showLoader = true
    this.uploadtime = this.getCurrentTime()
    if (this.selectedImages.length === 0) {
      this.showToast('Please choose some image before submitting')
      return;
    }
    this.len = this.selectedImages.length
    this.imgUpl.uploadImage(this.selectedImages).subscribe((res: Success) => {
      if (res.success) {
        this.showLoader = false
        this.responsetime = this.getCurrentTime()
        this.timeDiff = this.getTimeDiff(this.responsetime, this.uploadtime)
        this.selectedImages = [];
        this.isImageModalOpen = false;
        this.isPreviewModalOpen = false;
        this.uploadSucces = true
        this.uploadData = res
        console.log(res)
      }
    });
  }

  getCurrentTime() {
    const currentTime = new Date();

    // Get the current time in various formats, including milliseconds
    const hours = currentTime.getHours(); // 0-23
    const minutes = currentTime.getMinutes(); // 0-59
    const seconds = currentTime.getSeconds(); // 0-59
    const milliseconds = currentTime.getMilliseconds(); // 0-999

    // Display the current time, including milliseconds
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  getTimeDiff(time1: any, time2: any) {

    const [hours1, minutes1, seconds1] = time1.split(":").map(parseFloat);
    const milliseconds1 = parseFloat(time1.split(".")[1]);
    const [hours2, minutes2, seconds2] = time2.split(":").map(parseFloat);
    const milliseconds2 = parseFloat(time2.split(".")[1]);

    // Calculate the time difference in milliseconds
    const timestamp1 = hours1 * 3600000 + minutes1 * 60000 + seconds1 * 1000 + milliseconds1;
    const timestamp2 = hours2 * 3600000 + minutes2 * 60000 + seconds2 * 1000 + milliseconds2;
    const timeDifference = Math.abs(timestamp2 - timestamp1);

    // Convert the time difference to a human-readable format
    const milliseconds = timeDifference % 1000;
    const seconds = Math.floor((timeDifference / 1000) % 60);
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    // Display the time difference
    return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
  }

  normailzeView() {
    this.uploadSucces = false
    this.len = 0
  }

  ionViewDidLeave(){
    this.normailzeView()
    this.showLoader = false
    this.isImageModalOpen = false;
    this.isPreviewModalOpen = false;
  }

  expand(e: any) {
    // e.target.classList.add('expand')
  }
}
