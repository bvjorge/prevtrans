import { NgModule } from '@angular/core';
import {SharedModule} from '../../../shared/shared.module';
import { AcidenteDeTransitoRoutingModule } from './acidente-de-transito-routing.module';
import {AcidentesDeTransitosComponent} from './acidentes-de-transitos/acidentes-de-transitos.component';
import {CadastroAcidenteDeTransitoComponent} from './cadastro-acidente-de-transito/cadastro-acidente-de-transito.component';
import {ImageUploadModule} from 'angular2-image-upload';

@NgModule({
  imports: [
    SharedModule,
    ImageUploadModule.forRoot(),
    AcidenteDeTransitoRoutingModule
  ],
  declarations: [AcidentesDeTransitosComponent, CadastroAcidenteDeTransitoComponent]
})
export class AcidenteDeTransitoModule { }
