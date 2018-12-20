import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

// export const options = [
//   { key: 'DeviceRequest', value: 'DeviceRequest', text: 'Device Request' },
//   { key: 'condition', value: 'condition', text: 'Condition' },
//   { key: 'ResourceType/3', value: 'ResourceType/3', text: 'ResourceType c' },

// ]
// export const options = [];
export const options=[
  { key: 'Binary', value: 'Binary', text: 'Binary' },
  { key: 'DomainResource', value: 'DomainResource', text: 'Domain Resource' },
  { key: 'Parameters', value: 'Parameters', text: 'Parameters' },
  { key: 'StructureDefinition', value: 'StructureDefinition', text: 'Structure Definition' },
  { key: 'Bundle', value: 'Bundle', text: 'Bundle' },
  { key: 'Observation', value: 'Observation', text: 'Observation' },
  { key: 'Patient', value: 'Patient', text: 'Patient' },
  { key: 'ValueSet', value: 'ValueSet', text: 'Value Set' },
  { key: 'CodeSystem', value: 'CodeSystem', text: 'Code System' },
  { key: 'OperationOutcome', value: 'OperationOutcome', text: 'Operation Outcome' },
  { key: 'Resource', value: 'Resource', text: 'Resource' },
  { key: 'OperationDefinition', value: 'OperationDefinition', text: 'Operation Definition' },
  { key: 'AllergyIntolerance', value: 'AllergyIntolerance', text: 'Allergy Intolerance' },
  { key: 'DiagnosticReport', value: 'DiagnosticReport', text: 'Diagnostic Report' },
  { key: 'MedicationStatement', value: 'MedicationStatement', text: 'Medication Statement' },
  { key: 'Questionnaire', value: 'Questionnaire', text: 'Questionnaire' },
  { key: 'Appointment', value: 'Appointment', text: 'Appointment' },
  { key: 'DocumentReference', value: 'DocumentReference', text: 'Document Reference' },
  { key: 'AppointmentResponse', value: 'AppointmentResponse', text: 'Appointment Response' },
  { key: 'AuditEvent', value: 'AuditEvent', text: 'Audit Event' },
  { key: 'CapabilityStatement', value: 'CapabilityStatement', text: 'Capability Statement' },
  { key: 'ConceptMap', value: 'ConceptMap', text: 'Concept Map' },
  { key: 'Condition', value: 'Condition', text: 'Condition' },
  { key: 'ImagingStudy', value: 'ImagingStudy', text: 'Imaging Study' },
  { key: 'Immunization', value: 'Immunization', text: 'Immunization' },
  { key: 'Location', value: 'Location', text: 'Location' },
  { key: 'Medication', value: 'Medication', text: 'Medication' },
  { key: 'MedicationRequest', value: 'MedicationRequest', text: 'Medication Request' },
  { key: 'MessageHeader', value: 'MessageHeader', text: 'Message Header' },
  { key: 'Organization', value: 'Organization', text: 'Organization' },
  { key: 'Practitioner', value: 'Practitioner', text: 'Practitioner' },
  { key: 'Procedure', value: 'Procedure', text: 'Procedure' },
  { key: 'ProcedureRequest', value: 'ProcedureRequest', text: 'Procedure Request' },
  { key: 'Provenance', value: 'Provenance', text: 'Provenance' },
  { key: 'QuestionnaireResponse', value: 'QuestionnaireResponse', text: 'Questionnaire Response' },
  { key: 'Schedule', value: 'Schedule', text: 'Schedule' },
  { key: 'SearchParameter', value: 'SearchParameter', text: 'Search Parameter' },
  { key: 'Slot', value: 'Slot', text: 'Slot' },
  { key: 'Subscription', value: 'Subscription', text: 'Subscription' },
  { key: 'Account', value: 'Account', text: 'Account' },
  { key: 'ActivityDefinition', value: 'ActivityDefinition', text: 'Activity Definition' },
  { key: 'CarePlan', value: 'CarePlan', text: 'Care Plan' },
  { key: 'TCareTeamN', value: 'CareTeam', text: 'Care Team' },
  { key: 'Claim', value: 'Claim', text: 'Claim' },
  { key: 'ClaimResponse', value: 'ClaimResponse', text: 'Claim Response' },
  { key: 'Communication', value: 'Communication', text: 'Communication' },
  { key: 'CommunicationRequest', value: 'CommunicationRequest', text: 'Communication Request' },
  { key: 'Composition', value: 'Composition', text: 'Composition' },
  { key: 'Coverage', value: 'Coverage', text: 'Coverage' },
  { key: 'Device', value: 'Device', text: 'Device' },
  { key: 'DocumentManifest', value: 'DocumentManifest', text: 'Document Manifest' },
  { key: 'EligibilityRequest', value: 'EligibilityRequest', text: 'Eligibility Request' },
  { key: 'EligibilityResponse', value: 'EligibilityResponse', text: 'Eligibility Response' },
  { key: 'Encounter', value: 'Encounter', text: 'Encounter' },
  { key: 'Endpoint', value: 'Endpoint', text: 'Endpoint' },
  { key: 'EpisodeOfCare', value: 'EpisodeOfCare', text: 'Episode Of Care' },
  { key: 'ExpansionProfile', value: 'ExpansionProfile', text: 'Expansion Profile' },
  { key: 'ExplanationOfBenefit', value: 'ExplanationOfBenefit', text: 'Explanation Of Benefit' },
  { key: 'FamilyMemberHistory', value: 'FamilyMemberHistory', text: 'Family Member History' },
  { key: 'Goal', value: 'Goal', text: 'Goal' },
  { key: 'GuidanceResponse', value: 'GuidanceResponse', text: 'Guidance Response' },
  { key: 'HealthcareService', value: 'HealthcareService', text: 'Healthcare Service' },
  { key: 'Library', value: 'Library', text: 'Library' },
  { key: 'Measure', value: 'Measure', text: 'Measure' },
  { key: 'MeasureReport', value: 'MeasureReport', text: 'Measure Report' },
  { key: 'MedicationAdministration', value: 'MedicationAdministration', text: 'Medication Administration' },
  { key: 'MedicationDispense', value: 'MedicationDispense', text: 'Medication Dispense' },
  { key: 'NutritionOrder', value: 'NutritionOrder', text: 'Nutrition Order' },
  { key: 'PaymentNotice', value: 'PaymentNotice', text: 'Payment Notice' },
  { key: 'PaymentReconciliation', value: 'PaymentReconciliation', text: 'Payment Reconciliation' },
  { key: 'Person', value: 'Person', text: 'Person' },
  { key: 'PlanDefinition', value: 'PlanDefinition', text: 'Plan Definition' },
  { key: 'PractitionerRole', value: 'PractitionerRole', text: 'Practitioner Role' },
  { key: 'ProcessRequest', value: 'ProcessRequest', text: 'Process Request' },
  { key: 'ProcessResponse', value: 'ProcessResponse', text: 'Process Response' },
  { key: 'RelatedPerson', value: 'RelatedPerson', text: 'Related Person' },
  { key: 'RequestGroup', value: 'RequestGroup', text: 'Request Group' },
  { key: 'Specimen', value: 'Specimen', text: 'Specimen' },
  { key: 'StructureMap', value: 'StructureMap', text: 'Structur eMap' },
  { key: 'Substance', value: 'Substance', text: 'Substance' },
  { key: 'Task', value: 'Task', text: 'Task' },
  { key: 'TestScript', value: 'TestScript', text: 'Test Script' },
  { key: 'Basic', value: 'Basic', text: 'Basic' },
  { key: 'BodySite', value: 'BodySite', text: 'Body Site' },
  { key: 'CompartmentDefinition', value: 'CompartmentDefinition', text: 'Compartment Definition' },
  { key: 'Consent', value: 'Consent', text: 'Consent' },
  { key: 'Contract', value: 'Contract', text: 'Contract' },
  { key: 'DataElement', value: 'DataElement', text: 'Data Element' },
  { key: 'DetectedIssue', value: 'DetectedIssue', text: 'Detected Issue' },
  { key: 'DeviceComponent', value: 'DeviceComponent', text: 'Device Component' },
  { key: 'DeviceMetric', value: 'DeviceMetric', text: 'Device Metric' },
  { key: 'Flag', value: 'Flag', text: 'Flag' },
  { key: 'Group', value: 'Group', text: 'Group' },
  { key: 'ImagingManifest', value: 'ImagingManifest', text: 'Imaging Manifest' },
  { key: 'ImmunizationRecommendation', value: 'ImmunizationRecommendation', text: 'Immunization Recommendation' },
  { key: 'ImplementationGuide', value: 'ImplementationGuide', text: 'Implementation Guide' },
  { key: 'List', value: 'List', text: 'List' },
  { key: 'Media', value: 'Media', text: 'Media' },
  { key: 'NamingSystem', value: 'NamingSystem', text: 'Naming System' },
  { key: 'ReferralRequest', value: 'ReferralRequest', text: 'Referral Request' },
  { key: 'RiskAssessment', value: 'RiskAssessment', text: 'Risk Assessment' },
  { key: 'Sequence', value: 'Sequence', text: 'Sequence' },
  { key: 'SupplyDelivery', value: 'SupplyDelivery', text: 'Supply Delivery' },
  { key: 'SupplyRequest', value: 'SupplyRequest', text: 'Supply Request' },
  { key: 'VisionPrescription', value: 'VisionPrescription', text: 'Vision Prescription' },
  { key: 'AdverseEvent', value: 'AdverseEvent', text: 'Adverse Event' },
  { key: 'ChargeItem', value: 'ChargeItem', text: 'Charge Item' },
  { key: 'ClinicalImpression', value: 'ClinicalImpression', text: 'Clinical Impression' },
  { key: 'DeviceRequest', value: 'DeviceRequest', text: 'Device Request' },
  { key: 'DeviceUseStatement', value: 'DeviceUseStatement', text: 'Device Use Statement' },
  { key: 'EnrollmentRequest', value: 'EnrollmentRequest', text: 'Enrollment Request' },
  { key: 'EnrollmentResponse', value: 'EnrollmentResponse', text: 'Enrollment Response' },
  { key: 'GraphDefinition', value: 'GraphDefinition', text: 'Graph Definition' },
  { key: 'Linkage', value: 'Linkage', text: 'Linkage' },
  { key: 'MessageDefinition', value: 'MessageDefinition', text: 'Message Definition' },
  { key: 'ResearchStudy', value: 'ResearchStudy', text: 'Research Study' },
  { key: 'ResearchSubject', value: 'ResearchSubject', text: 'Research Subject' },
  { key: 'ServiceDefinition', value: 'ServiceDefinition', text: 'Service Definition' },
  { key: 'TestReport', value: 'TestReport', text: 'Test Report' },
  
]


