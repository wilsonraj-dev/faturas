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
  { path: 'configuracoes', component: ProfileSettingsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
