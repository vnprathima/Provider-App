import React, {Component} from 'react';
import {Dropdown} from 'semantic-ui-react';

export const treatingOptions = [
  { key: 'alzheimers-disease', value: 'alzheimers-disease', text: 'Alzheimer\'s disease' },
  { key: 'benign-essential-hypertension', value: 'benign-essential-hypertension', text: 'Benign essential hypertension' },
  {key:'dementia-associated-with-another-disease',value:'dementia-associated-with-another-disease',text:'Dementia associated with another disease'},
  { key: 'disorder-of-lung', value: 'disorder-of-lung', text: 'Disorder of lung' },
  { key: 'essential-hypertension', value: 'essential-hypertension', text: 'Essential hypertension' },
  { key: 'nii', value: 'nii', text: 'Needs influenza immunization' },
  { key: 'Osteoarthritis', value: 'Osteoarthritis', text: 'Osteoarthritis' },
  { key: 'opmddtcce', value: 'opmddtcce', text: 'Other persistent mental disorders due to conditions classified elsewhere' },
  { key: 'tmd', value: 'tmd', text: 'Thiopurine methyltransferase deficiency' },
  { key: 'vdu', value: 'vdu', text: 'Vascular dementia, uncomplicated' },

]

let blackBorder = "blackBorder";

export default class DropdownTreating extends Component {
  constructor(props){
    super(props);
    this.state = { currentValue: ""}
  };

  handleChange = (e, { value }) => {
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
        options={treatingOptions}
        placeholder='Treating'
        search
        selection
        fluid
        onChange={this.handleChange}
      />
    )
  }
}