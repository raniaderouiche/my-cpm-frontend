import { User } from './../../../models/User';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CustomFile } from 'src/app/models/CustomFile';
import { Organization } from 'src/app/models/Organization';
import { OrganizationService } from 'src/app/services/organization.service';

@Component({
  selector: 'app-organization-details',
  templateUrl: './organization-details.component.html',
  styleUrls: ['./organization-details.component.scss'],
  providers: [MessageService],

})
export class OrganizationDetailsComponent implements OnInit {

  pathId : number;

  organization : Organization;
  admin: User

  document_file : File;
  document_pdfSrc:any
  document_fileUrl:any

  constructor(private route : ActivatedRoute, private organizationService : OrganizationService,private sanitizer: DomSanitizer,
    private messageService: MessageService) { }

  ngOnInit(): void {

    this.pathId = parseInt(this.route.snapshot.paramMap.get('id'));
    this.getOrganization()
    this.getOrgAdmin()

  }

  getOrganization() {
    this.organizationService.getOrganizationById(this.pathId).subscribe
      ({next:(response: Organization) => {
        this.organization = response;
        console.log(this.organization);
        if(this.organization.document){
          this.document_pdfSrc = this.dataToSRC(this.organization.document.data);
          this.document_fileUrl = this.srcToURL(this.document_pdfSrc);
          this.document_file = this.dataToFile(this.organization.document.data,this.organization.document.fileName);
        }
      },
        error: (error: HttpErrorResponse) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 });
        }
  })
  }

  getOrgAdmin() {
    this.organizationService.getOrganizationAdmin(this.pathId).subscribe(
      (data) => {
        this.admin = data
        console.log(this.admin)
      }
    );
  }

  getSrcFromCustomFile(customFile : CustomFile){
    let uint8Array = new Uint8Array(atob(customFile.data).split("").map(char => char.charCodeAt(0)));
    let dwn = new Blob([uint8Array])
    return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(dwn));
  }

  dataToFile = (data, fileName): File => {

    let u8 = new Uint8Array(atob(data).split("").map(char => char.charCodeAt(0)));
    let dwn = new Blob([u8], { type: 'application/pdf' })
    var b: any = dwn;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;
    //Cast to a File() type
    return <File>dwn;
}
  dataToSRC(data){
    return new Uint8Array(atob(data).split("").map(char => char.charCodeAt(0)));
  }
  srcToURL(src){
    let dwn = new Blob([src], {type: 'application/pdf'})
    return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(dwn));
  }

}
