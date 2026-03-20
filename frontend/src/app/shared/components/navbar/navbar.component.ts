import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  auth = inject(AuthService);

  initials(): string {
    const name = this.auth.currentUser()?.nombre ?? '';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  }
}
