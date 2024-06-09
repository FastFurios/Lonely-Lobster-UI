import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Configuration  } from '../shared/config-definitions'


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  public system:      FormGroup

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm()
  }

  private initForm(): void {
    if (this.system) return

    this.system = this.fb.group({
        id:        ["", Validators.required],
        frontendPresetParameters: this.fb.group({
            numIterationsPerBatch: [""],
            economicsStatsIntervall: [""]
        }),
        learnAndAdaptParms: this.fb.group({
            observationPeriod: [""],
            successMeasureFuntion: [""],
            adjustmentFactor: [""],
        }),
        wipLimitSearchParms: this.fb.group({
            initialTemperature: [""],
            degreesPerDownhillStepTolerance: [""],
            initialJumpDistance: [""],
            measurementPeriod: [""],
            wipLimitUpperBoundaryFactor: [""],
            searchOnAtStart: [""],
            verbose: [""]
        }),
        valueChains: this.fb.array([]),
        workers:this.fb.array([])
    })
  }

/*
  public valueChainsArray(values: string[]) {
    console.log("Value chain added")
    return this.fb.array(values)
  }
*/
  get valueChains(): FormArray<FormGroup> {
    return this.system.get('valueChains') as FormArray
  }

  public processSteps(vc: FormGroup): FormArray<FormGroup> {
    return vc.get('processSteps') as FormArray
  }

  get workers(): FormArray<FormGroup> {
    return this.system.get('workers') as FormArray
  }

  public workerAssignments(wo: FormGroup): FormArray<FormGroup> {
    return wo.get('processStepAssignments') as FormArray
  }

  public addValueChain(): void {
    this.valueChains.push(this.fb.group({
      id: [""],
      valueAdd: [""],
      valueDegradation: this.fb.group({
          function: [""],
          argument: [""]
      }),
      injection: this.fb.group({
          throughput: [""],
          probability: [""]
      }),
      processSteps: this.fb.array([])
    }))
  }

  public addProcessStep(pss: FormArray) {
    pss.push(this.fb.group({
      id: [""],
      normEffort: [""],
      wipLimit: [""]
    }))
  }

  public addWorker(): void {
    this.workers.push(this.fb.group({
      id: [""],
      processStepAssignments: this.fb.array([])
    }))
  }


  public addWorkerAssignments(ass: FormArray) {
    ass.push(this.fb.group({
      valueChainId: [""],
      processStepId: [""]
    }))
  }

  public submitForm() {
    console.log("Submitting form:")
    const systemValues = this.system.value
    console.log(systemValues)
  }
}
