import yamz from "yet-another-medium-zoom";
import KittyCard from "./kitty-card";
import { useEffect } from 'react';
import { customLightboxGenerator } from "../lib/yamz";
import classNames from "classnames";

export default function KittyGrid( props ) {
  useEffect(() => {
    const $images = [...document.querySelectorAll('[data-zoomable]')];
    yamz.setOptions({
      duration: 150,
      lightboxGenerator: customLightboxGenerator,
    });
    yamz.bind($images);
  }, []);

  const classes = classNames(
    'kitty-grid',
  );

  console.log( 'allkitties', props.allKitties );

  return (
    <div className={ classes }>
      { props.allKitties && props.allKitties.length ? props.allKitties.map( kit => {
        return <KittyCard
          mediaUri={ kit.meta.image }
          id={ kit.sn }
          key={ kit.sn }
          uuid={ kit.sn }
          forsale={ kit.forsale }
          description={ kit.metadata.description }
          handleClick={ () => handleClick( kit.uuid ) }
        />
      }) : <div>no kitties found</div> }
    </div>
  );
}
