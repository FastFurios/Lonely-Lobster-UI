import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ValueChainId, ProcessStepId, WorkerName } from '../shared/io_api_definitions'
import {  } from '../shared/io_api_definitions'


type ProcessStepWithItsValueChain = {
  valueChainId: ValueChainId
  processStepId:ProcessStepId 
}

type NumberedListEntryOfProcessStepsWithItsValueChain = {
  entryId:                       number // primary key for a pair of valueChain and process step 
  processStepWithItsValueChain:  ProcessStepWithItsValueChain
}

type NumberedListOfProcessStepsWithTheirValueChains = NumberedListEntryOfProcessStepsWithItsValueChain[]

type WorkerProcessStepAssignment = { worker: WorkerName; vcPs: ProcessStepWithItsValueChain }
type WorkersProcessStepAssignments = WorkerProcessStepAssignment[]


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  public system:      FormGroup
  private workersProcessStepAssignments: WorkersProcessStepAssignments = []
  selectedVcPs:       any

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm()
  }

  // ---------------------------------------------------------------------------------------
  // setting up the static form elements
  // ---------------------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------------------
  // adding dynamic form elements
  // ---------------------------------------------------------------------------------------

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
      assignments: this.fb.array([])
    }))
  }

  public addWorkerAssignments(ass: FormArray) {
    ass.push(this.fb.group({
      vcIdpsId: [""]
    }))
  }

  public deleteWorker(i: number): void {
    this.workers.removeAt(i)
  }
    

  // ---------------------------------------------------------------------------------------
  // getting form elements
  // ---------------------------------------------------------------------------------------

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
    return wo.get('assignments') as FormArray
  }

  public valueDegradation(vc: FormGroup): FormGroup {
    return vc.get('valueDegradation') as FormGroup
  }

  public injection(vc: FormGroup): FormGroup {
    return vc.get('injection') as FormGroup
  }


  // ---------------------------------------------------------------------------------------
  // getting form elements values
  // ---------------------------------------------------------------------------------------
 
  private processStepsOfValueChain(vc: FormGroup): string[] {
    const vcId = vc.get("id")?.value
    return (<FormArray<FormGroup>>vc.get("processSteps"))?.controls.map(ps => vcId + "." + ps.get("id")?.value)
  }

  get processStepsOfValueChains(): string[] {
    return (<FormArray<FormGroup>>this.system.get("valueChains"))?.controls.flatMap(vc => this.processStepsOfValueChain(vc))
  }

  // ---------------------------------------------------------------------------------------
  // handlers
  // ---------------------------------------------------------------------------------------


  public selectedWorkerAssignmentHandler(e: any): void {
    console.log("selectedWorkerAssignment(): e= ")
    console.log(e)

  }

  public submitForm() {
    console.log("Submitting form:")
    const systemValues = this.system.value
    console.log(systemValues)
  }
}
