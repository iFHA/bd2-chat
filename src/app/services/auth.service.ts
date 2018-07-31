import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Alert } from './../classes/alert';
import { AlertType } from '../enums/alert-type.enum';
import { User } from '../interfaces/user';
import { AlertService } from './alert.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { switchMap } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public currentUser: Observable<User | null>;
  public currentUserSnapshot: User | null;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private afAuth: AngularFireAuth,
    private db: AngularFirestore
  ) {
    this.currentUser = this.afAuth.authState
    .pipe(
      switchMap(user => {
        if (user) {
          return this.db.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );

    this.setCurrentUserSnapshot();

  }

  private setCurrentUserSnapshot(): void {
    this.currentUser.subscribe(user => this.currentUserSnapshot = user);
  }

  public deleteUser(): void {
    const uidzin: string = this.afAuth.auth.currentUser.uid;
    this.db.collection('users').doc(uidzin).delete()
    .then(() => {
      this.deletar();
    }).
    catch(erro => {
      this.alertService.alerts.next(new Alert('Falha ao deletar o usuário: ' + erro.message, AlertType.Danger));
    });
  }

  public deletar(): void {
    this.afAuth.auth.currentUser.delete()
    .then(() => {
      this.router.navigate(['/login']);
      this.alertService.alerts.next(new Alert('Usuário removido com sucesso.'));
    }).
    catch(erro => {
      this.alertService.alerts.next(new Alert('Falha ao deletar o usuário: ' + erro.message, AlertType.Danger));
    });
  }

  public signup(firstName: string, lastName: string, email: string, password: string): Observable<boolean> {
    return from(this.afAuth.auth.createUserWithEmailAndPassword(email, password)
    .then(user => {
        const userRef: AngularFirestoreDocument<User> = this.db.doc(`users/${user.user.uid}`);
        const updatedUser = {
          id: user.user.uid,
          email: user.user.email,
          firstName,
          lastName,
          photoUrl: 'https://firebasestorage.googleapis.com/v0/b/bdtr-16cb9.appspot.com/o/default_profile_pic.jpg?alt=media&token=6e71824f-554c-4b02-8407-ba3ff2a27c86',
          quote: 'A day without sunshine is like, you know, night.',
          bio: 'Em andamento...'
        };
        userRef.set(updatedUser);
        return true;
      })
      .catch(err => false)
    );
  }

  public login(email: string, password: string): Observable<boolean> {
    return from(
      this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then(user => true)
      .catch(err => false)
    );
  }

  public logout(): void {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/login']);
      this.alertService.alerts.next(new Alert('Logout realizado com sucesso.'));
    });
  }

}
