import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'pandoraa-trans-2025';

@Injectable({
  providedIn: 'root'
})
export class Crypto {
  encryptPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  }

  decryptPassword(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
