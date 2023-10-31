import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLinkWithHref, CommonModule],
})
export class FooterComponent  implements OnInit {
  @Input() activeTab: string = '';
  isActive = {
    home: false,
    uploadImages: false,
    fetchAllUploads: false,
    settings: false,
    profile: false,
  };
  constructor(private navCtrl: NavController) { }

  ngOnInit() {}

  ngOnChanges() {
    this.isActive = {
      home: false,
      uploadImages: false,
      fetchAllUploads: false,
      settings: false,
      profile: false,
    };
  }

  openTab(tab: string) {
    switch (tab) {
      case 'home':
        this.navCtrl.navigateForward('/');
        break;

      case 'uploadImages':
        this.navCtrl.navigateForward('/images');
        break;

      case 'fetchAllUploads':
        this.navCtrl.navigateForward('/allUploads');
        break;

      case 'settings':
        this.navCtrl.navigateForward('/settings');
        break;

      case 'profile':
        this.navCtrl.navigateForward('/profile');
        break;
    }
  }

}
