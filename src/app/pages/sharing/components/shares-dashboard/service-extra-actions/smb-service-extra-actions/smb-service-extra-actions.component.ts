import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AuditService } from 'app/enums/audit.enum';
import { UrlOptionsService } from 'app/services/url-options.service';

@UntilDestroy()
@Component({
  selector: 'ix-smb-extra-actions',
  templateUrl: './smb-service-extra-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmbServiceExtraActionsComponent {
  constructor(
    private router: Router,
    private urlOptions: UrlOptionsService,
  ) {}

  viewSessions(): void {
    this.router.navigate(['/sharing', 'smb', 'status', 'sessions']);
  }

  viewLogs(): void {
    const url = this.urlOptions.buildUrl('/system/audit', {
      searchQuery: {
        isBasicQuery: false,
        filters: [['service', '=', AuditService.Smb]],
      },
    });
    this.router.navigateByUrl(url);
  }
}
