import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
  inject
} from '@angular/core';

import {
  AlertController,
  LoadingController
} from '@ionic/angular';

import {
  getApp,
  getApps,
  initializeApp
} from 'firebase/app';

import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

import { environment } from '../../environments/environment';


const app = getApps().length
  ? getApp()
  : initializeApp(environment.firebaseConfig);

const db = getFirestore(app);

const animeCol = collection(db, 'anime');


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {

  // =========================
  // ANIME DATA
  // =========================

  animeList: any[] = [];


  // =========================
  // SEARCH AND FILTER
  // =========================

  searchTerm = '';

  selectedStatus = 'All';


  // =========================
  // UPDATE MODAL
  // =========================

  updateModalOpen = false;

  selectedAnime: any = {
    id: '',
    title: '',
    genre: '',
    episodes: 0,
    status: 'Ongoing',
    rating: 0
  };


  // =========================
  // TOAST
  // =========================

  toastOpen = false;

  toastMessage = '';


  // =========================
  // SERVICES
  // =========================

  private cdr =
    inject(ChangeDetectorRef);

  private ngZone =
    inject(NgZone);

  private alertCtrl =
    inject(AlertController);

  private loadingCtrl =
    inject(LoadingController);


  // =========================
  // INITIALIZE
  // =========================

  ngOnInit() {

    this.subscribeToAnime();

  }


  // =========================
  // READ
  // =========================

  async subscribeToAnime() {

    const loading =
      await this.loadingCtrl.create({

        message: 'Loading anime...',

        spinner: 'crescent'

      });

    await loading.present();


    onSnapshot(

      animeCol,

      async (snapshot) => {

        this.ngZone.run(() => {

          this.animeList =
            snapshot.docs.map(doc => ({

              id: doc.id,

              ...doc.data()

            }));


          console.log(
            'Anime loaded:',
            this.animeList
          );


          this.cdr.detectChanges();

        });


        await loading.dismiss();

      },


      async (error) => {

        console.error(
          'Firestore read error:',
          error
        );


        await loading.dismiss();


        this.showToast(
          'Failed to load anime.'
        );

      }

    );

  }


  // =========================
  // SEARCH + FILTER
  // =========================

  get filteredAnimeList() {

    return this.animeList.filter(
      anime => {

        const title =
          anime.title?.toLowerCase() || '';

        const genre =
          anime.genre?.toLowerCase() || '';

        const search =
          this.searchTerm.toLowerCase();


        const matchesSearch =
          title.includes(search) ||
          genre.includes(search);


        const matchesStatus =
          this.selectedStatus === 'All' ||
          anime.status === this.selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }


  // =========================
  // OPEN UPDATE MODAL
  // =========================

  openUpdateModal(
    anime: any
  ) {

    this.selectedAnime = {

      id: anime.id,

      title: anime.title,

      genre: anime.genre,

      episodes: anime.episodes,

      status: anime.status,

      rating: anime.rating

    };


    this.updateModalOpen = true;

  }


  // =========================
  // UPDATE
  // =========================

  async saveUpdate() {

    const loading =
      await this.loadingCtrl.create({

        message: 'Updating anime...',

        spinner: 'crescent'

      });

    await loading.present();


    try {

      const animeRef =
        doc(
          db,
          'anime',
          this.selectedAnime.id
        );


      await updateDoc(

        animeRef,

        {

          title:
            this.selectedAnime.title,

          genre:
            this.selectedAnime.genre,

          episodes:
            Number(
              this.selectedAnime.episodes
            ),

          status:
            this.selectedAnime.status,

          rating:
            Number(
              this.selectedAnime.rating
            )

        }

      );


      await loading.dismiss();


      this.updateModalOpen = false;


      this.ngZone.run(() => {

        this.toastMessage =
          'Anime updated successfully!';

        this.toastOpen = true;

        this.cdr.detectChanges();

      });

    }


    catch (error) {

      console.error(
        'Update error:',
        error
      );


      await loading.dismiss();


      this.updateModalOpen = false;


      this.ngZone.run(() => {

        this.toastMessage =
          'Failed to update anime.';

        this.toastOpen = true;

        this.cdr.detectChanges();

      });

    }

  }


  // =========================
  // DELETE
  // =========================

  async deleteAnime(
    animeId: string
  ) {

    const alert =
      await this.alertCtrl.create({

        header: 'Delete Anime',

        message:
          'Are you sure you want to delete this anime?',

        buttons: [

          {

            text: 'Cancel',

            role: 'cancel'

          },

          {

            text: 'Delete',

            role: 'destructive'

          }

        ]

      });


    await alert.present();


    const result =
      await alert.onDidDismiss();


    if (
      result.role === 'destructive'
    ) {

      const loading =
        await this.loadingCtrl.create({

          message: 'Deleting anime...',

          spinner: 'crescent'

        });


      await loading.present();


      try {

        const animeRef =
          doc(
            db,
            'anime',
            animeId
          );


        await deleteDoc(
          animeRef
        );


        await loading.dismiss();


        this.ngZone.run(() => {

          this.toastMessage =
            'Anime deleted successfully!';

          this.toastOpen = true;

          this.cdr.detectChanges();

        });

      }


      catch (error) {

        console.error(
          'Delete error:',
          error
        );


        await loading.dismiss();


        this.ngZone.run(() => {

          this.toastMessage =
            'Failed to delete anime.';

          this.toastOpen = true;

          this.cdr.detectChanges();

        });

      }

    }

  }


  // =========================
  // REFRESH
  // =========================

  async refreshAnime(
    event: any
  ) {

    const loading =
      await this.loadingCtrl.create({

        message: 'Refreshing anime...',

        spinner: 'crescent'

      });


    await loading.present();


    try {

      /*
       * The anime list is already connected
       * to Firestore through onSnapshot().
       *
       * We simply allow the current
       * real-time data to render again.
       */

      this.cdr.detectChanges();


      await new Promise(
        resolve => setTimeout(
          resolve,
          500
        )
      );

    }


    finally {

      await loading.dismiss();

      event.target.complete();

    }

  }


  // =========================
  // TOAST
  // =========================

  async showToast(
    message: string
  ) {

    this.toastMessage =
      message;

    this.toastOpen = true;

  }


  closeToast() {

    this.toastOpen = false;

  }

}
