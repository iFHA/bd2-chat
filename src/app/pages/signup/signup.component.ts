import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from './../../services/loading.service';
import { AlertType } from './../../enums/alert-type.enum';
import { Alert } from './../../classes/alert';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

  public signupForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private auth: AuthService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private createForm(): void {
    this.signupForm = this.fb.group({
      firstName: [
        '',
        [Validators.required],
      ],
      lastName: [
        '',
        [Validators.required]
      ],
      email: [
        '',
        [Validators.required, Validators.email],
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(8)]
      ]
    });
  }

  public submit(): void {
    if (this.signupForm.valid) {
      const {firstName, lastName, email, password} = this.signupForm.value;

      // TODO: call the auth service
      this.subscriptions.push(
        this.auth.signup(firstName, lastName, email, password).subscribe(success => {
          if (success) {
            this.router.navigate(['/chat']);
          } else {
            const failedSignupAlert = new Alert('Houve um problema no cadastro, tente novamente.', AlertType.Danger);
            this.alertService.alerts.next(failedSignupAlert);
          }
          this.loadingService.isLoading.next(false);
        })
      );
    } else {
      const failedSignupAlert = new Alert('Dados inválidos, tente novamente.', AlertType.Danger);
      this.alertService.alerts.next(failedSignupAlert);
    }
  }

}
