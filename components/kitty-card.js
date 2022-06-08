import Image from 'next/image'
import { useState } from 'react';
import classNames from 'classnames';

export default function KittyCard( props ) {
  const {
    id,
    uuid,
    mediaUri,
    forsale,
    description,
    handleClick,
  } = props;

  function handleSrcError( e ) {
    //you could handle img src error here
  }

  const classes = classNames(
    'kitty-card',
    {
      'is-for-sale': forsale !== '0',
    });

  return (
    <div className={ classes } onClick={ handleClick }>
      <div className="kitty-name">
        { `Kitty Paradise #${ id }` }
      </div>
      { mediaUri ?
        <Image
          key={ uuid }
          src={ mediaUri }
          alt={ `Kitty Paradise #${ id }` }
          width={ 640 }
          height={ 640 }
          data-zoomable
          data-album="kitties-album"
          data-id={ uuid }
          data-forsale={ forsale }
          data-title={ `Kitty Paradise #${ id }` }
          data-description={ description }
          onError={ handleSrcError }
        /> :
        <div className="kitty-image-error">ipfs error - try later</div>
      }

      <div className="kitty-meta">
        { forsale !== '0' ?
          <a href={ `https://singular.app/collectibles/${ uuid }` } target='_blank'>Buy for <span className="kitty-price">{ forsale / 0.9 / 1000000000000 } KSM</span></a>
        :
          <a href={ `https://singular.app/collectibles/${ uuid }` } target='_blank'>View on Singular</a>
        }
      </div>
    </div>
  )
}