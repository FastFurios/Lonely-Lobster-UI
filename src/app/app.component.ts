import { Component } from '@angular/core';
import { ConfigFileService } from './shared/config-file.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = "lonely-lobster"
  filename: string

  public showEditRunSaveOptions = false

  constructor(
    private router: Router,
    private route:  ActivatedRoute, 
    private cfs:    ConfigFileService) { }

}