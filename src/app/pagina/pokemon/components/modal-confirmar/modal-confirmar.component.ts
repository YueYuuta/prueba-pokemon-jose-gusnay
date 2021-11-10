import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationsService, NotificationType } from 'angular2-notifications';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { PokemonService } from 'src/app/services/pokemon.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-modal-confirmar',
  templateUrl: './modal-confirmar.component.html',
  styleUrls: ['./modal-confirmar.component.css'],
})
export class ModalConfirmarComponent implements OnInit, OnDestroy {
  private stop$ = new Subject<void>();
  constructor(
    public dialogRef: MatDialogRef<ModalConfirmarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _pokemonService: PokemonService,
    private spinner: NgxSpinnerService,
    private _notiService: NotificationsService
  ) {}
  ngOnDestroy(): void {
    this.stop();
  }

  ngOnInit(): void {}

  close(mensaje?: string): void {
    this.dialogRef.close(mensaje);
  }

  eliminarPokemon(): void {
    this.spinner.show();
    this._pokemonService
      .eliminarPokemon(this.data.id)
      .pipe(takeUntil(this.stop$))
      .subscribe(
        (response) => {
          this.spinner.hide();
          this.close('Pokemon Eliminado');
        },
        (err) => {
          this.spinner.hide();
          this._notiService.create(
            'Incorrecto',
            `${err.error}`,
            NotificationType.Error,
            {
              // theClass: 'outline',
              timeOut: 3000,
              showProgressBar: true,
              animate: 'scale',
            }
          );
        }
      );
  }

  stop(): void {
    this.stop$.next();
    this.stop$.complete();
  }
}
