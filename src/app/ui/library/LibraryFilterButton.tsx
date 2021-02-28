import React from 'react'
import { connect } from 'react-redux'
import { Popover, Button, IconName, Position, Menu, MenuItem, MenuDivider } from '@blueprintjs/core'
import classnames from 'classnames'
import SearchField from "react-search-field";

import { msg } from 'common/i18n/i18n'
import { TagId, TagById, Device, PhotoFilter } from 'common/CommonTypes'

import FaIcon from 'app/ui/widget/icon/FaIcon'
import { setLibraryFilter } from 'app/controller/PhotoController'
import { AppState } from 'app/state/StateTypes'

import './LibraryFilterButton.less'
import Toolbar from '../widget/Toolbar'

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

type SimpleFilterType = 'all' | 'flagged' | 'trash'
const simpleFilterTypes: SimpleFilterType[] = [ 'all', 'flagged', 'trash' ]
    // TODO: Revive Legacy code of 'version' feature
    // -> Add 'processed'

type FilterType = SimpleFilterType | 'tag'

const iconByFilterType: { [K in FilterType]: IconName | JSX.Element } = {
    all: 'book',
    flagged: <FaIcon name='flag' />,
    // TODO: Revive Legacy code of 'version' feature
    //processed: 'settings',
    trash: 'trash',
    tag: 'tag',
}

export interface OwnProps {
    className?: any
}

interface StateProps {
    libraryFilter: PhotoFilter
    tagIds: TagId[]
    tagById: TagById
    devices: Device[]
}

interface DispatchProps {
    setLibraryFilter(newFilter: PhotoFilter): void
}

export interface Props extends OwnProps, StateProps, DispatchProps {}

export class LibraryFilterButton extends React.Component<Props> {

    constructor(props) {
        super(props);
        this.tagNameFortagId = this.tagNameFortagId.bind(this);
      }

    onSimpleFilterClick(type: SimpleFilterType) {
        myConsole.log('onSimpleFilterClick', type)
        this.props.setLibraryFilter({ type })
    }

    onTagFilterClick(tagId: TagId) {
        this.props.setLibraryFilter({ type: 'tag', tagId })
    }

    tagNameFortagId(tagName: string) {
        for (const key in this.props.tagById) {
            let tagTitle = this.props.tagById[key].title
            let tagId = this.props.tagById[key].id
            if (tagTitle == tagName) {
                myConsole.log('found id ', tagId)
                myConsole.log('found tag ', tagTitle)
                break
            }
        }
    }

    render() {
        const { props } = this
        const { libraryFilter } = props

        const menu = (
            <Menu className='LibraryFilterButton-menu'>
                {simpleFilterTypes.map(type =>
                    <MenuItem
                        key={type}
                        icon={iconByFilterType[type]}
                        text={msg(`LibraryFilterButton_filter_${type}` as any)}
                        active={type === libraryFilter.type}
                        onClick={() => this.onSimpleFilterClick(type)}
                    />
                )}
                {!!props.tagIds.length &&
                    <>
                        <MenuDivider title={msg('LibraryFilterButton_tag_title')} />
                        {props.tagIds.map(tagId =>
                            <MenuItem
                                key={tagId}
                                icon={iconByFilterType['tag']}
                                text={props.tagById[tagId].title}
                                active={!!(libraryFilter.type === 'tag' && libraryFilter.tagId === tagId)}
                                onClick={() => this.onTagFilterClick(tagId)}
                            />
                        )}
                    </>
                }

                <Toolbar.Spacer />

                <SearchField
                    placeholder="Search..."
                    onChange={this.tagNameFortagId}
                />

                <Toolbar.Spacer />
            </Menu>
        )

        let activeFilterLabel: string
        if (libraryFilter.type === 'tag') {
            activeFilterLabel = msg('LibraryFilterButton_filter_tag', props.tagById[libraryFilter.tagId].title)
        } else {
            activeFilterLabel = msg(`LibraryFilterButton_filter_${libraryFilter.type}` as any)
        }

        return (
            <Popover
                className={classnames(props.className, 'LibraryFilterButton')}
                content={menu}
                position={Position.BOTTOM}
            >
                <Button
                    minimal={true}
                    rightIcon='caret-down'
                    text={msg('LibraryFilterButton_shown', activeFilterLabel)} />
            </Popover>
        )
    }

}


const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props: OwnProps) => {
        return {
            ...props,
            libraryFilter: state.library.filter,
            tagIds: state.data.tags.ids,
            tagById: state.data.tags.byId,
            devices: state.data.devices,
        }
    },
    dispatch => ({
        setLibraryFilter,
    })
)(LibraryFilterButton)

export default Connected
