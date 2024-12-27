//-------------------------------------------------------------------
// EDITOR COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 25.12.2024

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';
import { I_ConfigAsJson, I_ValueChainAsJson, I_ProcessStepAsJson, I_GloballyDefinedWorkitemSelectionStrategyAsJson, I_WorkerAsJson, I_ValueChainAndProcessStepAsJson, valueDegradationFunctionNames, successMeasureFunctionNames, I_SelectionStrategy, I_sortVector, I_SortVectorAsJson, EventTypeId, EventSeverity } from '../shared/io_api_definitions'
import { workItemSelectionStrategyMeasureNames, selectionCriterionNames } from '../shared/frontend_definitions'
import { ConfigFileService } from '../shared/config-file.service'
import { AppStateService, FrontendState } from '../shared/app-state.service'
import { EventsService } from '../shared/events.service'

/**
 * @class This Angular component is an editor with which a system configuration can be created or updated. In the code the symbol suffix "fg" stands for a Reactive Form Group, "fa" for a Reactive Form Array. 
 */
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  /** Form Group that stores and displays the system configuration */
  public systemFg:                  FormGroup
  /** possible values for value degradation function names */
  public valueDegradationFunctions: string[] = valueDegradationFunctionNames
  /** possible values for success measure function names */
  public successMeasureFunctions:   string[] = successMeasureFunctionNames
  /** possible values for work item selection strategy names */
  public workItemSelectionStrategyMeasures   = Object.values(workItemSelectionStrategyMeasureNames)
  /** possible values for sorting order names */
  public selectionCriteria                   = selectionCriterionNames

  constructor(private fb:  FormBuilder,
              private cfs: ConfigFileService,
              private ass: AppStateService,
              private ess: EventsService) { }

  /** initialize the system configuration Form Group with the configuration of the configuration file service. Listen for application state transition events and re-initialize the Form Group when event occured */            
  ngOnInit(): void {
    this.initForm(this.cfs.configAsJson())
    this.ass.frontendNewStateBroadcastSubject$.subscribe((state: FrontendState) => {
      this.initForm(this.cfs.configAsJson())
    })
  }

