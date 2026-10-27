import { Component, inject } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc
} from 'firebase/firestore';

import { environment } from '../../environments/environment';


const app = initializeApp(
  environment.firebaseConfig
);

const db = getFirestore(app);

const animeCol = collection(
  db,
  'anime'
);


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  private toastCtrl = inject(ToastController);

  private loadingCtrl = inject(LoadingController);


  newAnime = {
    title: '',
    genre: '',
    episodes: 0,
    status: 'Ongoing',
    rating: 0
  };


  async addAnime() {

    // =========================
    // VALIDATION
    // =========================

    if (
      !this.newAnime.title ||
      !this.newAnime.genre ||
      !this.newAnime.episodes ||
      !this.newAnime.rating
    ) {

      await this.showToast(
        'Please fill in all fields.'
      );

      return;
    }


    // =========================
    // SHOW LOADING
    // =========================

    const loading =
      await this.loadingCtrl.create({
        message: 'Adding anime...',
        spinner: 'crescent'
      });

    await loading.present();


    // =========================
    // ADD TO FIRESTORE
    // =========================

    try {

      await addDoc(
        animeCol,
        this.newAnime
      );


      // Close loading
      await loading.dismiss();


      // Show success message
      await this.showToast(
        'Anime added successfully!'
      );


      // Reset form
      this.newAnime = {

        title: '',

        genre: '',

        episodes: 0,

        status: 'Ongoing',

        rating: 0

      };

    }


    catch (error) {

      console.error(
        'Add anime error:',
        error
      );


      // Close loading
      await loading.dismiss();


      // Show error message
      await this.showToast(
        'Failed to add anime.'
      );

    }

  }


  // =========================
  // TOAST
  // =========================

  async showToast(message: string) {

    const toast =
      await this.toastCtrl.create({

        message: message,

        duration: 2000,

        position: 'bottom'

      });


    await toast.present();

  }

}