let blackBorder = "blackBorder";

export default class DropdownResourceType extends Component {
  constructor(props){
    super(props);
    this.state = { currentValue: ""}
    this.handleChange = this.handleChange.bind(this);
    // var mkFhir = require('fhir.js');
    // var client = mkFhir({
    //   baseUrl: 'http://localhost:8080/hapi-fhir-jpaserver-example/baseDstu3'
    // });
    // client
    //   .search( {type: {}, query: {  }})
    //   .then(function(res){
    //       var bundle = res.data;
    //       var count = (bundle.entry && bundle.entry.length) || 0;
    //       console.log("# Patients born in 1974: ", count,bundle.entry);
    //       for(var i=0;i<bundle.entry.length;i++){
    //         console.log(bundle,'----------------')
    //         // if(bundle.entry[i].resource.name[0].given[1]!= undefined){
    //         //   var name = bundle.entry[i].resource.name[0].given[0]+" "+bundle.entry[i].resource.name[0].given[1]
    //         // }
    //         // else{
    //         //   var name = bundle.entry[i].resource.name[0].given[0]+" "+bundle.entry[i].resource.name[0].family
    //         // }
    //         // options.push({
    //         //   key: bundle.entry[i].resource.pid,
    //         //   value: bundle.entry[i].resource.pid,
    //         //   text: name,
    //         // })
    //       }

    //   })  
  };

  handleChange = (e, { value }) => {
    console.log(this.props);
    this.props.updateCB(this.props.elementName, value)
    this.setState({ currentValue: value })
  }

  render() {
    const { currentValue } = this.state
    if(currentValue){
        blackBorder = "blackBorder";
    }else{
        blackBorder = "";
    }
    return (
      <Dropdown
      className={blackBorder}
        options={options}
        placeholder='Choose ResourceType'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}
