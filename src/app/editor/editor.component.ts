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
      id:                                   [cfo  ? cfo.system_id : undefined, [Validators.required, EditorComponent.noValueCheck] ],
      frontendPresetParameters: this.fb.group({
          numIterationsPerBatch:            [cfo ? cfo.frontend_preset_parameters?.num_iterations_per_batch : undefined,         [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheckFactory(1)]],
          economicsStatsInterval:           [cfo ? cfo.frontend_preset_parameters?.economics_stats_interval : undefined,         [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheckFactory(0)]]
      }),
      learnAndAdaptParms: this.fb.group({
          observationPeriod:                [cfo ? cfo.learn_and_adapt_parms?.observation_period : undefined,                   [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheckFactory(1)]],
          successMeasureFunction:           [cfo ? cfo.learn_and_adapt_parms?.success_measure_function : undefined],
          adjustmentFactor:                 [cfo ? cfo.learn_and_adapt_parms?.adjustment_factor : undefined,                   [EditorComponent.numberIsInRangeCheckFactory(0, 1)]],
      }),
      wipLimitSearchParms: this.fb.group({
          initialTemperature:               [cfo ? cfo.wip_limit_search_parms?.initial_temperature : undefined,                [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheckFactory(1)]],
          coolingParameter:                 [cfo ? cfo.wip_limit_search_parms?.cooling_parm : undefined,                      [EditorComponent.numberIsInRangeCheckFactory(0, 1)]],
          degreesPerDownhillStepTolerance:  [cfo ? cfo.wip_limit_search_parms?.degrees_per_downhill_step_tolerance : undefined, [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheckFactory(0)]],
          initialJumpDistance:              [cfo ? cfo.wip_limit_search_parms?.initial_jump_distance : undefined,                [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheckFactory(1)]],
          measurementPeriod:                [cfo ? cfo.wip_limit_search_parms?.measurement_period : undefined,                 [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheckFactory(1)]],
          wipLimitUpperBoundaryFactor:      [cfo ? cfo.wip_limit_search_parms?.wip_limit_upper_boundary_factor : undefined,      [EditorComponent.numberIsInRangeCheckFactory(1.5)]],
          // searchOnAtStart:                  [cfo ? cfo.wip_limit_search_parms?.search_on_at_start : undefined],
          // verbose:                          [cfo ? cfo.wip_limit_search_parms?.verbose : undefined]
        }),
        valueChains:                        this.fb.array([],         [EditorComponent.idsDuplicateCheckFactory("id")!]),
        globallyDefinedWorkitemSelectionStrategies: this.fb.array([], [EditorComponent.idsDuplicateCheckFactory("id")!]),
        workers:                            this.fb.array([],         [EditorComponent.idsDuplicateCheckFactory("id")!])
    }, { validators: [EditorComponent.atLeastOneValueChainCheck, EditorComponent.atLeastOneProcessStepCheck, EditorComponent.atLeastOneWorkerCheck] })

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
      id:               [cfVc ? cfVc.value_chain_id : undefined, [/* Validators.required,  */EditorComponent.noValueCheck, EditorComponent.vcPsNameFormatCheck]],
      valueAdd:         [cfVc ? cfVc.value_add      : undefined, [EditorComponent.numberIsIntegerCheck]],
      valueDegradation: this.fb.group({
          function:     [cfVc ? cfVc.value_degradation?.function : undefined],
          argument:     [cfVc ? cfVc.value_degradation?.argument : undefined]
      }),
      injection: this.fb.group({
          throughput:   [cfVc ? cfVc.injection?.throughput  : undefined, [EditorComponent.numberIsInRangeCheckFactory(0)]],
          probability:  [cfVc ? cfVc.injection?.probability : undefined, [EditorComponent.numberIsInRangeCheckFactory(0.1, 1)]]
      }),
      processSteps:     this.fb.array([], [EditorComponent.idsDuplicateCheckFactory("id")!])
    })
    this.valueChainsFa.push(newVcFg)
    return newVcFg
  }

  public addProcessStepFg(pss: FormArray, cfPs?: I_ProcessStepAsJson): FormGroup {
    const newPsFg = this.fb.group({
      id:               [cfPs ? cfPs.process_step_id : undefined,  [/* Validators.required,  */EditorComponent.noValueCheck, EditorComponent.vcPsNameFormatCheck]],
      normEffort:       [cfPs ? cfPs.norm_effort : undefined,      [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheckFactory(0)]],
      wipLimit:         [cfPs ? cfPs.wip_limit : undefined,        [EditorComponent.numberIsIntegerCheck, EditorComponent.numberIsInRangeCheckFactory(0, 3)]]
    })
    pss.push(newPsFg)
    return newPsFg
  }

  public addWorkerFg(cfWo?: I_WorkerAsJson): FormGroup {
    const newWoFg = this.fb.group({
      id:               [cfWo ? cfWo.worker_id : undefined, [Validators.required, EditorComponent.noValueCheck]],
      assignments:      this.fb.array([], [EditorComponent.idsDuplicateCheckFactory("vcIdpsId")!]),
      strategies:       this.fb.array([], [EditorComponent.idsDuplicateCheckFactory("woWiSsId")!])
    })
    this.workersFa.push(newWoFg)
    return newWoFg
  }

  public addGloballyDefinedWorkitemSelectionStrategyFg(cfWiSS?: I_GloballyDefinedWorkitemSelectionStrategyAsJson): FormGroup {
    const newWiSSFg = this.fb.group({
      id:               [cfWiSS ? cfWiSS.id : undefined, [Validators.required, EditorComponent.noValueCheck]],
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
      selectionCriterion:    [cfSV ? cfSV.selection_criterion: undefined, [ Validators.required ]]
    })
    svs.push(newSvFg)
    return newSvFg
  }

  public addWorkerAssignmentFg(ass: FormArray, cfAs?: I_ValueChainAndProcessStepAsJson): FormGroup {
    const newAsFg = this.fb.group({
      vcIdpsId: [cfAs ? `${cfAs.value_chain_id}.${cfAs.process_steps_id}` : undefined]
    })
    ass.push(newAsFg)
    return newAsFg
  }

  
  public addWorkerStrategyFg(woWiSSs: FormArray, cfWiSSId?: string): FormGroup | undefined {
    const newWiSSFg = this.fb.group({
      woWiSsId: [cfWiSSId ? cfWiSSId : undefined],
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
  /** Check if form control value is not empty  */
  static noValueCheck(control: FormControl): ValidationErrors | null {
    return !control.value ? { noValue: { message: "Field must not be empty" } } : null
  }

  /** Check if form control value is in the "value-chain.process-step" format  */
  static vcPsNameFormatCheck(control: FormControl): ValidationErrors | null {
    return control.value?.includes(".") ? { idWithoutPeriod: { message: "IDs must not contain a period" } } : null
  }

  /** Check if number is an integer */
  static numberIsIntegerCheck(numCtrl: AbstractControl): ValidationErrors | null {
    const numCtrlVal = numCtrl.value
    return numCtrlVal != null && numCtrlVal != undefined && (numCtrlVal != Math.round(numCtrlVal)) ? { isNoInteger: { message: "Value must not have decimals" } } : null
  }

  /** Check if at least one value chain is defined */
  static atLeastOneValueChainCheck(systemFg: AbstractControl): ValidationErrors | null {
    const vcsNum = (<FormArray>systemFg.get("valueChains"))?.controls.length   
    return !vcsNum || vcsNum < 1 ? { noValuechain: { message: "System must have at least 1 value chain" } } : null
  }

  /** Check if at least one process step is defined */
  static atLeastOneProcessStepCheck(systemFg: AbstractControl): ValidationErrors | null {
    const pssNum = (<FormArray>systemFg.get("valueChains"))?.controls.flatMap(vcFg => (<FormArray>vcFg.get("processSteps"))?.controls.length).reduce((a: number, b: number) => a + b, 0)
    return !pssNum || pssNum < 1 ? { noProcessStep: { message: "System must have at least 1 process step" } } : null
  }

  /** Check if at least one worker is defined */
  static atLeastOneWorkerCheck(systemFg: AbstractControl): ValidationErrors | null {
    const vcsNum = (<FormArray>systemFg.get("workers"))?.controls.length   
    return !vcsNum || vcsNum < 1 ? { noWorker: { message: "System must have at least 1 worker" } } : null
  }

  // validator factories (used when validators require parameterization when assigned to a control at runtime):
  /** Check if number value of control is within a given range
   * @example numberIsInRangeCheck(1, 5) - values from 1 to 5 are OK, below or above is not OK
   * @example numberIsInRangeCheck(1) - values greater or equal 1 are OK, below are is OK
   * @example numberIsInRangeCheck(undefined, 5) - values to 5 are OK, babove is not OK
   */
  static numberIsInRangeCheckFactory(min: number | undefined, max?: number): ValidatorFn | null {
    return (numCtrl: AbstractControl) => numCtrl.value&& (min != undefined && numCtrl.value < min) || (max && numCtrl.value > max) 
              ? { notInRange: { message: `Value must be in the range of ${min} and ${max}` } } : null
  }

  /** Check if an ID is unique in an array of FormGroups */
  static idsDuplicateCheckFactory(idAttribute: string): ValidatorFn | null {
    return (xxs: AbstractControl) => { 
      const xxsFormArrayFormGroups = (<FormArray>xxs).controls
      const valueOccurancesCounts: number[] = xxsFormArrayFormGroups.map(fg => xxsFormArrayFormGroups.filter(e => e.get(idAttribute)!.value == fg.get(idAttribute)!.value).length)  
      return Math.max(...valueOccurancesCounts) > 1 ? { idDuplicates: { message: "IDs must be unique" } } : null
    }
  }

  // ---------------------------------------------------------------------------------------
  // handlers
  // ---------------------------------------------------------------------------------------

  /* utiliy */ listInvalidControls(): void {
    console.log("\nEntire configuration: " + this.systemFg?.invalid)
    console.log("System id: " + this.systemFg.get("id")?.invalid)
    //console.log("Value chains: errors: " + this.systemFg.get("valueChains")?.errors)
    console.log("Presets: " + this.frontendPresetParametersFg?.invalid)
    console.log("\t#Iterations: " + this.frontendPresetParametersFg?.get("numIterationsPerBatch")?.invalid)
    console.log("\t#Eco stats intervall: " + this.frontendPresetParametersFg?.get("economicsStatsInterval")?.invalid)
    console.log("Learn&adapt: " + this.learnAndAdaptParmsFg?.invalid)
    console.log("\t#Observation period: " + this.learnAndAdaptParmsFg?.get("observationPeriod")?.invalid)
    console.log("\t#SUccess Measure: " + this.learnAndAdaptParmsFg?.get("successMeasureFunction")?.invalid)
    console.log("\t#ADjustment factor: " + this.learnAndAdaptParmsFg?.get("adjustmentFactor")?.invalid)
    console.log("WIP limt opti: " + this.wipLimitSearchParmsFg?.invalid)
    console.log("Value chains: " + this.systemFg.get("valueChains")?.invalid)
    console.log("Strategies: " + this.globallyDefinedWorkitemSelectionStrategiesFa?.invalid)
    console.log("Workers: " + this.systemFg.get("workers")?.invalid)
  }




  /** when form is submitted store edited configuration in the configuration file service, add an application event to the application event service 
   * and notify the application state transition service that configuration was edited and saved */
  public onSubmitForm() {
    this.systemFg.markAllAsTouched();
    this.systemFg.updateValueAndValidity();
    this.listInvalidControls()
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