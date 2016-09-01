import React from 'react'
import { TouchableOpacity, TextInput,View } from 'react-native'
import buttonStyles from './styles/simpleButtonStyle'
import inputStyles from './styles/simpleInputStyle'

export default class SimpleInput extends React.Component {

    static propTypes = {
        placeholder: React.PropTypes.string,
        styles: React.PropTypes.object
    }

    static defaultProps={
        onPress:function(){},
        placeholder:"please add button copy"
    }

    render () {
        return (
            <TextInput style={[buttonStyles.button,inputStyles.inputField,buttonStyles.buttonText,inputStyles.inputText]} defaultValue="Your E-Mail address">{this.props.text && this.props.text.toUpperCase()}</TextInput>
        )
    }
}
