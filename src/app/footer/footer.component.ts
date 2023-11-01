import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { IonicModule, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLinkWithHref, CommonModule],
})
export class FooterComponent {
  @Input() currentRoute!: string;
  isActive = {
    home: false,
    uploadImages: false,
    fetchAllUploads: false,
    settings: false,
    profile: false,
  };

  constructor(private navCtrl: NavController, private toastCtrl: ToastController, private router: Router, private route: ActivatedRoute) {
    console.log(this.currentRoute)
  }

  ionViewWillEnter(){

  }

  ngOnChanges() {
    this.isActive = {
      home: false,
      uploadImages: false,
      fetchAllUploads: false,
      settings: false,
      profile: false,
    };
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      cssClass: 'showTop'
    });

    await toast.present();
  }

  async openTab(tab: string, isDisabled: boolean) {
    if(!isDisabled){
      await this.showToast('Currently it is not supported')
      return
    }
    switch (tab) {
      case 'home':
        this.makeItTrue('home');
        this.navCtrl.navigateForward('/');
        break;

      case 'uploadImages':
        this.makeItTrue('uploadImages');
        this.navCtrl.navigateForward('/images');
        break;

      case 'fetchAllUploads':
        this.makeItTrue('fetchAllUploads');
        this.navCtrl.navigateForward('/allUploads');
        break;

      case 'settings':
        this.makeItTrue('settings');
        this.navCtrl.navigateForward('/settings');
        break;

      case 'profile':
        this.makeItTrue('profile');
        this.navCtrl.navigateForward('/profile');
        break;
    }
  }

  makeItTrue(tabid: string){
    this.isActive = {
      home: false,
      uploadImages: false,
      fetchAllUploads: false,
      settings: false,
      profile: false,
    };
    switch (tabid) {
      case 'home':
        this.isActive['home'] = true
        break
      case 'uploadImages':
        this.isActive['uploadImages'] = true
        break
      case 'fetchAllUploads':
        this.isActive['fetchAllUploads'] = true
        break
      case 'settings':
        this.isActive['settings'] = true
        break
      case 'profile':
        this.isActive['profile'] = true
        break
    }
  }
  routingHandler(tabRoute: string){
    switch (tabRoute) {
      case 'home' || '/':
        this.isActive['home'] = true
        break
    }
  }
}
