import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PokemonModel } from '../pagina/pokemon/models/pokemon.model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

const url: string = environment.url;

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  constructor(private readonly http: HttpClient) {}

  obtenerPokemones(): Observable<PokemonModel[]> {
    return this.http.get<PokemonModel[]>(`${url}/pokemons`);
  }
  crearPokemon(pokemon: PokemonModel): Observable<any> {
    pokemon.idAuthor = 1;
    return this.http.post<any>(`${url}/pokemons/?idAuthor=1`, pokemon);
  }

  editarPokemon(pokemon: PokemonModel, id: number): Observable<any> {
    pokemon.idAuthor = 1;
    return this.http.put<any>(`${url}/pokemons/${id}`, pokemon);
  }

  obtenerPokemonPorId(id: number): Observable<PokemonModel> {
    return this.http.get<PokemonModel>(`${url}/pokemons/${id}`);
  }
  eliminarPokemon(id: number): Observable<any> {
    return this.http.delete<any>(`${url}/pokemons/${id}`);
  }
}
