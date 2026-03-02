import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormControl,Validators, FormGroup} from '@angular/forms';
import {AuthService} from '../../auth.service';
import {StorageService} from '../../storage.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  }
  );
  showPassword = false;
  errorMessage = '';

  constructor(private router:Router,private auth:AuthService, private storageService:StorageService, private cdr: ChangeDetectorRef) {}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.auth.authenticateUser(this.form.value.email, this.form.value.password).subscribe({
      next: (response: any) => {
        this.storageService.storeToken(response.token);
        void this.router.navigate(['user/dashboard']);
      },
      error: (error: any) => {
        this.errorMessage = 'Invalid email or password';
        this.cdr.detectChanges();
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;

  }
}
