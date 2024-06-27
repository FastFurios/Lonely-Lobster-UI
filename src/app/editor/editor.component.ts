import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { ValueChainId, ProcessStepId, WorkerName, valueDegradationFunctionNames, successMeasureFunctionNames } from '../shared/io_api_definitions'

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
  public system:                    FormGroup
  public valueDegradationFunctions: string[] = valueDegradationFunctionNames
  public successMeasureFunctions:   string[] = successMeasureFunctionNames
  //private workersProcessStepAssignments: WorkersProcessStepAssignments = []
  selectedVcPs:                     any
  learnAndAdaptToggle:              boolean = false
  wipLimitOptimizeToggle:           boolean = false

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
//    this.valueDegradationFunctions = valueDegradationFunctionNames
//    this.successMeasureFunctions   = successMeasureFunctionNames
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
          successMeasureFunction: [""],
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
      id: ["", [Validators.required, EditorComponent.vcPsNameFormatCheck]],
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
      id: ["", [ Validators.required, EditorComponent.vcPsNameFormatCheck ]],
      normEffort: [""],
      wipLimit: [""]
    }))
  }

  public addWorker(): void {
    this.workers.push(this.fb.group({
      id: [""],
      assignments: this.fb.array([], [EditorComponent.workerAssignmentsDuplicateCheck])
    }))
  }

  public addWorkerAssignments(ass: FormArray) {
    ass.push(this.fb.group({
      vcIdpsId: [""]
    }))
  }

  // ---------------------------------------------------------------------------------------
  // delete dynamic form elements
  // ---------------------------------------------------------------------------------------

  public deleteValueChain(i: number): void {
    this.valueChains.removeAt(i)
  }
    
  public deleteProcessStep(vc: FormGroup, i: number): void {
    this.processSteps(vc).removeAt(i)
  }
    
  public deleteWorker(i: number): void {
    this.workers.removeAt(i)
  }
    
  public deleteAssignment(wo: FormGroup, i: number): void {
    this.workerAssignments(wo).removeAt(i)
  }
    
  // ---------------------------------------------------------------------------------------
  // validators
  // ---------------------------------------------------------------------------------------

  static vcPsNameFormatCheck(control: FormControl): ValidationErrors | null {
    return control.value.includes(".") ? { idWithoutPeriod: { valid: false } } : null
  }

  static workerAssignmentsDuplicateCheck(woAss: AbstractControl): ValidationErrors | null {
    const woAssFormArrayFormGroups = (<FormArray>woAss).controls
    const valueOccurancesCounts: number[] = woAssFormArrayFormGroups.map(fg => woAssFormArrayFormGroups.filter(e => e.get("vcIdpsId")!.value == fg.get("vcIdpsId")!.value).length)  
    return Math.max(...valueOccurancesCounts) > 1 ? { duplicates: { valid: false } } : null
  }
/**
  static workerAssignmentsEmptyCheck(woAss: AbstractControl): ValidationErrors | null {
    const woAssFormArrayFormGroups = (<FormArray>woAss).controls
    const lengths: number[] = woAssFormArrayFormGroups.map(fg => fg.get("vcIdpsId")!.value.length)  
    return Math.min(...lengths) == 0 ? { empty: { valid: false } } : null
  }
*/
  // ---------------------------------------------------------------------------------------
  // getting form elements
  // ---------------------------------------------------------------------------------------

  get learnAndAdaptParms(): FormGroup {
    return this.system.get('learnAndAdaptParms') as FormGroup
  }

  get wipLimitSearchParms(): FormGroup {
    return this.system.get('wipLimitSearchParms') as FormGroup
  }

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

  public addLearnAndAdaptParametersHandler() {
    console.log("addLearnAndAdaptParameters()")
    this.learnAndAdaptToggle = !this.learnAndAdaptToggle
  }

  public addWipLimitsOptimizationParametersHandler() {
    console.log("addWipLimitsOptimizationParameters()")
    this.wipLimitOptimizeToggle = !this.wipLimitOptimizeToggle
  }

  public submitForm() {
    console.log("Submitting form:")
    const systemValues = this.system.value
    console.log(systemValues)
  }
}
