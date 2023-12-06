import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ix-nfs-extra-actions',
  templateUrl: './nfs-service-extra-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NfsServiceExtraActionsComponent {
  constructor(
    private router: Router,
  ) {}

  viewSessions(): void {
    this.router.navigate(['/sharing', 'nfs', 'sessions']);
  }
}
