import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { AlertService } from './../services/alert.service';
import { AlertType } from './../enums/alert-type.enum';
import { Alert } from './../classes/alert';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IsOwnerGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.currentUser.pipe(
      take(1),
      map(currentUser => !!currentUser && currentUser.id === next.params.userId),
      tap(isOwner => {
        if(!isOwner) {
          this.alertService.alerts.next( new Alert('Você só pode editar o seu perfil!', AlertType.Danger));
          this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
        }
      })
    );
  }
}
