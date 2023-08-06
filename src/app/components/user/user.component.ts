import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Gender } from 'src/app/enums/Gender';
import { Organization } from 'src/app/models/Organization';
import { Role } from 'src/app/models/Role';
import { User } from 'src/app/models/User';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { OrganizationService } from 'src/app/services/organization.service';
import { RoleService } from 'src/app/services/role.service';
import { UserService } from 'src/app/services/user.service';


//password confirm validator
export const passwordMatchingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { notmatched: true };
};
//unique username validator
let USERS_LIST: User[] = [];
export const usernameExistsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.get('username').dirty) {
    const username = control.get('username')?.value;
    let check = USERS_LIST.find(i => i.username === username);
    return check == null ? null : { usernameTaken: true };
  } else
    return null;
};


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class UserComponent implements OnInit {

  user : User;
  users : User[];
  selectedUsers : User[];

  organizations : Organization[];
  selectedOrganization : Organization;

  userDialog : boolean;
  deleteUserDialog : boolean;

  gender = Gender;
  genders = [];

  roles:Role[] = [];
  selectedRoles : Role[] = [];

  cols: any[];

  myForm: FormGroup;
  pwdForm: FormGroup;

  isAdmin : Boolean = false


  constructor(private messageService: MessageService,
     private router: Router,
     private authenticationService : AuthenticationService,
     private organizationService : OrganizationService,
     private roleService : RoleService,
     private userService : UserService) {
    }

  ngOnInit(): void {

    this.genders = Object.keys(this.gender);

    if(this.authenticationService.getUserRoleFromLocalCache()=="ADMIN"){
      this.isAdmin = true
      this.getUsersByOrg();
    }

    this.getUsers();
    this.getOrganisations();
    this.getRoles();

    this.cols = [
      { field: 'lastName', header: 'lastName' },
      { field: 'firstName', header: 'firstName' },
      { field: 'gender', header: 'gender' },
      { field: 'email', header: 'email' },
      { field: 'phone', header: 'phone' },
      { field: 'address', header: 'address' },
      { field: 'role', header: 'role' },
    ];


    function ageRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {

      let age = new Date().getFullYear() - new Date(control.value).getFullYear()

      if (age !== undefined && (age < 18)) {
        return { 'ageRange': true };
      }
      return null;
    }


    this.myForm = new FormGroup({
      id: new FormControl(''),
      firstName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"), Validators.required]),
      lastName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"), Validators.required]),
      gender: new FormControl('', Validators.required),
      dob: new FormControl('', [ageRangeValidator, Validators.required]),
      email: new FormControl('', [Validators.email, Validators.required]),
      phone: new FormControl('', [Validators.pattern("[0-9]{8}"), Validators.required]),
      address : new FormControl(''),
      organization : new FormControl(''),
      username: new FormControl('', Validators.required),
      roles: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl(''),
    }, { validators: [passwordMatchingValidator, usernameExistsValidator] })

    this.pwdForm = new FormGroup({
      password: new FormControl(''),
      confirmPassword: new FormControl(''),
    }, { validators: [passwordMatchingValidator] })


  }
  getUsersByOrg() {
    this.userService.getUsersByOrg().subscribe(
      (data) => {
        this.users = data;
      }
    );
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      (data) => {
        if(this.authenticationService.getUserRoleFromLocalCache()=="SUPER_ADMIN"){
          this.users = data;
        }
        USERS_LIST = data
      }
    );
  }

  getOrganisations() {
    this.organizationService.getOrganizations().subscribe(
      (data) => {
        this.organizations = data;
      }
    );
  }

  openNew(){
    this.userDialog = true;
  }

  getRoles(){
    this.roleService.getRoles().subscribe(
      (data) => {
        this.roles = data;
        if(this.authenticationService.getUserRoleFromLocalCache()=="ADMIN"){
          this.roles = this.roles.filter(role => role.name != "SUPER_ADMIN")
        }
      }
    );
  }


  userSelected(){
    this.myForm.get("organization").setValue(this.selectedOrganization);
  }

  saveUser() {

    if(this.myForm.valid){
      this.user = {
        id: null,
        isActive : true,
        firstName: this.myForm.get('firstName').value,
        lastName: this.myForm.get('lastName').value,
        gender : this.myForm.get('gender').value,
        dob : this.myForm.get('dob').value,
        email : this.myForm.get('email').value,
        phone : this.myForm.get('phone').value,
        address : this.myForm.get('address').value,
        organization : this.myForm.get('organization').value,
        username : this.myForm.get('username').value,
        roles : [this.myForm.get('roles').value],
        password : this.myForm.get('password').value,

      }
      if(this.isAdmin){
        this.user.organization = this.users[0].organization
      }
      console.log(this.user);

      this.userService.saveUserWithOrg(this.user,this.user.organization.id).subscribe({
        next: (response: User) => {
          this.myForm.reset();
          if(this.isAdmin){
            this.getUsersByOrg();
          }
          this.getUsers();
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
        },
        complete: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Utilisateur Enregistrer' });
          this.userDialog = false;
        }
      })
    }else{
      this.messageService.add({ severity: 'error', summary: 'Formulaire invalide', detail: 'Veuillez remplir tous les champs obligatoires.', life: 3000 });
    }


  }

  openDeleteDialog(user: User){
    this.deleteUserDialog = true
    this.user = {...user}
  }

  confirmDelete(){
    this.userService.deleteUserById(this.user?.id).subscribe({
      next: (response: User) => {
        this.getUsers();
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
      },
      complete: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Utilisateur Supprimé' });
        this.deleteUserDialog = false;
        this.user = null;
      }
    })
  }

  viewUser(user){
    this.router.navigate(['cpm/users/',user.id]);

  }

}
