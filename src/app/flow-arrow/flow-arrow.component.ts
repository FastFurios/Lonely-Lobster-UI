//-------------------------------------------------------------------
// FLOW ARROW COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 21.12.2024

import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core'
import { UiBoxSize} from '../shared/ui-boxes-definitions'

/**
 * @class This Angular component renders the flow arrows between workitem baskets i.e. process steps and/or the output basket. 
 */
@Component({
  selector: 'app-flow-arrow',
  templateUrl: './flow-arrow.component.html',
  styleUrls: ['./flow-arrow.component.css']
})
export class FlowArrowComponent implements OnInit, OnChanges, AfterViewInit {
  /** current work items flow rate */
  @Input() flowRate: number
  /** current size of display area */
  @Input() flowArrowBoxSize: UiBoxSize
  @ViewChild('myCanvas') canvas: ElementRef<HTMLCanvasElement>
  ctx: CanvasRenderingContext2D
  /** true when arrow canvas view is displayed */
  viewIsUp: boolean = false

  /** @private */
  constructor() { }
  /** @private */
  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.ctx = <CanvasRenderingContext2D>this.canvas.nativeElement.getContext('2d');
    this.drawShape(this.flowRate, this.flowArrowBoxSize.width)
    this.viewIsUp = true
  }

  /** redraw arrow when flow rate or display area size change */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.viewIsUp) {
      this.ctx.clearRect(0, 0, this.flowArrowBoxSize.width, this.flowArrowBoxSize.height)
      this.drawShape(this.flowRate, this.flowArrowBoxSize.width)
    }
  }

  /** draw the flow arrow */
  private drawShape(thickness: number, length: number) {
    // Filled right arrow
    let realThickness: number;
    if (thickness == 0) {
      realThickness = 10
      this.ctx.setLineDash([5, 5])
    }
    else {
      realThickness = thickness * 10
    } 
    this.ctx.beginPath();
    this.ctx.lineTo(10, 0);
    this.ctx.lineTo((length - 10) * 0.8, 0);
    this.ctx.lineTo((length - 10), realThickness/2);
    this.ctx.lineTo((length - 10) * 0.8, realThickness);
    this.ctx.lineTo(10, realThickness);
    this.ctx.stroke();
    if (thickness > 0) {
      this.ctx.fillStyle = "brown";
      this.ctx.fill();
    }
    if (thickness == 0) {
      this.ctx.fillStyle = "grey";
    }
    else {
      this.ctx.fillStyle = "white";
    } 
    this.ctx.font = "10px Arial, Helvetica"
    this.ctx.fillText(`${thickness}`, 20, realThickness <= 15 ? 10 : realThickness/2)
  }
}