// ---------------------------------------------------------------------------------------
/** 
 * set up the system configuration Form Group with all values from the system configuration   
 * @param cfo - system confiuration 
 */
 // ---------------------------------------------------------------------------------------
  private initForm(cfo?: I_ConfigAsJson): void {
    this.systemFg = this.fb.group({
      id:                                   [cfo  ? cfo.system_id : "", Validators.required],
      frontendPresetParameters: this.fb.group({
          numIterationsPerBatch:            [cfo ? cfo.frontend_preset_parameters?.num_iterations_per_batch : "", [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheck(1)]],
          economicsStatsInterval:           [cfo ? cfo.frontend_preset_parameters?.economics_stats_interval : "", [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheck(0)]]
      }),
      learnAndAdaptParms: this.fb.group({
          observationPeriod:                [cfo ? cfo.learn_and_adapt_parms?.observation_period : "", [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheck(1)]],
          successMeasureFunction:           [cfo ? cfo.learn_and_adapt_parms?.success_measure_function : ""],
          adjustmentFactor:                 [cfo ? cfo.learn_and_adapt_parms?.adjustment_factor : "", [EditorComponent.numberIsInRangeCheck(0, 1)]],
      }),
      wipLimitSearchParms: this.fb.group({
          initialTemperature:               [cfo ? cfo.wip_limit_search_parms?.initial_temperature : ""],
          coolingParameter:                 [cfo ? cfo.wip_limit_search_parms?.cooling_parm : ""],
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
      valueAdd:         [cfVc ? cfVc.value_add      : "", [EditorComponent.numberIsIntegerCheck]],
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
    const newPsFg = this.fb.group({
      id:               [cfPs ? cfPs.process_step_id : "", [ Validators.required, EditorComponent.vcPsNameFormatCheck ]],
      normEffort:       [cfPs ? cfPs.norm_effort : "", [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheck(0)]],
      wipLimit:         [cfPs ? cfPs.wip_limit : "", [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheck(0)]]
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
    function measureDescription(cfSV: any /* should be I_SortVectorAsJson but does not compile when typed that way !?! */): string {
      if (!cfSV) return ""
      const measureKey: keyof typeof workItemSelectionStrategyMeasureNames = cfSV.measure
      return workItemSelectionStrategyMeasureNames[measureKey]
    }
    const newSvFg = this.fb.group({
      measure:               [measureDescription(cfSV), [ Validators.required ]],
      selectionCriterion:    [cfSV ? cfSV.selection_criterion: "", [ Validators.required ]]
    })
    svs.push(newSvFg)
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
    this.workerAssignmentsFa(wo).removeAt(i)
  }
    
  public deleteWorkerStrategyFg(wo: FormGroup, i: number): void {
    this.workerStrategiesFa(wo).removeAt(i)
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
  // validators
  // ---------------------------------------------------------------------------------------

  // plain validators:
  /** Check if form control value is in the "value-chain.process-step" format  */
  static vcPsNameFormatCheck(control: FormControl): ValidationErrors | null {
    return control.value.includes(".") ? { idWithoutPeriod: { valid: false } } : null
  }

  /** Check if worker is assigned to a process step just once */
  static workerAssignmentsDuplicateCheck(woAss: AbstractControl): ValidationErrors | null {
    const woAssFormArrayFormGroups = (<FormArray>woAss).controls
    const valueOccurancesCounts: number[] = woAssFormArrayFormGroups.map(fg => woAssFormArrayFormGroups.filter(e => e.get("vcIdpsId")!.value == fg.get("vcIdpsId")!.value).length)  
    return Math.max(...valueOccurancesCounts) > 1 ? { duplicates: { valid: false } } : null
  }

  static numberIsIntegerCheck(numCtrl: AbstractControl): ValidationErrors | null {
    const numCtrlVal = numCtrl.value
//    return numCtrlVal != Math.round(numCtrlVal) ? { noInteger: { valid: false } } : null
    return numCtrlVal != Math.round(numCtrlVal) ? { noInteger: { message: "Value must not have decimals" } } : null
  }

  // validator factories:

  // static numberIsGreaterEqualThanCheck(min: number): ValidatorFn | null {
  //   return (numCtrl: AbstractControl) => numCtrl.value < min ? { below: { valid: false } } : null
  // }
  
  // static numberIsLessEqualThanCheck(max: number): ValidatorFn | null {
  //   return (numCtrl: AbstractControl) => numCtrl.value > max ? { above: { valid: false } } : null
  // }
  
  static numberIsInRangeCheck(min: number | undefined, max?: number): ValidatorFn | null {
//  return (numCtrl: AbstractControl) => ((min && numCtrl.value < min) || (max && numCtrl.value > max)) ? { range: { message: `Value must be in the range of ${min} and ${max}` } } : null
    return (numCtrl: AbstractControl) => (min != undefined && numCtrl.value < min) || (max && numCtrl.value > max) ? { range: { message: `Value is ${numCtrl.value} -  must be in the range of ${min} and ${max}` } } : null
  }
  


  // ---------------------------------------------------------------------------------------
  // handlers
  // ---------------------------------------------------------------------------------------

  /** when form is submitted store edited configuration in the configuration file service, add an application event to the application event service 
   * and notify the application state transition service that configuration was edited and saved */
  public onSubmitForm() {
    this.cfs.storeConfigAsJson(this.configObjectAsJsonFromForm())
    this.ess.add(EventsService.applicationEventFrom("Saved edit changes.", "", EventTypeId.configSaved, EventSeverity.info))
    this.ass.frontendEventsSubject$.next("config-edit-saved")
  }

  // ---------------------------------------------------------------------------------------
  // create JSON type system configuration object from the editor's system configuration Form Group
  // ---------------------------------------------------------------------------------------

  private configObjectAsJsonFromForm(): I_ConfigAsJson {
    const formValue = this.systemFg.value
    return {
      system_id:                    formValue.id,
      frontend_preset_parameters: {
        num_iterations_per_batch:   formValue.frontendPresetParameters.numIterationsPerBatch,
        economics_stats_interval:   formValue.frontendPresetParameters.economicsStatsInterval
      },
      learn_and_adapt_parms: {
        observation_period:         formValue.learnAndAdaptParms.observationPeriod,
        success_measure_function:   formValue.learnAndAdaptParms.successMeasureFunction,
        adjustment_factor:          formValue.learnAndAdaptParms.adjustmentFactor
      },
      wip_limit_search_parms: {
        initial_temperature:        formValue.wipLimitSearchParms.initialTemperature,
        cooling_parm:               formValue.wipLimitSearchParms.coolingParameter,
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

  private addValueChainAsJson(vc: any): I_ValueChainAsJson {
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

  private addProcessStepAsJson(ps: any): I_ProcessStepAsJson {
    return {
      process_step_id:      ps.id,
      norm_effort:          ps.normEffort,
      wip_limit:            ps.wipLimit
    }
  }

  private addWorkerAsJson(wo: any): I_WorkerAsJson {
    return {
      worker_id:                      wo.id,
      process_step_assignments:       wo.assignments.map((as: any) => this.addWorkerAssignmentAsJson(as)),
      workitem_selection_strategies:  wo.strategies.map((woSt: any) => woSt.woWiSsId)
    }
  }

  private addWorkerAssignmentAsJson(as: any): I_ValueChainAndProcessStepAsJson {
    const [vcId, psId] = (<string>as.vcIdpsId).split(".") 
    return {
      value_chain_id:   vcId,
      process_steps_id: psId
    }
  }

  private addStrategyAsJson(wiSs: any): I_SelectionStrategy {
    return {
      id:   wiSs.id,
      strategy: wiSs.strategy.map((svs: any) => { return {
        measure:             Object.keys(workItemSelectionStrategyMeasureNames)[Object.values(workItemSelectionStrategyMeasureNames).indexOf(svs.measure)] as string,
        selection_criterion: svs.selectionCriterion
      }})
    }
  }
}