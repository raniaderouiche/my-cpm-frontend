import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Gender } from 'src/app/enums/Gender';
import { BusinessSector } from 'src/app/models/BusinessSector';
import { Organization } from 'src/app/models/Organization';
import { User } from 'src/app/models/User';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BusinessSectorService } from 'src/app/services/business-sector.service';
import { CountryService } from 'src/app/services/local/country.service';
import { OrganizationService } from 'src/app/services/organization.service';
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
  if (control.get('username')?.dirty) {
    const username = control.get('username')?.value;
    let check = USERS_LIST.find(i => i.username === username);
    return check == null ? null : { usernameTaken: true };
  } else
    return null;
};

let ORGANIZATIONS_LIST: Organization[] = [];

export const codeExistsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.get('organizationCode')?.dirty) {
    const code = control.get('organizationCode')?.value;
    let check = ORGANIZATIONS_LIST.find(i => i.code === code);
    return check == null ? null : { codeTaken: true };
  } else
    return null;
};

export const nameExistsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.get('organizationName')?.dirty) {
    const name = control.get('organizationName')?.value;
    let check = ORGANIZATIONS_LIST.find(i => i.name === name);
    return check == null ? null : { nameTaken: true };
  } else
    return null;
};


@Component({
  selector: 'app-register-admin',
  templateUrl: './register-admin.component.html',
  styleUrls: ['./register-admin.component.scss'],
  providers: [MessageService],

})
export class RegisterAdminComponent implements OnInit {

  myForm: FormGroup;

  countries: any[] = [];
  selectedCountry: any;

  document_file : File;

  sectors : BusinessSector[];

  showLoading : boolean;

  image_file : File;

  gender = Gender;
  genders = [];

  dialog: Boolean = false


  constructor(private countryService: CountryService, private messageService : MessageService,
    private businessSectorService: BusinessSectorService, private authenticationService : AuthenticationService, private router: Router,
     private userService : UserService, private organizationService : OrganizationService) { }

  ngOnInit(): void {

    this.getCountries();

    this.genders = Object.keys(this.gender);

    document.documentElement.style.fontSize = '14px';

    this.getCountries();
    this.getSectors();
    this.getUsers();
    this.getOrganizations();

    function ageRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {

      let age = new Date().getFullYear() - new Date(control.value).getFullYear()

      if (age !== undefined && (age < 18)) {
        return { 'ageRange': true };
      }
      return null;
    }

    this.myForm = new FormGroup({
      id: new FormControl(''),
      organizationName: new FormControl('', [Validators.required]),
      organizationCode: new FormControl('', [Validators.required]),
      sector: new FormControl('', [Validators.required]),
      organizationEmail: new FormControl('', [Validators.required, Validators.email]),
      country: new FormControl('',),
      region: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.pattern('^[0-9]{8}$')]),

      directorFirstName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"),Validators.required]),
      directorLastName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"),Validators.required]),
      directorPhone: new FormControl('', [Validators.pattern('^[0-9]{8}$')]),
      directorEmail: new FormControl('', [Validators.email]),

      adminFirstName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"),Validators.required]),
      adminLastName : new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"),Validators.required]),
      adminDob: new FormControl('', [ageRangeValidator, Validators.required]),
      adminGender: new FormControl('', Validators.required),
      adminPhone: new FormControl('', [Validators.required,Validators.pattern('^[0-9]{8}$')]),
      adminEmail: new FormControl('', [Validators.required,Validators.email]),
      username: new FormControl('', [Validators.required, usernameExistsValidator]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl(''),

      document_file: new FormControl(''),
      image_file: new FormControl(''),

    }, { validators: [passwordMatchingValidator, usernameExistsValidator, codeExistsValidator, nameExistsValidator] });

