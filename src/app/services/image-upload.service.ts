import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Success } from '../models/success';
import { timeout } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  baseURL: string = environment.baseURL;
  images: string[] = [];

  constructor(private http: HttpClient) { }

  checkPayloadSize(data: any[]) {
    const jsonData = JSON.stringify(data);
    const payloadSizeInBytes = new TextEncoder().encode(jsonData).length;
    // console.log(payloadSizeInBytes);
  }

  setImages(images: string[] = []){
    this.images = images
    return
  }

  getImages(){
    return this.images
  }

  uploadImage(index: number){
    let base64 = this.images[index]
    return this.http.post<any>(
      `${this.baseURL}image`,
      { id: index, data: base64 },
    ).pipe(
      timeout(120000)
    );
  }
}
