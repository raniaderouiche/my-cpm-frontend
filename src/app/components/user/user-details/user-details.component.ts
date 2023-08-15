import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { User } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
import { Gender } from 'src/app/enums/Gender';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
  providers: [MessageService],

})
export class UserDetailsComponent implements OnInit {

  user : User;
  pathId : number;

  gender = Gender;
  genders = [];

  userDetailsForm: FormGroup;

  editing: boolean = false

  changeStatusDialog: boolean = false;

  stateOptions: any[] = [{label: 'Activé', value: true}, {label: 'Désactivé', value: false}];

  status: boolean;


  constructor(private userService: UserService,
              private route : ActivatedRoute,
              private messageService: MessageService) { }

  ngOnInit(): void {
    this.genders = Object.keys(this.gender);
    this.pathId = parseInt(this.route.snapshot.paramMap.get('id'));

    this.getUser()

    function ageRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {

      let age = new Date().getFullYear() - new Date(control.value).getFullYear()

      if (age !== undefined && (age < 18)) {
        return { 'ageRange': true };
      }
      return null;
    }

    this.userDetailsForm = new FormGroup({
      firstName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"), Validators.required]),
      lastName: new FormControl('', [Validators.pattern("[A-Za-z _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"), Validators.required]),
      gender: new FormControl('', Validators.required),
      dob: new FormControl('', [ageRangeValidator, Validators.required]),
      email: new FormControl('', [Validators.email, Validators.required]),
      phone: new FormControl('', [Validators.pattern("[0-9]{8}"), Validators.required]),
      address : new FormControl('')
    })
  }

  getUser(){
    this.userService.getUserById(this.pathId).subscribe({
      next: (response: User) => {
        this.user = response;
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 });
      }
    })
  }

  saveUser(user : User){
    this.userService.saveUser(user).subscribe({
      next: (response: User) => {
        this.getUser();
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
      },
      complete: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Utilisateur Enregistrer' });
        this.changeStatusDialog = false;
      }
    })
  }

  showEditing(){
    this.editing = true
    this.userDetailsForm.get('firstName').setValue(this.user.firstName)
    this.userDetailsForm.get('lastName').setValue(this.user.lastName);
    this.userDetailsForm.get('gender').setValue(this.user.gender);
    this.userDetailsForm.get('dob').setValue(new Date(this.user.dob));
    this.userDetailsForm.get('email').setValue(this.user.email);
    this.userDetailsForm.get('phone').setValue(this.user.phone);
    this.userDetailsForm.get('address').setValue(this.user.address);
  }

  hideEditing(){
    this.editing = false
  }

  showEditStatus(){
    this.changeStatusDialog = true
    if(this.user?.isActive == null){
      this.status = false
    }else{
      this.status = this.user?.isActive
    }
  }

  saveChanges(){
    this.user.firstName= this.userDetailsForm.get('firstName').value,
    this.user.lastName= this.userDetailsForm.get('lastName').value,
    this.user.gender = this.userDetailsForm.get('gender').value,
    this.user.dob = this.userDetailsForm.get('dob').value,
    this.user.email = this.userDetailsForm.get('email').value,
    this.user.phone = this.userDetailsForm.get('phone').value,
    this.user.address = this.userDetailsForm.get('address').value

    if(this.userDetailsForm.valid){
      this.saveUser(this.user)
      this.editing = false
    }else{
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Données invalide', life: 3000 });
    }

  }

  saveStatus(){
    this.user.isActive = this.status
    this.saveUser(this.user)
  }




}
