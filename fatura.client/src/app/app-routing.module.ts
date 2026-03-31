import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FaturasComponent } from './components/faturas/faturas.component';
import { CompraFormComponent } from './components/compra-form/compra-form.component';
import { FornecedoresComponent } from './components/fornecedores/fornecedores.component';
import { SimulacoesComponent } from './components/simulacoes/simulacoes.component';
import { SimulacaoDetalheComponent } from './components/simulacao-detalhe/simulacao-detalhe.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'faturas', component: FaturasComponent },
  { path: 'compras/nova', component: CompraFormComponent },
  { path: 'fornecedores', component: FornecedoresComponent },
  { path: 'simulacoes', component: SimulacoesComponent },
  { path: 'simulacoes/:id', component: SimulacaoDetalheComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
