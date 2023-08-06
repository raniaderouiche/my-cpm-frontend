import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DeliveryComponent } from './components/delivery/delivery.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItemComponent } from './components/item/item.component';
import { TypeComponent } from './components/type/type.component';
import { BusinessSectorComponent } from './components/business-sector/business-sector.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { OrganizationDetailsComponent } from './components/organization/organization-details/organization-details.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { ProfessionComponent } from './components/profession/profession.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterAdminComponent } from './components/register/register-admin/register-admin.component';
import { RegisterEmployeeComponent } from './components/register/register-employee/register-employee.component';
import { ApprovedRequestsComponent } from './components/requests/approved-requests/approved-requests.component';
import { RejectedRequestsComponent } from './components/requests/rejected-requests/rejected-requests.component';
import { WaitingRequestsComponent } from './components/requests/waiting-requests/waiting-requests.component';
import { UserDetailsComponent } from './components/user/user-details/user-details.component';
import { UserComponent } from './components/user/user.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { MarketComponent } from './components/market/market.component';
import { MarketDetailsComponent } from './components/market/market-details/market-details.component';
import { WorkOrderComponent } from './components/work-order/work-order.component';
import { AttachmentComponent } from './components/attachment/attachment.component';
import { WorkOrderConsultComponent } from './components/work-order/work-order-consult/work-order-consult.component';
import { WorkOrderManageComponent } from './components/work-order/work-order-manage/work-order-manage.component';
import { AttachmentManageComponent } from './components/attachment/attachment-manage/attachment-manage.component';
import { DeliveryManageComponent } from './components/delivery/delivery-manage/delivery-manage.component';
import { AuthGuard } from './guard/auth.guard';
import { RoleGuardGuard } from './guard/role-guard.guard';

const all = ['SUPER_ADMIN','ADMIN','USER','RESPONSABLE_TRAVAUX','CHEF_PROJET','FINANCIER']
const all_USER = ['SUPER_ADMIN','ADMIN']

@NgModule({
  imports: [
    RouterModule.forRoot([
        {path: '', component: LandingComponent},
        {path: 'login', component: LoginComponent},
        {path: 'registerAdmin', component: RegisterAdminComponent},
        {path: 'registerEmployee', component: RegisterEmployeeComponent},

        {
          path: 'cpm', component: AppLayoutComponent, canActivate : [AuthGuard],
          children:[
            { path:'dashboard',component:DashboardComponent},
            { path:'items',component:ItemComponent, canActivate : [RoleGuardGuard], data : { role : all_USER}},
            { path:'types',component:TypeComponent, canActivate : [RoleGuardGuard], data : { role : all_USER}},
            { path:'markets',component:MarketComponent, canActivate : [RoleGuardGuard], data : { role : all}},
            { path:'markets/:id',component:MarketDetailsComponent, canActivate : [RoleGuardGuard], data : { role : all}},
            { path:'organizations/manage',component:OrganizationComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN']}},
            { path:'organizations/manage/:id',component:OrganizationDetailsComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN']}},
            { path:'business_sectors',component:BusinessSectorComponent, canActivate : [RoleGuardGuard], data : { role : all_USER}},
            { path:'professions',component:ProfessionComponent, canActivate : [RoleGuardGuard], data : { role : all_USER}},
            { path:'requests/approved',component:ApprovedRequestsComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN']}},
            { path:'requests/waiting',component:WaitingRequestsComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN']}},
            { path:'requests/rejected',component:RejectedRequestsComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN']}},
            { path:'users',component:UserComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN','ADMIN']}},
            { path:'users/:id',component:UserDetailsComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN','ADMIN']}},
            { path:'attachments/order/:type/:id',component:AttachmentManageComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN', 'ADMIN','CHEF_PROJET']}},
            { path:'attachments',component:AttachmentComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN', 'ADMIN','CHEF_PROJET']}},
            { path:'deliveries',component:DeliveryComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN', 'ADMIN','FINANCIER']}},
            { path:'deliveries/order/:type/:id',component:DeliveryManageComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN', 'ADMIN','FINANCIER']}},
            { path:'workorder/order/:id',component:WorkOrderComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN', 'ADMIN','RESPONSABLE_TRAVAUX']}},
            { path:'workorders/consult/:id',component:WorkOrderConsultComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN', 'ADMIN','RESPONSABLE_TRAVAUX']}},
            { path:'workorders/manage',component:WorkOrderManageComponent, canActivate : [RoleGuardGuard], data : { role : ['SUPER_ADMIN', 'ADMIN','RESPONSABLE_TRAVAUX']}},

            {path: 'profile', component: ProfileComponent, canActivate : [RoleGuardGuard], data : { role : all}},

          ]
        },
    ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
],
  exports: [RouterModule]
})
export class AppRoutingModule { }
