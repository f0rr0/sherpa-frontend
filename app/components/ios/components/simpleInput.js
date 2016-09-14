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
        placeholder:"please add placeholder copy"
    }

    constructor(props){
        super(props);
        this.state={text:props.placeholder};
    }

    text(){
        return this.state.text;
    }

    render () {
        return (
            <TextInput clearTextOnFocus={true}
                       clearButtonMode="while-editing"
                       style={[
                            buttonStyles.button,
                            inputStyles.inputField,
                            buttonStyles.buttonText,
                            inputStyles.inputText,
                            this.props.style
                       ]}
                       onFocus={this.props.onStart}
                       onBlur={this.props.onEnd}
                       onChangeText={(text) =>{this.setState({text});this.props.onChange(text)}}
                       value={this.state.text}
            >
            </TextInput>
        )
    }
}
