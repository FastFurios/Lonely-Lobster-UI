import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-flow-arrow',
  templateUrl: './flow-arrow.component.html',
  styleUrls: ['./flow-arrow.component.css']
})
export class FlowArrowComponent implements OnInit, AfterViewInit {
  @ViewChild('myCanvas') canvas: ElementRef<HTMLCanvasElement>
  ctx: CanvasRenderingContext2D
  
  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.ctx = <CanvasRenderingContext2D>this.canvas.nativeElement.getContext('2d');
    this.drawShape(100)
  }

  drawShape(thickness: number) {
    console.log("ctx=" + this.ctx)
    // Filled right arrow
    this.ctx.beginPath();
    this.ctx.lineTo(10, 0);
    this.ctx.lineTo(250, 0);
    this.ctx.lineTo(290, thickness/2);
    this.ctx.lineTo(250, thickness);
    this.ctx.lineTo(10, thickness);
    this.ctx.stroke();
    this.ctx.fillStyle = "blue";
    this.ctx.fill();
  }
}
