import { Country } from './../../models/Country';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BusinessSector } from 'src/app/models/BusinessSector';
import { CustomFile } from 'src/app/models/CustomFile';
import { Organization } from 'src/app/models/Organization';
import { Role } from 'src/app/models/Role';
import { User } from 'src/app/models/User';
import { BusinessSectorService } from 'src/app/services/business-sector.service';
import { CountryService } from 'src/app/services/local/country.service';
import { OrganizationService } from 'src/app/services/organization.service';
import { RoleService } from 'src/app/services/role.service';
import { UserService } from 'src/app/services/user.service';
import { Gender } from 'src/app/enums/Gender';
import { DomSanitizer } from '@angular/platform-browser';
import { EmailService } from 'src/app/services/email.service';


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
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  providers: [MessageService],
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {

  organizations : Organization[] = [];
  organization : Organization;

  deleteOrganizationDialog: boolean = false;
  addOrganizationDialog: boolean = false;

  deleteOrganizationsDialog: boolean = false;

  myForm: FormGroup;
  editForm: FormGroup;

  //countries: any[] = [];
  selectedCountry: any;

  editDialog : boolean = false;

  formData: FormData;

  sectors: BusinessSector[];

  document_file : File;
  image_file : File;
  modalDocument_file : File;

  //so docs is an array of files to get arround the file uploader table when editing an organization
  docs : CustomFile[] = [];

  adminRole : Role;

  documentAvailability  : boolean = false;

  countries : Country[]

  user : User
  users : User[];
  gender = Gender;
  genders = [];

  public constructor( private organizationService : OrganizationService,
      private roleService : RoleService,
      private userService : UserService,
      private emailService : EmailService,
      private sanitizer: DomSanitizer,
      private countryService: CountryService, private messageService: MessageService,
      private businessSectorService: BusinessSectorService,
      private router: Router ) { }

  ngOnInit(): void {
    this.getOrganisations();
    this.getSectors();
    this.getUsers()

    this.getCountries();

    this.getAdminRole();

    this.genders = Object.keys(this.gender);

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
      phone: new FormControl('', [Validators.min(1),Validators.pattern('^[0-9]{8}$')]),

      directorFirstName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"),Validators.required]),
      directorLastName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"),Validators.required]),
      directorPhone: new FormControl('', [Validators.min(1),Validators.pattern('^[0-9]{8}$')]),
      directorEmail: new FormControl('', [Validators.email]),

      adminFirstName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"),Validators.required]),
      adminLastName : new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"),Validators.required]),
      adminDob: new FormControl('', [ageRangeValidator, Validators.required]),
      adminGender: new FormControl('', Validators.required),
      adminPhone: new FormControl('', [Validators.required,Validators.min(1),Validators.pattern('^[0-9]{8}$')]),
      adminEmail: new FormControl('', [Validators.required,Validators.email]),
      username: new FormControl('', [Validators.required, usernameExistsValidator]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl(''),

      document_file: new FormControl(''),
      image_file: new FormControl(''),

    }, { validators: [passwordMatchingValidator, usernameExistsValidator] });

    this.editForm = new FormGroup({
      id: new FormControl(''),
      organizationName: new FormControl('', [Validators.required]),
      organizationCode: new FormControl('', [Validators.required]),
      sector: new FormControl('', [Validators.required]),
      organizationEmail: new FormControl('', [Validators.required, Validators.email]),
      country: new FormControl('',),
      region: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.min(1),Validators.pattern('^[0-9]{8}$')]),

      directorFirstName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"),Validators.required]),
      directorLastName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"),Validators.required]),
      directorPhone: new FormControl('', [Validators.min(1),Validators.pattern('^[0-9]{8}$')]),
      directorEmail: new FormControl('', [Validators.email]),

      document_file: new FormControl(''),

    });
  }

  getOrganisations() {
    this.organizationService.getOrganizations().subscribe(
      (data) => {
        this.organizations = data;
        console.log(this.organizations);
      }
    );
  }

  getCountries(){
    this.countryService.getCountries().then(countries => {
      this.countries = countries;
  });
  }

  //get admin role from database
  getAdminRole() {
    this.roleService.getRoles().subscribe(
      (data) => {
        this.adminRole = data.find(role => role.name === 'ADMIN');
        if (this.adminRole == null) {
          this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Aucun role admin trouvé'});
        }
      }

    );
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      (data) => {
        this.users = data;
        USERS_LIST = this.users
      }
    );
  }


  openAddOrgDialog(){
    this.myForm.reset()
    this.addOrganizationDialog = true;
  }


  saveOrganization(){
    if(this.myForm.valid){

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
            this.getOrganisations()
          },
          error: (e) => {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
          },
          complete: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Utilisateur Enregistrer' });
            this.addOrganizationDialog = false;
          }
        })



    }else{
      this.messageService.add({ severity: 'error', summary: 'Formulaire invalide', detail: 'Veuillez remplir tous les champs obligatoires.', life: 3000 });
    }

  }

  deleteOrganization( organization: Organization ) {
    this.deleteOrganizationDialog = true;
    this.organization = {...organization};
  }

  confirmDelete() {
    this.deleteOrganizationDialog = false;
    this.organizationService.deleteOrganization(this.organization.id).subscribe(
      (event) => {
        this.getOrganisations();
      },
      (error: HttpErrorResponse) => {
        this.messageService.add({severity: 'error',summary: 'Enregistrement échoué', detail:error.message ,life: 5000});
      }
    );
    this.messageService.add({severity: 'success', summary: 'Succèss', detail: 'Organisation Supprimé',life: 3000});
    this.organization = {};
  }

  loadOrganization( id: number ) {
    this.router.navigate(['cpm/organizations/manage/',id]);
  }

  editOrganization( organization : Organization){



    this.editForm.get('id').setValue(organization.id);
    this.editForm.get('organizationName').setValue(organization.name);
    this.editForm.get('organizationCode').setValue(organization.code);
    this.editForm.get('sector').setValue(organization.sector);
    this.editForm.get('organizationEmail').setValue(organization.email);
    this.editForm.get('country').setValue(organization.country);
    this.editForm.get('region').setValue(organization.region);
    this.editForm.get('address').setValue(organization.address);
    this.editForm.get('phone').setValue(organization.phone);
    this.editForm.get('status').setValue(organization.status);
    this.editForm.get('directorFirstName').setValue(organization.directorFirstName);
    this.editForm.get('directorLastName').setValue(organization.directorLastName);
    this.editForm.get('directorPhone').setValue(organization.directorPhone);
    this.editForm.get('directorEmail').setValue(organization.directorEmail);

    console.log(organization.document );

    if(organization.document != null){
      this.documentAvailability = true;
    }else{
      this.documentAvailability = false;
    }

    this.docs = [];
    this.docs.push(organization.document);

    this.editDialog = true;

  }

  updateOrganization(){
    this.formData = new FormData();
    this.formData.append('id', this.editForm.get('id').value);
    this.formData.append('name', this.editForm.get('organizationName').value);
    this.formData.append('code', this.editForm.get('organizationCode').value);
    this.formData.append('email', this.editForm.get('organizationEmail').value);
    this.formData.append('phone', this.editForm.get('phone').value);
    this.formData.append('country', this.editForm.get('country').value);
    this.formData.append('region', this.editForm.get('region').value);
    this.formData.append('address', this.editForm.get('address').value);
    this.formData.append('status', this.editForm.get('status').value);
    this.formData.append('directorFirstName', this.editForm.get('directorFirstName').value);
    this.formData.append('directorLastName', this.editForm.get('directorLastName').value);
    this.formData.append('directorPhone', this.editForm.get('directorPhone').value);
    this.formData.append('directorEmail', this.editForm.get('directorEmail').value);

    let sectorId = this.editForm.get('sector').value.id;
    this.formData.append('sectorId', sectorId);

    console.log(this.modalDocument_file);
    if (this.modalDocument_file != null) {
      this.formData.append('document', this.modalDocument_file, this.modalDocument_file?.name);
    }

    this.organizationService.updateOrganization(this.formData).subscribe(
      (response: Organization) => {
        this.getOrganisations();
        this.messageService.add({ severity: 'success', summary: 'Succèss', detail: 'Stagiaire Enregistré', life: 3000});
      },
      (error: HttpErrorResponse) => {
        this.messageService.add({severity: 'error',summary: 'Enregistrement échoué', detail:error.message ,life: 3000});
      }
    )

    this.editDialog = false;

  }

  hideEditDialog(){
    this.editDialog = false;
    this.editForm.reset();
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

  getSrcFromCustomFile(customFile : CustomFile){
    let uint8Array = new Uint8Array(atob(customFile.data).split("").map(char => char.charCodeAt(0)));
    let dwn = new Blob([uint8Array])
    return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(dwn));
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

  onSelectModalDocument(event) {
    this.modalDocument_file = event.files[0];
    if(this.modalDocument_file.size < 10000000){
      this.editForm.get('document_file').setValue('valid');
      this.messageService.add({severity: 'info', summary: 'Success', detail: 'Ficher selectionneé'});
    }else{
      this.editForm.get('document_file').reset();
    }
  }

  onRemoveDocument() {
    this.document_file = null
    this.myForm.get('document_file').reset();
  }

  onRemoveModalDocument() {
    this.modalDocument_file = null
    this.editForm.get('document_file').reset();
  }

  onRemoveImage() {
    this.image_file = null
    this.myForm.get('image_file').reset();
  }

  onRemoveExistingDocument(){
    this.documentAvailability = false;
    this.modalDocument_file = null;
  }

  inviteDialog = false
  inviteEmail : string
  loading = false
  openInviteDialog(){
    this.inviteDialog = true
  }

  sendInvitationEmail(inviteEmail){

    const regexExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;

    if(regexExp.test(inviteEmail)){
      this.loading = true
      this.emailService.sendInvitationEmail(inviteEmail).subscribe({
        next: (response: any) => {
          this.loading = false
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Invitation Envoyée", life: 3000 });
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Un problème est survenu réessayez plus tard', life: 3000 });
        },
        complete: () => {
          this.inviteDialog = false
      }})
    }else{
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Format d"e-mail incorrect. Veuillez réessayer', life: 3000 });
    }

  }
}
