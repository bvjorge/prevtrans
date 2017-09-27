import { Injectable } from '@angular/core';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import {Observable} from 'rxjs/Observable';
import {PREVTRANS_API} from '../../app.api';
import {Usuario} from '../models/usuario.model';
import {PrevtransAdminHerrorHandler} from '../../prevtrans-admin/prevtrans-admin-herror-handler';
import {AuthHttp} from 'angular2-jwt';

@Injectable()
export class UsuarioService {

  constructor(private http: AuthHttp) { }

  usuarios(): Observable<Usuario[]> {
    return this.http.get(`${PREVTRANS_API}/usuarios`)
      .map(response => response.json()).catch(PrevtransAdminHerrorHandler.handleError);
  }
  postUsuario( usuario: Usuario): Observable<String> {
    return this.http.post(`${PREVTRANS_API}/usuarios`,
      JSON.stringify(usuario))
      .map(response => response.json());
  }
}