import React, { ReactNode } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button } from '@blueprintjs/core'
import classNames from 'classnames'

import { ImportProgress } from 'common/CommonTypes'

import BackgroundClient from 'app/BackgroundClient'
import Export from 'app/ui/Export'
import PictureDetail from 'app/ui//detail/PictureDetail'
import PictureDiff from 'app/ui/PictureDiff'
import SettingsPane from 'app/ui/SettingsPane'
import Library from 'app/ui/library/Library'
import LibraryFilterButton from 'app/ui/library/LibraryFilterButton'
import ImportProgressButton from 'app/ui/ImportProgressButton'
import { openSettingsAction } from 'app/state/actions'
import { AppState } from 'app/state/reducers'
import { MainViewState } from 'app/state/reducers/navigation'

import './App.less'


interface OwnProps {
    style?: any
    className?: any
}

interface StateProps {
    isFullScreen: boolean
    hasNativeTrafficLightButtons: boolean
    mainView: MainViewState
    importProgress: ImportProgress | null
    showExport: boolean
}

interface DispatchProps {
    toggleFullScreen(): void
    openSettings(): void
}

interface Props extends OwnProps, StateProps, DispatchProps {
}

class App extends React.Component<Props> {

    componentDidMount() {
        const splashElem = document.getElementById('splash')
        if (splashElem) splashElem.parentNode!.removeChild(splashElem)
    }

    render() {
        const { props } = this

        let modalView: ReactNode | null = null
        if (props.showExport) {
            modalView = <Export />
        }

        let mainView: ReactNode | null = null
        if (props.mainView === 'settings') {
            mainView = <SettingsPane className='App-mainView'/>
        } else if (props.mainView === 'detail') {
            mainView = <PictureDetail className='App-mainView' isActive={!modalView} />
        } else if (props.mainView === 'diff') {
            mainView = <PictureDiff className='App-mainView' />
        }

        return (
            <div className={classNames('App', { hasNativeTrafficLightButtons: props.hasNativeTrafficLightButtons })}>
                <Library
                    className='App-container'
                    topBarLeftItem={
                        <>
                            {props.isFullScreen &&
                                <Button
                                    minimal={true}
                                    icon='minimize'
                                    onClick={props.toggleFullScreen}
                                />
                            }
                            <LibraryFilterButton/>
                            <Button
                                minimal={true}
                                icon='cog'
                                onClick={props.openSettings}
                            />
                        </>
                    }
                    bottomBarLeftItem={props.importProgress &&
                        <ImportProgressButton progress={props.importProgress} />
                    }
                    isActive={!mainView && !modalView}
                />
                {mainView}
                {modalView}
            </div>
        );
    }
}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state, props) => {
        return {
            ...props,
            isFullScreen: state.navigation.isFullScreen,
            hasNativeTrafficLightButtons: state.data.uiConfig.platform === 'darwin' && !state.navigation.isFullScreen,
            mainView: state.navigation.mainView,
            importProgress: state.import && state.import.progress,
            showExport: !!state.export,
        }
    },
    dispatch => ({
        toggleFullScreen() { BackgroundClient.toggleFullScreen() },
        ...bindActionCreators({
            openSettings: openSettingsAction
        }, dispatch)
    })
)(App)

export default Connected