import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Alert } from './../classes/alert';
import { AlertService } from './../services/alert.service';
import { AlertType } from './../enums/alert-type.enum';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor (
    private auth: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.auth.currentUser.pipe(
      take(1),
      map( currentUser => !!currentUser),
      tap(loggedIn => {
        if (!loggedIn) {
          this.alertService.alerts.next(new Alert('Você precisa estar logado pra acessar esta página!', AlertType.Danger));
          this.router.navigate(['/login'], {
            queryParams: {
              returnUrl: state.url
            }
          });
        }
      })
    );
  }
}
