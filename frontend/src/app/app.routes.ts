import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyBooksComponent } from './pages/my-books/my-books.component';
import { OffersComponent } from './pages/offers/offers.component';

export const routes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent },
  { path: 'books', component: MyBooksComponent },
  { path: 'offers', component: OffersComponent },
  { path: '**', redirectTo: 'profile' }
];
