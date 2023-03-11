import { Component, OnInit, Input } from '@angular/core';
import { PsInventoryWi, PsInventoryColumn, PsInventory } from '../shared/workitems-inventory.service'

type ColShow = PsInventoryColumn & { overload: boolean }

@Component({
  selector: 'app-inventory-column',
  templateUrl: './inventory-column.component.html',
  styleUrls: ['./inventory-column.component.css']
})
export class InventoryColumnComponent implements OnInit {
  @Input() col: PsInventoryColumn
  colShow: ColShow

  constructor() { }

  ngOnInit(): void {
    this.colShow = {
      colNr:    this.col.colNr, 
      wis:      this.col.wis.slice(0,3),
      overload: this.col.wis.length > 3
    } 
  }
}
