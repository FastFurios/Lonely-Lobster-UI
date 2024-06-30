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


/* work

Aufruf Lonely Lobster
Options:
=> load => file selection and load 
  => edit (pre-filled)
    => save
      => download
      => run
  => run
=> edit (new) 
    => save
      => download
      => run


(start) => Screen: "load or new"
"load or new" + load => edit (pre-filled)
"load or new" + new  => edit (empty)
edit X + save => save into cfs
edit X + download => download into file system
edit X && saved to cfs + run => run
run && saved to cfs + edit => edit (pre-filled) 
run && not saved to cfs + edit => edit (empty) 
*/