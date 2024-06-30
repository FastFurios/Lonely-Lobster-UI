import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { ValueChainId, ProcessStepId, WorkerName, valueDegradationFunctionNames, successMeasureFunctionNames } from '../shared/io_api_definitions'
import { ConfigFileService } from '../shared/config-file.service';
import { stringify } from 'querystring';

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
  frontendPresetToggle:             boolean = false
  learnAndAdaptToggle:              boolean = false
  wipLimitOptimizeToggle:           boolean = false

  constructor(private fb:  FormBuilder,
              private cfs: ConfigFileService) { }

  ngOnInit(): void {
//    this.valueDegradationFunctions = valueDegradationFunctionNames
//    this.successMeasureFunctions   = successMeasureFunctionNames
    console.log(`Editor.ngOnInit(): cfs.objFromJsonFile is defined? ${this.cfs.configObject != undefined}`)
    this.initForm(this.cfs.configObject)
  }

  // ---------------------------------------------------------------------------------------
  // setting up the static form elements
  // ---------------------------------------------------------------------------------------

  private initForm(cfo? /* config File Object*/: any): void {
    if (this.system) return

    console.log(`Editor.initForm(): cfo is defined? ${cfo != undefined}`)
    console.log(`Editor.initForm: system_id = ${cfo?.system_id}`)
    this.system = this.fb.group({
      id:                                   [cfo  ? cfo.system_id : "", Validators.required],
      frontendPresetParameters: this.fb.group({
          numIterationsPerBatch:            [cfo ? cfo.frontend_preset_parameters.num_iterations_per_batch: ""],
          economicsStatsIntervall:          [cfo ? cfo.frontend_preset_parameters.economics_stats_interval : ""]
      }),
      learnAndAdaptParms: this.fb.group({
          observationPeriod:                [cfo ? cfo.learn_and_adapt_parms.observation_period : ""],
          successMeasureFunction:           [cfo ? cfo.learn_and_adapt_parms.success_measure_function : ""],
          adjustmentFactor:                 [cfo ? cfo.learn_and_adapt_parms.adjustment_factor : ""],
      }),
      wipLimitSearchParms: this.fb.group({
          initialTemperature:               [cfo ? cfo.wip_limit_search_parms.initial_temperature : ""],
          degreesPerDownhillStepTolerance:  [cfo ? cfo.wip_limit_search_parms.degrees_per_downhill_step_tolerance : ""],
          initialJumpDistance:              [cfo ? cfo.wip_limit_search_parms.initial_jump_distance : ""],
          measurementPeriod:                [cfo ? cfo.wip_limit_search_parms.measurement_period : ""],
          wipLimitUpperBoundaryFactor:      [cfo ? cfo.wip_limit_search_parms.wip_limit_upper_boundary_factor : ""],
          searchOnAtStart:                  [cfo ? cfo.wip_limit_search_parms.search_on_at_start : ""],
          verbose:                          [cfo ? cfo.wip_limit_search_parms.verbose : ""]
        }),
        valueChains: this.fb.array([]),
        workers:     this.fb.array([])
    })

    if (cfo?.value_chains) this.addValueChainFormGroupsToFormArray(cfo.value_chains)
    if (cfo?.workers)      this.addWorkerFormGroupsToFormArray(cfo.workers)
  }

  private addValueChainFormGroupsToFormArray(cfVcs: any): void {
    cfVcs.forEach((cfVc: any) => { 
      const newVcFormGroup = this.addValueChain(cfVc)
      const newVcFgPssFormArray = newVcFormGroup.get("processSteps")
      if (!newVcFgPssFormArray) {
        console.log(`Editor.initForm().addValueChainFormGroupsToFormArray(): no process-steps FormArray found`)
        return
      } 
//    const vcs = this.system.get(`valueChains`)
//    const firstVc = (<FormArray>vcs).controls[0]
//    console.log(`Editor.initForm().addValueChainFormGroupsToFormArray(): first vc.id = ${firstVc.get('id')?.value}`)
      cfVc.process_steps.forEach((cfPs: any) => this.addProcessStep(<FormArray>newVcFgPssFormArray!, cfPs))
    })
  }

  private addWorkerFormGroupsToFormArray(cfWos: any): void {
    cfWos.forEach((cfWo: any) => { 
      const newWoFormGroup = this.addWorker(cfWo)
      const newWoFgAssFormArray = newWoFormGroup.get("assignments")
      if (!newWoFgAssFormArray) {
        console.log(`Editor.initForm().addWorkerFormGroupsToFormArray(): no assignmengts FormArray found`)
        return
      } 
      cfWo.process_step_assignments.forEach((cfAs: any) => this.addWorkerAssignment(<FormArray>newWoFgAssFormArray, cfAs))
    })
  }



  // ---------------------------------------------------------------------------------------
  // adding dynamic form elements
  // ---------------------------------------------------------------------------------------

  public addValueChain(cfVc?: any): FormGroup {
    const newVcFormGroup = this.fb.group({
      id:               [cfVc ? cfVc.value_chain_id : "", [Validators.required, EditorComponent.vcPsNameFormatCheck]],
      valueAdd:         [cfVc ? cfVc.value_add      : ""],
      valueDegradation: this.fb.group({
          function:     [cfVc ? cfVc.value_degradation.function : ""],
          argument:     [cfVc ? cfVc.value_degradation.argument : ""]
      }),
      injection: this.fb.group({
          throughput:   [cfVc ? cfVc.injection.throughput  : ""],
          probability:  [cfVc ? cfVc.injection.probability : ""]
      }),
      processSteps:     this.fb.array([])
    })
    this.valueChains.push(newVcFormGroup)
    return newVcFormGroup
  }

  public addProcessStep(pss: FormArray, cfPs?: any): FormGroup {
    //console.log(`Editor.addProcessStep(pss: ${pss != undefined}, cfPs.process_step_id: ${cfPs.process_step_id})`)
    const newPsFormGroup = this.fb.group({
      id:               [cfPs ? cfPs.process_step_id : "", [ Validators.required, EditorComponent.vcPsNameFormatCheck ]],
      normEffort:       [cfPs ? cfPs.norm_effort : ""],
      wipLimit:         [cfPs ? cfPs.wip_limit : ""]
    })
    pss.push(newPsFormGroup)
    return newPsFormGroup
  }

  public addWorker(cfWo?: any): FormGroup {
    const newWoFormGroup = this.fb.group({
      id:               [cfWo ? cfWo.worker_id : ""],
      assignments:      this.fb.array([], [EditorComponent.workerAssignmentsDuplicateCheck])
    })
    this.workers.push(newWoFormGroup)
    return newWoFormGroup
  }

  public addWorkerAssignment(ass: FormArray, cfAs?: any): FormGroup {
    const newAsFormGroup = this.fb.group({
      vcIdpsId: [cfAs ? `${cfAs.value_chain_id}.${cfAs.process_steps_id}` : ""]
    })
    ass.push(newAsFormGroup)
    return newAsFormGroup
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

  get frontendPresetParameters(): FormGroup {
    return this.system.get('frontendPresetParameters') as FormGroup
  }

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

public addFrontendPresetsParametersHandler() {
  console.log("addFrontendPresetsParametersHandler()")
  this.frontendPresetToggle = !this.frontendPresetToggle
}

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
    console.log("this.system.value:")
    console.log(systemValues)
    this.cfs.configObject = this.configObject()
    console.log("cfs.jsonFileContentFromObj:")
    console.log(this.cfs.configObject)
  }

  // ---------------------------------------------------------------------------------------
  // initialize form value chains and workers with config file data
  // ---------------------------------------------------------------------------------------

  private configObject(): any {
    const formValue = this.system.value
    return {
      system_id:                    formValue.id,
      frontend_preset_parameters: {
        num_iterations_per_batch:   formValue.frontendPresetParameters.numIterationsPerBatch,
        economics_stats_interval:   formValue.frontendPresetParameters.economicsStatsIntervall
      },
      learn_and_adapt_parms: {
        observation_period:         formValue.learnAndAdaptParms.observationPeriod,
        success_measure_function:   formValue.learnAndAdaptParms.successMeasureFunction,
        adjustment_factor:          formValue.learnAndAdaptParms.adjustmentFactor
      },
      wip_limit_search_parms: {
        initial_temperature:        formValue.wipLimitSearchParms.initialTemperature,
        degrees_per_downhill_step_tolerance: formValue.wipLimitSearchParms.degreesPerDownhillStepTolerance,
        initial_jump_distance:      formValue.wipLimitSearchParms.initialJumpDistance,
        measurement_period:         formValue.wipLimitSearchParms.measurementPeriod,
        wip_limit_upper_boundary_factor: formValue.wipLimitSearchParms.wipLimitUpperBoundaryFactor,
        search_on_at_start:         formValue.wipLimitSearchParms.searchOnAtStart,
        verbose:                    formValue.wipLimitSearchParms.verbose
      },
      value_chains:                 formValue.valueChains.map((vc: any) => this.addValueChainAsJson(vc)),
      workers:                      formValue.workers.map((wo: any) => this.addWorkerAsJson(wo))       
    } 
  }

  private addValueChainAsJson(vc: any): any {
    return {
      value_chain_id:           vc.id,
      value_add:                vc.valueAdd,
      value_degradation: {
        function:               vc.valueDegradation.function,
        argument:               vc.valueDegradation.argument
      },
      injection: {
        throughput:             vc.injection.throughput,
        probability:            vc.injection.probability
      },
      process_steps:            vc.processSteps.map((ps: any) => this.addProcessStepAsJson(ps))
    }
  }

  private addProcessStepAsJson(ps: any): any {
    return {
      process_step_id:      ps.id,
      norm_effort:          ps.normEffort,
      wip_limit:            ps.wipLimit
    }
  }

  private addWorkerAsJson(wo: any): any {
    return {
      worker_id:                  wo.id,
      process_step_assignments:   wo.assignments.map((as: any) => this.addAssignmentAsJson(as))
    }
  }

  private addAssignmentAsJson(as: any): any {
    const [vcId, psId] = (<string>as.vcIdpsId).split(".") 
    return {
      value_chain_id:   vcId,
      process_steps_id: psId
    }
  }
}

