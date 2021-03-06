import {Component, EventEmitter, forwardRef, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Usuario} from '../../../shared/models/usuario.model';
import {AuthService} from '../../../shared/seguranca/auth.service';
import {MaterializeAction} from 'angular2-materialize';
import {UsuarioService} from '../../../shared/services/usuario.service';
import {Router} from '@angular/router';
import {ToastyService} from 'ng2-toasty';

declare const jQuery: any;
declare const Materialize: any;

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css']
})
export class PerfilUsuarioComponent implements OnInit {
  titulo: string;
  messageErroUsuario: string;
  messageErroEmail: string;
  LOGIN_REGEX = /^[_'.@A-Za-z0-9-]*$/;
  EMAIL_REGEX = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  perfilUsuarioForm: FormGroup;
  senhaForm: FormGroup;
  alteraSenhaAction = new EventEmitter<string | MaterializeAction>();

  constructor(private formBuilder: FormBuilder, private  auth: AuthService,
              @Inject(forwardRef(() => UsuarioService)) private usuarioService: UsuarioService,
              private router: Router, private toastyService: ToastyService) {
  }

  ngOnInit() {
    this.titulo = 'Perfil Usuário';
    this.messageErroUsuario = '';
    this.messageErroEmail = '';
    this.inicializaMaterialize();
    this.iniciaForm();
    this.carregarPerfil();
  }

  iniciaForm() {
    this.perfilUsuarioForm = this.formBuilder.group({
      nome: this.formBuilder.control('', [Validators.required, Validators.minLength(5)]),
      usuario: this.formBuilder.control('', Validators.compose([Validators.required,
        Validators.pattern(this.LOGIN_REGEX)]), this.validaUsuario.bind(this)),
      email: this.formBuilder.control('', [Validators.required, Validators.pattern(this.EMAIL_REGEX)],
        this.verificaEmail.bind(this))
    });

    this.senhaForm = this.formBuilder.group({
      senha: this.formBuilder.control('', [Validators.required, Validators.minLength(8)]),
      verificaSenha: this.formBuilder.control('', [Validators.required, Validators.minLength(8)])
    }, {validator: PerfilUsuarioComponent.equalsTo});
  }

  static equalsTo(group: AbstractControl): { [key: string]: boolean } {
    const senha = group.get('senha');
    const verificaSenha = group.get('verificaSenha');
    if (!senha || !verificaSenha) {
      return undefined;
    }
    if (senha.value !== verificaSenha.value) {
      return {senhaNotMatch: true}
    }
    return undefined;
  }

  validaUsuario(control: AbstractControl) {
    const q = new Promise((resolve, reject) => {
      setTimeout(() => {
        this.usuarioService.verificaUsuario(control.value, this.auth.jwtPayload.idUsuario)
          .subscribe(() => {
            this.messageErroUsuario = 'Usuário inválido';
            resolve(null);
          }, () => {
            this.messageErroUsuario = 'Usuário já está em uso';
            resolve({'usuarioEmUso': true});
          });
      }, 1000);
    });
    return q;
  }

  verificaEmail(control: AbstractControl) {
    const q = new Promise((resolve, reject) => {
      setTimeout(() => {
        this.usuarioService.verificaEmail(control.value, this.auth.jwtPayload.idUsuario)
          .subscribe(() => {
            this.messageErroEmail = 'E-mail inválido';
            resolve(null);
          }, () => {
            this.messageErroEmail = 'E-mail  já está em uso';
            resolve({'emailEmUso': true});
          });
      }, 1000);
    });
    return q;
  }

  validaForm(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({onlySelf: true});
      } else if (control instanceof FormGroup) {
        this.validaForm(control);
      }
    });
  }

  carregarPerfil() {
    this.usuarioService.getUsuario(this.auth.jwtPayload.idUsuario).subscribe(
      usuario => {
        this.perfilUsuarioForm.patchValue(usuario);
        this.inicializaMaterialize();
      }
    );
  }

  salvar(usuario: Usuario) {
    if (this.perfilUsuarioForm.valid) {
      this.usuarioService.alterarPerfil(this.auth.jwtPayload.idUsuario, usuario)
        .subscribe(user => {
          this.perfilUsuarioForm.patchValue(user);
          this.inicializaMaterialize();
          this.router.navigate(['admin']).then(
            () => this.confirmacao('Dados do Usuário Alterados com sucesso!!')
          );
        });
    } else {
      this.validaForm(this.perfilUsuarioForm);
    }
  }

  cancelar() {
    this.router.navigate(['admin']).then(
      () => this.confirmacao('Operação Cancelada !!')
    );
  }

  alterarSenha() {
    this.alteraSenhaAction.emit({action: 'modal', params: ['open']});
  }

  fechaModalSenha() {
    this.alteraSenhaAction.emit({action: 'modal', params: ['close']});
  }

  salvarSenha(senha: string) {
    this.usuarioService.alterarSenha(this.auth.jwtPayload.idUsuario, senha)
      .subscribe(() => {
          this.fechaModalSenha();
          this.confirmacao('Senha Alterada Com Sucesso!!');
        }
      );
  }

  inicializaMaterialize() {
    jQuery(document).ready(function () {
      Materialize.updateTextFields();
    });
  }

  confirmacao(msg: string) {
    this.toastyService.success({
      title: 'Confirmação',
      msg: msg,
      showClose: true,
      timeout: 10000,
      theme: 'default'
    });
  }
}
