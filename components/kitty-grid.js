import yamz from "yet-another-medium-zoom";
import KittyCard from "./kitty-card";
import { useEffect } from 'react';
import { getKittyDetail } from "../lib/kitties";
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

  async function handleClick( uuid ) {
    // const detail = await getKittyDetail( uuid );
  }

  const classes = classNames(
    'kitty-grid',
  );

  return (
    <div className={ classes }>
      { props.allKitties && props.allKitties.length ? props.allKitties.map( kit => {
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
