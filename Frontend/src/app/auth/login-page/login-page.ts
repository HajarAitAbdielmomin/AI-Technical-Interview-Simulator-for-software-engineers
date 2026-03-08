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
  isSignup = false;
  form: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });
  showPassword = false;
  errorMessage = '';
  successMessage = '';


  constructor(private router:Router,private auth:AuthService, private storageService:StorageService, private cdr: ChangeDetectorRef) {}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (this.isSignup) {
      this.auth.createUser(this.form.value.username,this.form.value.email, this.form.value.password).subscribe({
        next: (response: any) => {
          console.log('User created:', response);
          this.successMessage = 'Account created successfully! Please login.';
          this.isSignup = false;
          this.form.reset();
          (this.form as any).removeControl('username');
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Signup error:', error);
          this.errorMessage = error.error || 'Error creating user';
          this.cdr.detectChanges();
        }
      })
    } else {
      // Handle login
      this.auth.authenticateUser(this.form.value.email, this.form.value.password).subscribe({
        next: (response: any) => {
          this.storageService.storeToken(response.token);
          this.storageService.storeUser(response);
          void this.router.navigate(['user/dashboard']);
        },
        error: (error: any) => {
          this.errorMessage = 'Invalid email or password';
          this.cdr.detectChanges();
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleForm() {
    this.isSignup = !this.isSignup;
    this.errorMessage = '';
    this.successMessage = '';
    this.form.reset();

    if (this.isSignup) {
      (this.form as any).addControl('username', new FormControl('', [Validators.required]));
    } else {
      (this.form as any).removeControl('username');
    }
  }
}
