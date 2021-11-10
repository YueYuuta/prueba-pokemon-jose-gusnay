import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PokemonService } from 'src/app/services/pokemon.service';
import { PokemonModel } from '../../models/pokemon.model';
import { ModalDinamicoComponent } from '../modal-dinamico/modal-dinamico.component';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsService, NotificationType } from 'angular2-notifications';
import { ModalConfirmarComponent } from '../modal-confirmar/modal-confirmar.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.css'],
})
export class PokemonComponent implements OnInit, OnDestroy {
  private stop$ = new Subject<void>();
  displayedColumns: string[] = [
    'id',
    'image',
    'name',
    'attack',
    'defense',
    'acciones',
  ];
  dataSource: MatTableDataSource<PokemonModel>;
  total: number = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private readonly _pokemonService: PokemonService,
    public dialog: MatDialog,
    private _notiService: NotificationsService,
    private spinner: NgxSpinnerService
  ) {
    this.obtenerPokemones();
  }
  ngOnDestroy(): void {
    this.stop();
  }
  ngOnInit(): void {}

  private obtenerPokemones(): void {
    this.spinner.show();
    this._pokemonService
      .obtenerPokemones()
      .pipe(takeUntil(this.stop$))
      .subscribe(
        (pokemones) => {
          this.spinner.hide();
          this.total = pokemones.length;
          this.dataSource = new MatTableDataSource(pokemones);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        (err) => {
          this.spinner.hide();
        }
      );
  }

  // ngAfterViewInit() {
  //   // this.dataSource.paginator = this.paginator;
  //   // this.dataSource.sort = this.sort;
  // }

  abrirEliminar(id: number): void {
    this._pokemonService
      .obtenerPokemonPorId(id)
      .pipe(takeUntil(this.stop$))
      .subscribe(
        (response) => {
          const dialogRef = this.dialog.open(ModalConfirmarComponent, {
            width: '250px',
            data: { id },
          });
          dialogRef
            .afterClosed()
            .pipe(takeUntil(this.stop$))
            .subscribe((result) => {
              if (result) {
                this.obtenerPokemones();
                this._notiService.create(
                  'Correcto',
                  `${result}`,
                  NotificationType.Success,
                  {
                    // theClass: 'outline',
                    timeOut: 3000,
                    showProgressBar: true,
                    animate: 'scale',
                  }
                );
              }
            });
        },
        (err) => {
          this._notiService.create(
            'Error',
            `${err.error.error}`,
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

  abrirModalDinamimco(pokemon?: PokemonModel): void {
    let dialogRef = this.dialog.open(ModalDinamicoComponent, {
      height: '400px',
      width: '600px',
      data: { pokemon },
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.stop$))
      .subscribe((result) => {
        console.log(`Dialog result: ${result}`);

        if (result) {
          this.obtenerPokemones();
          this._notiService.create(
            'Correcto',
            `${result}`,
            NotificationType.Success,
            {
              // theClass: 'outline',
              timeOut: 3000,
              showProgressBar: true,
              animate: 'scale',
            }
          );
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  stop(): void {
    this.stop$.next();
    this.stop$.complete();
  }
}
