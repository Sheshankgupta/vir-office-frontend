import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Success } from '../models/success';

@Injectable()
export class ImageUploadService {
  baseURL: string = environment.baseURL;
  constructor(private http: HttpClient) { }

  uploadImage(formData: any): any {
    console.log(formData);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<HttpResponse<Success>>(
      `${this.baseURL}/upload`,
      { data: formData }, // Send formData directly without wrapping it in an array
      { headers }
    );
  }

  checkPayloadSize(data: any[]) {
    const jsonData = JSON.stringify(data);
    const payloadSizeInBytes = new TextEncoder().encode(jsonData).length;
    console.log(payloadSizeInBytes);
  }
}
