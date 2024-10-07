import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { I_ConfigAsJson, I_ValueChainAsJson, I_ProcessStepAsJson, I_GloballyDefinedWorkitemSelectionStrategyAsJson, I_WorkerAsJson, I_ValueChainAndProcessStepAsJson, valueDegradationFunctionNames, successMeasureFunctionNames, I_selectionStrategy, I_sortVector, workItemSelectionStrategyMeasureNames, selectionCriterionNames, I_SortVectorAsJson } from '../shared/io_api_definitions'
import { ConfigFileService } from '../shared/config-file.service';



@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  @Output() systemSaved                      = new EventEmitter()
  public systemFg:                  FormGroup
  public valueDegradationFunctions: string[] = valueDegradationFunctionNames
  public successMeasureFunctions:   string[] = successMeasureFunctionNames
  public workItemSelectionStrategyMeasures   = Object.values(workItemSelectionStrategyMeasureNames)
  public selectionCriteria                   = selectionCriterionNames

  
  //private workersProcessStepAssignments: WorkersProcessStepAssignments = []
  frontendPresetToggle:             boolean = false
  learnAndAdaptToggle:              boolean = false
  wipLimitOptimizeToggle:           boolean = false

  constructor(private fb:  FormBuilder,
              private cfs: ConfigFileService) { }

  ngOnInit(): void {
    console.log(`Editor.ngOnInit(): this.cfs.configAsJson=`)
    console.log(this.cfs.configAsJson)
    this.initForm(this.cfs.configAsJson)
    this.cfs.componentEventSubject$.subscribe((compEvent:string) => {
      if (compEvent == "ConfigLoadEvent") this.processComponentEvent(compEvent)})
  }

  private processComponentEvent(compEvent: string): void {
    //console.log("Editor.processComponentEvent(): received compEvent= " + compEvent + "; initializing form")
    console.log(`Editor.processComponentEvent(): this.cfs.configAsJson=`)
    console.log(this.cfs.configAsJson)
    if (this.cfs.configAsJson) this.initForm(this.cfs.configAsJson)
  }
  
  // ---------------------------------------------------------------------------------------
  // setting up the static form elements
  // ---------------------------------------------------------------------------------------

  private initForm(cfo?: I_ConfigAsJson): void {
//    if (this.system) return

//  console.log(`Editor.initForm(): config-file-service system=${cfo?.system_id}; initializing form...`)
    this.systemFg = this.fb.group({
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

    if (cfo?.value_chains)                  this.addValueChainsFgs(cfo.value_chains)
    if (cfo?.globally_defined_workitem_selection_strategies) this.addGloballyDefinedWorkitemSelectionStrategiesFgs(cfo.globally_defined_workitem_selection_strategies)
    if (cfo?.workers)                       this.addWorkersFgs(cfo.workers)
  }

  private addValueChainsFgs(cfVcs: I_ValueChainAsJson[]): void {
    cfVcs.forEach((cfVc: I_ValueChainAsJson) => { 
      const newVcFg = this.addValueChainFg(cfVc)
      const newVcFgPssFa = newVcFg.get("processSteps")
      if (!newVcFgPssFa) {
        console.log(`Editor.initForm().addValueChainFormGroupsToFormArray(): no process-steps FormArray found`)
        return
      }       
      cfVc.process_steps.forEach((cfPs: I_ProcessStepAsJson) => this.addProcessStepFg(<FormArray>newVcFgPssFa!, cfPs))
    })
  }

  private addGloballyDefinedWorkitemSelectionStrategiesFgs(cfWiSSs: I_GloballyDefinedWorkitemSelectionStrategyAsJson[]): void {
    cfWiSSs.forEach((cfWiSS: I_GloballyDefinedWorkitemSelectionStrategyAsJson) => { 
      const newWiSSFg = this.addGloballyDefinedWorkitemSelectionStrategyFg(cfWiSS)
      const newWiSSFgSvsFa = newWiSSFg.get("strategy")
      if (!newWiSSFgSvsFa) {
        console.log(`Editor.initForm().addGloballyDefinedWorkitemSelectionStrategyFormGroupsToFormArray(): no strategy FormArray found`)
        return
      }       
      cfWiSS.strategy.forEach((cfSv: I_sortVector) => this.addSortVectorFg(<FormArray>newWiSSFgSvsFa, cfSv))
    })
  }

  private addWorkersFgs(cfWos: I_WorkerAsJson[]): void {
    cfWos.forEach((cfWo: I_WorkerAsJson) => { 
      const newWoFg = this.addWorkerFg(cfWo)

      // add assignments
      const newWoFgAssFa = newWoFg.get("assignments")
      if (!newWoFgAssFa) {
        console.log(`Editor.initForm().addWorkerFormGroupsToFormArray(): no assignmengts FormArray found`)
        return
      } 
      cfWo.process_step_assignments.forEach((cfAs: I_ValueChainAndProcessStepAsJson) => this.addWorkerAssignmentFg(<FormArray>newWoFgAssFa, cfAs))

      // add workitem selection strategies
      const newWoFgStratsFa = newWoFg.get("strategies")
      if (!newWoFgStratsFa) {
        console.log(`Editor.initForm().addWorkerFormGroupsToFormArray(): no strategies FormArray found`)
        return
      } 
      cfWo.workitem_selection_strategies?.forEach((cfStrat: string) => this.addWorkerStrategyFg(<FormArray>newWoFgStratsFa, cfStrat))
    })
  }

  // ---------------------------------------------------------------------------------------
  // adding dynamic form elements
  // ---------------------------------------------------------------------------------------

  public addValueChainFg(cfVc?: I_ValueChainAsJson): FormGroup {
    const newVcFg = this.fb.group({
      id:               [cfVc ? cfVc.value_chain_id : "", [Validators.required, EditorComponent.vcPsNameFormatCheck]],
      valueAdd:         [cfVc ? cfVc.value_add      : ""],
      valueDegradation: this.fb.group({
          function:     [cfVc ? cfVc.value_degradation?.function : ""],
          argument:     [cfVc ? cfVc.value_degradation?.argument : ""]
      }),
      injection: this.fb.group({
          throughput:   [cfVc ? cfVc.injection?.throughput  : ""],
          probability:  [cfVc ? cfVc.injection?.probability : ""]
      }),
      processSteps:     this.fb.array([])
    })
    this.valueChainsFa.push(newVcFg)
    return newVcFg
  }

  public addProcessStepFg(pss: FormArray, cfPs?: I_ProcessStepAsJson): FormGroup {
    //console.log(`Editor.addProcessStep(pss: ${pss != undefined}, cfPs.process_step_id: ${cfPs.process_step_id})`)
    const newPsFg = this.fb.group({
      id:               [cfPs ? cfPs.process_step_id : "", [ Validators.required, EditorComponent.vcPsNameFormatCheck ]],
      normEffort:       [cfPs ? cfPs.norm_effort : ""],
      wipLimit:         [cfPs ? cfPs.wip_limit : ""]
    })
    pss.push(newPsFg)
    return newPsFg
  }

  public addWorkerFg(cfWo?: I_WorkerAsJson): FormGroup {
    const newWoFg = this.fb.group({
      id:               [cfWo ? cfWo.worker_id : ""],
      assignments:      this.fb.array([], [EditorComponent.workerAssignmentsDuplicateCheck]),
      strategies:       this.fb.array([])
    })
    this.workersFa.push(newWoFg)
    return newWoFg
  }

  public addGloballyDefinedWorkitemSelectionStrategyFg(cfWiSS?: I_GloballyDefinedWorkitemSelectionStrategyAsJson): FormGroup {
    const newWiSSFg = this.fb.group({
      id:               [cfWiSS ? cfWiSS.id : "", [Validators.required]],
      strategy:         this.fb.array([])
    })
    this.globallyDefinedWorkitemSelectionStrategiesFa.push(newWiSSFg)
    return newWiSSFg
  }

  public addSortVectorFg(svs: FormArray, cfSV?: I_SortVectorAsJson): FormGroup {
    function measureDescription(cfSV: any /* should be I_SortVectorAsJson */): string {
      if (!cfSV) return ""
      const measureKey: keyof typeof workItemSelectionStrategyMeasureNames = cfSV.measure
      return workItemSelectionStrategyMeasureNames[measureKey]
    }
    const newSvFg = this.fb.group({
      measure:               [measureDescription(cfSV), [ Validators.required ]],
      selectionCriterion:    [cfSV ? cfSV.selection_criterion: "", [ Validators.required ]]
    })
    svs.push(newSvFg)
    //console.log(`addSortVector(svs=${svs}, cfSv=${cfSV.measure}: ${cfSV.selection_criterion}): length of svs= ${svs.length}`)
    return newSvFg
  }

  public addWorkerAssignmentFg(ass: FormArray, cfAs?: I_ValueChainAndProcessStepAsJson): FormGroup {
    const newAsFg = this.fb.group({
      vcIdpsId: [cfAs ? `${cfAs.value_chain_id}.${cfAs.process_steps_id}` : ""]
    })
    ass.push(newAsFg)
    return newAsFg
  }

  
  public addWorkerStrategyFg(woWiSSs: FormArray, cfWiSSId?: string): FormGroup | undefined {
    const newWiSSFg = this.fb.group({
      woWiSsId: [cfWiSSId ? cfWiSSId : ""],
    })
    woWiSSs.push(newWiSSFg)
    return newWiSSFg
  }

  // ---------------------------------------------------------------------------------------
  // delete dynamic form elements
  // ---------------------------------------------------------------------------------------

  public deleteValueChainFg(i: number): void {
    this.valueChainsFa.removeAt(i)
  }
    
  public deleteProcessStepFg(vc: FormGroup, i: number): void {
    this.processStepsFa(vc).removeAt(i)
  }
    
  public deleteGloballyDefinedWorkitemSelectionStrategyFg(i: number): void {
    this.globallyDefinedWorkitemSelectionStrategiesFa.removeAt(i)
  }

  public deleteSortVectorFg(wiSS: FormGroup, i: number): void {
    this.sortVectorsFa(wiSS).removeAt(i)
  }
    
  public deleteWorkerFg(i: number): void {
    this.workersFa.removeAt(i)
  }
    
  public deleteAssignmentFg(wo: FormGroup, i: number): void {
//  console.log(`Editor: deleteAssignment(${wo.get("id")}, ${i})`)
    this.workerAssignmentsFa(wo).removeAt(i)
  }
    
  public deleteWorkerStrategyFg(wo: FormGroup, i: number): void {
    this.workerStrategiesFa(wo).removeAt(i)
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

  get frontendPresetParametersFg(): FormGroup {
    return this.systemFg.get('frontendPresetParameters') as FormGroup
  }
  public valueDegradationFg(vc: FormGroup): FormGroup {
    return vc.get('valueDegradation') as FormGroup
  }

  public injectionFg(vc: FormGroup): FormGroup {
    return vc.get('injection') as FormGroup
  }

  get learnAndAdaptParmsFg(): FormGroup {
    return this.systemFg.get('learnAndAdaptParms') as FormGroup
  }
  
  get wipLimitSearchParmsFg(): FormGroup {
    return this.systemFg.get('wipLimitSearchParms') as FormGroup
  }

  get valueChainsFa(): FormArray<FormGroup> {
    return this.systemFg.get('valueChains') as FormArray
  }

  public processStepsFa(vc: FormGroup): FormArray<FormGroup> {
    return vc.get('processSteps') as FormArray
  }

  get globallyDefinedWorkitemSelectionStrategiesFa(): FormArray<FormGroup> {
    return this.systemFg.get('globallyDefinedWorkitemSelectionStrategies') as FormArray
  }

  public sortVectorsFa(wiSS: FormGroup): FormArray<FormGroup> {
    //console.log(`Editor.sortVectors(${wiSS.get("id")?.value}).length = ${(wiSS.get("strategy") as FormArray<FormGroup>)?.controls.map((sv: FormGroup) => sv.get("measure")?.value)}`)
    return wiSS.get('strategy') as FormArray
  }

  get workersFa(): FormArray<FormGroup> {
    return this.systemFg.get('workers') as FormArray
  }

  public workerAssignmentsFa(wo: FormGroup): FormArray<FormGroup> {
    return wo.get('assignments') as FormArray
  }

  public workerStrategiesFa(wo: FormGroup): FormArray<FormGroup> {
    return wo.get('strategies') as FormArray
  }

  // ---------------------------------------------------------------------------------------
  // getting form elements values
  // ---------------------------------------------------------------------------------------
 
  private processStepsOfValueChainStrings(vc: FormGroup): string[] {
    const vcId = vc.get("id")?.value
    return (<FormArray<FormGroup>>vc.get("processSteps"))?.controls.map(ps => vcId + "." + ps.get("id")?.value)
  }

  get processStepsOfValueChainsStrings(): string[] {
    return (<FormArray<FormGroup>>this.systemFg.get("valueChains"))?.controls.flatMap(vc => this.processStepsOfValueChainStrings(vc))
  }

  get globallyDefinedWorkitemSelectionStrategiesIdsStrings(): string[] {
    return this.globallyDefinedWorkitemSelectionStrategiesFa.controls.flatMap(wiSs => wiSs.get("id")?.value)
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

  public submitForm() {
    this.cfs.configAsJson = this.configObjectAsJsonFromForm()
    this.cfs.componentEvent = "EditorSaveEvent"
  }

  // ---------------------------------------------------------------------------------------
  // initialize form value chains and workers with config file data
  // ---------------------------------------------------------------------------------------

  private configObjectAsJsonFromForm(): any {
    const formValue = this.systemFg.value
    console.log("formValue=")
    console.log(formValue)
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
      globally_defined_workitem_selection_strategies: 
                                    formValue.globallyDefinedWorkitemSelectionStrategies.map((wiSs: any) => this.addStrategyAsJson(wiSs))        
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
      worker_id:                      wo.id,
      process_step_assignments:       wo.assignments.map((as: any) => this.addWorkerAssignmentAsJson(as)),
      workitem_selection_strategies:  wo.strategies.map((woSt: any) => woSt.woWiSsId)
    }
  }

  private addWorkerAssignmentAsJson(as: any): any {
    const [vcId, psId] = (<string>as.vcIdpsId).split(".") 
    return {
      value_chain_id:   vcId,
      process_steps_id: psId
    }
  }

  private addStrategyAsJson(wiSs: any): I_selectionStrategy {
    // console.log("Editor.addStrategyAsJson(): wiSs =")
    // console.log(wiSs)
    return {
      id:   wiSs.id,
      strategy: wiSs.strategy.map((svs: any) => { return {
        measure:             Object.keys(workItemSelectionStrategyMeasureNames)[Object.values(workItemSelectionStrategyMeasureNames).indexOf(svs.measure)] as string,
        selection_criterion: svs.selectionCriterion
      }})
    }
  }
}