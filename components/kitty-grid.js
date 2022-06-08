import yamz from "yet-another-medium-zoom";
import KittyCard from "./kitty-card";
import { useEffect } from 'react';
import { customLightboxGenerator } from "../lib/yamz";
import classNames from "classnames";

export default function KittyGrid( props ) {
  //TODO: add your code here for image click popup

  const classes = classNames(
    'kitty-grid',
  );

  return (
    <div className={ classes }>
      {
        //TODO: for every kitty in the received json data, add a kitty card
      }
      <div>no kitties found</div>
    </div>
  );
}
