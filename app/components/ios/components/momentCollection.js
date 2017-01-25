import { ScrollView } from 'react-native'
import AddPaging from 'react-native-paged-scroll-view/index'
var PagedScrollView = AddPaging(ScrollView);
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import Dimensions from 'Dimensions';

const CARD_PREVIEW_WIDTH = 10
const CARD_MARGIN = 3;
const CARD_WIDTH = Dimensions.get('window').width - (CARD_MARGIN + CARD_PREVIEW_WIDTH) * 2;

import {
    StyleSheet,
    View
} from 'react-native';

import React, { Component } from 'react';

class MomentCollection extends Component{
    componentDidMount(){

    }


    handlePageChange(){

    }

    _renderImageSlider(){
        let currentIndex=0;
        return(
            <PagedScrollView
                style={styles.container}
                automaticallyAdjustInsets={false}
                horizontal={true}
                decelerationRate={0}
                ref="scrollview"
                snapToInterval={CARD_WIDTH + CARD_MARGIN*2}
                snapToAlignment="start"
                contentContainerStyle={styles.content}
                showsHorizontalScrollIndicator={false}
                onPageChange={this.handlePageChange.bind(this)}
            >

                {this.props.momentData.map((moment)=>{
                    currentIndex++;
                    return(
                        <ImageProgress
                            style={{height:CARD_WIDTH,height:CARD_WIDTH,backgroundColor:'grey'}}
                            resizeMode="cover"
                            indicator={Progress.Circle}
                            indicatorProps={{
                                color: 'rgba(150, 150, 150, 1)',
                                unfilledColor: 'rgba(200, 200, 200, 0.2)'
                            }}
                            source={{uri:moment.mediaUrl}}
                        >
                        </ImageProgress>
                    )
                })}
            </PagedScrollView>
        )

    }

    render(){
        let currentIndex=0;
        console.log('interval',CARD_WIDTH + CARD_MARGIN*2)
        return(

            <PagedScrollView
                style={styles.container}
                automaticallyAdjustInsets={false}
                horizontal={true}
                decelerationRate={0}
                ref="scrollview"
                snapToInterval={CARD_WIDTH + CARD_MARGIN*2}
                snapToAlignment="start"
                contentContainerStyle={styles.content}
                showsHorizontalScrollIndicator={false}
                onPageChange={this.handlePageChange.bind(this)}
            >

                {this.props.momentData.map((moment)=>{
                    currentIndex++;
                    return(
                    <ImageProgress
                            style={styles.card}
                            resizeMode="cover"
                            indicator={Progress.Circle}
                            indicatorProps={{
                                color: 'rgba(150, 150, 150, 1)',
                                unfilledColor: 'rgba(200, 200, 200, 0.2)'
                            }}
                            source={{uri:moment.mediaUrl}}
                        >
                        </ImageProgress>
                    )
                })}
            </PagedScrollView>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        backgroundColor:'transparent'
    },
    content: {
        backgroundColor:'transparent',
        paddingHorizontal: CARD_PREVIEW_WIDTH,
        alignItems: 'flex-start',
        flex:1
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH,
        margin: CARD_MARGIN,
        alignItems: 'center',
        justifyContent: 'center'
    },
});


export default MomentCollection

