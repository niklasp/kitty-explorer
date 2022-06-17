import classNames from 'classnames';
import { useState } from 'react'

export default function KittySettings( props ) {

  return(
    <div className="kitty-settings">
      <div className="backdrop"></div>
      <div className="kitty-filter">show:
        <a
          className={ classNames( 'filter', { active: props.filter === 'all' } ) }
          onClick={ props.onFilterClick( 'all' ) }
        >
          all
        </a>
        <a
        className={ classNames( 'filter', { active: props.filter === 'forsale' } ) }
          onClick={ props.onFilterClick( 'forsale' ) }
        >
          forsale
        </a>
      </div>
      <div className="kitty-sort">
        sort:
        <a
          className={ classNames( 'sort-by', { active: props.sort.sortBy === 'id' } ) }
          onClick={ props.onSortClick( {
            sortBy: 'id',
            sortDir: props.sort.sortDir === 'asc' ? 'desc' : 'asc',
          } )}
        >
          id
          <span className="descasc">
            { props.sort.sortDir === 'asc' ? '↑' : '↓'}
          </span>
        </a>
        <a
        className={ classNames( 'sort-by', { active: props.sort.sortBy === 'forsale' } ) } 
          onClick={ props.onSortClick( {
            sortBy: 'forsale',
            sortDir: props.sort.sortDir === 'asc' ? 'desc' : 'asc',
          } )}
        >
          price
          <span className="descasc">
            { props.sort.sortDir === 'asc' ? '↑' : '↓'}
          </span>
        </a>
      </div>
      <div className="kitty-filters"></div>
    </div>
  );
}