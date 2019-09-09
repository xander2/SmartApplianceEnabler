import {AfterViewChecked, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Logger} from '../log/logger';
import {TranslateService} from '@ngx-translate/core';
import {ErrorMessageHandler} from '../shared/error-message-handler';
import {FormHandler} from '../shared/form-handler';
import {ErrorMessages} from '../shared/error-messages';
import {ControlContainer, FormArray, FormGroup, FormGroupDirective, Validators} from '@angular/forms';
import {NestedFormService} from '../shared/nested-form-service';
import {FormMarkerService} from '../shared/form-marker-service';
import {Settings} from '../settings/settings';
import {EvModbusControl} from './ev-modbus-control';
import {SettingsDefaults} from '../settings/settings-defaults';
import {EvModbusWriteRegisterName} from './ev-modbus-write-register-name';
import {ModbusRegisterConfguration} from '../shared/modbus-register-confguration';
import {InputValidatorPatterns} from '../shared/input-validator-patterns';
import {ModbusRead} from '../modbus-read/modbus-read';
import {EvModbusReadRegisterName} from './ev-modbus-read-register-name';
import {ModbusWrite} from '../modbus-write/modbus-write';

@Component({
  selector: 'app-control-evcharger-modbus',
  templateUrl: './control-evcharger-modbus.component.html',
  styleUrls: ['../global.css'],
  viewProviders: [
    {provide: ControlContainer, useExisting: FormGroupDirective}
  ]
})
export class ControlEvchargerModbusComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input()
  evModbusControl: EvModbusControl;
  @Input()
  settings: Settings;
  @Input()
  settingsDefaults: SettingsDefaults;
  modbusConfigurations: FormArray;
  form: FormGroup;
  formHandler: FormHandler;
  @Input()
  translationKeys: string[];
  translatedStrings: string[];
  errors: { [key: string]: string } = {};
  errorMessages: ErrorMessages;
  errorMessageHandler: ErrorMessageHandler;

  constructor(private logger: Logger,
              private parent: FormGroupDirective,
              private nestedFormService: NestedFormService,
              private formMarkerService: FormMarkerService,
              private translate: TranslateService) {
    this.errorMessageHandler = new ErrorMessageHandler(logger);
    this.formHandler = new FormHandler();
  }

  ngOnInit() {
    console.log('evModbusControl=', this.evModbusControl);
    // this.errorMessages = new ErrorMessages('ControlEvchargerModbusComponent.error.', [
    //   new ErrorMessage('voltage', ValidatorType.pattern),
    // ], this.translate);
    this.form = this.parent.form;
    this.expandParentForm(this.form, this.evModbusControl, this.formHandler);
    // this.form.statusChanges.subscribe(() => {
    //   this.errors = this.errorMessageHandler.applyErrorMessages4ReactiveForm(this.form, this.errorMessages);
    // });
    this.translate.get(this.translationKeys).subscribe(translatedStrings => {
      this.translatedStrings = translatedStrings;
    });
    this.nestedFormService.submitted.subscribe(
      () => this.updateFromForm(this.evModbusControl, this.form));
    this.formMarkerService.dirty.subscribe(() => this.form.markAsDirty());
  }

  ngAfterViewChecked() {
    this.formHandler.markLabelsRequired();
  }

  ngOnDestroy() {
    // FIXME: erzeugt Fehler bei Wechsel des Zählertypes
    // this.nestedFormService.submitted.unsubscribe();
  }

  getReadFormControlPrefix(index: number) {
    return `read${index}.`;
  }

  getWriteFormControlPrefix(index: number) {
    return `write${index}.`;
  }

  get readValueNames() {
    return Object.keys(EvModbusReadRegisterName);
  }

  get writeValueNames() {
    return Object.keys(EvModbusWriteRegisterName);
  }

  get readValueNameTextKeys() {
    return Object.keys(EvModbusReadRegisterName).map(key => `ControlEvchargerComponent.${key}`);
  }

  get writeValueNameTextKeys() {
    return Object.keys(EvModbusWriteRegisterName).map(key => `ControlEvchargerComponent.${key}`);
  }

  expandParentForm(form: FormGroup, evModbusControl: EvModbusControl, formHandler: FormHandler) {
    this.formHandler.addFormControl(form, 'modbusIdref', evModbusControl.idref,
      [Validators.required]);
    this.formHandler.addFormControl(form, 'slaveAddress', evModbusControl.slaveAddress,
      [Validators.required, Validators.pattern(InputValidatorPatterns.INTEGER)]);
  }

  updateFromForm(evModbusControl: EvModbusControl, form: FormGroup) {
  }

  addModbusRead() {
    const modbusRead = new ModbusRead();
    this.evModbusControl.registerReads.push(modbusRead);
    this.form.markAsDirty();
  }

  addModbusWrite() {
    const modbusWrite = new ModbusWrite();
    this.evModbusControl.registerWrites.push(modbusWrite);
    this.form.markAsDirty();
  }
}