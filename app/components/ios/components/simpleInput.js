import React from 'react'
import { TouchableOpacity, TextInput,View } from 'react-native'
import buttonStyles from './styles/simpleButtonStyle'
import inputStyles from './styles/simpleInputStyle'

export default class SimpleInput extends React.Component {

    static propTypes = {
        placeholder: React.PropTypes.string,
        styles: React.PropTypes.object,
        text: React.PropTypes.string
    }

    static defaultProps={
        onPress:function(){},
        onStart:function(){},
        onEnd:function(){},
        onChange:function(){},
        onSubmitEditing:function(){},
        keyboardType: "default",
        placeholder:"please add placeholder copy"
    }

    constructor(props){
        super(props);
        this.state={
            text:props.placeholder,
            keyboardType: props.keyboardType
        };
    }

    text(){
        return this.state.text;
    }


    render () {
        return (
            <TextInput clearTextOnFocus={false}
                       clearButtonMode="while-editing"
                       style={[
                            buttonStyles.button,
                            inputStyles.inputField,
                            buttonStyles.buttonText,
                            inputStyles.inputText,
                            this.props.style
                       ]}
                       onFocus={()=>{
                         if(this.props.onStart)this.props.onStart();
                         if(this.state.text==this.props.placeholder)this.setState({text:""});
                       }}
                       onBlur={()=>{
                        if(this.props.onEnd)this.props.onEnd();
                        if(this.state.text=='')this.setState({text:this.props.placeholder})
                       }}
                       onChangeText={(text) =>{this.setState({text});this.props.onChange(text)}}
                       onSubmitEditing={this.props.onSubmitEditing}
                       keyboardType={this.state.keyboardType}
                       value={this.state.text}
            >
            </TextInput>
        )
    }
}
