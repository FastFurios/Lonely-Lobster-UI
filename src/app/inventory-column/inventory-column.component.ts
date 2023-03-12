import { Component, OnInit, Input } from '@angular/core';
import { PsInventoryWi, PsInventoryColumn, PsInventory } from '../shared/workitems-inventory.service';

type PsInventoryColumnShow = PsInventoryColumn & { excessWisNum: number }

@Component({
  selector: 'app-inventory-column',
  templateUrl: './inventory-column.component.html',
  styleUrls: ['./inventory-column.component.css']
})
export class InventoryColumnComponent implements OnInit {
  @Input() psInventoryColumn: PsInventoryColumn
  psInventoryColumnShow: PsInventoryColumnShow

  constructor() { }

  ngOnInit(): void {
    this.psInventoryColumnShow = {
      colNr:        this.psInventoryColumn.colNr, 
      wis:          this.psInventoryColumn.wis.slice(0,3),
      excessWisNum: this.psInventoryColumn.wis.length - 3
    } 
  }
}
