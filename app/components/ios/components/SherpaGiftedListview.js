'use strict'

var React = require('react');

var {
    ListView,
    View,
    RefreshControl,
    } = require('react-native');
const SCREEN_WIDTH = require('Dimensions').get('window').width;

// small helper function which merged two objects into one
function MergeRecursive(obj1, obj2) {
    for (var p in obj2) {
        try {
            if ( obj2[p].constructor==Object ) {
                obj1[p] = MergeRecursive(obj1[p], obj2[p]);
            } else {
                obj1[p] = obj2[p];
            }
        } catch(e) {
            obj1[p] = obj2[p];
        }
    }
    return obj1;
}

var GiftedSpinner = require('react-native-gifted-spinner');
var EnhancedListView = require('react-native-enhanced-listview')

var SherpaGiftedListview = React.createClass({

    getDefaultProps() {
        return {
            customStyles: {},
            initialListSize: 10,
            firstLoader: true,
            pagination: true,
            refreshable: true,
            refreshableColors: undefined,
            refreshableProgressBackgroundColor: undefined,
            refreshableSize: undefined,
            refreshableTitle: undefined,
            refreshableTintColor: undefined,
            renderRefreshControl: null,
            headerView: null,
            sectionHeaderView: null,
            scrollEnabled: true,
            withSections: false,
            onFetch(page, callback, options) { callback([]); },
            footerView:()=>{return <View></View>},
            paginationFetchingView: null,
            paginationAllLoadedView: null,
            paginationWaitingView: null,
            emptyView: null,
            renderSeparator: null,
            initialLoad:true
        };
    },

    propTypes: {
        customStyles: React.PropTypes.object,
        initialListSize: React.PropTypes.number,
        firstLoader: React.PropTypes.bool,
        pagination: React.PropTypes.bool,
        refreshable: React.PropTypes.bool,
        refreshableColors: React.PropTypes.array,
        refreshableProgressBackgroundColor: React.PropTypes.string,
        refreshableSize: React.PropTypes.string,
        refreshableTitle: React.PropTypes.string,
        refreshableTintColor: React.PropTypes.string,
        renderRefreshControl: React.PropTypes.func,
        headerView: React.PropTypes.func,
        sectionHeaderView: React.PropTypes.func,
        scrollEnabled: React.PropTypes.bool,
        withSections: React.PropTypes.bool,
        onFetch: React.PropTypes.func,
        initialLoad: React.PropTypes.bool,
        paginationFetchingView: React.PropTypes.func,
        paginationAllLoadedView: React.PropTypes.func,
        paginationWaitingView: React.PropTypes.func,
        emptyView: React.PropTypes.func,
        renderSeparator: React.PropTypes.func,
    },

    _setPage(page) { this._page = page; },
    _getPage() { return this._page; },
    _setRows(rows) { this._rows = rows; },
    _getRows() { return this._rows; },


    paginationFetchingView() {
        if (this.props.paginationFetchingView) {
            return this.props.paginationFetchingView();
        }

        return (
            <View style={[this.defaultStyles.paginationView, this.props.customStyles.paginationView]}>
                <GiftedSpinner />
            </View>
        );
    },
    paginationAllLoadedView() {
        if (this.props.paginationAllLoadedView) {
            return this.props.paginationAllLoadedView();
        }

        return (
            <View></View>
            //<View style={[this.defaultStyles.paginationView, this.props.customStyles.paginationView]}>
            //  <Text style={[this.defaultStyles.actionsLabel, this.props.customStyles.actionsLabel]}>
            //    ~
            //  </Text>
            //</View>
        );
    },
    paginationWaitingView(paginateCallback) {
        if (this.props.paginationWaitingView) {
            return this.props.paginationWaitingView(paginateCallback);
        }

        return (
            <View></View>
        );
    },
    headerView() {
        if(this.props.renderHeaderOnInit)return this.props.headerView();
        if (this.state.paginationStatus === 'firstLoad' || !this.props.headerView){
            return null;
        }
        return this.props.headerView();
    },
    emptyView(refreshCallback) {
        if (this.props.emptyView) {
            return this.props.emptyView(refreshCallback);
        }

        return (<View></View>)
        //return (
        //  <View style={[this.defaultStyles.defaultView, this.props.customStyles.defaultView]}>
        //    <Text style={[this.defaultStyles.defaultViewTitle, this.props.customStyles.defaultViewTitle]}>
        //      Sorry, there is no content to display
        //    </Text>
        //
        //    <TouchableHighlight
        //      underlayColor='#c8c7cc'
        //      onPress={refreshCallback}
        //    >
        //      <Text>
        //        ↻
        //      </Text>
        //    </TouchableHighlight>
        //  </View>
        //);
    },
    renderSeparator() {
        if (this.props.renderSeparator) {
            return this.props.renderSeparator();
        }

        return (
            <View style={[this.defaultStyles.separator, this.props.customStyles.separator]} />
        );
    },

    getInitialState() {
        this._setPage(1);
        this._setRows([]);

        var ds = null;
        if (this.props.withSections === true) {
            ds = new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
                sectionHeaderHasChanged: (section1, section2) => section1 !== section2,
            });
            return {
                dataSource: ds.cloneWithRowsAndSections(this._getRows()),
                isRefreshing: false,
                paginationStatus: 'firstLoad',
            };
        } else {
            ds = new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            });
            return {
                dataSource: ds.cloneWithRows(this._getRows()),
                isRefreshing: false,
                paginationStatus: 'firstLoad',
            };
        }
    },

    componentDidMount() {
        this.notVisible = {}
        if(this.props.initialLoad){
            this.props.onFetch(this._getPage(), this._postRefresh, {firstLoad: true});
        }else{
            this._postRefresh();
        }
    },

    setNativeProps(props) {
        this.refs.listview.setNativeProps(props);
    },

    _refresh() {
        this._onRefresh({external: true});
    },

    _onRefresh(options = {}) {
        if (this.isMounted()) {
            this.setState({
                isRefreshing: true,
            });
            this._setPage(1);
            this.props.onFetch(this._getPage(), this._postRefresh, options);
        }
    },

    _postRefresh(rows = [], options = {}) {
        if (this.isMounted()) {
            this._updateRows(rows, options);
        }
    },

    _onPaginate() {
        if(this.state.paginationStatus==='allLoaded'||this.state.paginationStatus == 'fetching'){
            return null
        }else {
            this.setState({
                paginationStatus: 'fetching',
            });
            this.props.onFetch(this._getPage() + 1, this._postPaginate, {});
        }
    },

    _postPaginate(rows = [], options = {}) {
        this._setPage(this._getPage() + 1);
        var mergedRows = null;
        if (this.props.withSections === true) {
            mergedRows = MergeRecursive(this._getRows(), rows);
        } else {
            mergedRows = this._getRows().concat(rows);
        }
        this._updateRows(mergedRows, options);
    },

    _updateRows(rows = [], options = {}) {
        if (rows !== null) {
            this._setRows(rows);
            if (this.props.withSections === true) {
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRowsAndSections(rows),
                    isRefreshing: false,
                    paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
                });
            } else {
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(rows),
                    isRefreshing: false,
                    paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
                });
            }
        } else {
            this.setState({
                isRefreshing: false,
                paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
            });
        }
    },

    _renderPaginationView() {
        let pagedFooterView=null;
        if ((this.state.paginationStatus === 'fetching' && this.props.pagination === true) || (this.state.paginationStatus === 'firstLoad' && this.props.firstLoader === true)) {
            pagedFooterView= this.paginationFetchingView();
        } else if (this.state.paginationStatus === 'waiting' && this.props.pagination === true && (this.props.withSections === true || this._getRows().length > 0)) {
            pagedFooterView= this.paginationWaitingView(this._onPaginate);
        } else if (this.state.paginationStatus === 'allLoaded' && this.props.pagination === true) {
            pagedFooterView= this.paginationAllLoadedView();
        } else if (this._getRows().length === 0) {
            pagedFooterView= this.emptyView(this._onRefresh);
        } else {
            pagedFooterView= null;
        }

        //console.log(this.props.footerView());


        return(
            <View style={{ justifyContent: 'flex-start',
        marginHorizontal: 7,
        width: SCREEN_WIDTH-28,
        alignItems: 'center'}}>

                    {pagedFooterView}
                {this.props.footerView()}


            </View>
        )
    },


    enhance(visibleRows, changedRows) {
        if (this.props.onChangeVisibleRows) {
            this.props.onChangeVisibleRows
        }

        Object.keys(changedRows['s1']).map(i => {
            if (changedRows['s1'][i] === false) { this.notVisible[i] = null }
            else { delete this.notVisible[i] }
        })
    },

    enhancedRowRender(rowData, sectionID, rowID, highlightRow) {
        if (this.notVisible[rowID] !== undefined) { return null }

       return this.props.rowView(rowData,sectionID,rowID,highlightRow)
    },


    renderRefreshControl() {
        if (this.props.renderRefreshControl) {
            return this.props.renderRefreshControl({ onRefresh: this._onRefresh });
        }
        return (
            <RefreshControl
                onRefresh={this._onRefresh}
                refreshing={this.state.isRefreshing}
                colors={this.props.refreshableColors}
                progressBackgroundColor={this.props.refreshableProgressBackgroundColor}
                size={this.props.refreshableSize}
                tintColor={this.props.refreshableTintColor}
                title={this.props.refreshableTitle}
            />
        );
    },

    render() {
        return (
            <ListView
                ref="listview"
                enableEmptySections={true}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps='never'
                dataSource={this.state.dataSource}
                // renderRow={this.props.rowView}
                renderSectionHeader={this.props.sectionHeaderView}
                renderHeader={this.headerView}
                renderFooter={this._renderPaginationView}
                renderSeparator={this.renderSeparator}
                automaticallyAdjustContentInsets={false}
                onChangeVisibleRows={this.enhance}
                renderRow={this.enhancedRowRender}
                scrollEnabled={this.props.scrollEnabled}
                canCancelContentTouches={true}
                contentContainerStyle={this.props.customStyles.contentContainerStyle}
                refreshControl={this.props.refreshable === true ? this.renderRefreshControl() : null}

                {...this.props}

                style={[this.props.style]}
            />
        );
    },

    defaultStyles: {
        separator: {
            height: 1,
            backgroundColor: '#CCC'
        },
        actionsLabel: {
            fontSize: 20,
        },
        paginationView: {
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFF',
        },
        defaultView: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        defaultViewTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 15,
        },
    },
});


module.exports = SherpaGiftedListview;
