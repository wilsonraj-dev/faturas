import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';
import { AppComponent } from './app.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FaturasComponent } from './components/faturas/faturas.component';
import { CompraFormComponent } from './components/compra-form/compra-form.component';
import { SimulacaoResultadoComponent } from './components/simulacao-resultado/simulacao-resultado.component';
import { FornecedoresComponent } from './components/fornecedores/fornecedores.component';
import { SimulacoesComponent } from './components/simulacoes/simulacoes.component';
import { SimulacaoDetalheComponent } from './components/simulacao-detalhe/simulacao-detalhe.component';
import { LoginComponent } from './components/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    FaturasComponent,
    CompraFormComponent,
    SimulacaoResultadoComponent,
    FornecedoresComponent,
    SimulacoesComponent,
    SimulacaoDetalheComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
