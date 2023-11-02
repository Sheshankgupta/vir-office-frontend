import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PageNotFoundComponent  {

  constructor(private navCtrl: NavController) { }

  ionViewDidEnter() {
    window.setTimeout(()=>{
      this.navCtrl.navigateBack('home')
    }, 3000)
  }


  goToHome(){
    this.navCtrl.navigateBack('home')
  }

}
