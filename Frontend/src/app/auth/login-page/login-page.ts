import { Component } from '@angular/core';
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
  roles: string[] = []
  constructor(private router:Router,private auth:AuthService, private storageService:StorageService) {}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.authenticateUser(this.form.value.email, this.form.value.password).subscribe({
      next: (response: any) => {
        this.storageService.storeToken(response.token);

        this.roles = response.roles

        if(this.roles.includes("ROLE_ADMIN")){
          void this.router.navigate(['admin/dashboard']);
        } else if(this.roles.includes("ROLE_PROJECT_MANAGER")){
          void this.router.navigate(['project-manager/dashboard']);
        } else if(this.roles.includes("ROLE_TEAM_MEMBER")){
          void this.router.navigate(['team-member/dashboard']);
        } else if(this.roles.includes("ROLE_PRODUCT_OWNER")){
          void this.router.navigate(['product-owner/dashboard']);
        }else void this.router.navigate(['']);

      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;

  }
}
