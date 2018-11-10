import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MediaMatcher } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, scan, mergeMap, throttleTime, last } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Appointment } from 'src/app/models/appointment';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AddAppointmentComponent } from '../add-appointment/add-appointment.component';
import { CalendarEvent } from 'src/app/models/calendar-event';
import { AuthService } from 'src/app/services/auth.service';

// amount of items pulled from firestore
const batchSize = 10;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {

  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  endReached = false;

  offset = new BehaviorSubject(null);
  batch = new Observable<Appointment[]>();

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    private authService: AuthService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private db: AngularFirestore,
    public appointmentDialog: MatDialog,
    public snackBar: MatSnackBar,
  ) {
    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap((n: Date) => this.getBatch(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );

    this.batch = batchMap.pipe(
      map(v => Object.values(v))
    );

    this.mobileQuery = media.matchMedia('(max-width: 720px)');
    this._mobileQueryListener = () => {
      changeDetectorRef.detectChanges();
    };
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  getNextBatch(e, offset) {
    if (this.endReached) {
      return;
    }

    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();

    if (end >= total - 3) {
      this.offset.next(offset as Date);
    }
  }

  getBatch(lastSeenDate: Date) {
    return this.db
      .collection('appointments', ref =>
        ref
          .orderBy('date')
          .startAfter(lastSeenDate ? lastSeenDate : new Date().toISOString())
          .limit(batchSize)
      )
      .snapshotChanges()
      .pipe(
        tap(arr => (arr.length ? null : (this.endReached = true))),
        map(arr => {
          return arr.reduce((acc, cur) => {
            const id = cur.payload.doc.id;
            const data = cur.payload.doc.data();
            const a = new Appointment();
            a._id = id;
            a.attendees = (data as any).attendees;
            a.author = (data as any).author;
            a.body = (data as any).body;
            a.date = ((data as any).date);
            a.title = (data as any).title;
            return { ...acc, [id]: a };
          }, {});
        })
      );
  }

  trackByIndex(i) {
    return i;
  }

  reload() {
    this.offset.next(new Date().toISOString());
    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap(n => this.getBatch(n)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );

    this.batch = batchMap.pipe(
      map(v => Object.values(v))
    );

  }

  removeFromList(appointment: Appointment) {
    this.reload();
  }

  addToCalendar(event: CalendarEvent) {
    this.authService.addCalendarEvent(event);
    this.openSnackBar('Event added to your Google Calendar');
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 1000
    });
  }

  openAddAppointmentDialog() {
    this.appointmentDialog.open(AddAppointmentComponent, {
      data: {
      }
    }).afterClosed().subscribe(() => {
      setTimeout(() => this.reload(), 1000);
    });
  }
}
