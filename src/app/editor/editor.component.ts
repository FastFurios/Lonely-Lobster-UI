import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { ValueChainId, ProcessStepId, WorkerName, valueDegradationFunctionNames, successMeasureFunctionNames, I_selectionStrategy, I_sortVector, workItemSelectionStrategyMeasureNames, selectionCriterionNames } from '../shared/io_api_definitions'
import { ConfigFileService } from '../shared/config-file.service';

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
  @Output() systemSaved                      = new EventEmitter()
  public system:                    FormGroup
  public valueDegradationFunctions: string[] = valueDegradationFunctionNames
  public successMeasureFunctions:   string[] = successMeasureFunctionNames
  public workItemSelectionStrategyMeasures   = Object.values(workItemSelectionStrategyMeasureNames)
  public selectionCriteria                   = selectionCriterionNames

  
  //private workersProcessStepAssignments: WorkersProcessStepAssignments = []
  selectedVcPs:                     any
  frontendPresetToggle:             boolean = false
  learnAndAdaptToggle:              boolean = false
  wipLimitOptimizeToggle:           boolean = false

  constructor(private fb:  FormBuilder,
              private cfs: ConfigFileService) { }

  ngOnInit(): void {
    //console.log(`Editor.ngOnInit(): cfs.configObject= ${this.cfs.configObject != undefined}`)
    this.initForm(this.cfs.configObject)
    this.cfs.componentEventSubject$.subscribe((compEvent:string) => {
      if (compEvent == "ConfigLoadEvent") this.processComponentEvent(compEvent)})
  }

  private processComponentEvent(compEvent: string): void {
  //console.log("Editor.processComponentEvent(): received compEvent= " + compEvent + "; initializing form")
    if (this.cfs.configObject) this.initForm(this.cfs.configObject)
  }
  
  // ---------------------------------------------------------------------------------------
  // setting up the static form elements
  // ---------------------------------------------------------------------------------------

  private initForm(cfo? /* config File Object*/: any): void {
//    if (this.system) return

    console.log(`Editor.initForm(): config-file-service system=${cfo?.system_id}; initializing form...`)
    this.system = this.fb.group({
      id:                                   [cfo  ? cfo.system_id : "", Validators.required],
      frontendPresetParameters: this.fb.group({
          numIterationsPerBatch:            [cfo ? cfo.frontend_preset_parameters?.num_iterations_per_batch : ""],
          economicsStatsIntervall:          [cfo ? cfo.frontend_preset_parameters?.economics_stats_interval : ""]
      }),
      learnAndAdaptParms: this.fb.group({
          observationPeriod:                [cfo ? cfo.learn_and_adapt_parms?.observation_period : ""],
          successMeasureFunction:           [cfo ? cfo.learn_and_adapt_parms?.success_measure_function : ""],
          adjustmentFactor:                 [cfo ? cfo.learn_and_adapt_parms?.adjustment_factor : ""],
      }),
      wipLimitSearchParms: this.fb.group({
          initialTemperature:               [cfo ? cfo.wip_limit_search_parms?.initial_temperature : ""],
          degreesPerDownhillStepTolerance:  [cfo ? cfo.wip_limit_search_parms?.degrees_per_downhill_step_tolerance : ""],
          initialJumpDistance:              [cfo ? cfo.wip_limit_search_parms?.initial_jump_distance : ""],
          measurementPeriod:                [cfo ? cfo.wip_limit_search_parms?.measurement_period : ""],
          wipLimitUpperBoundaryFactor:      [cfo ? cfo.wip_limit_search_parms?.wip_limit_upper_boundary_factor : ""],
          searchOnAtStart:                  [cfo ? cfo.wip_limit_search_parms?.search_on_at_start : ""],
          verbose:                          [cfo ? cfo.wip_limit_search_parms?.verbose : ""]
        }),
        valueChains:                        this.fb.array([]),
        globallyDefinedWorkitemSelectionStrategies: this.fb.array([]),
        workers:                            this.fb.array([])
    })

    if (cfo?.value_chains)                  this.addValueChainFormGroupsToFormArray(cfo.value_chains)
    if (cfo?.globally_defined_workitem_selection_strategies) this.addGloballyDefinedWorkitemSelectionStrategyFormGroupsToFormArray(cfo.globally_defined_workitem_selection_strategies)
    if (cfo?.workers)                       this.addWorkerFormGroupsToFormArray(cfo.workers)
  }

  private addValueChainFormGroupsToFormArray(cfVcs: any): void {
    cfVcs.forEach((cfVc: any) => { 
      const newVcFormGroup = this.addValueChain(cfVc)
      const newVcFgPssFormArray = newVcFormGroup.get("processSteps")
      if (!newVcFgPssFormArray) {
        console.log(`Editor.initForm().addValueChainFormGroupsToFormArray(): no process-steps FormArray found`)
        return
      }       
      cfVc.process_steps.forEach((cfPs: any) => this.addProcessStep(<FormArray>newVcFgPssFormArray!, cfPs))
    })
  }

  private addGloballyDefinedWorkitemSelectionStrategyFormGroupsToFormArray(cfWiSSs: any): void {
    cfWiSSs.forEach((cfWiSS: any) => { 
      const newWiSSFormGroup = this.addGloballyDefinedWorkitemSelectionStrategy(cfWiSS)
      const newWiSSFgSvsFormArray = newWiSSFormGroup.get("strategy")
      if (!newWiSSFgSvsFormArray) {
        console.log(`Editor.initForm().addGloballyDefinedWorkitemSelectionStrategyFormGroupsToFormArray(): no strategy FormArray found`)
        return
      }       
      cfWiSS.strategy.forEach((cfSv: I_sortVector) => this.addSortVector(<FormArray>newWiSSFgSvsFormArray, cfSv))
    })
  }

  private addWorkerFormGroupsToFormArray(cfWos: any): void {
    cfWos.forEach((cfWo: any) => { 
      const newWoFormGroup = this.addWorker(cfWo)

      // add assignments
      const newWoFgAssFormArray = newWoFormGroup.get("assignments")
      if (!newWoFgAssFormArray) {
        console.log(`Editor.initForm().addWorkerFormGroupsToFormArray(): no assignmengts FormArray found`)
        return
      } 
      cfWo.process_step_assignments.forEach((cfAs: any) => this.addWorkerAssignment(<FormArray>newWoFgAssFormArray, cfAs))

      // add workitem selection strategies
      const newWoFgStratFormArray = newWoFormGroup.get("strategies")
      if (!newWoFgStratFormArray) {
        console.log(`Editor.initForm().addWorkerFormGroupsToFormArray(): no strategies FormArray found`)
        return
      } 
      cfWo.workitem_selection_strategies.forEach((cfStrat: string) => this.addWorkerStrategy(<FormArray>newWoFgStratFormArray, cfStrat))
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
      assignments:      this.fb.array([], [EditorComponent.workerAssignmentsDuplicateCheck]),
      strategies:       this.fb.array([])
    })
    this.workers.push(newWoFormGroup)
    return newWoFormGroup
  }

  public addGloballyDefinedWorkitemSelectionStrategy(cfWiSS?: any): FormGroup {
    const newWiSSFormGroup = this.fb.group({
      id:               [cfWiSS ? cfWiSS.id : "", [Validators.required]],
      strategy:         this.fb.array([])
    })
    this.globallyDefinedWorkitemSelectionStrategies.push(newWiSSFormGroup)
    return newWiSSFormGroup
  }

  public addSortVector(svs: FormArray, cfSV?: any): FormGroup {
    const newSvFormGroup = this.fb.group({
      measure:               [cfSV ? cfSV.measure            : "", [ Validators.required ]],
      selectionCriterion:    [cfSV ? cfSV.selection_criterion: "", [ Validators.required ]]
    })
    svs.push(newSvFormGroup)
    console.log(`addSortVector(svs=${svs}, cfSv=${cfSV.measure}: ${cfSV.selection_criterion}): length of svs= ${svs.length}`)
    return newSvFormGroup
  }

  public addWorkerAssignment(ass: FormArray, cfAs?: any): FormGroup {
    const newAsFormGroup = this.fb.group({
      vcIdpsId: [cfAs ? `${cfAs.value_chain_id}.${cfAs.process_steps_id}` : ""]
    })
    ass.push(newAsFormGroup)
    return newAsFormGroup
  }

  
  public addWorkerStrategy(woWiSSs: FormArray, cfWiSSId?: string): FormGroup | undefined {
    const newWiSSFormGroup = this.fb.group({
      woWiSsId: [cfWiSSId ? cfWiSSId : ""],
    })
    woWiSSs.push(newWiSSFormGroup)
    return newWiSSFormGroup
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
    
  public deleteGloballyDefinedWorkitemSelectionStrategy(i: number): void {
    this.globallyDefinedWorkitemSelectionStrategies.removeAt(i)
  }

  public deleteSortVector(wiSS: FormGroup, i: number): void {
    this.sortVectors(wiSS).removeAt(i)
  }
    
  public deleteWorker(i: number): void {
    this.workers.removeAt(i)
  }
    
  public deleteAssignment(wo: FormGroup, i: number): void {
//  console.log(`Editor: deleteAssignment(${wo.get("id")}, ${i})`)
    this.workerAssignments(wo).removeAt(i)
  }
    
  public deleteWorkerStrategy(wo: FormGroup, i: number): void {
    this.workerStrategies(wo).removeAt(i)
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

  get globallyDefinedWorkitemSelectionStrategies(): FormArray<FormGroup> {
    return this.system.get('globallyDefinedWorkitemSelectionStrategies') as FormArray
  }

  public sortVectors(wiSS: FormGroup): FormArray<FormGroup> {
    return wiSS.get('strategy') as FormArray
  }

  get workers(): FormArray<FormGroup> {
    return this.system.get('workers') as FormArray
  }

  public workerAssignments(wo: FormGroup): FormArray<FormGroup> {
    return wo.get('assignments') as FormArray
  }

  public workerStrategies(wo: FormGroup): FormArray<FormGroup> {
    return wo.get('strategies') as FormArray
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

  get globallyDefinedWorkitemSelectionStrategiesIds(): string[] {
    return this.globallyDefinedWorkitemSelectionStrategies.controls.flatMap(wiSs => wiSs.get("id")?.value)
  }

  // ---------------------------------------------------------------------------------------
  // getting elements in config file
  // ---------------------------------------------------------------------------------------
 
  private globallyDefinedWorkItemSelectionStrategy(stratId: string): I_selectionStrategy | undefined {
    return this.cfs.configObject.globally_defined_workitem_selection_strategies?.find((strat: any) => strat.id == stratId)
  }

  // ---------------------------------------------------------------------------------------
  // handlers
  // ---------------------------------------------------------------------------------------

  public addParametersHandler() {
    //  console.log("addFrontendPresetsParametersHandler()")
      this.frontendPresetToggle   = !this.frontendPresetToggle
      this.learnAndAdaptToggle    = !this.learnAndAdaptToggle
      this.wipLimitOptimizeToggle = !this.wipLimitOptimizeToggle
  }

/*
  public addFrontendPresetsParametersHandler() {
//  console.log("addFrontendPresetsParametersHandler()")
  this.frontendPresetToggle = !this.frontendPresetToggle
}

  public addLearnAndAdaptParametersHandler() {
//    console.log("addLearnAndAdaptParameters()")
    this.learnAndAdaptToggle = !this.learnAndAdaptToggle
  }

  public addWipLimitsOptimizationParametersHandler() {
//    console.log("addWipLimitsOptimizationParameters()")
    this.wipLimitOptimizeToggle = !this.wipLimitOptimizeToggle
  }
*/

  public submitForm() {
    const systemValues = this.system.value
    this.cfs.configObject = this.configObject()
    this.cfs.componentEvent = "EditorSaveEvent"
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
      workers:                      formValue.workers.map((wo: any) => this.addWorkerAsJson(wo)),
      globally_defined_workitem_selection_strategies: formValue.globallyDefinedWorkItemSelectionStrategies.map((wiSs: any) => this.addStrategyAsJson(wiSs))        
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

  private addStrategyAsJson(wiSs: any): I_selectionStrategy {
    return {
      id:   wiSs.id,
      strategy: wiSs.strategy.map((svs: any) => { return {
        measure:             svs.measure,
        selection_criterion: svs.selectionCriterion
      }})
    }
  }
}

