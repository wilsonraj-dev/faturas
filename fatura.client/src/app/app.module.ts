import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FaturasComponent } from './components/faturas/faturas.component';
import { CompraFormComponent } from './components/compra-form/compra-form.component';
import { ComprasRecorrentesComponent } from './components/compras-recorrentes/compras-recorrentes.component';
import { SimulacaoResultadoComponent } from './components/simulacao-resultado/simulacao-resultado.component';
import { FornecedoresComponent } from './components/fornecedores/fornecedores.component';
import { SimulacoesComponent } from './components/simulacoes/simulacoes.component';
import { SimulacaoDetalheComponent } from './components/simulacao-detalhe/simulacao-detalhe.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { DashboardFornecedoresComponent } from './components/dashboard-fornecedores/dashboard-fornecedores.component';
import { InstituicoesComponent } from './components/financeiro/instituicoes/instituicoes.component';
import { ContasComponent } from './components/financeiro/contas/contas.component';
import { CategoriasFinanceiroComponent } from './components/financeiro/categorias/categorias.component';
import { LancamentosComponent } from './components/financeiro/lancamentos/lancamentos.component';
import { ConfirmDialogComponent } from './components/financeiro/dialogs/confirm-dialog.component';
import { InstituicaoFormDialogComponent } from './components/financeiro/dialogs/instituicao-form-dialog.component';
import { ContaFormDialogComponent } from './components/financeiro/dialogs/conta-form-dialog.component';
import { CategoriaFormDialogComponent } from './components/financeiro/dialogs/categoria-form-dialog.component';
import { SubcategoriaFormDialogComponent } from './components/financeiro/dialogs/subcategoria-form-dialog.component';
import { LancamentoFormDialogComponent } from './components/financeiro/dialogs/lancamento-form-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FaturasComponent,
    CompraFormComponent,
    ComprasRecorrentesComponent,
    SimulacaoResultadoComponent,
    FornecedoresComponent,
    SimulacoesComponent,
    SimulacaoDetalheComponent,
    LoginComponent,
    RegisterComponent,
    ProfileSettingsComponent,
    SideMenuComponent,
    DashboardFornecedoresComponent,
    InstituicoesComponent,
    ContasComponent,
    CategoriasFinanceiroComponent,
    LancamentosComponent,
    ConfirmDialogComponent,
    InstituicaoFormDialogComponent,
    ContaFormDialogComponent,
    CategoriaFormDialogComponent,
    SubcategoriaFormDialogComponent,
    LancamentoFormDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
