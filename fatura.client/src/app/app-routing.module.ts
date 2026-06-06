import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FaturasComponent } from './components/faturas/faturas.component';
import { CompraFormComponent } from './components/compra-form/compra-form.component';
import { ComprasRecorrentesComponent } from './components/compras-recorrentes/compras-recorrentes.component';
import { FornecedoresComponent } from './components/fornecedores/fornecedores.component';
import { SimulacoesComponent } from './components/simulacoes/simulacoes.component';
import { SimulacaoDetalheComponent } from './components/simulacao-detalhe/simulacao-detalhe.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { AuthGuard } from './guards/auth.guard';
import { InstituicoesComponent } from './components/financeiro/instituicoes/instituicoes.component';
import { ContasComponent } from './components/financeiro/contas/contas.component';
import { CategoriasFinanceiroComponent } from './components/financeiro/categorias/categorias.component';
import { LancamentosComponent } from './components/financeiro/lancamentos/lancamentos.component';
import { LembretesPagamentoComponent } from './components/lembretes-pagamento/lembretes-pagamento.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Dashboard', icon: 'dashboard', exact: true }
  },
  {
    path: 'faturas',
    component: FaturasComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Faturas', icon: 'receipt_long', exact: true }
  },
  {
    path: 'compras/nova',
    component: CompraFormComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Nova Compra', icon: 'add_shopping_cart', exact: true }
  },
  {
    path: 'compras-recorrentes',
    component: ComprasRecorrentesComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Recorrentes', icon: 'autorenew', exact: true }
  },
  {
    path: 'lembretes-pagamento',
    component: LembretesPagamentoComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Lembretes de Pagamento', icon: 'notifications_active', exact: true }
  },
  {
    path: 'fornecedores',
    component: FornecedoresComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Fornecedores', icon: 'store', exact: true }
  },
  {
    path: 'simulacoes',
    component: SimulacoesComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Simulações', icon: 'calculate', exact: false }
  },
  { path: 'simulacoes/:id', component: SimulacaoDetalheComponent, canActivate: [AuthGuard] },
  {
    path: 'financeiro/instituicoes',
    component: InstituicoesComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Instituições', icon: 'account_balance', exact: true, group: 'Financeiro' }
  },
  {
    path: 'financeiro/contas',
    component: ContasComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Contas', icon: 'credit_card', exact: true, group: 'Financeiro' }
  },
  {
    path: 'financeiro/categorias',
    component: CategoriasFinanceiroComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Categorias', icon: 'category', exact: true, group: 'Financeiro' }
  },
  {
    path: 'financeiro/lancamentos',
    component: LancamentosComponent,
    canActivate: [AuthGuard],
    data: { showInMenu: true, label: 'Lançamentos', icon: 'payments', exact: true, group: 'Financeiro' }
  },
  { path: 'configuracoes', component: ProfileSettingsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
