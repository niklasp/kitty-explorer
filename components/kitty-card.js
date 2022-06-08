import Image from 'next/image'
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
  );

  return (
    <div className={ classes } onClick={ handleClick }>
      <div className="kitty-name">
        {
           // TODO: add the name of the kitty here
        }
      </div>
      { mediaUri ?
        //TODO: add your code here showing the image of the NFT
        <div>Replace this with your code</div>
      :
        <div className="kitty-image-error">ipfs error - try later</div>
      }

      <div className="kitty-meta">
        {
          //TODO: add some meta here that will be shown on hover of the card
        }
        Add Meta here
      </div>
    </div>
  )
}