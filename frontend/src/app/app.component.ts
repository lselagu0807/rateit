import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (showNavbar()) {
      <app-navbar />
    }
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`main { min-height: calc(100vh - 60px); }`],
})
export class AppComponent {
  private router = inject(Router);

  showNavbar = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => !(e as NavigationEnd).url.startsWith('/login'))
    ),
    { initialValue: !window.location.pathname.startsWith('/login') }
  );
}
