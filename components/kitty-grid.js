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
      { props.allKitties.map( kit => {
        if (kit.mediaUri) {
          return <KittyCard 
            mediaUri={ kit.mediaUri }
            id={ kit.id }
            key={ kit.uuid }
            uuid={ kit.uuid }
            forsale={ kit.forsale }
            description={ kit.description }
            handleClick={ () => handleClick( kit.uuid ) }
          />
        } else {
          return (<div>not found</div>);
        }
      })}
    </div>
  );
}
