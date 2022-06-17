import yamz from "yet-another-medium-zoom";
import KittyCard from "./kitty-card";
import { useEffect } from 'react';
import { customLightboxGenerator } from "../lib/yamz";
import classNames from "classnames";

export default function KittyGrid( props ) {
  const { allKitties } = props;
  
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

  return (
    <div className={ classes }>
      { allKitties && allKitties.length ? allKitties.map( kit => {
        return <KittyCard
          mediaUri={ kit.metadata.mediaUri }
          id={ kit.id }
          key={ kit.uuid }
          uuid={ kit.uuid }
          forsale={ kit.forsale }
          description={ kit.metadata.description }
          handleClick={ () => handleClick( kit.uuid ) }
        />
      }) : <div>no kitties found</div> }
    </div>
  );
}
