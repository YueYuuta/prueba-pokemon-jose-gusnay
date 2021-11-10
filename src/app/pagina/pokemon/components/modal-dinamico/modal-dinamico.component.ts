import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationsService, NotificationType } from 'angular2-notifications';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PokemonService } from 'src/app/services/pokemon.service';
import { PokemonModel } from '../../models/pokemon.model';

@Component({
  selector: 'app-modal-dinamico',
  templateUrl: './modal-dinamico.component.html',
  styleUrls: ['./modal-dinamico.component.css'],
})
export class ModalDinamicoComponent implements OnInit, OnDestroy {
  private stop$ = new Subject<void>();
  pokemonForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<ModalDinamicoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly fb: FormBuilder,
    private readonly _pokemonService: PokemonService,
    private spinner: NgxSpinnerService,
    private _notiService: NotificationsService
  ) {}
  ngOnDestroy(): void {
    this.stop();
  }

  ngOnInit(): void {
    this.formDinamico();
  }

  formatLabel(value: number) {
    return value;
  }

  close(mensaje?: string): void {
    this.dialogRef.close(mensaje);
  }
  private formDinamico(): void {
    if (!this.data.pokemon) {
      this.formGuardar();
    } else {
      this.formEditar();
    }
  }

  private formGuardar(): void {
    this.pokemonForm = this.fb.group({
      name: ['', [Validators.required]],
      image: [''],
      attack: ['', [Validators.required]],
      defense: ['', Validators.required],
      hp: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  private formEditar(): void {
    this.pokemonForm = this.fb.group({
      name: [this.data.pokemon.name, [Validators.required]],
      image: [this.data.pokemon.image],
      attack: [this.data.pokemon.attack, [Validators.required]],
      defense: [this.data.pokemon.defense, Validators.required],
      hp: [this.data.pokemon.hp, Validators.required],
      type: [this.data.pokemon.type, Validators.required],
    });
  }

  guardadoDinamico(event: Event): void {
    if (!this.data.pokemon) {
      this.guardar(event);
    } else {
      this.editar(event);
    }
  }
  guardar(event: any): void {
    console.log(this.pokemonForm.value);

    if (this.pokemonForm.valid) {
      event.preventDefault();
      this.spinner.show();
      const pokemon: PokemonModel = this.pokemonForm.value;
      this._pokemonService
        .crearPokemon(pokemon)
        .pipe(takeUntil(this.stop$))
        .subscribe(
          (data: any) => {
            console.log(data);
            this.spinner.hide();
            this.pokemonForm.reset();
            this.close('Pokemon Creado');
          },
          (err: any) => {
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
  }
  editar(event: Event): void {
    if (this.pokemonForm.valid) {
      event.preventDefault();
      // this.spinner.show();
      const pokemon: PokemonModel = this.pokemonForm.value;
      this._pokemonService
        .editarPokemon(pokemon, this.data.pokemon.id)
        .pipe(takeUntil(this.stop$))
        .subscribe(
          (data) => {
            this.spinner.hide();
            this.pokemonForm.reset();
            this.close('Pokemon Editado');
          },
          (err: any) => {
            this.spinner.hide();
            this._notiService.create(
              'Incorrecto',
              `Error al editar un pokemon`,
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
  }
  stop(): void {
    this.stop$.next();
    this.stop$.complete();
  }
}
