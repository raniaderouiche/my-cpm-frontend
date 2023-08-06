import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { Organization } from 'src/app/models/Organization';
import { OrganizationService } from 'src/app/services/organization.service';

@Component({
  selector: 'app-rejected-requests',
  templateUrl: './rejected-requests.component.html',
  providers: [MessageService],
  styleUrls: ['./rejected-requests.component.scss']
})
export class RejectedRequestsComponent implements OnInit {

  organizations : Organization[] = [];
  organization : Organization;

  organizationDialog : boolean;

  dataLoaded : boolean = false;

  document_pdfSrc : any;
  document_fileUrl : any;

  pdfView : boolean = false;

  validationSelect : any[];
  selectValue : Boolean;

  hideField : Boolean = false;


  constructor(private organizationService : OrganizationService, private messageService: MessageService,private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getRejectedOrganizations();
    this.validationSelect = [
      {icon: 'pi pi-check', name: 'Valider'},
      {icon: 'pi pi-times', name: 'Rejeter'},
    ];
  }

  getRejectedOrganizations() {
    this.organizationService.getRejectedOrganizations().subscribe(
      (data) => {
        this.organizations = data;
      }
    );
  }

  hideDialog(){
    this.organizationDialog = false;
  }

  dataToSRC(data){
    return new Uint8Array(atob(data).split("").map(char => char.charCodeAt(0)));
  }

  srcToURL(src){
    let dwn = new Blob([src], {type: 'application/pdf'})
    return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(dwn));
  }

  viewRequest(organization : Organization){
    this.selectValue = organization?.status
    console.log(this.selectValue)
    this.dataLoaded = false;
    this.organizationDialog = true;
    this.organization = organization;
    if(this.organization.document){
      this.document_pdfSrc = this.dataToSRC(this.organization.document.data);
      this.document_fileUrl = this.srcToURL(this.document_pdfSrc);
    }


    this.dataLoaded = true;
  }

  viewpdf(){
    this.pdfView = true;
  }

  onOptionClick(event){
    this.hideField = event.option.value;
  }

  save(id){

    if(this.selectValue){
      this.organizationService.activateOrganization(id).subscribe(
        (data) => {
          this.messageService.add({severity:'success', summary:'Organisation activée', detail:'L\'organisation a été activée avec succès'});
          this.getRejectedOrganizations();
        }
      );
    }else if(!this.selectValue){
      this.organizationService.rejectOrganization(id).subscribe(
        (data) => {
          this.messageService.add({severity:'success', summary:'Organisation rejetée', detail:'L\'organisation a été rejetée avec succès'});
          this.getRejectedOrganizations();
        }
      );
    }

    this.organizationDialog = false;

  }


}
