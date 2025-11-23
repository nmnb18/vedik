import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guards';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'order',
        loadComponent: () =>
          import('./pages/order/order.component').then((c) => c.OrderComponent),
        canActivate: [authGuard],
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./pages/stock/stock.component').then((c) => c.StockComponent),
        canActivate: [authGuard],
      },
      {
        path: 'product',
        loadComponent: () =>
          import('./pages/product/product.component').then(
            (c) => c.ProductComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'client',
        loadComponent: () =>
          import('./pages/client/client.component').then(
            (c) => c.ClientComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'client/:id',
        loadComponent: () =>
          import('./pages/client/client-details/client-details.component').then(
            (c) => c.ClientDetailsComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'expense',
        loadComponent: () =>
          import('./pages/expense/expense.component').then(
            (c) => c.ExpenseComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'transport',
        loadComponent: () =>
          import('./pages/transport/transport.component').then(
            (c) => c.TransportComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./pages/payments/payments.component').then(
            (c) => c.PaymentsComponent
          ),
        canActivate: [authGuard],
      },

      {
        path: 'cp-orders',
        loadComponent: () =>
          import('./pages/cp-order/cp-order.component').then(
            (c) => c.CpOrderComponent
          ),
        canActivate: [authGuard],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => c.LoginComponent),
    canActivate: [loginGuard],
  },
];
