import { Component, OnInit, Input } from '@angular/core';
import { PsInventoryWi, PsInventoryColumn, PsInventory } from '../shared/workitems-inventory.service'

@Component({
  selector: 'app-inventory-column',
  templateUrl: './inventory-column.component.html',
  styleUrls: ['./inventory-column.component.css']
})
export class InventoryColumnComponent implements OnInit {
  @Input() col: PsInventoryColumn



  constructor() { }

  ngOnInit(): void {
  }

}
