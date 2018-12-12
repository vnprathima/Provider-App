import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

const defaultValues = [
    { key: 'Diabetic foot examination (regime/therapy)', text: '401191002', value: '401191002', codeSystem: 'http://snomed.info/sct' },
    { key: 'End Stage Liver Disease', text: '708248004', value: '708248004', codeSystem: 'http://snomed.info/sct' },
    { key: 'Chronic pain due to malignancy (finding)', text: '10181000119102', value: '10181000119102', codeSystem: 'http://snomed.info/sct' },
    { key: 'Transplantation of liver (procedure)', text: '18027006', value: '18027006', codeSystem: 'http://snomed.info/sct' },
    { key: 'Secondary neuroendocrine tumor of liver', text: '209.72', value: '209.72', codeSystem: 'https://www.cdc.gov/nchs/icd/icd9.htm' },
    { key: 'Metastasis from malignant tumor of liver (disorder)', text: '315000005', value:'315000005', codeSystem: 'http://snomed.info/sct' },
    { key: 'Carcinoma in situ of extrahepatic bile ducts (disorder)', text:'92589000', value:'92589000', codeSystem: 'http://snomed.info/sct'},
    { key: 'Cholangiocarcinoma of biliary tract (disorder)', text: '312104005', value:'312104005', codeSystem:'http://snomed.info/sct' },
    { key: 'Tumor surgically unresectable (finding)', text: '711361003', value:'711361003', codeSystem:'http://snomed.info/sct' },
    { key: 'Hemangioendothelioma of liver (disorder)', text: '427744002', value:'427744002', codeSystem:'http://snomed.info/sct' },
    { key: 'Aftercare for liver transplant done (situation)', text: '96601000119101', value:'96601000119101', codeSystem:'http://snomed.info/sct' },
    { key: 'Sandimmune', text: '202816', value:'202816', codeSystem:'https://www.nlm.nih.gov/research/umls/rxnorm/' },
    { key: 'Imuran', text: '202559', value:'202559', codeSystem:'https://www.nlm.nih.gov/research/umls/rxnorm/' },
    { key: 'ATGAM', text: '1204', value:'1204', codeSystem:'https://www.nlm.nih.gov/research/umls/rxnorm/' },
    { key: 'Muromonab-CD3', text: '42405', value:'42405', codeSystem:'https://www.nlm.nih.gov/research/umls/rxnorm/' },
    { key: 'Prograf', text: '196463', value:'196463', codeSystem:'https://www.nlm.nih.gov/research/umls/rxnorm/' },
    { key: 'mycophenolate mofetil', text: '68149', value:'68149', codeSystem:'https://www.nlm.nih.gov/research/umls/rxnorm/' },
    { key: 'Daclizumab', text: '190353', value:'190353', codeSystem:'https://www.nlm.nih.gov/research/umls/rxnorm/' },
    { key: 'Cyclophosphamide', text: '3002', value:'3002', codeSystem:'https://www.nlm.nih.gov/research/umls/rxnorm/' },
    { key: 'Prednisone', text: '8640', value:'8640', codeSystem:'https://www.nlm.nih.gov/research/umls/rxnorm/' },
]

function dropDownOptions() {
  return defaultValues.map((v) => {return {key: v.key, text: `${v.key} - ${v.value}`, value: v.value}})
}

let blackBorder = "blackBorder";

export default class DropdownInput extends Component {
  constructor(props){
    super(props);
    this.state = { options: dropDownOptions() }
  };

  handleAddition = (e, { value }) => {
    this.setState({
      options: [{ text: value, value }, ...this.state.options],
    })
  }

  handleChange = (e, { value }) => {
    this.props.updateCB(this.props.elementName, value)
    this.props.updateCB('codeSystem', defaultValues.find((v) => v.value === value).codeSystem)
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
      className={"dropdownCode " +blackBorder}
        options={this.state.options}
        placeholder='Choose Code'
        search
        selection
        fluid
        allowAdditions
        value={currentValue}
        onAddItem={this.handleAddition}
        onChange={this.handleChange}
      />
    )
  }
}