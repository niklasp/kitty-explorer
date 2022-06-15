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

<<<<<<< Updated upstream
  console.log( 'allkitties', props.allKitties );
=======
  // console.log( 'allkitties', props.allKitties );
>>>>>>> Stashed changes

  return (
    <div className={ classes }>
      { props.allKitties && props.allKitties.length ? props.allKitties.map( kit => {
        return <KittyCard
<<<<<<< Updated upstream
          mediaUri={ kit.meta.image }
          id={ kit.sn }
          key={ kit.sn }
          uuid={ kit.sn }
=======
          mediaUri={ kit.image }
          id={ kit.id }
          key={ kit.uuid }
          uuid={ kit.uuid }
>>>>>>> Stashed changes
          forsale={ kit.forsale }
          description={ kit.meta?.description }
          handleClick={ () => handleClick( kit.sn ) }
        />
      }) : <div>no kitties found</div> }
    </div>
  );
}
