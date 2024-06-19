import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  model,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DashboardEnclosureSlot } from 'app/interfaces/enclosure.interface';
import { SvgCacheService } from 'app/pages/system/enclosure/services/svg-cache.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';

@UntilDestroy()
@Component({
  selector: 'ix-enclosure-svg',
  templateUrl: './enclosure-svg.component.html',
  styleUrls: ['./enclosure-svg.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnclosureSvgComponent {
  readonly svgUrl = input.required<string>();
  readonly slots = input<DashboardEnclosureSlot[]>();
  readonly enableMouseEvents = input(true);
  readonly slotTintFn = input<(slot: DashboardEnclosureSlot) => string>();
  readonly selectedSlot = model<DashboardEnclosureSlot | null>(null);

  protected svg = signal<SafeHtml | undefined>(undefined);
  protected svgContainer = viewChild<ElementRef<HTMLElement>>('svgContainer');

  private overlayRects: Record<number, SVGRectElement> = {};

  constructor(
    private renderer: Renderer2,
    private svgLoader: SvgCacheService,
    private errorHandler: ErrorHandlerService,
    private sanitizer: DomSanitizer,
  ) {}

  // TODO: Consider building and using asyncComputed.
  protected loadSvg = effect(() => {
    this.svg.set(undefined);
    this.svgLoader
      .loadSvg(this.svgUrl())
      .pipe(
        this.errorHandler.catchError(),
        untilDestroyed(this),
      )
      .subscribe((svg) => {
        // This ensures that template had time to switch to undefined.
        // TODO: Not pretty, rework somehow.
        setTimeout(() => {
          this.svg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
        });
      });
  }, { allowSignalWrites: true });

  protected processSvg = effect(() => {
    if (!this.svgContainer() || !this.svg()) {
      return;
    }

    const driveTrays = this.svgContainer().nativeElement.querySelectorAll<SVGGElement>('svg g[id^="DRIVE_CAGE_"]');
    this.clearOverlays();

    // TODO: Unclear if input change will trigger re-render.
    driveTrays.forEach((tray) => {
      const slot = this.getSlotForTray(tray);
      if (!slot) {
        return;
      }

      this.addOverlay(slot, tray);

      if (this.enableMouseEvents()) {
        // TODO: Check if not removing events manually leads to memory leaks.
        this.addClickEvent(slot);
      }

      if (this.slotTintFn()) {
        this.addTint(slot);
      }
    });
  });

  private highlightSelectedSlot = effect(() => {
    Object.values(this.overlayRects).forEach((overlay) => overlay.classList.remove('selected'));

    if (!this.selectedSlot()) {
      return;
    }

    const slotOverlay = this.overlayRects[this.selectedSlot().drive_bay_number];
    this.renderer.addClass(slotOverlay, 'selected');
  });

  private clearOverlays(): void {
    Object.values(this.overlayRects).forEach((overlay) => overlay.remove());
    this.overlayRects = {};
  }

  private addOverlay(slot: DashboardEnclosureSlot, tray: SVGGElement): void {
    const overlayRect = this.renderer.createElement('rect', 'http://www.w3.org/2000/svg') as SVGRectElement;
    this.renderer.appendChild(tray.parentNode, overlayRect);
    const trayRect = tray.getBBox();

    this.renderer.addClass(overlayRect, 'overlay-rect');
    this.renderer.setAttribute(overlayRect, 'width', `${trayRect.width}`);
    this.renderer.setAttribute(overlayRect, 'height', `${trayRect.height}`);
    this.renderer.setAttribute(overlayRect, 'x', `${trayRect.x}`);
    this.renderer.setAttribute(overlayRect, 'y', `${trayRect.y}`);

    this.overlayRects[slot.drive_bay_number] = overlayRect;
  }

  private addClickEvent(slot: DashboardEnclosureSlot): void {
    const overlay = this.overlayRects[slot.drive_bay_number];
    overlay.addEventListener('click', () => this.selectedSlot.set(slot));
  }

  private addTint(slot: DashboardEnclosureSlot): void {
    const overlay = this.overlayRects[slot.drive_bay_number];

    this.renderer.removeClass(overlay, 'tinted');

    const slotTint = this.slotTintFn()(slot);
    if (!slotTint) {
      return;
    }

    this.renderer.addClass(overlay, 'tinted');
    this.renderer.setStyle(overlay, 'fill', slotTint);
  }

  private getSlotForTray(tray: SVGGElement): DashboardEnclosureSlot {
    const slotNumber = Number(tray.id.split('_').pop()) + 1;
    const traySlot = this.slots().find((slot) => slot.drive_bay_number === slotNumber);

    if (!traySlot) {
      console.error(`Slot ${slotNumber} not found in slots list`);
      return undefined;
    }

    return traySlot;
  }
}