    this.myForm.reset()

  }

  getUsers() {
    this.userService.getUsers().subscribe(
      (data) => {
        USERS_LIST = data;
      }
    );
  }

  getOrganizations() {
    this.organizationService.getOrganizations().subscribe(
      (data) => {
        console.log(data);
        ORGANIZATIONS_LIST = data;
      }
    );
  }

  getCountries(){
    this.countryService.getCountries().then(countries => {
      this.countries = countries;
  });
  }

  getSectors() {
    this.businessSectorService.getSectors().subscribe
      ((response: BusinessSector[]) => {
        this.sectors = response;
      },
        (error: HttpErrorResponse) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 });
        }
      )
  }

  onRegister() {
    if(this.myForm.valid){
      this.showLoading = true;

      const formData: FormData = new FormData();

        formData.append('name', this.myForm.get('organizationName').value);
        formData.append('code', this.myForm.get('organizationCode').value);
        formData.append('email', this.myForm.get('organizationEmail').value);
        formData.append('sectorId', this.myForm.get('sector').value.id);
        formData.append('phone', this.myForm.get('phone').value);
        formData.append('country', this.myForm.get('country').value.name);
        formData.append('region', this.myForm.get('region').value);
        formData.append('address', this.myForm.get('address').value);
        formData.append('directorFirstName', this.myForm.get('directorFirstName').value);
        formData.append('directorLastName', this.myForm.get('directorLastName').value);
        formData.append('directorPhone', this.myForm.get('directorPhone').value);
        formData.append('directorEmail', this.myForm.get('directorEmail').value);
        formData.append('adminFN', this.myForm.get('adminFirstName').value);
        formData.append('adminLN', this.myForm.get('adminLastName').value);
        formData.append('adminGender', this.myForm.get('adminGender').value);
        formData.append('adminDob', this.myForm.get('adminDob').value);
        formData.append('adminPhone', this.myForm.get('adminPhone').value);
        formData.append('adminEmail', this.myForm.get('adminEmail').value);
        formData.append('adminUsername', this.myForm.get('username').value);
        formData.append('adminPwd', this.myForm.get('password').value);


        if (this.document_file != null) {
          formData.append('document', this.document_file, this.document_file?.name);
        }

        if (this.image_file != null) {
          formData.append('image', this.image_file, this.image_file?.name);
        }

        this.organizationService.saveOrganization(formData).subscribe({
          next:(response) => {
            this.dialog =true
          },
          error: (e) => {
            this.showLoading = false;
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
          },
          complete: () => {
            this.showLoading = false;

          }
        })



    }else{
      this.messageService.add({ severity: 'error', summary: 'Formulaire invalide', detail: 'Veuillez remplir tous les champs obligatoires correctement.', life: 3000 });
    }

  }

  login(username, password) {

    console.log(username);
    console.log(password);

    let user = {
      'username': username,
      'password': password,
    }

      this.authenticationService.login(user).subscribe(
        (response: any) => {
          const token = response.body["access_token"];
          this.authenticationService.saveToken(token);
          const refreshtoken = response.body["refresh_token"];
          this.authenticationService.saveRefreshToken(refreshtoken);
          this.authenticationService.addUserRoleToLocalCache()
          this.authenticationService.expiredMsg = null
          this.router.navigateByUrl('/cpm');
        },
        (error: HttpErrorResponse) => {
          this.showLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Authentification échoué', life: 3000 });
        }
    )
    }

    onSelectDocument(event) {
      this.document_file = event.files[0];
      if(this.document_file.size < 10000000){
        this.myForm.get('document_file').setValue('valid');
        this.messageService.add({severity: 'info', summary: 'Success', detail: 'Ficher selectionneé'});
      }else{
        this.myForm.get('document_file').reset();
      }
    }

    onSelectImage(event) {
      this.image_file = event.files[0];
      if(this.image_file.size < 10000000){
        this.myForm.get('image_file').setValue('valid');
        this.messageService.add({severity: 'info', summary: 'Success', detail: 'Image selectionneé'});
      }else{
        this.myForm.get('image_file').reset();
      }
    }

    onRemoveDocument() {
      this.document_file = null
      this.myForm.get('document_file').reset();
    }

    onRemoveImage() {
      this.image_file = null
      this.myForm.get('image_file').reset();
    }

    goToLanding() {
      this.router.navigate(['/']);
    }


}
